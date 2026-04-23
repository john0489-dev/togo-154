import { createClient } from 'npm:@supabase/supabase-js@2';
import { getPaddleClient, type PaddleEnv } from '../_shared/paddle.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No auth' }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: sub } = await adminClient
      .from('subscriptions')
      .select('paddle_customer_id, paddle_subscription_id, environment')
      .eq('user_id', userRes.user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) {
      return new Response(JSON.stringify({ error: 'No subscription' }), { status: 404, headers: corsHeaders });
    }

    const env = (sub.environment as PaddleEnv) || 'sandbox';
    const paddle = getPaddleClient(env);
    const portal = await paddle.customerPortalSessions.create(
      sub.paddle_customer_id,
      [sub.paddle_subscription_id]
    );

    return new Response(
      JSON.stringify({ url: portal.urls?.general?.overview || portal.urls?.subscriptions?.[0]?.cancelSubscription }),
      { headers: corsHeaders }
    );
  } catch (e) {
    console.error('[create-portal-session]', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
