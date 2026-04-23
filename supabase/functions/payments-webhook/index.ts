import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Map our price IDs to display SAR amounts
const SAR_BY_PRICE_ID: Record<string, number> = {
  support_sar_10: 10,
  support_sar_25: 25,
  support_sar_50: 50,
  support_sar_100: 100,
  support_sar_250: 250,
  support_sar_500: 500,
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log('[paddle webhook] event:', event.eventType, 'env:', env);

    if (event.eventType === EventName.TransactionCompleted) {
      await handleTransactionCompleted(event.data, env);
    } else {
      console.log('[paddle webhook] unhandled event:', event.eventType);
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

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  const { id: transactionId, customerId, items, customData, details } = data;
  const item = items?.[0];
  if (!item) {
    console.error('[paddle webhook] no items in transaction', transactionId);
    return;
  }

  const priceExternalId = item.price?.importMeta?.externalId || item.price?.id;
  const amountCents = parseInt(details?.totals?.total || item.price?.unitPrice?.amount || '0', 10);
  const currency = details?.totals?.currencyCode || item.price?.unitPrice?.currencyCode || 'USD';
  const sarAmount = SAR_BY_PRICE_ID[priceExternalId as string] || null;
  const userId = customData?.userId || null;
  const customerEmail = customData?.email || null;
  const customerName = customData?.name || null;

  // Idempotent insert
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('paddle_transaction_id', transactionId)
    .maybeSingle();

  if (existing) {
    console.log('[paddle webhook] invoice already exists for', transactionId);
    return;
  }

  const { data: inserted, error } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      customer_email: customerEmail,
      customer_name: customerName,
      paddle_transaction_id: transactionId,
      paddle_customer_id: customerId,
      price_id: priceExternalId,
      amount_cents: amountCents,
      currency: currency,
      display_amount_sar: sarAmount,
      status: 'paid',
      environment: env,
      paid_at: new Date().toISOString(),
      metadata: { source: 'paddle_webhook' },
    })
    .select('id, invoice_number')
    .single();

  if (error) {
    console.error('[paddle webhook] insert failed:', error);
    return;
  }

  console.log('[paddle webhook] invoice created:', inserted?.invoice_number, inserted?.id);
}
