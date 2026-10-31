-- BorrowCircle — views and database functions.
-- All sensitive workflow mutations live here: they validate the caller via
-- auth.uid(), run atomically, write notifications/audit rows, and never trust
-- client-supplied identities.

-- ---------------------------------------------------------------------------
-- Views
-- ---------------------------------------------------------------------------

-- Public profile data: no phone, no exact coordinates.
create or replace view public.public_profiles as
select
  p.id,
  p.full_name,
  p.username,
  p.avatar_path,
  p.city,
  p.locality,
  p.bio,
  p.is_verified,
  p.account_status,
  p.created_at,
  (select round(avg(r.rating)::numeric, 2) from public.reviews r where r.reviewee_id = p.id) as rating_avg,
  (select count(*) from public.reviews r where r.reviewee_id = p.id) as rating_count
from public.profiles p
where p.account_status = 'ACTIVE';

grant select on public.public_profiles to authenticated;

-- Item with category, public owner and image paths.
create or replace view public.item_details as
select
  i.*,
  to_jsonb(c) filter (where c is not null) as category,
  to_jsonb(pp) as owner,
  coalesce(
    (select jsonb_agg(jsonb_build_object('id', im.id, 'item_id', im.item_id, 'storage_path', im.storage_path, 'display_order', im.display_order) order by im.display_order)
     from public.item_images im where im.item_id = i.id),
    '[]'::jsonb
  ) as images
from public.items i
join public.categories c on c.id = i.category_id
left join public.public_profiles pp on pp.id = i.owner_id;

-- Borrow request hydrated with item and participant profiles.
create or replace view public.request_details as
select
  br.*,
  to_jsonb(id) as item,
  to_jsonb(pb) as borrower,
  to_jsonb(pl) as lender
from public.borrow_requests br
join public.item_details id on id.id = br.item_id
left join public.public_profiles pb on pb.id = br.borrower_id
left join public.public_profiles pl on pl.id = br.lender_id;

create or replace view public.review_details as
select r.*, to_jsonb(pp) as reviewer
from public.reviews r
left join public.public_profiles pp on pp.id = r.reviewer_id;

grant select on public.item_details to anon, authenticated;
grant select on public.request_details to authenticated;
grant select on public.review_details to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.notify(
  p_user_id text,
  p_type public.notification_type,
  p_title text,
  p_message text,
  p_reference_id uuid default null
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, type, title, message, reference_id)
  values (p_user_id, p_type, p_title, p_message, p_reference_id);
$$;

create or replace function public.audit(
  p_event_type text,
  p_reference_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.audit_events (actor_id, event_type, reference_id, metadata)
  values (auth.uid(), p_event_type, p_reference_id, p_metadata);
$$;

create or replace function public.build_agreement_content(br public.borrow_requests)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'item_id', br.item_id,
    'item_title', (select title from public.items where id = br.item_id),
    'start_date', br.start_date,
    'end_date', br.end_date,
    'borrowing_fee', br.borrowing_fee,
    'security_deposit', br.security_deposit,
    'currency', br.currency,
    'responsibilities', jsonb_build_array(
      'Treat the item with care and use it only for its intended purpose.',
      'Return the item on or before the agreed return date, in the recorded condition.',
      'The security deposit is refunded after a satisfactory return check.',
      'Report any damage or loss immediately through BorrowCircle.'
    ),
    'version_note', 'This agreement is an immutable snapshot of the terms both parties accepted.'
  );
$$;

-- ---------------------------------------------------------------------------
-- Discovery search
-- ---------------------------------------------------------------------------

create or replace function public.search_items(
  p_query text default null,
  p_category_slug text default null,
  p_condition text default null,
  p_max_fee bigint default null,
  p_sort text default 'recommended',
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_limit integer default 60
) returns setof public.item_details
language sql
stable
set search_path = public
as $$
  select d.*
  from public.item_details d
  where d.status = 'ACTIVE'
    and (p_query is null or d.title ilike '%' || p_query || '%' or d.description ilike '%' || p_query || '%' or d.category->>'name' ilike '%' || p_query || '%')
    and (p_category_slug is null or d.category->>'slug' = p_category_slug)
    and (p_condition is null or d.condition = p_condition)
    and (p_max_fee is null or d.borrowing_fee <= p_max_fee)
  order by
    case
      when p_sort = 'price_asc' then d.borrowing_fee
      when p_sort = 'newest' then null
      else null
    end asc nulls last,
    case when p_sort = 'newest' then d.created_at end desc nulls last,
    case
      when p_sort = 'nearest' and p_latitude is not null and p_longitude is not null and d.approximate_latitude is not null
        then (6371 * 2 * asin(sqrt(
          power(sin(radians(d.approximate_latitude - p_latitude) / 2), 2) +
          cos(radians(p_latitude)) * cos(radians(d.approximate_latitude)) *
          power(sin(radians(d.approximate_longitude - p_longitude) / 2), 2))))
      when p_sort = 'nearest' then 1e9
      else null
    end asc nulls last,
    d.created_at desc
  limit least(p_limit, 100);
$$;

-- Haversine distance in km, used by clients for the "x km away" label.
create or replace function public.distance_km(
  lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision
) returns double precision
language sql
immutable
as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lon2 - lon1) / 2), 2)));
$$;

-- ---------------------------------------------------------------------------
-- Borrow request lifecycle
-- ---------------------------------------------------------------------------

create or replace function public.create_borrow_request(
  p_item_id uuid,
  p_start_date date,
  p_end_date date,
  p_message text default null
) returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.items;
  v_request public.borrow_requests;
  v_days integer;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED: sign in first';
  end if;

  select * into v_item from public.items where id = p_item_id;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: item not found';
  end if;
  if v_item.status <> 'ACTIVE' then
    raise exception 'VALIDATION_ERROR: this listing is not active';
  end if;
  if v_item.owner_id = auth.uid() then
    raise exception 'FORBIDDEN: you cannot borrow your own item';
  end if;
  if p_end_date <= p_start_date then
    raise exception 'VALIDATION_ERROR: the return date must be after the start date';
  end if;
  if p_start_date < current_date then
    raise exception 'VALIDATION_ERROR: the start date cannot be in the past';
  end if;

  v_days := (p_end_date - p_start_date);
  if v_days < v_item.minimum_days then
    raise exception 'VALIDATION_ERROR: minimum borrowing duration is % day(s)', v_item.minimum_days;
  end if;
  if v_item.maximum_days is not null and v_days > v_item.maximum_days then
    raise exception 'VALIDATION_ERROR: maximum borrowing duration is % day(s)', v_item.maximum_days;
  end if;

  insert into public.borrow_requests (
    item_id, borrower_id, lender_id, start_date, end_date, message,
    borrowing_fee, security_deposit, currency, status
  ) values (
    v_item.id, auth.uid(), v_item.owner_id, p_start_date, p_end_date, p_message,
    v_item.borrowing_fee * v_days, v_item.security_deposit, v_item.currency, 'PENDING'
  )
  returning * into v_request;

  perform public.notify(
    v_item.owner_id,
    'BORROW_REQUEST_RECEIVED',
    'New borrow request',
    (select full_name from public.profiles where id = auth.uid()) || ' requested to borrow ' || v_item.title || '.',
    v_request.id
  );
  perform public.audit('borrow_request_created', v_request.id, jsonb_build_object('item_id', v_item.id));

  return v_request;
end;
$$;

create or replace function public.accept_borrow_request(p_request_id uuid)
returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
  v_item public.items;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED: sign in first';
  end if;

  -- Lock the item row so concurrent acceptances serialise
  select * into v_request from public.borrow_requests where id = p_request_id for update;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.lender_id <> auth.uid() then
    raise exception 'FORBIDDEN: only the item owner can accept requests';
  end if;
  if v_request.status <> 'PENDING' then
    raise exception 'INVALID_TRANSACTION_STATE: only pending requests can be accepted';
  end if;

  select * into v_item from public.items where id = v_request.item_id for update;
  if v_item.status <> 'ACTIVE' then
    raise exception 'VALIDATION_ERROR: this listing is no longer active';
  end if;

  -- Recheck overlapping confirmed reservations (exclusion constraint backs this up)
  if exists (
    select 1 from public.borrow_requests other
    where other.id <> v_request.id
      and other.item_id = v_request.item_id
      and other.status in ('ACCEPTED', 'AWAITING_ACKNOWLEDGEMENT', 'READY_FOR_HANDOVER', 'ACTIVE', 'RETURN_INITIATED', 'OVERDUE')
      and other.start_date < v_request.end_date
      and v_request.start_date < other.end_date
  ) then
    raise exception 'RESERVATION_CONFLICT: the item is no longer available for these dates';
  end if;

  update public.borrow_requests
  set status = 'AWAITING_ACKNOWLEDGEMENT', accepted_at = now(), updated_at = now()
  where id = v_request.id
  returning * into v_request;

  insert into public.agreements (borrow_request_id, version, agreement_content)
  values (v_request.id, 1, public.build_agreement_content(v_request));

  perform public.notify(
    v_request.borrower_id,
    'BORROW_REQUEST_ACCEPTED',
    'Request accepted',
    'Your borrowing request was accepted. Please review and acknowledge the agreement.',
    v_request.id
  );
  perform public.notify(
    v_request.borrower_id,
    'AGREEMENT_REQUIRED',
    'Agreement awaiting your acknowledgement',
    'Review the borrowing agreement for this transaction.',
    v_request.id
  );
  perform public.audit('borrow_request_accepted', v_request.id, jsonb_build_object('item_id', v_item.id));

  return v_request;
exception
  when exclude_violation then
    raise exception 'RESERVATION_CONFLICT: the item is no longer available for these dates';
end;
$$;

create or replace function public.decline_borrow_request(p_request_id uuid)
returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
begin
  select * into v_request from public.borrow_requests where id = p_request_id for update;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.lender_id <> auth.uid() then
    raise exception 'FORBIDDEN: only the item owner can decline requests';
  end if;
  if v_request.status <> 'PENDING' then
    raise exception 'INVALID_TRANSACTION_STATE: only pending requests can be declined';
  end if;
  update public.borrow_requests
  set status = 'DECLINED', updated_at = now()
  where id = v_request.id
  returning * into v_request;
  perform public.notify(
    v_request.borrower_id, 'BORROW_REQUEST_DECLINED', 'Request declined',
    'Your borrowing request was declined.', v_request.id
  );
  perform public.audit('borrow_request_declined', v_request.id);
  return v_request;
end;
$$;

create or replace function public.cancel_borrow_request(p_request_id uuid)
returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
  v_other uuid;
begin
  select * into v_request from public.borrow_requests where id = p_request_id for update;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.borrower_id <> auth.uid() and v_request.lender_id <> auth.uid() then
    raise exception 'FORBIDDEN: only transaction participants can cancel';
  end if;
  if v_request.status not in ('PENDING', 'ACCEPTED', 'AWAITING_ACKNOWLEDGEMENT', 'READY_FOR_HANDOVER') then
    raise exception 'INVALID_TRANSACTION_STATE: this transaction can no longer be cancelled';
  end if;
  update public.borrow_requests
  set status = 'CANCELLED', updated_at = now()
  where id = v_request.id
  returning * into v_request;
  v_other := case when v_request.borrower_id = auth.uid() then v_request.lender_id else v_request.borrower_id end;
  perform public.notify(v_other, 'DISPUTE_UPDATED', 'Transaction cancelled', 'The borrowing transaction was cancelled.', v_request.id);
  perform public.audit('borrow_request_cancelled', v_request.id);
  return v_request;
end;
$$;

create or replace function public.acknowledge_agreement(p_request_id uuid)
returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
  v_agreement public.agreements;
begin
  select * into v_request from public.borrow_requests where id = p_request_id for update;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.borrower_id <> auth.uid() and v_request.lender_id <> auth.uid() then
    raise exception 'FORBIDDEN: only transaction participants can acknowledge';
  end if;
  if v_request.status <> 'AWAITING_ACKNOWLEDGEMENT' then
    raise exception 'INVALID_TRANSACTION_STATE: the agreement is not awaiting acknowledgement';
  end if;
  select * into v_agreement from public.agreements where borrow_request_id = v_request.id;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: agreement not found';
  end if;

  if v_request.borrower_id = auth.uid() then
    if v_agreement.borrower_accepted_at is not null then
      raise exception 'INVALID_TRANSACTION_STATE: you already acknowledged this agreement';
    end if;
    update public.agreements set borrower_accepted_at = now() where id = v_agreement.id;
  else
    if v_agreement.lender_accepted_at is not null then
      raise exception 'INVALID_TRANSACTION_STATE: you already acknowledged this agreement';
    end if;
    update public.agreements set lender_accepted_at = now() where id = v_agreement.id;
  end if;

  select * into v_agreement from public.agreements where id = v_agreement.id;
  if v_agreement.borrower_accepted_at is not null and v_agreement.lender_accepted_at is not null then
    update public.borrow_requests
    set status = 'READY_FOR_HANDOVER', updated_at = now()
    where id = v_request.id
    returning * into v_request;
    perform public.notify(v_request.borrower_id, 'AGREEMENT_COMPLETED', 'Agreement complete', 'Both parties acknowledged the agreement. Time to arrange handover.', v_request.id);
    perform public.notify(v_request.lender_id, 'AGREEMENT_COMPLETED', 'Agreement complete', 'Both parties acknowledged the agreement. Time to arrange handover.', v_request.id);
  end if;
  perform public.audit('agreement_acknowledged', v_request.id, jsonb_build_object('by', auth.uid()));
  return v_request;
end;
$$;

create or replace function public.confirm_item_receipt(p_request_id uuid)
returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
begin
  select * into v_request from public.borrow_requests where id = p_request_id for update;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.borrower_id <> auth.uid() then
    raise exception 'FORBIDDEN: only the borrower can confirm receipt';
  end if;
  if v_request.status <> 'READY_FOR_HANDOVER' then
    raise exception 'INVALID_TRANSACTION_STATE: the transaction is not ready for handover';
  end if;
  if not exists (
    select 1 from public.condition_reports
    where borrow_request_id = v_request.id and report_type = 'HANDOVER'
  ) then
    raise exception 'VALIDATION_ERROR: the lender must record the handover condition first';
  end if;
  update public.borrow_requests
  set status = 'ACTIVE', updated_at = now()
  where id = v_request.id
  returning * into v_request;
  perform public.notify(v_request.lender_id, 'BORROWING_STARTED', 'Borrowing started', 'The borrower confirmed receipt. The borrowing is now active.', v_request.id);
  perform public.audit('item_receipt_confirmed', v_request.id);
  return v_request;
end;
$$;

create or replace function public.initiate_return(p_request_id uuid)
returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
begin
  select * into v_request from public.borrow_requests where id = p_request_id for update;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.borrower_id <> auth.uid() then
    raise exception 'FORBIDDEN: only the borrower can initiate the return';
  end if;
  if v_request.status not in ('ACTIVE', 'OVERDUE') then
    raise exception 'INVALID_TRANSACTION_STATE: the borrowing is not active';
  end if;
  update public.borrow_requests
  set status = 'RETURN_INITIATED', updated_at = now()
  where id = v_request.id
  returning * into v_request;
  perform public.notify(v_request.lender_id, 'RETURN_INITIATED', 'Return initiated', 'The borrower initiated the return. Arrange the handback.', v_request.id);
  perform public.audit('return_initiated', v_request.id);
  return v_request;
end;
$$;

create or replace function public.confirm_item_return(p_request_id uuid)
returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
begin
  select * into v_request from public.borrow_requests where id = p_request_id for update;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.lender_id <> auth.uid() then
    raise exception 'FORBIDDEN: only the lender can confirm the return';
  end if;
  if v_request.status not in ('RETURN_INITIATED', 'OVERDUE') then
    raise exception 'INVALID_TRANSACTION_STATE: a return has not been initiated';
  end if;
  update public.borrow_requests
  set status = 'COMPLETED', completed_at = now(), updated_at = now()
  where id = v_request.id
  returning * into v_request;
  perform public.notify(v_request.borrower_id, 'RETURN_COMPLETED', 'Return confirmed', 'The return was confirmed. You can now leave a review.', v_request.id);
  perform public.notify(v_request.lender_id, 'RETURN_COMPLETED', 'Return confirmed', 'The return was confirmed. You can now leave a review.', v_request.id);
  perform public.audit('return_confirmed', v_request.id);
  return v_request;
end;
$$;

create or replace function public.report_issue(p_request_id uuid, p_reason text)
returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
begin
  select * into v_request from public.borrow_requests where id = p_request_id for update;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.borrower_id <> auth.uid() and v_request.lender_id <> auth.uid() then
    raise exception 'FORBIDDEN: only transaction participants can report an issue';
  end if;
  if v_request.status not in ('ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'READY_FOR_HANDOVER') then
    raise exception 'INVALID_TRANSACTION_STATE: an issue cannot be reported in this state';
  end if;
  update public.borrow_requests
  set status = 'DISPUTED', updated_at = now()
  where id = v_request.id
  returning * into v_request;
  insert into public.user_reports (reporter_id, reported_user_id, reported_item_id, reason, description)
  values (
    auth.uid(),
    case when v_request.borrower_id = auth.uid() then v_request.lender_id else v_request.borrower_id end,
    v_request.item_id,
    p_reason,
    'Disputed transaction ' || v_request.id
  );
  perform public.notify(v_request.borrower_id, 'DISPUTE_UPDATED', 'Dispute opened', 'A dispute was opened on this transaction. An administrator will review it.', v_request.id);
  perform public.notify(v_request.lender_id, 'DISPUTE_UPDATED', 'Dispute opened', 'A dispute was opened on this transaction. An administrator will review it.', v_request.id);
  perform public.audit('dispute_opened', v_request.id, jsonb_build_object('reason', p_reason));
  return v_request;
end;
$$;

create or replace function public.resolve_dispute(p_request_id uuid, p_outcome text, p_notes text default null)
returns public.borrow_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN: only administrators can resolve disputes';
  end if;
  if p_outcome not in ('COMPLETED', 'CANCELLED') then
    raise exception 'VALIDATION_ERROR: outcome must be COMPLETED or CANCELLED';
  end if;
  select * into v_request from public.borrow_requests where id = p_request_id for update;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.status <> 'DISPUTED' then
    raise exception 'INVALID_TRANSACTION_STATE: only disputed transactions can be resolved';
  end if;
  update public.borrow_requests
  set status = p_outcome::public.borrowing_status,
      completed_at = case when p_outcome = 'COMPLETED' then now() else completed_at end,
      updated_at = now()
  where id = v_request.id
  returning * into v_request;
  perform public.notify(v_request.borrower_id, 'DISPUTE_UPDATED', 'Dispute resolved', coalesce(p_notes, 'The dispute was resolved by an administrator.'), v_request.id);
  perform public.notify(v_request.lender_id, 'DISPUTE_UPDATED', 'Dispute resolved', coalesce(p_notes, 'The dispute was resolved by an administrator.'), v_request.id);
  perform public.audit('dispute_resolved', v_request.id, jsonb_build_object('outcome', p_outcome, 'notes', p_notes));
  return v_request;
end;
$$;

-- ---------------------------------------------------------------------------
-- Condition reports
-- ---------------------------------------------------------------------------

create or replace function public.create_condition_report(
  p_request_id uuid,
  p_report_type public.condition_report_type,
  p_notes text default null
) returns public.condition_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
  v_report public.condition_reports;
begin
  select * into v_request from public.borrow_requests where id = p_request_id;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.borrower_id <> auth.uid() and v_request.lender_id <> auth.uid() then
    raise exception 'FORBIDDEN: only transaction participants can submit condition reports';
  end if;
  if p_report_type = 'HANDOVER' and v_request.status not in ('READY_FOR_HANDOVER', 'ACTIVE') then
    raise exception 'INVALID_TRANSACTION_STATE: handover conditions are recorded around handover time';
  end if;
  if p_report_type = 'RETURN' and v_request.status not in ('RETURN_INITIATED', 'ACTIVE', 'OVERDUE') then
    raise exception 'INVALID_TRANSACTION_STATE: return conditions are recorded around return time';
  end if;
  if p_notes is not null and char_length(p_notes) > 1000 then
    raise exception 'VALIDATION_ERROR: notes are limited to 1000 characters';
  end if;
  insert into public.condition_reports (borrow_request_id, submitted_by, report_type, notes)
  values (p_request_id, auth.uid(), p_report_type, p_notes)
  returning * into v_report;
  perform public.audit('condition_report_created', p_request_id, jsonb_build_object('type', p_report_type));
  return v_report;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------

create or replace function public.create_review(
  p_request_id uuid,
  p_reviewee_id uuid,
  p_rating integer,
  p_comment text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.borrow_requests;
begin
  select * into v_request from public.borrow_requests where id = p_request_id;
  if not found then
    raise exception 'RESOURCE_NOT_FOUND: request not found';
  end if;
  if v_request.borrower_id <> auth.uid() and v_request.lender_id <> auth.uid() then
    raise exception 'FORBIDDEN: only transaction participants can review';
  end if;
  if v_request.status <> 'COMPLETED' then
    raise exception 'INVALID_TRANSACTION_STATE: reviews can only be left on completed transactions';
  end if;
  if p_reviewee_id <> v_request.borrower_id and p_reviewee_id <> v_request.lender_id then
    raise exception 'FORBIDDEN: you can only review the other party of your transaction';
  end if;
  if p_reviewee_id = auth.uid() then
    raise exception 'FORBIDDEN: you cannot review yourself';
  end if;
  if p_rating < 1 or p_rating > 5 then
    raise exception 'VALIDATION_ERROR: rating must be between 1 and 5';
  end if;
  if exists (select 1 from public.reviews where borrow_request_id = p_request_id and reviewer_id = auth.uid()) then
    raise exception 'VALIDATION_ERROR: you already reviewed this transaction';
  end if;
  insert into public.reviews (borrow_request_id, reviewer_id, reviewee_id, rating, comment)
  values (p_request_id, auth.uid(), p_reviewee_id, p_rating, p_comment);
  perform public.notify(p_reviewee_id, 'NEW_REVIEW', 'New review', 'You received a new review.', p_request_id);
  perform public.audit('review_created', p_request_id, jsonb_build_object('rating', p_rating));
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------

create or replace function public.admin_stats()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'active_listings', (select count(*) from public.items where status = 'ACTIVE'),
    'borrow_requests', (select count(*) from public.borrow_requests),
    'completed_transactions', (select count(*) from public.borrow_requests where status = 'COMPLETED'),
    'open_disputes', (select count(*) from public.borrow_requests where status = 'DISPUTED'),
    'open_reports', (select count(*) from public.user_reports where status = 'OPEN')
  );
$$;

create or replace function public.admin_list_users(p_query text default null)
returns setof public.public_profiles
language sql
security definer
set search_path = public
as $$
  select * from public.public_profiles
  where p_query is null
     or full_name ilike '%' || p_query || '%'
     or email in (select email from public.profiles where email ilike '%' || p_query || '%')
  order by created_at desc
  limit 200;
$$;

create or replace function public.admin_set_user_status(p_user_id text, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN: only administrators can change account status';
  end if;
  if p_status not in ('ACTIVE', 'SUSPENDED') then
    raise exception 'VALIDATION_ERROR: status must be ACTIVE or SUSPENDED';
  end if;
  update public.profiles set account_status = p_status::public.account_status, updated_at = now() where id = p_user_id;
  perform public.audit('account_status_changed', p_user_id, jsonb_build_object('status', p_status));
end;
$$;

-- ---------------------------------------------------------------------------
-- Scheduled jobs (idempotent). Schedule with pg_cron or a cron-invoked
-- scheduled Edge Function, e.g. every 15 minutes:
--   select public.expire_pending_requests();
--   select public.mark_overdue_borrowings();
-- ---------------------------------------------------------------------------

create or replace function public.expire_pending_requests()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with expired as (
    update public.borrow_requests
    set status = 'EXPIRED', updated_at = now()
    where status = 'PENDING' and created_at < now() - interval '72 hours'
    returning *
  )
  select count(*) into v_count from expired;
  return v_count;
end;
$$;

create or replace function public.mark_overdue_borrowings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with overdue as (
    update public.borrow_requests
    set status = 'OVERDUE', updated_at = now()
    where status = 'ACTIVE' and end_date < current_date
    returning *
  )
  select count(*) into v_count from overdue;

  -- Notify exactly once per newly overdue request
  if v_count > 0 then
    perform public.notify(
      r.borrower_id, 'BORROWING_OVERDUE', 'Borrowing overdue',
      'The return date for your borrowing has passed. Please return the item.', r.id
    )
    from public.borrow_requests r
    where r.status = 'OVERDUE' and r.updated_at > now() - interval '1 minute';
    perform public.notify(
      r.lender_id, 'BORROWING_OVERDUE', 'Borrowing overdue',
      'A borrowing from you is overdue.', r.id
    )
    from public.borrow_requests r
    where r.status = 'OVERDUE' and r.updated_at > now() - interval '1 minute';
  end if;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants: expose only what clients need
-- ---------------------------------------------------------------------------

grant execute on function
  public.search_items(text, text, text, bigint, text, double precision, double precision, integer),
  public.distance_km(double precision, double precision, double precision, double precision),
  public.create_borrow_request(uuid, date, date, text),
  public.accept_borrow_request(uuid),
  public.decline_borrow_request(uuid),
  public.cancel_borrow_request(uuid),
  public.acknowledge_agreement(uuid),
  public.confirm_item_receipt(uuid),
  public.initiate_return(uuid),
  public.confirm_item_return(uuid),
  public.report_issue(uuid, text),
  public.resolve_dispute(uuid, text, text),
  public.create_condition_report(uuid, public.condition_report_type, text),
  public.create_review(uuid, uuid, integer, text)
to authenticated;

grant execute on function public.admin_stats(), public.admin_list_users(text), public.admin_set_user_status(uuid, text) to authenticated;

revoke all on public.audit_events from anon, authenticated;
