-- BorrowCircle — triggers

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_items_updated on public.items;
create trigger trg_items_updated before update on public.items
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_borrow_requests_updated on public.borrow_requests;
create trigger trg_borrow_requests_updated before update on public.borrow_requests
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Note: with Clerk third-party auth there are no auth.users rows and therefore
-- no profile-creation trigger. Profiles are created by the client on first
-- sign-in (see RLS policy in 003 and createMyProfile in the shared API).

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.is_verified = old.is_verified;
    new.account_status = old.account_status;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Guard financial snapshots: once a request leaves PENDING its fee/deposit
-- and party ids are frozen (definer functions bypass triggers, but no direct
-- client update path exists anyway — this is defence in depth).
create or replace function public.freeze_accepted_request()
returns trigger
language plpgsql
as $$
begin
  if old.status <> 'PENDING' then
    new.borrowing_fee = old.borrowing_fee;
    new.security_deposit = old.security_deposit;
    new.borrower_id = old.borrower_id;
    new.lender_id = old.lender_id;
    new.item_id = old.item_id;
    new.start_date = old.start_date;
    new.end_date = old.end_date;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_freeze_request on public.borrow_requests;
create trigger trg_freeze_request before update on public.borrow_requests
  for each row execute function public.freeze_accepted_request();
