import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, useClerk, useUser } from '@clerk/clerk-expo';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '@borrowcircle/shared';
import { demoMode, initBackend, clerkPublishableKey, setClerkTokenGetter } from '@/lib/backend';

interface AppState {
  user: api.SessionUser | null;
  profile: api.Profile | null;
  loading: boolean;
  savedIds: string[];
  toggleSave: (itemId: string) => Promise<boolean>;
  toast: string;
  showToast: (message: string) => void;
  unreadCount: number;
  refreshUnread: () => void;
  demo: boolean;
  refresh: () => void;
  /** Clerk supplies the session identity (Supabase third-party auth). */
  clerk: boolean;
  hasOnboarded: boolean;
  setOnboarded: () => void;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  return clerkPublishableKey ? <ClerkAppState>{children}</ClerkAppState> : <DemoAppState>{children}</DemoAppState>;
}

/** Registers the Clerk token provider so supabase-js can authenticate. */
export function SupabaseBridge() {
  const clerk = useClerk();
  useEffect(() => {
    setClerkTokenGetter(async () => {
      const session = (clerk as unknown as { session?: { getToken: (o?: { template?: string }) => Promise<string | null> } }).session;
      return (await session?.getToken({ template: 'supabase' })) ?? null;
    });
    return () => setClerkTokenGetter(null);
  }, [clerk]);
  return null;
}

function ClerkAppState({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const clerk = useClerk();
  const [profile, setProfile] = useState<api.Profile | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [hasOnboarded] = useState(true); // Clerk users skip the local onboarding flag

  const user = useMemo<api.SessionUser | null>(
    () => (isSignedIn && userId ? { id: userId, email: clerkUser?.primaryEmailAddress?.emailAddress ?? null } : null),
    [isSignedIn, userId, clerkUser?.primaryEmailAddress?.emailAddress],
  );

  useEffect(() => {
    initBackend();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setSavedIds([]);
      setUnreadCount(0);
      return;
    }
    void (async () => {
      if (!clerkUser) return;
      let p = await api.getMyProfile();
      if (!p) {
        // Supabase third-party auth has no profile trigger — create it on
        // first sign-in (RLS only allows id = auth.uid()).
        await api.createMyProfile({
          full_name: clerkUser.fullName ?? clerkUser.username ?? 'New member',
          email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
        });
        p = await api.getMyProfile();
      }
      setProfile(p);
      const [saved, notifs] = await Promise.all([api.getSavedItemIds(), api.listNotifications()]);
      setSavedIds(saved);
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    })();
  }, [user?.id, clerkUser?.id, nonce]);

  const showToast = useCallback((message: string) => setToast(message), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleSave = useCallback(
    async (itemId: string): Promise<boolean> => {
      try {
        const nowSaved = await api.toggleSavedItem(itemId);
        setSavedIds((ids) => (nowSaved ? [...ids, itemId] : ids.filter((id) => id !== itemId)));
        setToast(nowSaved ? 'Saved for later' : 'Removed from saved');
        return nowSaved;
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Could not save this item');
        return false;
      }
    },
    [],
  );

  const refreshUnread = useCallback(() => {
    void api.listNotifications().then((notifs) => setUnreadCount(notifs.filter((n) => !n.is_read).length));
  }, []);

  const setOnboarded = useCallback(() => undefined, []);

  const value = useMemo<AppState>(
    () => ({
      user,
      profile,
      loading: !isLoaded,
      savedIds,
      toggleSave,
      toast,
      showToast,
      unreadCount,
      refreshUnread,
      demo: false,
      clerk: true,
      refresh: () => setNonce((n) => n + 1),
      hasOnboarded,
      setOnboarded,
      signOut: () => clerk.signOut(),
    }),
    [user, profile, isLoaded, savedIds, toggleSave, toast, showToast, unreadCount, refreshUnread, clerk, hasOnboarded, setOnboarded],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function DemoAppState({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.SessionUser | null>(null);
  const [profile, setProfile] = useState<api.Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [hasOnboarded, setHasOnboardedState] = useState(false);

  useEffect(() => {
    initBackend();
    AsyncStorage.getItem('bc_onboarded').then((v) => setHasOnboardedState(v === '1'));
    void (async () => {
      const u = await api.getSessionUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setSavedIds([]);
      setUnreadCount(0);
      return;
    }
    void (async () => {
      const [p, saved, notifs] = await Promise.all([api.getMyProfile(), api.getSavedItemIds(), api.listNotifications()]);
      setProfile(p);
      setSavedIds(saved);
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    })();
  }, [user, nonce]);

  const showToast = useCallback((message: string) => setToast(message), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleSave = useCallback(
    async (itemId: string): Promise<boolean> => {
      try {
        const nowSaved = await api.toggleSavedItem(itemId);
        setSavedIds((ids) => (nowSaved ? [...ids, itemId] : ids.filter((id) => id !== itemId)));
        setToast(nowSaved ? 'Saved for later' : 'Removed from saved');
        return nowSaved;
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Could not save this item');
        return false;
      }
    },
    [],
  );

  const refreshUnread = useCallback(() => {
    void api.listNotifications().then((notifs) => setUnreadCount(notifs.filter((n) => !n.is_read).length));
  }, []);

  const setOnboarded = useCallback(() => {
    void AsyncStorage.setItem('bc_onboarded', '1');
    setHasOnboardedState(true);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      user,
      profile,
      loading,
      savedIds,
      toggleSave,
      toast,
      showToast,
      unreadCount,
      refreshUnread,
      demo: demoMode(),
      clerk: false,
      refresh: () => setNonce((n) => n + 1),
      hasOnboarded,
      setOnboarded,
      signOut: async () => {
        await api.signOut();
      },
    }),
    [user, profile, loading, savedIds, toggleSave, toast, showToast, unreadCount, refreshUnread, hasOnboarded, setOnboarded],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
