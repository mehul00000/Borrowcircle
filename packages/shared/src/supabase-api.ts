// Unified BorrowCircle API used by BOTH the website and the mobile app.
// Default implementation: Supabase (data via RLS-protected queries, sensitive
// workflow mutations via database functions exposed through Edge Functions).
// When Supabase credentials are absent the same operations run against an
// isolated in-memory demo store. The shared parameter/result types live in
// backend-types.ts so platform-specific implementations can implement the
// identical contract.

import type {
  AdminStats,
  AdminUserRow,
  AuthBridge,
  CreateItemInput,
  ItemFilters,
  RequestFilters,
  SessionUser,
  SignUpResult,
} from './backend-types';

export type { AdminStats, AdminUserRow, CreateItemInput, ItemFilters, RequestFilters, SessionUser, SignUpResult };

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  backendError,
  DEMO_MODE_KEY,
  getBackend,
  ServiceError,
  type StorageLike,
} from './supabase';
import {
  buildDemoItems,
  DEMO_BORROW_REQUESTS,
  DEMO_CATEGORIES,
  DEMO_CURRENT_USER_ID,
  DEMO_NOTIFICATIONS,
  DEMO_PROFILES,
  type DemoStore,
} from './demo-data';
import { dayCount, haversineKm } from './format';
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

// ---------------------------------------------------------------------------
// Auth bridge (Clerk)
// ---------------------------------------------------------------------------

let authBridge: AuthBridge | null = null;

/** Register the app-specific Clerk auth bridge. Pass null to unregister. */
export function setAuthBridge(bridge: AuthBridge | null) {
  authBridge = bridge;
}

// ---------------------------------------------------------------------------
// Demo store (persisted through the platform storage adapter when provided)
// ---------------------------------------------------------------------------

let storage: StorageLike | null = null;
let demoStore: DemoStore | null = null;
let demoSession: Profile | null = null;

export const DEMO_USER_ID = DEMO_CURRENT_USER_ID;

export function configureDemoStorage(s: StorageLike | null) {
  storage = s;
}

async function loadDemo(): Promise<DemoStore> {
  if (demoStore) return demoStore;
  if (storage) {
    try {
      const raw = await storage.getItem(DEMO_MODE_KEY);
      if (raw) {
        demoStore = JSON.parse(raw) as DemoStore;
        return demoStore;
      }
    } catch {
      // fall through to a fresh store
    }
  }
  demoStore = {
    profiles: DEMO_PROFILES,
    items: buildDemoItems(),
    requests: DEMO_BORROW_REQUESTS,
    notifications: DEMO_NOTIFICATIONS,
    saved: [],
    reviews: [],
    reports: [],
  };
  await persistDemo();
  return demoStore;
}

async function persistDemo() {
  if (!storage || !demoStore) return;
  try {
    await storage.setItem(DEMO_MODE_KEY, JSON.stringify(demoStore));
  } catch {
    // persistence is best-effort in demo mode
  }
}

function itemWithMeta(store: DemoStore, item: Item): Item {
  const category = DEMO_CATEGORIES.find((c) => c.id === item.category_id) ?? null;
  const owner = store.profiles.find((p) => p.id === item.owner_id) as PublicProfile | undefined;
  const distance =
    item.approximate_latitude != null && item.approximate_longitude != null
      ? haversineKm(28.5673, 77.1855, item.approximate_latitude, item.approximate_longitude)
      : null;
  return { ...item, category, owner: owner ?? null, distance_km: distance };
}

function hydrateRequest(store: DemoStore, r: BorrowRequest): BorrowRequest {
  return {
    ...r,
    item: store.items.find((i) => i.id === r.item_id) ?? null,
    borrower: (store.profiles.find((p) => p.id === r.borrower_id) as PublicProfile | undefined) ?? null,
    lender: (store.profiles.find((p) => p.id === r.lender_id) as PublicProfile | undefined) ?? null,
  };
}

function nextStatus(store: DemoStore, r: BorrowRequest, status: BorrowRequest['status']) {
  r.status = status;
  r.updated_at = new Date().toISOString();
  void persistDemo();
  void store;
}

function demoNotify(userId: string, type: AppNotification['type'], title: string, message: string, reference_id?: string) {
  void loadDemo().then((store) => {
    store.notifications.unshift({
      id: `demo-notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: userId,
      type,
      title,
      message,
      reference_id: reference_id ?? null,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    void persistDemo();
  });
}

// ---------------------------------------------------------------------------
// Session
//
// Authentication is handled by Clerk (both apps). Each app registers an
// AuthBridge once its Clerk provider is ready; the bridge supplies the
// session identity so every data function below can call getSessionUser().
// Supabase receives the matching Clerk JWT per request through the
// accessToken provider (setSupabaseAccessToken) — see supabase.ts.
// Without a bridge (legacy Supabase auth, or demo mode) the original local
// implementations are used.
// ---------------------------------------------------------------------------

export async function signIn(email: string, password: string): Promise<SessionUser> {
  if (authBridge) return authBridge.signIn(email, password);
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw backendError(error);
    return { id: data.user.id, email: data.user.email ?? null };
  }
  const store = await loadDemo();
  const profile = store.profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());
  if (!profile || password.length < 4) throw new ServiceError('UNAUTHENTICATED', 'Invalid email or password.');
  demoSession = profile;
  await persistDemo();
  return { id: profile.id, email: profile.email };
}

export async function signUp(input: { fullName: string; email: string; password: string }): Promise<SignUpResult> {
  if (authBridge) return authBridge.signUp(input);
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { full_name: input.fullName } },
    });
    if (error) throw backendError(error);
    if (!data.user) throw new ServiceError('VALIDATION_ERROR', 'Check your inbox to verify your email before signing in.');
    return { id: data.user.id, email: data.user.email ?? null, needsEmailConfirmation: !data.session };
  }
  const store = await loadDemo();
  if (store.profiles.some((p) => p.email?.toLowerCase() === input.email.toLowerCase())) {
    throw new ServiceError('VALIDATION_ERROR', 'An account with this email already exists.');
  }
  const profile: Profile = {
    id: `demo-user-${Date.now()}`,
    full_name: input.fullName,
    username: null,
    email: input.email,
    phone: null,
    bio: null,
    avatar_path: null,
    city: 'Delhi',
    locality: 'RK Puram',
    is_verified: false,
    account_status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.profiles.push(profile);
  demoSession = profile;
  await persistDemo();
  return { id: profile.id, email: profile.email, needsEmailConfirmation: false };
}

export async function signOut(): Promise<void> {
  if (authBridge) return authBridge.signOut();
  const supabase = getBackend();
  if (supabase) {
    await supabase.auth.signOut();
    return;
  }
  demoSession = null;
  await persistDemo();
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (authBridge) return authBridge.sendPasswordReset(email);
  const supabase = getBackend();
  if (supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw backendError(error);
    return;
  }
  await loadDemo();
  // Demo mode: pretend the email was sent.
}

export async function updatePassword(newPassword: string): Promise<void> {
  if (authBridge?.updatePassword) return authBridge.updatePassword(newPassword);
  const supabase = getBackend();
  if (!supabase) throw new ServiceError('FORBIDDEN', 'Password changes require a connected backend.');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw backendError(error);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (authBridge) return authBridge.getSessionUser();
  const supabase = getBackend();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    return { id: data.session.user.id, email: data.session.user.email ?? null };
  }
  if (demoSession) return { id: demoSession.id, email: demoSession.email };
  const store = await loadDemo();
  demoSession = store.profiles.find((p) => p.id === DEMO_CURRENT_USER_ID) ?? null;
  return demoSession ? { id: demoSession.id, email: demoSession.email } : null;
}

export function onAuthStateChange(cb: (user: SessionUser | null) => void): () => void {
  if (authBridge) return authBridge.onAuthStateChange(cb);
  const supabase = getBackend();
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      cb(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
    });
    return () => data.subscription.unsubscribe();
  }
  return () => {};
}

/**
 * Create the profile row for a Clerk-authenticated user. Supabase third-party
 * auth has no trigger to do this (there is no auth.users row), so apps call
 * it right after the first sign-in; RLS only permits id = auth.uid().
 */
export async function createMyProfile(input: { full_name: string; email?: string | null }): Promise<Profile> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in first.');
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: input.full_name || 'New member',
          email: input.email ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: true },
      )
      .select()
      .single();
    if (error) throw backendError(error);
    return data as Profile;
  }
  const store = await loadDemo();
  const existing = store.profiles.find((p) => p.id === user.id);
  if (existing) {
    existing.full_name = input.full_name || existing.full_name;
    existing.email = input.email ?? existing.email;
    await persistDemo();
    return existing;
  }
  const profile: Profile = {
    id: user.id,
    full_name: input.full_name || 'New member',
    username: null,
    email: input.email ?? null,
    phone: null,
    bio: null,
    avatar_path: null,
    city: 'Delhi',
    locality: 'RK Puram',
    is_verified: false,
    account_status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.profiles.push(profile);
  await persistDemo();
  return profile;
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function getMyProfile(): Promise<Profile | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw backendError(error);
    return data as Profile;
  }
  const store = await loadDemo();
  return store.profiles.find((p) => p.id === user.id) ?? null;
}

export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw backendError(error);
    return data as PublicProfile;
  }
  const store = await loadDemo();
  const p = store.profiles.find((x) => x.id === userId);
  if (!p) return null;
  const { rating_avg, rating_count } = await ratingFor(userId);
  return { ...p, rating_avg, rating_count };
}

async function ratingFor(userId: string): Promise<{ rating_avg: number | null; rating_count: number }> {
  const supabase = getBackend();
  if (supabase) {
    const { data } = await supabase.from('public_profiles').select('rating_avg, rating_count').eq('id', userId).single();
    return { rating_avg: data?.rating_avg ?? null, rating_count: data?.rating_count ?? 0 };
  }
  const store = await loadDemo();
  const mine = store.reviews.filter((r) => r.reviewee_id === userId);
  const avg = mine.length ? mine.reduce((s, r) => s + r.rating, 0) / mine.length : null;
  return { rating_avg: avg, rating_count: mine.length };
}

export async function updateMyProfile(patch: Partial<Profile>): Promise<Profile> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in first.');
  const supabase = getBackend();
  const allowed: Partial<Profile> = {
    full_name: patch.full_name,
    username: patch.username || null,
    bio: patch.bio ?? null,
    city: patch.city ?? null,
    locality: patch.locality ?? null,
    phone: patch.phone ?? null,
  };
  if (supabase) {
    const { data, error } = await supabase.from('profiles').update(allowed).eq('id', user.id).select().single();
    if (error) throw backendError(error);
    return data as Profile;
  }
  const store = await loadDemo();
  const idx = store.profiles.findIndex((p) => p.id === user.id);
  store.profiles[idx] = { ...store.profiles[idx]!, ...allowed, updated_at: new Date().toISOString() };
  await persistDemo();
  return store.profiles[idx]!;
}

// ---------------------------------------------------------------------------
// Categories & items
// ---------------------------------------------------------------------------

export async function listCategories(): Promise<Category[]> {
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
    if (error) throw backendError(error);
    return data as Category[];
  }
  return DEMO_CATEGORIES;
}

export async function listItems(filters: ItemFilters = {}): Promise<Item[]> {
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.rpc('search_items', {
      p_query: filters.query || null,
      p_category_slug: filters.categorySlug || null,
      p_condition: filters.condition || null,
      p_max_fee: filters.maxFee ?? null,
      p_sort: filters.sort || 'recommended',
      p_latitude: filters.latitude ?? null,
      p_longitude: filters.longitude ?? null,
      p_limit: filters.limit ?? 60,
    });
    if (error) throw backendError(error);
    return (data as Item[]) ?? [];
  }
  const store = await loadDemo();
  let items = store.items.filter((i) => i.status === 'ACTIVE').map((i) => itemWithMeta(store, i));
  if (filters.query) {
    const q = filters.query.toLowerCase();
    items = items.filter(
      (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || (i.category?.name.toLowerCase().includes(q) ?? false),
    );
  }
  if (filters.categorySlug) items = items.filter((i) => i.category?.slug === filters.categorySlug);
  if (filters.condition) items = items.filter((i) => i.condition === filters.condition);
  if (filters.maxFee != null) items = items.filter((i) => i.borrowing_fee <= filters.maxFee!);
  switch (filters.sort) {
    case 'price_asc':
      items.sort((a, b) => a.borrowing_fee - b.borrowing_fee);
      break;
    case 'newest':
      items.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    case 'nearest':
      items.sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));
      break;
    default:
      break;
  }
  return items.slice(0, filters.limit ?? 60);
}

export async function getItem(itemId: string): Promise<Item | null> {
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.from('item_details').select('*').eq('id', itemId).maybeSingle();
    if (error) throw backendError(error);
    return (data as Item) ?? null;
  }
  const store = await loadDemo();
  const item = store.items.find((i) => i.id === itemId);
  return item ? itemWithMeta(store, item) : null;
}

export async function getMyItems(): Promise<Item[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.from('item_details').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
    if (error) throw backendError(error);
    return (data as Item[]) ?? [];
  }
  const store = await loadDemo();
  return store.items.filter((i) => i.owner_id === user.id).map((i) => itemWithMeta(store, i));
}

export async function createItem(input: CreateItemInput, imageBlobs: { blob: Blob; fileName: string }[]): Promise<Item> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in to list an item.');
  const supabase = getBackend();
  if (supabase) {
    const payload = {
      title: input.title,
      description: [input.description, input.borrowing_rules ? `Borrowing rules: ${input.borrowing_rules}` : ''].filter(Boolean).join('\n\n'),
      category_id: input.category_id,
      condition: input.condition,
      borrowing_fee: Math.round(input.borrowing_fee * 100),
      security_deposit: Math.round(input.security_deposit * 100),
      minimum_days: input.minimum_days,
      maximum_days: input.maximum_days,
      location_label: input.location_label,
      approximate_latitude: input.approximate_latitude,
      approximate_longitude: input.approximate_longitude,
      status: input.status,
    };
    const { data, error } = await supabase.from('items').insert(payload).select().single();
    if (error) throw backendError(error);
    const item = data as Item;
    for (const [idx, image] of imageBlobs.entries()) {
      const path = `${user.id}/${item.id}/image_${idx + 1}.webp`;
      const { error: upErr } = await supabase.storage.from('item-images').upload(path, image.blob, { contentType: 'image/webp', upsert: true });
      if (upErr) throw backendError(upErr);
      const { error: rowErr } = await supabase.from('item_images').insert({ item_id: item.id, storage_path: path, display_order: idx });
      if (rowErr) throw backendError(rowErr);
    }
    await supabase.from('item_availability').insert({
      item_id: item.id,
      start_date: input.available_from,
      end_date: input.available_until,
      is_available: true,
    });
    return getItem(item.id) as Promise<Item>;
  }
  const store = await loadDemo();
  const item: Item = {
    id: `demo-item-${Date.now()}`,
    owner_id: user.id,
    category_id: input.category_id,
    title: input.title,
    description: [input.description, input.borrowing_rules ? `Borrowing rules: ${input.borrowing_rules}` : ''].filter(Boolean).join('\n\n'),
    condition: input.condition,
    borrowing_fee: Math.round(input.borrowing_fee * 100),
    security_deposit: Math.round(input.security_deposit * 100),
    currency: 'INR',
    minimum_days: input.minimum_days,
    maximum_days: input.maximum_days,
    location_label: input.location_label,
    approximate_latitude: input.approximate_latitude,
    approximate_longitude: input.approximate_longitude,
    status: input.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.items.unshift(item);
  await persistDemo();
  demoNotify('demo-user-maya', 'BORROW_REQUEST_RECEIVED', 'New listing nearby', `${input.title} was just listed in your area.`);
  return itemWithMeta(store, item);
}

export async function updateItemStatus(itemId: string, status: Item['status']): Promise<void> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in first.');
  const supabase = getBackend();
  if (supabase) {
    const { error } = await supabase.from('items').update({ status }).eq('id', itemId).eq('owner_id', user.id);
    if (error) throw backendError(error);
    return;
  }
  const store = await loadDemo();
  const item = store.items.find((i) => i.id === itemId && i.owner_id === user.id);
  if (!item) throw new ServiceError('FORBIDDEN', 'You can only manage your own listings.');
  item.status = status;
  item.updated_at = new Date().toISOString();
  await persistDemo();
}

// ---------------------------------------------------------------------------
// Saved items
// ---------------------------------------------------------------------------

export async function listSavedItems(): Promise<SavedItem[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase
      .from('saved_items')
      .select('id, user_id, item_id, created_at, item:item_details(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw backendError(error);
    return (data as unknown as SavedItem[]) ?? [];
  }
  const store = await loadDemo();
  return store.saved
    .filter((s) => s.user_id === user.id)
    .map((s) => ({ ...s, item: store.items.find((i) => i.id === s.item_id) ?? null }))
    .reverse();
}

export async function toggleSavedItem(itemId: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in to save items.');
  const supabase = getBackend();
  if (supabase) {
    const { data } = await supabase.from('saved_items').select('id').eq('user_id', user.id).eq('item_id', itemId).maybeSingle();
    if (data) {
      const { error } = await supabase.from('saved_items').delete().eq('id', (data as { id: string }).id);
      if (error) throw backendError(error);
      return false;
    }
    const { error } = await supabase.from('saved_items').insert({ user_id: user.id, item_id: itemId });
    if (error) throw backendError(error);
    return true;
  }
  const store = await loadDemo();
  const idx = store.saved.findIndex((s) => s.user_id === user.id && s.item_id === itemId);
  if (idx >= 0) {
    store.saved.splice(idx, 1);
    await persistDemo();
    return false;
  }
  store.saved.push({ id: `demo-saved-${Date.now()}`, user_id: user.id, item_id: itemId, created_at: new Date().toISOString() });
  await persistDemo();
  return true;
}

export async function getSavedItemIds(): Promise<string[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const supabase = getBackend();
  if (supabase) {
    const { data } = await supabase.from('saved_items').select('item_id').eq('user_id', user.id);
    return ((data as { item_id: string }[]) ?? []).map((r) => r.item_id);
  }
  const store = await loadDemo();
  return store.saved.filter((s) => s.user_id === user.id).map((s) => s.item_id);
}

// ---------------------------------------------------------------------------
// Borrow requests & workflow (sensitive mutations go through DB functions)
// ---------------------------------------------------------------------------

export async function createBorrowRequest(input: { item_id: string; start_date: string; end_date: string; message?: string }): Promise<BorrowRequest> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in to send a borrowing request.');
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.rpc('create_borrow_request', {
      p_item_id: input.item_id,
      p_start_date: input.start_date,
      p_end_date: input.end_date,
      p_message: input.message || null,
    });
    if (error) throw backendError(error);
    return (data as BorrowRequest) ?? ({} as BorrowRequest);
  }
  const store = await loadDemo();
  const item = store.items.find((i) => i.id === input.item_id);
  if (!item) throw new ServiceError('RESOURCE_NOT_FOUND', 'This listing no longer exists.');
  if (item.owner_id === user.id) throw new ServiceError('FORBIDDEN', 'You cannot borrow your own item.');
  if (input.end_date <= input.start_date) throw new ServiceError('VALIDATION_ERROR', 'Return date must be after the start date.');
  const days = dayCount(input.start_date, input.end_date);
  if (item.maximum_days && days > item.maximum_days) throw new ServiceError('VALIDATION_ERROR', `Maximum borrowing duration is ${item.maximum_days} days.`);
  const request: BorrowRequest = {
    id: `demo-request-${Date.now()}`,
    item_id: item.id,
    borrower_id: user.id,
    lender_id: item.owner_id,
    start_date: input.start_date,
    end_date: input.end_date,
    message: input.message || null,
    borrowing_fee: item.borrowing_fee * days,
    security_deposit: item.security_deposit,
    currency: item.currency,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.requests.unshift(request);
  await persistDemo();
  demoNotify(item.owner_id, 'BORROW_REQUEST_RECEIVED', 'New borrow request', `Someone requested to borrow ${item.title}.`, request.id);
  return hydrateRequest(store, request);
}

export async function listMyRequests(filters: RequestFilters): Promise<BorrowRequest[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const supabase = getBackend();
  if (supabase) {
    let query = supabase.from('request_details').select('*').order('created_at', { ascending: false });
    query = filters.role === 'borrower' ? query.eq('borrower_id', user.id) : filters.role === 'lender' ? query.eq('lender_id', user.id) : query.or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`);
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      query = query.in('status', statuses);
    }
    const { data, error } = await query;
    if (error) throw backendError(error);
    return (data as BorrowRequest[]) ?? [];
  }
  const store = await loadDemo();
  let requests = store.requests.filter((r) => r.borrower_id === user.id || r.lender_id === user.id);
  if (filters.role === 'borrower') requests = requests.filter((r) => r.borrower_id === user.id);
  if (filters.role === 'lender') requests = requests.filter((r) => r.lender_id === user.id);
  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    requests = requests.filter((r) => statuses.includes(r.status));
  }
  return requests.map((r) => hydrateRequest(store, r));
}

export async function getBorrowRequest(requestId: string): Promise<BorrowRequest | null> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in to view this transaction.');
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.from('request_details').select('*').eq('id', requestId).maybeSingle();
    if (error) throw backendError(error);
    return (data as BorrowRequest) ?? null;
  }
  const store = await loadDemo();
  const r = store.requests.find((x) => x.id === requestId);
  if (!r) return null;
  if (r.borrower_id !== user.id && r.lender_id !== user.id) throw new ServiceError('FORBIDDEN', 'Only transaction participants can view this request.');
  return hydrateRequest(store, r);
}

async function callWorkflowRpc(rpc: string, params: Record<string, unknown>, demoAction: (store: DemoStore, user: SessionUser) => Promise<BorrowRequest | void>): Promise<BorrowRequest | void> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in first.');
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.rpc(rpc, params);
    if (error) throw backendError(error);
    return data as BorrowRequest;
  }
  const store = await loadDemo();
  return demoAction(store, user);
}

function findParticipantRequest(store: DemoStore, requestId: string, user: SessionUser): BorrowRequest {
  const r = store.requests.find((x) => x.id === requestId);
  if (!r) throw new ServiceError('RESOURCE_NOT_FOUND', 'Transaction not found.');
  if (r.borrower_id !== user.id && r.lender_id !== user.id) throw new ServiceError('FORBIDDEN', 'Only transaction participants can do this.');
  return r;
}

export function acceptBorrowRequest(requestId: string) {
  return callWorkflowRpc(
    'accept_borrow_request',
    { p_request_id: requestId },
    async (store, user) => {
      const r = findParticipantRequest(store, requestId, user);
      if (r.lender_id !== user.id) throw new ServiceError('FORBIDDEN', 'Only the item owner can accept requests.');
      if (r.status !== 'PENDING') throw new ServiceError('INVALID_TRANSACTION_STATE', 'Only pending requests can be accepted.');
      const clash = store.requests.some(
        (o) => o.id !== r.id && o.item_id === r.item_id && ['ACCEPTED', 'AWAITING_ACKNOWLEDGEMENT', 'READY_FOR_HANDOVER', 'ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'DISPUTED'].includes(o.status) && o.start_date < r.end_date && r.start_date < o.end_date,
      );
      if (clash) throw new ServiceError('RESERVATION_CONFLICT', 'The item is no longer available for these dates.');
      nextStatus(store, r, 'AWAITING_ACKNOWLEDGEMENT');
      demoNotify(r.borrower_id, 'BORROW_REQUEST_ACCEPTED', 'Request accepted', 'Your borrowing request was accepted. Please review the agreement.', r.id);
      return hydrateRequest(store, r);
    },
  );
}

export function declineBorrowRequest(requestId: string) {
  return callWorkflowRpc(
    'decline_borrow_request',
    { p_request_id: requestId },
    async (store, user) => {
      const r = findParticipantRequest(store, requestId, user);
      if (r.lender_id !== user.id) throw new ServiceError('FORBIDDEN', 'Only the item owner can decline requests.');
      if (r.status !== 'PENDING') throw new ServiceError('INVALID_TRANSACTION_STATE', 'Only pending requests can be declined.');
      nextStatus(store, r, 'DECLINED');
      demoNotify(r.borrower_id, 'BORROW_REQUEST_DECLINED', 'Request declined', 'Your borrowing request was declined.', r.id);
      return hydrateRequest(store, r);
    },
  );
}

export function cancelBorrowRequest(requestId: string) {
  return callWorkflowRpc(
    'cancel_borrow_request',
    { p_request_id: requestId },
    async (store, user) => {
      const r = findParticipantRequest(store, requestId, user);
      if (!['PENDING', 'ACCEPTED', 'AWAITING_ACKNOWLEDGEMENT', 'READY_FOR_HANDOVER'].includes(r.status)) {
        throw new ServiceError('INVALID_TRANSACTION_STATE', 'This transaction can no longer be cancelled.');
      }
      nextStatus(store, r, 'CANCELLED');
      demoNotify(r.borrower_id === user.id ? r.lender_id : r.borrower_id, 'DISPUTE_UPDATED', 'Transaction cancelled', 'The borrowing transaction was cancelled.', r.id);
      return hydrateRequest(store, r);
    },
  );
}

export async function getAgreement(requestId: string): Promise<Agreement | null> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in first.');
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.from('agreements').select('*').eq('borrow_request_id', requestId).maybeSingle();
    if (error) throw backendError(error);
    return (data as Agreement) ?? null;
  }
  const store = await loadDemo();
  const r = findParticipantRequest(store, requestId, user);
  const demo = r as BorrowRequest & { _agreement?: Agreement };
  if (demo._agreement) return demo._agreement;
  const agreement: Agreement = {
    id: `demo-agreement-${r.id}`,
    borrow_request_id: r.id,
    version: 1,
    agreement_content: {
      item: store.items.find((i) => i.id === r.item_id)?.title ?? '',
      start_date: r.start_date,
      end_date: r.end_date,
      borrowing_fee: r.borrowing_fee,
      security_deposit: r.security_deposit,
      responsibilities: [
        'Treat the item with care and use it only for its intended purpose.',
        'Return the item on or before the agreed return date, in the recorded condition.',
        'The deposit is refunded after a satisfactory return check.',
        'Report any damage or loss immediately through BorrowCircle.',
      ],
    },
    borrower_accepted_at: null,
    lender_accepted_at: null,
    created_at: r.created_at,
  };
  (r as BorrowRequest & { _agreement?: Agreement })._agreement = agreement;
  return agreement;
}

export function acknowledgeAgreement(requestId: string) {
  return callWorkflowRpc(
    'acknowledge_agreement',
    { p_request_id: requestId },
    async (store, user) => {
      const r = findParticipantRequest(store, requestId, user);
      if (r.status !== 'AWAITING_ACKNOWLEDGEMENT') throw new ServiceError('INVALID_TRANSACTION_STATE', 'The agreement is not awaiting acknowledgement.');
      const agreement = (await getAgreement(requestId)) as Agreement;
      if (user.id === r.borrower_id) agreement.borrower_accepted_at = new Date().toISOString();
      else agreement.lender_accepted_at = new Date().toISOString();
      const bothDone = Boolean(agreement.borrower_accepted_at && agreement.lender_accepted_at);
      if (bothDone) {
        nextStatus(store, r, 'READY_FOR_HANDOVER');
        demoNotify(r.borrower_id, 'AGREEMENT_COMPLETED', 'Agreement complete', 'Both parties acknowledged the agreement. Time to arrange handover.', r.id);
        demoNotify(r.lender_id, 'AGREEMENT_COMPLETED', 'Agreement complete', 'Both parties acknowledged the agreement. Time to arrange handover.', r.id);
      }
      await persistDemo();
      return hydrateRequest(store, r);
    },
  );
}

export function confirmItemReceipt(requestId: string) {
  return callWorkflowRpc(
    'confirm_item_receipt',
    { p_request_id: requestId },
    async (store, user) => {
      const r = findParticipantRequest(store, requestId, user);
      if (r.borrower_id !== user.id) throw new ServiceError('FORBIDDEN', 'Only the borrower can confirm receipt.');
      if (r.status !== 'READY_FOR_HANDOVER') throw new ServiceError('INVALID_TRANSACTION_STATE', 'The transaction is not ready for handover.');
      nextStatus(store, r, 'ACTIVE');
      demoNotify(r.lender_id, 'BORROWING_STARTED', 'Borrowing started', 'The borrower confirmed receipt. The borrowing is now active.', r.id);
      return hydrateRequest(store, r);
    },
  );
}

export function initiateReturn(requestId: string) {
  return callWorkflowRpc(
    'initiate_return',
    { p_request_id: requestId },
    async (store, user) => {
      const r = findParticipantRequest(store, requestId, user);
      if (r.borrower_id !== user.id) throw new ServiceError('FORBIDDEN', 'Only the borrower can initiate the return.');
      if (!['ACTIVE', 'OVERDUE'].includes(r.status)) throw new ServiceError('INVALID_TRANSACTION_STATE', 'The borrowing is not active.');
      nextStatus(store, r, 'RETURN_INITIATED');
      demoNotify(r.lender_id, 'RETURN_INITIATED', 'Return initiated', 'The borrower initiated the return. Arrange the handback.', r.id);
      return hydrateRequest(store, r);
    },
  );
}

export function confirmItemReturn(requestId: string) {
  return callWorkflowRpc(
    'confirm_item_return',
    { p_request_id: requestId },
    async (store, user) => {
      const r = findParticipantRequest(store, requestId, user);
      if (r.lender_id !== user.id) throw new ServiceError('FORBIDDEN', 'Only the lender can confirm the return.');
      if (!['RETURN_INITIATED', 'OVERDUE'].includes(r.status)) throw new ServiceError('INVALID_TRANSACTION_STATE', 'A return has not been initiated.');
      nextStatus(store, r, 'COMPLETED');
      demoNotify(r.borrower_id, 'RETURN_COMPLETED', 'Return confirmed', 'The return was confirmed. You can now leave a review.', r.id);
      demoNotify(r.lender_id, 'RETURN_COMPLETED', 'Return confirmed', 'The return was confirmed. You can now leave a review.', r.id);
      return hydrateRequest(store, r);
    },
  );
}

export function resolveDispute(requestId: string, outcome: 'COMPLETED' | 'CANCELLED', notes: string) {
  return callWorkflowRpc(
    'resolve_dispute',
    { p_request_id: requestId, p_outcome: outcome, p_notes: notes },
    async (store, user) => {
      const r = findParticipantRequest(store, requestId, user);
      if (r.status !== 'DISPUTED') throw new ServiceError('INVALID_TRANSACTION_STATE', 'Only disputed transactions can be resolved.');
      nextStatus(store, r, outcome);
      demoNotify(r.borrower_id, 'DISPUTE_UPDATED', 'Dispute resolved', notes || 'The dispute was resolved by an administrator.', r.id);
      demoNotify(r.lender_id, 'DISPUTE_UPDATED', 'Dispute resolved', notes || 'The dispute was resolved by an administrator.', r.id);
      return hydrateRequest(store, r);
    },
  );
}

// ---------------------------------------------------------------------------
// Condition reports & evidence
// ---------------------------------------------------------------------------

export async function createConditionReport(input: { request_id: string; report_type: 'HANDOVER' | 'RETURN'; notes?: string; images: { blob: Blob; fileName: string }[] }): Promise<ConditionReport> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in first.');
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.rpc('create_condition_report', {
      p_request_id: input.request_id,
      p_report_type: input.report_type,
      p_notes: input.notes || null,
    });
    if (error) throw backendError(error);
    const report = data as ConditionReport;
    const folder = input.report_type === 'HANDOVER' ? 'handover' : 'return';
    const imagePaths: string[] = [];
    for (const [idx, image] of input.images.entries()) {
      const path = `${input.request_id}/${folder}/image_${idx + 1}.webp`;
      const { error: upErr } = await supabase.storage.from('condition-evidence').upload(path, image.blob, { contentType: 'image/webp', upsert: true });
      if (upErr) throw backendError(upErr);
      imagePaths.push(path);
    }
    if (imagePaths.length) {
      const { error: imgErr } = await supabase.from('condition_images').insert(imagePaths.map((p) => ({ condition_report_id: report.id, storage_path: p })));
      if (imgErr) throw backendError(imgErr);
    }
    return report;
  }
  const store = await loadDemo();
  const r = findParticipantRequest(store, input.request_id, user);
  const report: ConditionReport = {
    id: `demo-report-${Date.now()}`,
    borrow_request_id: r.id,
    submitted_by: user.id,
    report_type: input.report_type,
    notes: input.notes || null,
    created_at: new Date().toISOString(),
    images: input.images.map((img, i) => ({ id: `demo-cimg-${i}`, storage_path: `local:${img.fileName}` })),
  };
  store.reports.push(report);
  await persistDemo();
  return report;
}

export async function listConditionReports(requestId: string): Promise<ConditionReport[]> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in first.');
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase
      .from('condition_reports')
      .select('*, images:condition_images(id, storage_path), submitted_by_profile:public_profiles(*)')
      .eq('borrow_request_id', requestId)
      .order('created_at');
    if (error) throw backendError(error);
    const reports = (data as unknown as ConditionReport[]) ?? [];
    // condition-evidence is a private bucket: swap paths for short-lived signed URLs
    for (const report of reports) {
      for (const image of report.images ?? []) {
        const { data: signed } = await supabase.storage.from('condition-evidence').createSignedUrl(image.storage_path, 600);
        image.url = signed?.signedUrl;
      }
    }
    return reports;
  }
  const store = await loadDemo();
  findParticipantRequest(store, requestId, user);
  return store.reports.filter((r) => r.borrow_request_id === requestId);
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function createReview(input: { request_id: string; reviewee_id: string; rating: number; comment?: string }): Promise<void> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in first.');
  const supabase = getBackend();
  if (supabase) {
    const { error } = await supabase.rpc('create_review', {
      p_request_id: input.request_id,
      p_reviewee_id: input.reviewee_id,
      p_rating: input.rating,
      p_comment: input.comment || null,
    });
    if (error) throw backendError(error);
    return;
  }
  const store = await loadDemo();
  const r = findParticipantRequest(store, input.request_id, user);
  if (r.status !== 'COMPLETED') throw new ServiceError('INVALID_TRANSACTION_STATE', 'Reviews can only be left on completed transactions.');
  if (store.reviews.some((x) => x.borrow_request_id === r.id && x.reviewer_id === user.id)) {
    throw new ServiceError('VALIDATION_ERROR', 'You already reviewed this transaction.');
  }
  store.reviews.push({
    id: `demo-review-${Date.now()}`,
    borrow_request_id: r.id,
    reviewer_id: user.id,
    reviewee_id: input.reviewee_id,
    rating: input.rating,
    comment: input.comment || null,
    created_at: new Date().toISOString(),
  });
  await persistDemo();
  demoNotify(input.reviewee_id, 'NEW_REVIEW', 'New review', 'You received a new review.', r.id);
}

export async function listReviewsForUser(userId: string): Promise<Review[]> {
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.from('review_details').select('*').eq('reviewee_id', userId).order('created_at', { ascending: false });
    if (error) throw backendError(error);
    return (data as Review[]) ?? [];
  }
  const store = await loadDemo();
  return store.reviews.filter((r) => r.reviewee_id === userId).map((r) => ({ ...r, reviewer: store.profiles.find((p) => p.id === r.reviewer_id) ?? null })).reverse();
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function listNotifications(): Promise<AppNotification[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
    if (error) throw backendError(error);
    return (data as AppNotification[]) ?? [];
  }
  const store = await loadDemo();
  return store.notifications.filter((n) => n.user_id === user.id);
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = getBackend();
  if (supabase) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw backendError(error);
    return;
  }
  const store = await loadDemo();
  const n = store.notifications.find((x) => x.id === id);
  if (n) n.is_read = true;
  await persistDemo();
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  const supabase = getBackend();
  if (supabase) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    if (error) throw backendError(error);
    return;
  }
  const store = await loadDemo();
  for (const n of store.notifications) if (n.user_id === user.id) n.is_read = true;
  await persistDemo();
}

/** Subscribe to live notification inserts for the signed-in user (Realtime). */
export function subscribeToNotifications(userId: string, onInsert: (n: AppNotification) => void): () => void {
  const supabase = getBackend();
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => onInsert(payload.new as AppNotification))
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

// ---------------------------------------------------------------------------
// Reports & admin
// ---------------------------------------------------------------------------

export async function createReport(input: { reason: string; description?: string; reported_user_id?: string | null; reported_item_id?: string | null }): Promise<void> {
  const user = await getSessionUser();
  if (!user) throw new ServiceError('UNAUTHENTICATED', 'Sign in first.');
  const supabase = getBackend();
  if (supabase) {
    const { error } = await supabase.from('user_reports').insert({
      reporter_id: user.id,
      reported_user_id: input.reported_user_id ?? null,
      reported_item_id: input.reported_item_id ?? null,
      reason: input.reason,
      description: input.description || null,
    });
    if (error) throw backendError(error);
    return;
  }
  await loadDemo(); // demo mode accepts and discards the report
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.rpc('admin_stats');
    if (error) throw backendError(error);
    return (data as unknown as AdminStats) ?? { total_users: 0, active_listings: 0, borrow_requests: 0, completed_transactions: 0, open_disputes: 0 };
  }
  const store = await loadDemo();
  return {
    total_users: store.profiles.length,
    active_listings: store.items.filter((i) => i.status === 'ACTIVE').length,
    borrow_requests: store.requests.length,
    completed_transactions: store.requests.filter((r) => r.status === 'COMPLETED').length,
    open_disputes: store.requests.filter((r) => r.status === 'DISPUTED').length,
  };
}

export async function adminListUsers(query?: string): Promise<AdminUserRow[]> {
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.rpc('admin_list_users', { p_query: query || null });
    if (error) throw backendError(error);
    return (data as AdminUserRow[]) ?? [];
  }
  const store = await loadDemo();
  return store.profiles.filter((p) => !query || p.full_name.toLowerCase().includes(query.toLowerCase()) || p.email?.toLowerCase().includes(query.toLowerCase()));
}

export async function adminSetUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
  const supabase = getBackend();
  if (supabase) {
    const { error } = await supabase.rpc('admin_set_user_status', { p_user_id: userId, p_status: status });
    if (error) throw backendError(error);
    return;
  }
  const store = await loadDemo();
  const p = store.profiles.find((x) => x.id === userId);
  if (p) p.account_status = status;
  await persistDemo();
}

export async function adminListReports(): Promise<UserReport[]> {
  const supabase = getBackend();
  if (supabase) {
    const { data, error } = await supabase.from('user_reports').select('*').order('created_at', { ascending: false });
    if (error) throw backendError(error);
    return (data as UserReport[]) ?? [];
  }
  return [];
}

export function isDemoMode(): boolean {
  return getBackend() === null;
}

/** Whether the signed-in user holds the trusted ADMIN role (user_roles table). */
export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  const supabase = getBackend();
  if (supabase) {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
    return (data as { role: string } | null)?.role === 'ADMIN';
  }
  // Demo mode: expose the admin dashboard so the UI is fully explorable.
  return true;
}

/** Open a dispute on a transaction (participant action, admin-resolved). */
export function reportIssue(requestId: string, reason: string) {
  return callWorkflowRpc(
    'report_issue',
    { p_request_id: requestId, p_reason: reason },
    async (store, user) => {
      const r = findParticipantRequest(store, requestId, user);
      if (!['ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'READY_FOR_HANDOVER'].includes(r.status)) {
        throw new ServiceError('INVALID_TRANSACTION_STATE', 'An issue cannot be reported in this state.');
      }
      nextStatus(store, r, 'DISPUTED');
      demoNotify(r.borrower_id, 'DISPUTE_UPDATED', 'Dispute opened', 'A dispute was opened on this transaction. An administrator will review it.', r.id);
      demoNotify(r.lender_id, 'DISPUTE_UPDATED', 'Dispute opened', 'A dispute was opened on this transaction. An administrator will review it.', r.id);
      return hydrateRequest(store, r);
    },
  );
}

/** Register an FCM push token for the signed-in user. */
export async function registerPushToken(token: string, platform: 'ios' | 'android' | 'web' = 'android'): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  const supabase = getBackend();
  if (!supabase) return;
  const { error } = await supabase.from('push_tokens').upsert({ token, user_id: user.id, platform, last_active_at: new Date().toISOString() });
  if (error) throw backendError(error);
}
