-- BorrowCircle — initial schema (tables, enums, constraints)
-- Convention: date ranges are [start_date, end_date) — start inclusive, end exclusive.
-- Money is stored in minor units (paise). Currency INR for the initial pilot.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.borrowing_status as enum (
  'PENDING', 'ACCEPTED', 'AWAITING_ACKNOWLEDGEMENT', 'READY_FOR_HANDOVER',
  'ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'DISPUTED',
  'COMPLETED', 'DECLINED', 'CANCELLED', 'EXPIRED'
);

create type public.listing_status as enum ('DRAFT', 'ACTIVE', 'PAUSED', 'UNAVAILABLE', 'REMOVED');

create type public.condition_report_type as enum ('HANDOVER', 'RETURN');

create type public.report_status as enum ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

create type public.notification_type as enum (
  'BORROW_REQUEST_RECEIVED', 'BORROW_REQUEST_ACCEPTED', 'BORROW_REQUEST_DECLINED',
  'AGREEMENT_REQUIRED', 'AGREEMENT_COMPLETED', 'HANDOVER_REMINDER', 'BORROWING_STARTED',
  'RETURN_REMINDER', 'RETURN_INITIATED', 'RETURN_COMPLETED', 'BORROWING_OVERDUE',
  'DISPUTE_UPDATED', 'NEW_REVIEW'
);

create type public.account_status as enum ('ACTIVE', 'SUSPENDED');

-- ---------------------------------------------------------------------------
-- Trusted roles (clients can never self-assign admin — see RLS policies)
-- ---------------------------------------------------------------------------

create table public.user_roles (
  user_id text primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('MEMBER', 'ADMIN')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

-- User ids are Clerk user ids (text, e.g. 'user_2abc...') because
-- authentication is delegated to Clerk via Supabase third-party auth;
-- auth.uid() in RLS resolves to the same Clerk user id.
create table public.profiles (
  id text primary key,
  full_name text not null,
  username text unique,
  email text,
  phone text,
  bio text,
  avatar_path text,
  city text,
  locality text,
  latitude double precision,
  longitude double precision,
  is_verified boolean not null default false,
  account_status public.account_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_location_check check (
    (latitude is null and longitude is null) or (latitude is not null and longitude is not null)
  )
);

-- ---------------------------------------------------------------------------
-- Categories, items, images, availability
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  description text,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  title text not null check (char_length(title) between 4 and 90),
  description text not null check (char_length(description) between 20 and 4000),
  condition text not null check (condition in ('New', 'Like new', 'Good', 'Fair', 'Heavily Used')),
  borrowing_fee bigint not null default 0 check (borrowing_fee >= 0),
  security_deposit bigint not null default 0 check (security_deposit >= 0),
  currency text not null default 'INR' check (currency in ('INR')),
  minimum_days integer not null default 1 check (minimum_days >= 1),
  maximum_days integer check (maximum_days is null or maximum_days >= 1),
  borrowing_rules text,
  location_label text,
  approximate_latitude double precision,
  approximate_longitude double precision,
  status public.listing_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_duration_check check (maximum_days is null or maximum_days >= minimum_days),
  constraint items_location_check check (
    (approximate_latitude is null and approximate_longitude is null)
    or (approximate_latitude is not null and approximate_longitude is not null)
  )
);

create table public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.item_availability (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint item_availability_range_check check (end_date > start_date)
);

-- ---------------------------------------------------------------------------
-- Borrow requests, agreements, condition reports, reviews
-- ---------------------------------------------------------------------------

create table public.borrow_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  borrower_id text not null references public.profiles(id) on delete cascade,
  lender_id text not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  message text check (message is null or char_length(message) <= 500),
  borrowing_fee bigint not null default 0 check (borrowing_fee >= 0),
  security_deposit bigint not null default 0 check (security_deposit >= 0),
  currency text not null default 'INR',
  status public.borrowing_status not null default 'PENDING',
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint borrow_requests_dates_check check (end_date > start_date),
  constraint borrow_requests_parties_check check (borrower_id <> lender_id)
);

-- Database-level guarantee that two borrowers can never hold the same item
-- for overlapping confirmed ranges. Pending requests do not block others.
alter table public.borrow_requests
  add constraint no_double_booking
  exclude using gist (
    item_id with =,
    daterange(start_date, end_date, '[)') with &&
  ) where (status in ('ACCEPTED', 'AWAITING_ACKNOWLEDGEMENT', 'READY_FOR_HANDOVER', 'ACTIVE', 'RETURN_INITIATED', 'OVERDUE'));

create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  borrow_request_id uuid unique not null references public.borrow_requests(id) on delete cascade,
  version integer not null default 1,
  agreement_content jsonb not null,
  borrower_accepted_at timestamptz,
  lender_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.condition_reports (
  id uuid primary key default gen_random_uuid(),
  borrow_request_id uuid not null references public.borrow_requests(id) on delete cascade,
  submitted_by text not null references public.profiles(id),
  report_type public.condition_report_type not null,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

create table public.condition_images (
  id uuid primary key default gen_random_uuid(),
  condition_report_id uuid not null references public.condition_reports(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  borrow_request_id uuid not null references public.borrow_requests(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 600),
  created_at timestamptz not null default now(),
  constraint reviews_parties_check check (reviewer_id <> reviewee_id),
  constraint reviews_one_per_transaction unique (borrow_request_id, reviewer_id)
);

-- ---------------------------------------------------------------------------
-- Notifications, saved items, reports, devices
-- ---------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  message text not null,
  reference_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_items_unique unique (user_id, item_id)
);

create table public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id text not null references public.profiles(id) on delete cascade,
  reported_user_id text references public.profiles(id) on delete set null,
  reported_item_id uuid references public.items(id) on delete set null,
  reason text not null,
  description text,
  status public.report_status not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android', 'web')),
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id text,
  event_type text not null,
  reference_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
