'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as api from '@borrowcircle/shared';
import { setAuthBridge } from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { isDemoMode, initBackend, clerkPublishableKey } from '@/lib/backend';

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

function ClerkAppState({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const clerk = useClerk();
  const [profile, setProfile] = useState<api.Profile | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [nonce, setNonce] = useState(0);

  const user = useMemo<api.SessionUser | null>(
    () =>
      isSignedIn && clerkUser
        ? { id: clerkUser.id, email: clerkUser.primaryEmailAddress?.emailAddress ?? null }
        : null,
    [isSignedIn, clerkUser?.id, clerkUser?.primaryEmailAddress?.emailAddress],
  );

  useEffect(() => {
    initBackend();
  }, []);

  // Keep the shared data layer's identity in sync with Clerk (it reads this
  // for every RLS-authenticated query and for profile auto-creation).
  const userRef = useRef(user);
  userRef.current = user;
  useEffect(() => {
    setAuthBridge({
      signIn: async () => {
        throw new Error('Use the Clerk sign-in flow.');
      },
      signUp: async () => {
        throw new Error('Use the Clerk sign-up flow.');
      },
      signOut: async () => {
        await clerk.signOut();
      },
      sendPasswordReset: async () => {
        throw new Error('Use the Clerk password-reset flow.');
      },
      getSessionUser: async () => userRef.current,
      onAuthStateChange: (cb) => {
        cb(userRef.current);
        return () => undefined;
      },
    });
    return () => setAuthBridge(null);
  }, [clerk]);

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

  const toggleSave = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const nowSaved = await api.toggleSavedItem(itemId);
      setSavedIds((ids) => (nowSaved ? [...ids, itemId] : ids.filter((id) => id !== itemId)));
      setToast(nowSaved ? 'Saved for later' : 'Removed from saved items');
      return nowSaved;
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Could not save this item');
      return false;
    }
  }, []);

  const refreshUnread = useCallback(() => {
    void api.listNotifications().then((notifs) => setUnreadCount(notifs.filter((n) => !n.is_read).length));
  }, []);

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
      signOut: () => clerk.signOut(),
    }),
    [user, profile, isLoaded, savedIds, toggleSave, toast, showToast, unreadCount, refreshUnread, clerk],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast">
          <Icon name="check" size={19} />
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}

function DemoAppState({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.SessionUser | null>(null);
  const [profile, setProfile] = useState<api.Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    initBackend();
    void (async () => {
      const u = await api.getSessionUser();
      setUser(u);
      setLoading(false);
    })();
    const unsub = api.onAuthStateChange((u) => {
      setUser(u);
      setNonce((n) => n + 1);
    });
    return unsub;
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
        setToast(nowSaved ? 'Saved for later' : 'Removed from saved items');
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
      demo: isDemoMode(),
      clerk: false,
      refresh: () => setNonce((n) => n + 1),
      signOut: async () => {
        await api.signOut();
      },
    }),
    [user, profile, loading, savedIds, toggleSave, toast, showToast, unreadCount, refreshUnread],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast">
          <Icon name="check" size={19} />
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}
