// Facade for the BorrowCircle data layer.
//
// Default implementation: Supabase (shared by website and mobile) with an
// isolated demo fallback. A platform can register an alternative
// implementation at startup via setBackendImpl — every screen keeps calling
// the exact same functions exported here.

import type { BackendImpl } from './backend-types';
import type { AppNotification, SavedItem, UserReport } from './types';
import * as supa from './supabase-api';
import { setAuthBridge } from './supabase-api';
export { setAuthBridge };

let impl: BackendImpl | null = null;

/** Register a platform-specific backend implementation (optional). */
export function setBackendImpl(next: BackendImpl | null) {
  impl = next;
}

export function backendImplName(): 'custom' | 'supabase-demo' {
  return impl ? 'custom' : 'supabase-demo';
}

// Re-export everything that does not need dispatching (types, helpers, demo
// plumbing). Explicit exports below shadow the star exports of the same name.
export * from './supabase-api';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const signIn: typeof supa.signIn = (email, password) => (impl ? impl.signIn(email, password) : supa.signIn(email, password));

export const signUp: typeof supa.signUp = (input) => (impl ? impl.signUp(input) : supa.signUp(input));

export const signOut: typeof supa.signOut = () => (impl ? impl.signOut() : supa.signOut());

export const sendPasswordReset: typeof supa.sendPasswordReset = (email) => (impl ? impl.sendPasswordReset(email) : supa.sendPasswordReset(email));

export const updatePassword: typeof supa.updatePassword = (newPassword) => (impl ? impl.updatePassword(newPassword) : supa.updatePassword(newPassword));

export const getSessionUser: typeof supa.getSessionUser = () => (impl ? impl.getSessionUser() : supa.getSessionUser());

export const onAuthStateChange: typeof supa.onAuthStateChange = (cb) => (impl ? impl.onAuthStateChange(cb) : supa.onAuthStateChange(cb));

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export const getMyProfile: typeof supa.getMyProfile = () => (impl ? impl.getMyProfile() : supa.getMyProfile());

export const createMyProfile: typeof supa.createMyProfile = (input) => (impl ? impl.createMyProfile(input) : supa.createMyProfile(input));

export const getPublicProfile: typeof supa.getPublicProfile = (userId) => (impl ? impl.getPublicProfile(userId) : supa.getPublicProfile(userId));

export const updateMyProfile: typeof supa.updateMyProfile = (patch) => (impl ? impl.updateMyProfile(patch) : supa.updateMyProfile(patch));

// ---------------------------------------------------------------------------
// Categories & items
// ---------------------------------------------------------------------------

export const listCategories: typeof supa.listCategories = () => (impl ? impl.listCategories() : supa.listCategories());

export const listItems: typeof supa.listItems = (filters) => (impl ? impl.listItems(filters) : supa.listItems(filters));

export const getItem: typeof supa.getItem = (itemId) => (impl ? impl.getItem(itemId) : supa.getItem(itemId));

export const getMyItems: typeof supa.getMyItems = () => (impl ? impl.getMyItems() : supa.getMyItems());

export const createItem: typeof supa.createItem = (input, imageBlobs) => (impl ? impl.createItem(input, imageBlobs) : supa.createItem(input, imageBlobs));

export const updateItemStatus: typeof supa.updateItemStatus = (itemId, status) => (impl ? impl.updateItemStatus(itemId, status) : supa.updateItemStatus(itemId, status));

// ---------------------------------------------------------------------------
// Saved items
// ---------------------------------------------------------------------------

export const listSavedItems: typeof supa.listSavedItems = () => (impl ? impl.listSavedItems() : supa.listSavedItems());

export const toggleSavedItem: typeof supa.toggleSavedItem = (itemId) => (impl ? impl.toggleSavedItem(itemId) : supa.toggleSavedItem(itemId));

export const getSavedItemIds: typeof supa.getSavedItemIds = () => (impl ? impl.getSavedItemIds() : supa.getSavedItemIds());

// ---------------------------------------------------------------------------
// Borrow requests & workflow
// ---------------------------------------------------------------------------

export const createBorrowRequest: typeof supa.createBorrowRequest = (input) => (impl ? impl.createBorrowRequest(input) : supa.createBorrowRequest(input));

export const listMyRequests: typeof supa.listMyRequests = (filters) => (impl ? impl.listMyRequests(filters) : supa.listMyRequests(filters));

export const getBorrowRequest: typeof supa.getBorrowRequest = (requestId) => (impl ? impl.getBorrowRequest(requestId) : supa.getBorrowRequest(requestId));

export const acceptBorrowRequest: typeof supa.acceptBorrowRequest = (requestId) => (impl ? impl.acceptBorrowRequest(requestId) : supa.acceptBorrowRequest(requestId));

export const declineBorrowRequest: typeof supa.declineBorrowRequest = (requestId) => (impl ? impl.declineBorrowRequest(requestId) : supa.declineBorrowRequest(requestId));

export const cancelBorrowRequest: typeof supa.cancelBorrowRequest = (requestId) => (impl ? impl.cancelBorrowRequest(requestId) : supa.cancelBorrowRequest(requestId));

export const reportIssue: typeof supa.reportIssue = (requestId, reason) => (impl ? impl.reportIssue(requestId, reason) : supa.reportIssue(requestId, reason));

export const resolveDispute: typeof supa.resolveDispute = (requestId, outcome, notes) => (impl ? impl.resolveDispute(requestId, outcome, notes) : supa.resolveDispute(requestId, outcome, notes));

export const getAgreement: typeof supa.getAgreement = (requestId) => (impl ? impl.getAgreement(requestId) : supa.getAgreement(requestId));

export const acknowledgeAgreement: typeof supa.acknowledgeAgreement = (requestId) => (impl ? impl.acknowledgeAgreement(requestId) : supa.acknowledgeAgreement(requestId));

export const confirmItemReceipt: typeof supa.confirmItemReceipt = (requestId) => (impl ? impl.confirmItemReceipt(requestId) : supa.confirmItemReceipt(requestId));

export const initiateReturn: typeof supa.initiateReturn = (requestId) => (impl ? impl.initiateReturn(requestId) : supa.initiateReturn(requestId));

export const confirmItemReturn: typeof supa.confirmItemReturn = (requestId) => (impl ? impl.confirmItemReturn(requestId) : supa.confirmItemReturn(requestId));

// ---------------------------------------------------------------------------
// Condition reports & reviews
// ---------------------------------------------------------------------------

export const createConditionReport: typeof supa.createConditionReport = (input) => (impl ? impl.createConditionReport(input) : supa.createConditionReport(input));

export const listConditionReports: typeof supa.listConditionReports = (requestId) => (impl ? impl.listConditionReports(requestId) : supa.listConditionReports(requestId));

export const createReview: typeof supa.createReview = (input) => (impl ? impl.createReview(input) : supa.createReview(input));

export const listReviewsForUser: typeof supa.listReviewsForUser = (userId) => (impl ? impl.listReviewsForUser(userId) : supa.listReviewsForUser(userId));

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const listNotifications: typeof supa.listNotifications = () => (impl ? impl.listNotifications() : supa.listNotifications());

export const markNotificationRead: typeof supa.markNotificationRead = (id) => (impl ? impl.markNotificationRead(id) : supa.markNotificationRead(id));

export const markAllNotificationsRead: typeof supa.markAllNotificationsRead = () => (impl ? impl.markAllNotificationsRead() : supa.markAllNotificationsRead());

export const subscribeToNotifications: typeof supa.subscribeToNotifications = (userId, onInsert) => (impl ? impl.subscribeToNotifications(userId, onInsert) : supa.subscribeToNotifications(userId, onInsert));

export const registerPushToken: typeof supa.registerPushToken = (token, platform) => (impl ? impl.registerPushToken(token, platform) : supa.registerPushToken(token, platform));

// ---------------------------------------------------------------------------
// Reports & admin
// ---------------------------------------------------------------------------

export const createReport: typeof supa.createReport = (input) => (impl ? impl.createReport(input) : supa.createReport(input));

export const getAdminStats: typeof supa.getAdminStats = () => (impl ? impl.getAdminStats() : supa.getAdminStats());

export const adminListUsers: typeof supa.adminListUsers = (query) => (impl ? impl.adminListUsers(query) : supa.adminListUsers(query));

export const adminSetUserStatus: typeof supa.adminSetUserStatus = (userId, status) => (impl ? impl.adminSetUserStatus(userId, status) : supa.adminSetUserStatus(userId, status));

export const adminListReports: typeof supa.adminListReports = () => (impl ? impl.adminListReports() : supa.adminListReports());

export const isAdmin: typeof supa.isAdmin = () => (impl ? impl.isAdmin() : supa.isAdmin());

// Re-exported utility types used by screens
export type { SavedItem, UserReport, AppNotification };
