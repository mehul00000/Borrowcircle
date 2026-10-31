-- BorrowCircle — storage buckets and policies.
-- Buckets: item-images (public delivery), profile-images (public delivery),
-- condition-evidence (private, participant-only via signed URLs).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('item-images', 'item-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('profile-images', 'profile-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('condition-evidence', 'condition-evidence', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Helper: is the caller a participant of the borrow request encoded in a
-- condition-evidence path ("{request_id}/{handover|return}/...")?
create or replace function public.can_access_condition_evidence(p_path text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
begin
  begin
    v_request_id := (split_part(p_path, '/', 1))::uuid;
  exception when others then
    return false;
  end;
  return public.is_request_participant(v_request_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- item-images: {user_id}/{item_id}/... — owner writes, everyone reads
-- ---------------------------------------------------------------------------

create policy "public read item images" on storage.objects
  for select using (bucket_id = 'item-images');

create policy "owner writes item images" on storage.objects
  for insert with check (
    bucket_id = 'item-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "owner updates item images" on storage.objects
  for update using (
    bucket_id = 'item-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "owner deletes item images" on storage.objects
  for delete using (
    bucket_id = 'item-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- profile-images: {user_id}/avatar.webp — owner writes, everyone reads
-- ---------------------------------------------------------------------------

create policy "public read profile images" on storage.objects
  for select using (bucket_id = 'profile-images');

create policy "owner writes profile images" on storage.objects
  for insert with check (
    bucket_id = 'profile-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "owner updates profile images" on storage.objects
  for update using (
    bucket_id = 'profile-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "owner deletes profile images" on storage.objects
  for delete using (
    bucket_id = 'profile-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- condition-evidence: private; only transaction participants may read or
-- write inside their request folder. Delivered through short-lived signed URLs.
-- ---------------------------------------------------------------------------

create policy "participants read condition evidence" on storage.objects
  for select using (
    bucket_id = 'condition-evidence'
    and public.can_access_condition_evidence(name)
  );

create policy "participants write condition evidence" on storage.objects
  for insert with check (
    bucket_id = 'condition-evidence'
    and public.can_access_condition_evidence(name)
  );

create policy "participants update condition evidence" on storage.objects
  for update using (
    bucket_id = 'condition-evidence'
    and public.can_access_condition_evidence(name)
  );

create policy "participants delete condition evidence" on storage.objects
  for delete using (
    bucket_id = 'condition-evidence'
    and public.can_access_condition_evidence(name)
  );
