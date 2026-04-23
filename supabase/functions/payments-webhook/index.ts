import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

function billingPeriodFrom(item: any): string | null {
  const interval = item?.price?.billingCycle?.interval;
  if (interval === 'month') return 'monthly';
  if (interval === 'year') return 'yearly';
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log('[paddle webhook]', event.eventType, 'env:', env);

    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await upsertSubscription(event.data, env);
        break;
      case EventName.SubscriptionCanceled:
        await markCanceled(event.data, env);
        break;
      case EventName.TransactionCompleted:
        console.log('[paddle webhook] transaction.completed', event.data.id);
        break;
      case EventName.TransactionPaymentFailed:
        // Status will also flow in via subscription.updated → past_due
        console.log('[paddle webhook] transaction.payment_failed', event.data.id);
        break;
      default:
        console.log('[paddle webhook] unhandled', event.eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[paddle webhook] error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});

async function upsertSubscription(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData, scheduledChange } = data;

  const userId = customData?.userId;
  if (!userId) {
    console.error('[paddle webhook] no userId in customData; skipping');
    return;
  }

  const item = items?.[0];
  if (!item) {
    console.error('[paddle webhook] no items in subscription; skipping');
    return;
  }

  const priceId = item.price?.importMeta?.externalId || item.price?.id;
  const productId = item.product?.importMeta?.externalId || item.price?.productId || item.product?.id;
  const billingPeriod = billingPeriodFrom(item);

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    product_id: productId,
    price_id: priceId,
    billing_period: billingPeriod,
    status,
    current_period_start: currentBillingPeriod?.startsAt ?? null,
    current_period_end: currentBillingPeriod?.endsAt ?? null,
    cancel_at_period_end: scheduledChange?.action === 'cancel',
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,environment' });

  if (error) {
    console.error('[paddle webhook] upsert error:', error);
    throw error;
  }
}

async function markCanceled(data: any, env: PaddleEnv) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);
  if (error) console.error('[paddle webhook] cancel error:', error);
}
