-- BorrowCircle — indexes for common query patterns

create index if not exists idx_items_owner on public.items(owner_id);
create index if not exists idx_items_category on public.items(category_id);
create index if not exists idx_items_status on public.items(status);
create index if not exists idx_items_created on public.items(created_at desc);
create index if not exists idx_items_title_trgm on public.items using gin (to_tsvector('english', title || ' ' || description));

create index if not exists idx_borrow_requests_borrower on public.borrow_requests(borrower_id);
create index if not exists idx_borrow_requests_lender on public.borrow_requests(lender_id);
create index if not exists idx_borrow_requests_status on public.borrow_requests(status);
create index if not exists idx_borrow_requests_item on public.borrow_requests(item_id);

create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_saved_items_user on public.saved_items(user_id);
create index if not exists idx_item_images_item on public.item_images(item_id, display_order);
create index if not exists idx_condition_reports_request on public.condition_reports(borrow_request_id);
create index if not exists idx_reviews_reviewee on public.reviews(reviewee_id);
create index if not exists idx_user_reports_status on public.user_reports(status);
