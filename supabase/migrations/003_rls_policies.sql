-- BorrowCircle — Row Level Security
-- Principle: no client can read another user's private records, and no client
-- can mutate transaction state directly — workflow mutations only happen
-- inside security definer functions (004).

-- ---------------------------------------------------------------------------
-- Trusted helpers (security definer, fixed search_path)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'ADMIN'
  );
$$;

create or replace function public.is_request_participant(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.borrow_requests
    where id = p_request_id and (borrower_id = auth.uid() or lender_id = auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------

alter table public.user_roles          enable row level security;
alter table public.profiles            enable row level security;
alter table public.categories          enable row level security;
alter table public.items               enable row level security;
alter table public.item_images         enable row level security;
alter table public.item_availability   enable row level security;
alter table public.borrow_requests     enable row level security;
alter table public.agreements          enable row level security;
alter table public.condition_reports   enable row level security;
alter table public.condition_images    enable row level security;
alter table public.reviews             enable row level security;
alter table public.notifications       enable row level security;
alter table public.saved_items         enable row level security;
alter table public.user_reports        enable row level security;
alter table public.push_tokens         enable row level security;
alter table public.audit_events        enable row level security;

-- ---------------------------------------------------------------------------
-- user_roles: read your own role; only service role can write
-- ---------------------------------------------------------------------------

create policy "read own role" on public.user_roles
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- profiles: users read/update their own row. Public profile data is exposed
-- through the public_profiles view (004) which omits coordinates and phone.
-- ---------------------------------------------------------------------------

create policy "read own profile" on public.profiles
  for select using (id = auth.uid());
-- Third-party auth has no profile-creation trigger: the client creates its own
-- profile on first sign-in (privileged fields are reset by the trigger in 005).
create policy "users create own profile" on public.profiles
  for insert with check (
    id = auth.uid()
    and is_verified = false
    and account_status = 'ACTIVE'
    and coalesce((new.id in (select user_id from public.user_roles where role = 'ADMIN')), false) = false
  );
create policy "update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Admins can read and moderate any profile
create policy "admins read all profiles" on public.profiles
  for select using (public.is_admin());
create policy "admins update profiles" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- categories: public read; admin-only writes
-- ---------------------------------------------------------------------------

create policy "read categories" on public.categories
  for select using (is_active or public.is_admin());
create policy "admins manage categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- items: public can see active listings, owners manage their own
-- ---------------------------------------------------------------------------

create policy "read active listings" on public.items
  for select using (status = 'ACTIVE' or owner_id = auth.uid() or public.is_admin());
create policy "insert own listing" on public.items
  for insert with check (owner_id = auth.uid());
create policy "update own listing" on public.items
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "delete own listing" on public.items
  for delete using (owner_id = auth.uid() and status not in ('UNAVAILABLE'));

-- ---------------------------------------------------------------------------
-- item_images / item_availability: follow the parent item's visibility
-- ---------------------------------------------------------------------------

create policy "read item images" on public.item_images
  for select using (
    exists (select 1 from public.items i where i.id = item_id and (i.status = 'ACTIVE' or i.owner_id = auth.uid()))
  );
create policy "manage own item images" on public.item_images
  for all using (
    exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid())
  );

create policy "read availability" on public.item_availability
  for select using (
    exists (select 1 from public.items i where i.id = item_id and (i.status = 'ACTIVE' or i.owner_id = auth.uid()))
  );
create policy "manage own availability" on public.item_availability
  for all using (
    exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- borrow_requests: participants read; only the borrower inserts.
-- No UPDATE/DELETE policies — transaction state changes go through
-- security definer functions only.
-- ---------------------------------------------------------------------------

create policy "participants read request" on public.borrow_requests
  for select using (borrower_id = auth.uid() or lender_id = auth.uid() or public.is_admin());
create policy "borrower inserts request" on public.borrow_requests
  for insert with check (
    borrower_id = auth.uid()
    and lender_id = (select owner_id from public.items where id = item_id)
  );

-- ---------------------------------------------------------------------------
-- agreements: participants read; writes only via functions
-- ---------------------------------------------------------------------------

create policy "participants read agreement" on public.agreements
  for select using (public.is_request_participant(borrow_request_id));

-- ---------------------------------------------------------------------------
-- condition reports & images: participants only
-- ---------------------------------------------------------------------------

create policy "participants read reports" on public.condition_reports
  for select using (public.is_request_participant(borrow_request_id));
create policy "participants insert own report" on public.condition_reports
  for insert with check (submitted_by = auth.uid() and public.is_request_participant(borrow_request_id));

create policy "participants read report images" on public.condition_images
  for select using (
    exists (
      select 1 from public.condition_reports cr
      where cr.id = condition_report_id and public.is_request_participant(cr.borrow_request_id)
    )
  );
create policy "participants insert report images" on public.condition_images
  for insert with check (
    exists (
      select 1 from public.condition_reports cr
      where cr.id = condition_report_id and cr.submitted_by = auth.uid() and public.is_request_participant(cr.borrow_request_id)
    )
  );

-- ---------------------------------------------------------------------------
-- reviews: published reviews are readable; participants insert their own
-- (transaction must be COMPLETED and unreviewed — enforced by the
-- create_review function and the one-per-transaction unique constraint)
-- ---------------------------------------------------------------------------

create policy "read reviews" on public.reviews
  for select using (true);
create policy "insert own review" on public.reviews
  for insert with check (reviewer_id = auth.uid() and public.is_request_participant(borrow_request_id));

-- ---------------------------------------------------------------------------
-- notifications: strictly own
-- ---------------------------------------------------------------------------

create policy "read own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "mark own notifications read" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- saved items: strictly own
-- ---------------------------------------------------------------------------

create policy "own saved items" on public.saved_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- user reports: reporters see their own; admins see and manage all
-- ---------------------------------------------------------------------------

create policy "read own reports" on public.user_reports
  for select using (reporter_id = auth.uid() or public.is_admin());
create policy "insert own report" on public.user_reports
  for insert with check (reporter_id = auth.uid());
create policy "admins manage reports" on public.user_reports
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- push tokens & audit events
-- ---------------------------------------------------------------------------

create policy "own push tokens" on public.push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- audit_events: inserted by definer functions; admins can read
create policy "admins read audit" on public.audit_events
  for select using (public.is_admin());
