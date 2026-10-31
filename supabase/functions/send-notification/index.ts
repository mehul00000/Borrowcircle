// send-notification — delivers a persisted notification to a user's Expo push
// tokens. The in-app notification row is written by the workflow database
// functions; this function handles the outbound push channel. Requires the
// EXPO_ACCESS_TOKEN secret; without it the function records delivery as
// skipped so transaction flows are never blocked by push failures.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, success, failure, errorResponse } from '../_shared/http.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY') ?? '';
const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN') ?? '';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  try {
    if (!serviceKey) return failure('FORBIDDEN', 'Service credentials are not configured', 500);
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { user_id: userId, title, message, reference_id: referenceId } = await req.json();

    const { data: tokens } = await admin
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId)
      .gte('last_active_at', new Date(Date.now() - 90 * 86400000).toISOString());

    if (!tokens?.length || !expoAccessToken) {
      return success({ delivered: 0, skipped: 'no tokens or EXPO_ACCESS_TOKEN not configured' });
    }

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${expoAccessToken}` },
      body: JSON.stringify(
        tokens.map((t: { token: string }) => ({ to: t.token, title, body: message, data: { reference_id: referenceId } })),
      ),
    });
    if (!res.ok) throw new Error(`Expo push failed: ${res.status}`);
    return success({ delivered: tokens.length });
  } catch (err) {
    return errorResponse(err);
  }
});
