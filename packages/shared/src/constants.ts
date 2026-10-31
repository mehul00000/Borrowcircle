import type { BorrowingStatus, Condition } from './types';

export const CONDITIONS: Condition[] = ['New', 'Like new', 'Good', 'Fair', 'Heavily Used'];

export const STATUS_LABELS: Record<BorrowingStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  AWAITING_ACKNOWLEDGEMENT: 'Agreement awaiting acknowledgement',
  READY_FOR_HANDOVER: 'Ready for handover',
  ACTIVE: 'Borrowing active',
  RETURN_INITIATED: 'Return initiated',
  OVERDUE: 'Overdue',
  DISPUTED: 'Disputed',
  COMPLETED: 'Completed',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

// Ordered happy-path stages for the transaction timeline
export const TIMELINE_STAGES: { key: string; label: string; statuses: BorrowingStatus[] }[] = [
  { key: 'submitted', label: 'Request Submitted', statuses: ['PENDING', 'ACCEPTED', 'AWAITING_ACKNOWLEDGEMENT', 'READY_FOR_HANDOVER', 'ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'DISPUTED', 'COMPLETED'] },
  { key: 'accepted', label: 'Request Accepted', statuses: ['ACCEPTED', 'AWAITING_ACKNOWLEDGEMENT', 'READY_FOR_HANDOVER', 'ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'DISPUTED', 'COMPLETED'] },
  { key: 'agreement', label: 'Agreement Acknowledged', statuses: ['READY_FOR_HANDOVER', 'ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'DISPUTED', 'COMPLETED'] },
  { key: 'handover', label: 'Handover Completed', statuses: ['ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'DISPUTED', 'COMPLETED'] },
  { key: 'active', label: 'Borrowing Active', statuses: ['ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'DISPUTED', 'COMPLETED'] },
  { key: 'return', label: 'Return Initiated', statuses: ['RETURN_INITIATED', 'OVERDUE', 'DISPUTED', 'COMPLETED'] },
  { key: 'returned', label: 'Return Confirmed', statuses: ['COMPLETED'] },
  { key: 'completed', label: 'Transaction Completed', statuses: ['COMPLETED'] },
];

// Listing creation wizard (web + mobile share the same step order)
export const WIZARD_STEPS = ['Photos', 'Details', 'Borrowing Terms', 'Availability', 'Location', 'Preview'] as const;

// Categories used as discovery shortcuts. Canonical full list lives in the
// categories table; these slugs match the seed data.
export const CATEGORY_SHORTCUTS: { name: string; slug: string; count: string }[] = [
  { name: 'Photography', slug: 'photography', count: '86 items' },
  { name: 'Tools', slug: 'tools-and-hardware', count: '124 items' },
  { name: 'Electronics', slug: 'electronics', count: '98 items' },
  { name: 'Books', slug: 'books-and-study-material', count: '210 items' },
  { name: 'Travel', slug: 'travel-and-luggage', count: '74 items' },
  { name: 'Sports', slug: 'sports-and-fitness', count: '112 items' },
];

export const DEFAULT_LOCATION = { label: 'RK Puram, Delhi', city: 'Delhi', locality: 'RK Puram', latitude: 28.5673, longitude: 77.1855 };

export const DISPUTE_REASONS = ['Damaged item', 'Missing item', 'Late return', 'Item not as described', 'Condition disagreement', 'Other'];

export const APP_NAME = 'BorrowCircle';
