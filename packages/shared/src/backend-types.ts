// Contract every pluggable BorrowCircle backend implementation must satisfy.
// The Supabase implementation lives in supabase-api.ts (shared by all apps);
// a platform may register an alternative implementation at runtime via
// setBackendImpl() — e.g. the isolated demo store on devices without config.

import type {
  Agreement,
  AppNotification,
  BorrowRequest,
  Category,
  ConditionReport,
  Item,
  Profile,
  PublicProfile,
  Review,
  SavedItem,
  UserReport,
} from './types';

export interface SessionUser {
  id: string;
  email: string | null;
}

export interface SignUpResult extends SessionUser {
  needsEmailConfirmation: boolean;
}

export interface ItemFilters {
  query?: string;
  categorySlug?: string | null;
  condition?: string | null;
  maxFee?: number | null;
  sort?: 'recommended' | 'nearest' | 'newest' | 'price_asc' | 'rating';
  latitude?: number | null;
  longitude?: number | null;
  limit?: number;
}

export interface RequestFilters {
  role: 'borrower' | 'lender' | 'all';
  status?: BorrowRequest['status'] | BorrowRequest['status'][];
}

export interface CreateItemInput {
  title: string;
  description: string;
  category_id: string;
  condition: Item['condition'];
  borrowing_fee: number;
  security_deposit: number;
  minimum_days: number;
  maximum_days: number | null;
  borrowing_rules: string;
  location_label: string;
  approximate_latitude: number | null;
  approximate_longitude: number | null;
  available_from: string;
  available_until: string;
  status: 'DRAFT' | 'ACTIVE';
}

export interface AdminStats {
  total_users: number;
  active_listings: number;
  borrow_requests: number;
  completed_transactions: number;
  open_disputes: number;
}

export interface AdminUserRow extends Profile {
  listings_count?: number;
}

export type WorkflowResult = Promise<BorrowRequest | void>;

/**
 * App-specific authentication bridge (Clerk on web and mobile). Data
 * functions call getSessionUser() to learn the caller's identity; the
 * interactive flows (sign-in UI etc.) run through Clerk's own hooks in each
 * app, which may delegate to signIn/signUp here when convenient.
 */
export interface AuthBridge {
  signIn(email: string, password: string): Promise<SessionUser>;
  signUp(input: { fullName: string; email: string; password: string }): Promise<SignUpResult>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword?(newPassword: string): Promise<void>;
  getSessionUser(): Promise<SessionUser | null>;
  onAuthStateChange(cb: (user: SessionUser | null) => void): () => void;
}

export interface BackendImpl {
  signIn(email: string, password: string): Promise<SessionUser>;
  signUp(input: { fullName: string; email: string; password: string }): Promise<SignUpResult>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  getSessionUser(): Promise<SessionUser | null>;
  onAuthStateChange(cb: (user: SessionUser | null) => void): () => void;

  getMyProfile(): Promise<Profile | null>;
  createMyProfile(input: { full_name: string; email?: string | null }): Promise<Profile>;
  getPublicProfile(userId: string): Promise<PublicProfile | null>;
  updateMyProfile(patch: Partial<Profile>): Promise<Profile>;

  listCategories(): Promise<Category[]>;
  listItems(filters?: ItemFilters): Promise<Item[]>;
  getItem(itemId: string): Promise<Item | null>;
  getMyItems(): Promise<Item[]>;
  createItem(input: CreateItemInput, imageBlobs: { blob: Blob; fileName: string }[]): Promise<Item>;
  updateItemStatus(itemId: string, status: Item['status']): Promise<void>;

  listSavedItems(): Promise<SavedItem[]>;
  toggleSavedItem(itemId: string): Promise<boolean>;
  getSavedItemIds(): Promise<string[]>;

  createBorrowRequest(input: { item_id: string; start_date: string; end_date: string; message?: string }): Promise<BorrowRequest>;
  listMyRequests(filters: RequestFilters): Promise<BorrowRequest[]>;
  getBorrowRequest(requestId: string): Promise<BorrowRequest | null>;
  acceptBorrowRequest(requestId: string): WorkflowResult;
  declineBorrowRequest(requestId: string): WorkflowResult;
  cancelBorrowRequest(requestId: string): WorkflowResult;
  reportIssue(requestId: string, reason: string): WorkflowResult;
  resolveDispute(requestId: string, outcome: 'COMPLETED' | 'CANCELLED', notes: string): WorkflowResult;

  getAgreement(requestId: string): Promise<Agreement | null>;
  acknowledgeAgreement(requestId: string): WorkflowResult;
  confirmItemReceipt(requestId: string): WorkflowResult;
  initiateReturn(requestId: string): WorkflowResult;
  confirmItemReturn(requestId: string): WorkflowResult;

  createConditionReport(input: { request_id: string; report_type: 'HANDOVER' | 'RETURN'; notes?: string; images: { blob: Blob; fileName: string }[] }): Promise<ConditionReport>;
  listConditionReports(requestId: string): Promise<ConditionReport[]>;

  createReview(input: { request_id: string; reviewee_id: string; rating: number; comment?: string }): Promise<void>;
  listReviewsForUser(userId: string): Promise<Review[]>;

  listNotifications(): Promise<AppNotification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  subscribeToNotifications(userId: string, cb: (n: AppNotification) => void): () => void;

  registerPushToken(token: string, platform?: 'ios' | 'android' | 'web'): Promise<void>;
  createReport(input: { reason: string; description?: string; reported_user_id?: string | null; reported_item_id?: string | null }): Promise<void>;

  getAdminStats(): Promise<AdminStats>;
  adminListUsers(query?: string): Promise<AdminUserRow[]>;
  adminSetUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void>;
  adminListReports(): Promise<UserReport[]>;
  isAdmin(): Promise<boolean>;
}
