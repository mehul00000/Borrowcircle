-- BorrowCircle — development seed data. NEVER run against production.
-- With Clerk third-party auth there are no auth.users rows: profiles use
-- Clerk user ids directly. The ids below are placeholder profiles that own
-- the sample listings so discovery has content before you sign up.

insert into public.categories (name, slug, icon) values
  ('Electronics', 'electronics', 'spark'),
  ('Photography', 'photography', 'camera'),
  ('Tools and Hardware', 'tools-and-hardware', 'tool'),
  ('Books and Study Material', 'books-and-study-material', 'book'),
  ('Sports and Fitness', 'sports-and-fitness', 'star'),
  ('Travel and Luggage', 'travel-and-luggage', 'package'),
  ('Home Appliances', 'home-appliances', 'home'),
  ('Kitchen Equipment', 'kitchen-equipment', 'package'),
  ('Gaming', 'gaming', 'spark'),
  ('Events and Entertainment', 'events-and-entertainment', 'star'),
  ('Furniture', 'furniture', 'home'),
  ('Miscellaneous', 'miscellaneous', 'package')
on conflict (slug) do nothing;

-- Placeholder neighbour profiles that own the demo listings
insert into public.profiles (id, full_name, email, username, bio, city, locality, is_verified)
values
  ('user_seed_maya', 'Maya Kapoor', 'maya@example.com', 'mayak', 'Photographer sharing my gear with the neighbourhood.', 'Delhi', 'RK Puram', true),
  ('user_seed_rohan', 'Rohan Verma', 'rohan@example.com', 'rohanv', 'Weekend DIY enthusiast.', 'Delhi', 'Green Park', false),
  ('user_seed_neha', 'Neha Singh', 'neha@example.com', 'nehas', 'Traveller. Lender of suitcases and tents.', 'Delhi', 'Hauz Khas', true)
on conflict (id) do nothing;

-- Sample listings
insert into public.items (owner_id, category_id, title, description, condition, borrowing_fee, security_deposit, minimum_days, maximum_days, location_label, approximate_latitude, approximate_longitude, status)
select p.id, c.id, v.title, v.description, v.condition, v.fee, v.deposit, v.min_days, v.max_days, v.loc, v.lat, v.lng, v.status
from (values
  ('user_seed_maya', 'photography', 'Sony Camera Tripod', 'A sturdy aluminium tripod with a fluid head, perfect for photography and video. Includes a quick-release plate and carry bag.', 'Good', 5000, 25000, 1, 14, 'RK Puram, Delhi', 28.5673, 77.1855, 'ACTIVE'),
  ('user_seed_maya', 'electronics', 'Portable HD Projector', '1080p portable projector with HDMI and USB-C. Great for movie nights and presentations. Comes with remote and carry case.', 'Like new', 15000, 75000, 1, 7, 'RK Puram, Delhi', 28.5689, 77.1830, 'ACTIVE'),
  ('user_seed_maya', 'gaming', 'DualSense Controller', 'PlayStation 5 wireless controller in excellent condition. Includes USB-C charging cable.', 'Like new', 7000, 35000, 1, 7, 'RK Puram, Delhi', 28.5660, 77.1880, 'ACTIVE'),
  ('user_seed_rohan', 'tools-and-hardware', 'Cordless Drill Machine', '18V cordless drill with two batteries and a 40-piece bit set. Ideal for furniture assembly and wall mounting.', 'Like new', 8000, 40000, 1, 10, 'Green Park, Delhi', 28.5590, 77.2060, 'ACTIVE'),
  ('user_seed_neha', 'travel-and-luggage', 'Camping Tent for Four', 'Waterproof 4-person dome tent, easy 10-minute setup. Comes with ground sheet and pegs.', 'Good', 12000, 60000, 1, 14, 'Hauz Khas, Delhi', 28.5480, 77.2000, 'ACTIVE'),
  ('user_seed_neha', 'travel-and-luggage', 'Cabin Travel Suitcase', 'Hard-shell 55cm cabin suitcase with TSA lock and smooth spinner wheels.', 'Good', 6000, 30000, 1, 14, 'Hauz Khas, Delhi', 28.5470, 77.1990, 'ACTIVE')
) as v(owner, slug, title, description, condition, fee, deposit, min_days, max_days, loc, lat, lng, status)
join public.profiles p on p.id = v.owner
join public.categories c on c.slug = v.slug
where not exists (select 1 from public.items i where i.title = v.title);
