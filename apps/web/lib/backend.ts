'use client';

import { configureDemoStorage, createBackend, setSupabaseAccessToken } from '@borrowcircle/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export type BackendName = 'supabase' | 'demo';

// Backend resolution for the website:
//   1. Supabase (data + storage + realtime) with Clerk supplying the JWT
//      (third-party auth) when a publishable key is configured
//   2. Demo store — everything on this device
let backendName: BackendName = 'demo';

export const isDemoMode = () => backendName === 'demo';
export const activeBackend = (): BackendName => backendName;

const localStorageAdapter = {
  getItem: async (key: string) => window.localStorage.getItem(key),
  setItem: async (key: string, value: string) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    window.localStorage.removeItem(key);
  },
};

let initialised = false;

/** Wire the shared package to the web platform (localStorage + env config). */
export function initBackend() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;
  configureDemoStorage(localStorageAdapter);

  if (!supabaseUrl || !publishableKey) {
    backendName = 'demo';
    return;
  }

  // Clerk issues a JWT named "supabase" per session; supabase-js fetches it
  // for every request, and RLS resolves auth.uid() to the Clerk user id.
  setSupabaseAccessToken(async () => {
    const clerk = (window as unknown as {
      Clerk?: { session?: { getToken: (o?: { template?: string }) => Promise<string | null> } };
    }).Clerk;
    return (await clerk?.session?.getToken({ template: 'supabase' })) ?? null;
  });

  createBackend({ supabaseUrl, publishableKey, storage: localStorageAdapter });
  backendName = 'supabase';
}

/** Public URL for an item image path (demo data carries full URLs). */
export function itemImageUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:/.test(path)) return path;
  return `${supabaseUrl}/storage/v1/object/public/item-images/${path}`;
}

export function avatarUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:/.test(path)) return path;
  return `${supabaseUrl}/storage/v1/object/public/profile-images/${path}`;
}
