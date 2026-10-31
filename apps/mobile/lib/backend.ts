import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { configureDemoStorage, createBackend, setSupabaseAccessToken } from '@borrowcircle/shared';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export type BackendName = 'supabase' | 'demo';

// Backend resolution for the mobile apps:
//   1. Supabase (data + storage + realtime) with Clerk supplying the JWT
//      (third-party auth) when a publishable key is configured
//   2. Demo store — data stays on-device
let backendName: BackendName = 'demo';

export const demoMode = () => backendName === 'demo';
export const activeBackend = (): BackendName => backendName;

const secureAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const asyncAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// The Clerk instance registers this once ClerkProvider is ready; supabase-js
// then calls it for every request (Clerk JWT template named "supabase").
let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(fn: (() => Promise<string | null>) | null) {
  clerkTokenGetter = fn;
}

let initialised = false;

export function initBackend() {
  if (initialised) return;
  initialised = true;
  configureDemoStorage(asyncAdapter);

  if (!supabaseUrl || !publishableKey) {
    backendName = 'demo';
    return;
  }

  setSupabaseAccessToken(async () => {
    if (clerkTokenGetter) {
      try {
        return (await clerkTokenGetter()) ?? null;
      } catch {
        return null;
      }
    }
    return null;
  });

  createBackend({ supabaseUrl, publishableKey });
  backendName = 'supabase';
}

/** Resolve an item image to a URI (demo data carries full URLs). */
export function itemImageUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:/.test(path)) return path;
  return `https://${supabaseUrl.replace(/^https?:\/\//, '')}/storage/v1/object/public/item-images/${path}`;
}

export function avatarUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:/.test(path)) return path;
  return `https://${supabaseUrl.replace(/^https?:\/\//, '')}/storage/v1/object/public/profile-images/${path}`;
}

/** Local image URI → Blob for Supabase Storage uploads. */
export async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}
