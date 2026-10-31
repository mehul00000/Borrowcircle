// Shared domain types for BorrowCircle. Mirrors the Supabase schema in
// supabase/migrations. Money is stored in minor units (paise).

export type BorrowingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'AWAITING_ACKNOWLEDGEMENT'
  | 'READY_FOR_HANDOVER'
  | 'ACTIVE'
  | 'RETURN_INITIATED'
  | 'OVERDUE'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'EXPIRED';

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'UNAVAILABLE' | 'REMOVED';

export type Condition = 'New' | 'Like new' | 'Good' | 'Fair' | 'Heavily Used';

export type ConditionReportType = 'HANDOVER' | 'RETURN';

export type NotificationType =
  | 'BORROW_REQUEST_RECEIVED'
  | 'BORROW_REQUEST_ACCEPTED'
  | 'BORROW_REQUEST_DECLINED'
  | 'AGREEMENT_REQUIRED'
  | 'AGREEMENT_COMPLETED'
  | 'HANDOVER_REMINDER'
  | 'BORROWING_STARTED'
  | 'RETURN_REMINDER'
  | 'RETURN_INITIATED'
  | 'RETURN_COMPLETED'
  | 'BORROWING_OVERDUE'
  | 'DISPUTE_UPDATED'
  | 'NEW_REVIEW';

export type ReportStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_path: string | null;
  city: string | null;
  locality: string | null;
  is_verified: boolean;
  account_status: 'ACTIVE' | 'SUSPENDED';
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

export interface ItemImage {
  id: string;
  item_id: string;
  storage_path: string;
  display_order: number;
}

export interface Item {
  id: string;
  owner_id: string;
  category_id: string;
  title: string;
  description: string;
  condition: Condition;
  borrowing_fee: number;
  security_deposit: number;
  currency: string;
  minimum_days: number;
  maximum_days: number | null;
  location_label: string | null;
  approximate_latitude: number | null;
  approximate_longitude: number | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  // Joined / computed fields (from list queries)
  category?: Pick<Category, 'id' | 'name' | 'slug' | 'icon'> | null;
  owner?: PublicProfile | null;
  images?: ItemImage[] | null;
  image_urls?: string[];
  distance_km?: number | null;
}

export interface PublicProfile {
  id: string;
  full_name: string;
  username: string | null;
  avatar_path: string | null;
  city: string | null;
  locality: string | null;
  is_verified: boolean;
  bio?: string | null;
  created_at?: string;
  rating_avg?: number | null;
  rating_count?: number | null;
}

export interface ItemAvailability {
  id: string;
  item_id: string;
  start_date: string;
  end_date: string;
  is_available: boolean;
}

export interface BorrowRequest {
  id: string;
  item_id: string;
  borrower_id: string;
  lender_id: string;
  start_date: string;
  end_date: string;
  message: string | null;
  borrowing_fee: number;
  security_deposit: number;
  currency: string;
  status: BorrowingStatus;
  created_at: string;
  updated_at: string;
  item?: Item | null;
  borrower?: PublicProfile | null;
  lender?: PublicProfile | null;
}

export interface Agreement {
  id: string;
  borrow_request_id: string;
  version: number;
  agreement_content: Record<string, unknown>;
  borrower_accepted_at: string | null;
  lender_accepted_at: string | null;
  created_at: string;
}

export interface ConditionReport {
  id: string;
  borrow_request_id: string;
  submitted_by: string;
  report_type: ConditionReportType;
  notes: string | null;
  created_at: string;
  images?: { id: string; storage_path: string; url?: string }[];
  submitted_by_profile?: PublicProfile | null;
}

export interface Review {
  id: string;
  borrow_request_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: PublicProfile | null;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
  item?: Item | null;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_item_id: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

// Timeline stage derived from a borrow request status
export interface TimelineStage {
  key: string;
  label: string;
  done: boolean;
  current: boolean;
}
