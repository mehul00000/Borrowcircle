export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return null;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function success(data: unknown, message = 'Operation completed successfully'): Response {
  return json({ success: true, data, message });
}

export function failure(code: string, message: string, status = 400): Response {
  return json({ success: false, error: { code, message } }, status);
}

/** Map a Postgres error message to the standard error envelope. */
export function errorResponse(err: unknown): Response {
  const message = err instanceof Error ? err.message : String(err);
  let code = 'INTERNAL_SERVER_ERROR';
  let status = 500;
  if (/^UNAUTHENTICATED/.test(message)) { code = 'UNAUTHENTICATED'; status = 401; }
  else if (/^FORBIDDEN/.test(message)) { code = 'FORBIDDEN'; status = 403; }
  else if (/^RESOURCE_NOT_FOUND/.test(message)) { code = 'RESOURCE_NOT_FOUND'; status = 404; }
  else if (/^VALIDATION_ERROR/.test(message)) { code = 'VALIDATION_ERROR'; status = 422; }
  else if (/^RESERVATION_CONFLICT/.test(message)) { code = 'RESERVATION_CONFLICT'; status = 409; }
  else if (/^INVALID_TRANSACTION_STATE/.test(message)) { code = 'INVALID_TRANSACTION_STATE'; status = 409; }
  return failure(code, message.replace(/^[A-Z_]+: /, ''), status);
}
