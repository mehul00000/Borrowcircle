# BorrowCircle

A hyperlocal peer-to-peer borrowing and lending platform. **One backend, three interfaces:** a Next.js website plus a React Native (Expo) mobile app for Android and iOS. **Clerk handles authentication** on every platform; **Supabase** provides the PostgreSQL database, Row Level Security, storage and realtime. Supabase accepts Clerk-issued JWTs (third-party auth), so `auth.uid()` in RLS resolves to the Clerk user id and one account works across all three platforms.

> Why buy when you can borrow? Discover useful things around you, borrow from your neighbours, and share what you own.

---

## What's in this repository

```
borrowcircle/
├── apps/
│   ├── web/        Next.js 15 (App Router) + TypeScript + Tailwind v4 website (Clerk + Supabase)
│   └── mobile/     React Native + Expo + Expo Router app (Clerk + Supabase
│                   on Android & iOS; demo fallback)
├── packages/
│   └── shared/     Shared types, constants, Zod validation, formatting and
│                   the unified backend contract used by BOTH apps
├── supabase/
│   ├── config.toml
│   ├── migrations/       001 schema · 002 indexes · 003 RLS · 004 functions
│   │                     005 triggers · 006 storage policies
│   │                     (user ids are Clerk user ids — third-party auth)
│   ├── functions/        Edge Functions (one per workflow mutation)
│   └── seed.sql          Dev seed (categories + 2 demo users + listings)
├── docs/                 PRD, TRD, DESIGN, ARCHITECTURE, BACKEND specs
├── design/               Original Figma design implementation (source of truth
│                         for the visual identity — preserved untouched)
├── .env.example
└── package.json          pnpm workspace
```

## Quick start

### 1. Install

This is a pnpm monorepo (the design repo's toolchain). Node 18+ required.

```bash
npm install -g pnpm   # once
pnpm install
```

### 2. Configure the backend and authentication

1. **Clerk** — create an application at [clerk.com](https://clerk.com), enable
   Email + password, and copy your keys into `apps/web/.env.local`
   (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) and
   `apps/mobile/.env` (`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`).
2. **Supabase** — create a project at [supabase.com](https://supabase.com) and
   copy the Project URL + publishable key into the same env files
   (`NEXT_PUBLIC_SUPABASE_*` / `EXPO_PUBLIC_SUPABASE_*`).
3. **Connect Clerk to Supabase** (one-time, two steps):
   - In the Clerk dashboard create a **JWT template named `supabase`**
     (custom template; the signing key is Clerk's). The apps request this
     template per request (`getToken({ template: 'supabase' })`).
   - In Supabase go to **Authentication → Third-Party Auth**, select Clerk and
     add your Clerk domain (shown in the Clerk dashboard, e.g.
     `https://your-app.clerk.accounts.dev`).
4. Apply the database migrations and seed (see below).

Without credentials every app runs **demo mode** — all features work against
an isolated local demo store, clearly labelled with a banner.

### 3. Database setup

```bash
# with the Supabase CLI (https://supabase.com/docs/guides/cli)
cd supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push          # applies migrations 001–006
supabase db reset         # local alternative; also applies seed.sql

# deploy the Edge Functions
supabase functions deploy create-borrow-request
supabase functions deploy accept-borrow-request
# …and the rest in supabase/functions/

# generate TypeScript types (optional, for editor support)
supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > ../packages/shared/src/database.types.ts
```

**Migrations include:** the full schema (profiles, categories, items, images,
availability, borrow requests, agreements, condition reports, reviews,
notifications, saved items, user reports, push tokens, audit events),
Row Level Security on every table, a `no_double_booking` GiST exclusion
constraint that makes overlapping confirmed reservations impossible at the
database level, security-definer workflow functions (accept/decline/cancel,
acknowledge agreement, confirm receipt/return, condition reports, reviews,
disputes), auth→profile creation triggers, storage buckets + policies
(`item-images`, `profile-images` public; `condition-evidence` private,
participant-only via signed URLs), and idempotent scheduled-job functions
(`expire_pending_requests`, `mark_overdue_borrowings` — schedule with pg_cron
or a cron-invoked Edge Function).

### 4. Run the website

```bash
pnpm web:dev             # http://localhost:3000
```

### 5. Run the mobile app

```bash
pnpm mobile:start        # then press a (Android) / i (iOS) in the Expo CLI
```

Use the [Expo Go](https://expo.dev/go) app for a quick try, or an emulator
(note: **Google sign-in requires a development build** — Expo Go intercepts
OAuth redirects; everything else works in Expo Go).
Production builds use EAS (recommended on Windows — local native builds need
Android Studio + NDK and can hit Windows path-length limits):

> **pnpm monorepo note** — dependencies are installed with a hoisted layout
> (`pnpm-workspace.yaml`). If you run a local `npx expo prebuild -p android`,
> re-apply the autolinking patch afterwards: `node ../../scripts/patch-android.cjs`
> from `apps/mobile` (it teaches Expo autolinking to find packages in the
> monorepo's root `node_modules`).

```bash
cd apps/mobile
npx eas build -p android --profile preview   # APK
npx eas build -p ios --profile preview
```

### Making yourself an admin

Admin comes from a protected table (clients can never self-assign):

```sql
insert into user_roles (user_id, role) values ('user_YOUR_CLERK_ID', 'ADMIN');
```

Run that in the Supabase SQL editor after you've signed up once (your profile
id equals your Clerk user id).

---

## Features

**Website** — landing page (original design preserved), discover with search /
category chips / price filter / sorting, item details with gallery, date
selection, fee estimate and request flow, listing creation wizard (Photos →
Details → Borrowing Terms → Availability → Location → Preview), dashboard,
requests (received/sent/history), full transaction detail with timeline,
digital agreement acknowledgement, handover & return condition reports with
photo upload, reviews, notifications, saved items, profiles, settings,
listing management and an admin dashboard.

**Mobile** — onboarding, auth, 5-tab navigation (Home, Discover, Activity,
Saved, Profile), item details with bottom-sheet request flow and native date
pickers, listing creation with camera/gallery, transaction detail with
agreement acknowledgement, condition reports via camera/photo library, push
notification permission handling, notifications, settings and public profiles.
Sessions are stored with Expo SecureStore.

**Shared** — identical business rules, validation (Zod), state handling and
workflow calls on all platforms via one backend contract
(`packages/shared/src/backend-types.ts`). Sensitive mutations go through
PostgreSQL security-definer functions, so no client can put a transaction into
an invalid state. Authentication is delegated to Clerk through an auth bridge;
Supabase receives a Clerk JWT per request (third-party auth), and the schema's
user ids are Clerk user ids.

## Transaction lifecycle

`PENDING → ACCEPTED → AWAITING_ACKNOWLEDGEMENT → READY_FOR_HANDOVER → ACTIVE → RETURN_INITIATED → COMPLETED`

with `DECLINED`, `CANCELLED`, `EXPIRED` (job), `OVERDUE` (job) and `DISPUTED`
(admin-resolved). Every transition validates the caller's identity and role
server-side, records an audit event and notifies the counterparty.

## Environment variables

See [.env.example](.env.example). Only publishable (anon) keys are ever used in
frontend/mobile code; the secret key stays server-side (Edge Functions).

## Known limitations / remaining configuration

- **Supabase + Clerk credentials** are not committed (correctly). Until you add
  them, all apps run in demo mode with isolated local sample data — the banner
  marks this clearly. All integration code paths are implemented.
- **Push notifications**: the mobile apps use Expo Push — the Settings toggle
  registers the device token into `push_tokens`, and the `send-notification`
  Edge Function delivers messages (needs `EXPO_ACCESS_TOKEN`; requires a
  development build, push doesn't work in Expo Go).
- **Condition-report photos in demo mode** are not persisted (no storage
  backend); with Supabase connected they upload to the private
  `condition-evidence` bucket and render through short-lived signed URLs.
- **Email sending** (verification/reset) uses Supabase Auth's built-in email;
  a custom provider needs `EMAIL_PROVIDER_API_KEY`.
- Overdue/expiration jobs are provided as idempotent SQL functions; schedule
  them with `pg_cron` (`select cron.schedule(...)` calling
  `public.expire_pending_requests()` and `public.mark_overdue_borrowings()`)
  or a scheduled Edge Function.
- iOS builds require macOS (Xcode + CocoaPods) or EAS cloud builds; Android APK
  builds work anywhere with EAS.
