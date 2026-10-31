import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface StorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface BorrowCircleBackendConfig {
  supabaseUrl: string;
  publishableKey: string;
  storage?: StorageLike;
}

export const DEMO_MODE_KEY = 'bc_demo_data_v1';

// Auth is handled by Clerk; Supabase receives a Clerk-issued JWT per request
// through this provider (set by the app once the Clerk instance is ready).
// See supabase.com/docs/guides/auth/third-party/authentication/clerk.
let accessTokenProvider: (() => Promise<string | null>) | null = null;

export function setSupabaseAccessToken(fn: (() => Promise<string | null>) | null) {
  accessTokenProvider = fn;
}

let cached: SupabaseClient | null = null;
let cachedConfig: BorrowCircleBackendConfig | null = null;

/** Create (and memoise) the shared Supabase client. Returns null in demo mode. */
export function createBackend(config: BorrowCircleBackendConfig | null): SupabaseClient | null {
  if (!config?.supabaseUrl || !config?.publishableKey) {
    cached = null;
    cachedConfig = null;
    return null;
  }
  if (cached && cachedConfig?.supabaseUrl === config.supabaseUrl) return cached;
  cachedConfig = config;
  cached = createClient(config.supabaseUrl, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    accessToken: async () => {
      if (accessTokenProvider) {
        try {
          return (await accessTokenProvider()) ?? null;
        } catch {
          return null;
        }
      }
      return null;
    },
  });
  return cached;
}

export function getBackend(): SupabaseClient | null {
  return cached;
}

export class ServiceError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Extract a friendly message from a PostgREST/RPC error. */
export function backendError(err: { message?: string; code?: string } | null): ServiceError {
  if (!err) return new ServiceError('INTERNAL_SERVER_ERROR', 'Something went wrong. Please try again.');
  const message = err.message || 'Something went wrong. Please try again.';
  if (err.code === '23505' || /duplicate key/i.test(message)) {
    return new ServiceError('VALIDATION_ERROR', 'That record already exists.');
  }
  if (/conflict|overlap|already reserved/i.test(message)) {
    return new ServiceError('RESERVATION_CONFLICT', 'The item is no longer available for these dates.');
  }
  if (/not allowed|permission|policy/i.test(message)) {
    return new ServiceError('FORBIDDEN', 'You are not allowed to perform this action.');
  }
  return new ServiceError(err.code || 'INTERNAL_SERVER_ERROR', message);
}

export const ok = <T,>(data: T, message = 'Operation completed successfully') => ({ success: true as const, data, message });
