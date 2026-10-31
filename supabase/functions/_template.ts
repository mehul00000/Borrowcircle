// Canonical workflow Edge Function. Each function in this folder proxies an
// authenticated caller to the matching security-definer database function:
// identity always comes from the verified JWT, never from the request body.
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, success, errorResponse } from '../_shared/http.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

async function userClient(req: Request): Promise<SupabaseClient> {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHENTICATED: missing bearer token');
  }
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error('UNAUTHENTICATED: invalid or expired token');
  return client;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  try {
    const supabase = await userClient(req);
    const body = await req.json().catch(() => ({}));
    const { data, error } = await supabase.rpc('RPC_NAME', body.params ?? {});
    if (error) throw new Error(error.message);
    return success(data);
  } catch (err) {
    return errorResponse(err);
  }
});
