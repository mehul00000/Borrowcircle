// Development demo data. Used ONLY when Supabase credentials are not
// configured, so both apps remain fully explorable. Isolated from production:
// it lives in this file and in a single storage key (see supabase.ts).

import type { AppNotification, BorrowRequest, Category, ConditionReport, Item, Profile, Review, SavedItem } from './types';

export const DEMO_AVATARS: Record<string, string> = {};

const images = {
  tripod: 'https://images.unsplash.com/photo-1792228170620-601f5f8c3248?auto=format&fit=crop&w=900&q=85',
  camera: 'https://images.unsplash.com/photo-1666594113287-a7c4b050f58e?auto=format&fit=crop&w=900&q=85',
  controller: 'https://images.unsplash.com/photo-1666594113162-36ff41b879df?auto=format&fit=crop&w=900&q=85',
  suitcase: 'https://images.unsplash.com/photo-1595475349262-88ba1e1eecaf?auto=format&fit=crop&w=900&q=85',
  tent: 'https://images.unsplash.com/photo-1663958211279-38c0f1d6f02c?auto=format&fit=crop&w=900&q=85',
  projector: 'https://images.unsplash.com/photo-1711549052851-8db1b4cca67f?auto=format&fit=crop&w=900&q=85',
  community: 'https://images.unsplash.com/photo-1709879057923-9f846b583154?auto=format&fit=crop&w=1400&q=85',
  friends: 'https://images.unsplash.com/photo-1687360441027-27e70655b27e?auto=format&fit=crop&w=1200&q=85',
  drill: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85',
  football: 'https://images.unsplash.com/photo-1614638536572-9151b8a11e5c?auto=format&fit=crop&w=900&q=85',
  lamp: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',
  blender: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=85',
};

export { images };

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', description: null, icon: 'spark', is_active: true },
  { id: 'cat-photography', name: 'Photography', slug: 'photography', description: null, icon: 'camera', is_active: true },
  { id: 'cat-tools', name: 'Tools and Hardware', slug: 'tools-and-hardware', description: null, icon: 'tool', is_active: true },
  { id: 'cat-books', name: 'Books and Study Material', slug: 'books-and-study-material', description: null, icon: 'book', is_active: true },
  { id: 'cat-sports', name: 'Sports and Fitness', slug: 'sports-and-fitness', description: null, icon: 'star', is_active: true },
  { id: 'cat-travel', name: 'Travel and Luggage', slug: 'travel-and-luggage', description: null, icon: 'package', is_active: true },
  { id: 'cat-home', name: 'Home Appliances', slug: 'home-appliances', description: null, icon: 'home', is_active: true },
  { id: 'cat-kitchen', name: 'Kitchen Equipment', slug: 'kitchen-equipment', description: null, icon: 'package', is_active: true },
  { id: 'cat-gaming', name: 'Gaming', slug: 'gaming', description: null, icon: 'spark', is_active: true },
  { id: 'cat-events', name: 'Events and Entertainment', slug: 'events-and-entertainment', description: null, icon: 'star', is_active: true },
  { id: 'cat-furniture', name: 'Furniture', slug: 'furniture', description: null, icon: 'home', is_active: true },
  { id: 'cat-misc', name: 'Miscellaneous', slug: 'miscellaneous', description: null, icon: 'package', is_active: true },
];

export const DEMO_CURRENT_USER_ID = 'demo-user-alex';

export const DEMO_PROFILES: Profile[] = [
  {
    id: DEMO_CURRENT_USER_ID,
    full_name: 'Alex Sharma',
    username: 'alexsharma',
    email: 'alex@example.com',
    phone: null,
    bio: 'Borrowing my way to a lighter footprint.',
    avatar_path: null,
    city: 'Delhi',
    locality: 'RK Puram',
    is_verified: true,
    account_status: 'ACTIVE',
    created_at: '2025-03-14T10:00:00Z',
    updated_at: '2025-03-14T10:00:00Z',
  },
  {
    id: 'demo-user-maya',
    full_name: 'Maya Kapoor',
    username: 'mayak',
    email: 'maya@example.com',
    phone: null,
    bio: 'Photographer sharing my gear with the neighbourhood.',
    avatar_path: null,
    city: 'Delhi',
    locality: 'RK Puram',
    is_verified: true,
    account_status: 'ACTIVE',
    created_at: '2025-01-08T10:00:00Z',
    updated_at: '2025-01-08T10:00:00Z',
  },
  {
    id: 'demo-user-rohan',
    full_name: 'Rohan Verma',
    username: 'rohanv',
    email: 'rohan@example.com',
    phone: null,
    bio: 'Weekend DIY enthusiast.',
    avatar_path: null,
    city: 'Delhi',
    locality: 'Green Park',
    is_verified: false,
    account_status: 'ACTIVE',
    created_at: '2025-02-20T10:00:00Z',
    updated_at: '2025-02-20T10:00:00Z',
  },
  {
    id: 'demo-user-neha',
    full_name: 'Neha Singh',
    username: 'nehas',
    email: 'neha@example.com',
    phone: null,
    bio: 'Traveller. Lender of suitcases and tents.',
    avatar_path: null,
    city: 'Delhi',
    locality: 'Hauz Khas',
    is_verified: true,
    account_status: 'ACTIVE',
    created_at: '2024-11-02T10:00:00Z',
    updated_at: '2024-11-02T10:00:00Z',
  },
];

function item(
  id: string,
  owner_id: string,
  category_id: string,
  title: string,
  description: string,
  condition: Item['condition'],
  borrowing_fee: number,
  image: string,
  distance_km: number,
  available: boolean,
): Item {
  return {
    id,
    owner_id,
    category_id,
    title,
    description,
    condition,
    borrowing_fee,
    security_deposit: borrowing_fee * 5,
    currency: 'INR',
    minimum_days: 1,
    maximum_days: 14,
    location_label: 'RK Puram, Delhi',
    approximate_latitude: 28.5673 + (Math.random() - 0.5) * 0.02,
    approximate_longitude: 77.1855 + (Math.random() - 0.5) * 0.02,
    status: available ? 'ACTIVE' : 'ACTIVE',
    created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    category: DEMO_CATEGORIES.find((c) => c.id === category_id) ?? null,
    owner: DEMO_PROFILES.find((p) => p.id === owner_id) as PublicOwner,
    images: [{ id: `${id}-img-1`, item_id: id, storage_path: image, display_order: 0 }],
    image_urls: [image],
    distance_km,
  };
}

type PublicOwner = NonNullable<Item['owner']>;

export function buildDemoItems(): Item[] {
  return [
    item('demo-item-1', 'demo-user-maya', 'cat-photography', 'Sony Camera Tripod', 'A sturdy aluminium tripod with a fluid head, perfect for photography and video. Includes a quick-release plate and carry bag.', 'Good', 5000, images.tripod, 1.2, true),
    item('demo-item-2', 'demo-user-rohan', 'cat-tools', 'Cordless Drill Machine', '18V cordless drill with two batteries and a 40-piece bit set. Ideal for furniture assembly and wall mounting.', 'Like new', 8000, images.drill, 2.1, true),
    item('demo-item-3', 'demo-user-neha', 'cat-travel', 'Camping Tent for Four', 'Waterproof 4-person dome tent, easy 10-minute setup. Comes with ground sheet and pegs.', 'Good', 12000, images.tent, 3.4, true),
    item('demo-item-4', 'demo-user-maya', 'cat-electronics', 'Portable HD Projector', '1080p portable projector with HDMI and USB-C. Great for movie nights and presentations.', 'Like new', 15000, images.projector, 1.8, true),
    item('demo-item-5', 'demo-user-maya', 'cat-gaming', 'DualSense Controller', 'PlayStation 5 wireless controller in excellent condition. Includes USB-C charging cable.', 'Like new', 7000, images.controller, 1.5, true),
    item('demo-item-6', 'demo-user-neha', 'cat-travel', 'Cabin Travel Suitcase', 'Hard-shell 55cm cabin suitcase with TSA lock and smooth spinner wheels.', 'Good', 6000, images.suitcase, 2.5, true),
    item('demo-item-7', 'demo-user-rohan', 'cat-sports', 'Football, Size 5', 'Match-quality football, barely used. Perfect for a weekend game in the park.', 'Good', 0, images.football, 0.9, true),
    item('demo-item-8', 'demo-user-maya', 'cat-home', 'Study Table Lamp', 'Adjustable LED desk lamp with three brightness levels and a USB charging port.', 'Good', 0, images.lamp, 1.1, true),
    item('demo-item-9', 'demo-user-neha', 'cat-kitchen', 'Countertop Blender', '700W blender with two jars. Great for smoothies and soups when hosting.', 'Like new', 9000, images.blender, 2.8, true),
  ];
}

export const DEMO_BORROW_REQUESTS: BorrowRequest[] = [
  {
    id: 'demo-request-1',
    item_id: 'demo-item-4',
    borrower_id: DEMO_CURRENT_USER_ID,
    lender_id: 'demo-user-maya',
    start_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
    message: 'Hi Maya! Could I borrow the projector for movie night on Saturday?',
    borrowing_fee: 45000,
    security_deposit: 75000,
    currency: 'INR',
    status: 'PENDING',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'demo-request-2',
    item_id: 'demo-item-1',
    borrower_id: 'demo-user-neha',
    lender_id: DEMO_CURRENT_USER_ID,
    start_date: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    message: 'Borrowing the tripod for a family shoot this weekend.',
    borrowing_fee: 10000,
    security_deposit: 25000,
    currency: 'INR',
    status: 'PENDING',
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
];

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'demo-notif-1',
    user_id: DEMO_CURRENT_USER_ID,
    type: 'BORROW_REQUEST_RECEIVED',
    title: 'New borrow request',
    message: 'Neha Singh requested to borrow Sony Camera Tripod.',
    reference_id: 'demo-request-2',
    is_read: false,
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    id: 'demo-notif-2',
    user_id: DEMO_CURRENT_USER_ID,
    type: 'BORROW_REQUEST_ACCEPTED',
    title: 'Request sent',
    message: 'Your request for Portable HD Projector was sent to Maya Kapoor.',
    reference_id: 'demo-request-1',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

export interface DemoStore {
  profiles: Profile[];
  items: Item[];
  requests: BorrowRequest[];
  notifications: AppNotification[];
  saved: SavedItem[];
  reviews: Review[];
  reports: ConditionReport[];
}
