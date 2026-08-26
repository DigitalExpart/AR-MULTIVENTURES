// ============================================================================
// AR MULTIVENTURES — EDGE FUNCTION: PAYSTACK-WEBHOOK
// Secure Webhook Listener with HMAC-SHA512 Signature Verification & Idempotency
// ============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';
import { verifyPaystackSignature, koboToNaira } from '../_shared/paystack.ts';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-paystack-signature');
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY') || '';

    // 1. Signature Verification
    if (paystackSecretKey) {
      const isValid = await verifyPaystackSignature(rawBody, signatureHeader, paystackSecretKey);
      if (!isValid) {
        console.error('Paystack webhook signature verification failed');
        return new Response('Invalid Signature', { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const eventData = payload.data;

    if (!eventType || !eventData) {
      return new Response('Invalid Payload', { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 2. Compute Payload Hash for Idempotency
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawBody));
    const eventHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const providerRef = eventData.reference || `EVT_${Date.now()}`;
    const eventId = eventData.id ? String(eventData.id) : null;

    // Check if event already exists
    const { data: existingEvent } = await supabaseAdmin
      .from('payment_webhook_events')
      .select('id, processing_status')
      .eq('event_hash', eventHash)
      .single();

    if (existingEvent && existingEvent.processing_status === 'PROCESSED') {
      // Return 200 OK immediately for duplicate webhooks
      return new Response(JSON.stringify({ status: 'ignored', reason: 'already_processed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert pending webhook event record
    await supabaseAdmin
      .from('payment_webhook_events')
      .insert({
        provider: 'PAYSTACK',
        event_id: eventId,
        event_hash: eventHash,
        event_type: eventType,
        provider_reference: providerRef,
        processing_status: 'PROCESSING',
      })
      .select('id')
      .single();

    // 3. Process Charge Success Event
    if (eventType === 'charge.success' && eventData.status === 'success') {
      const amountNaira = koboToNaira(eventData.amount);
      const currency = eventData.currency || 'NGN';
      const environment = paystackSecretKey?.startsWith('sk_live_') ? 'LIVE' : 'TEST';

      // Call Authoritative Stored Procedure
      const { data: procRes, error: procError } = await supabaseAdmin.rpc('process_verified_payment', {
        p_internal_reference: providerRef,
        p_provider_reference: providerRef,
        p_amount: amountNaira,
        p_currency: currency,
        p_provider: 'PAYSTACK',
        p_environment: environment,
      });

      if (procError || !procRes?.success) {
        console.error('Failed to process payment in database:', procError || procRes);
        await supabaseAdmin
          .from('payment_webhook_events')
          .update({
            processing_status: 'FAILED',
            error_message: procRes?.error || procError?.message || 'Database error',
            processed_at: new Date().toISOString(),
          })
          .eq('event_hash', eventHash);

        return new Response(JSON.stringify({ status: 'error', message: 'DB execution failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Mark Event as Processed
      await supabaseAdmin
        .from('payment_webhook_events')
        .update({
          processing_status: 'PROCESSED',
          processed_at: new Date().toISOString(),
        })
        .eq('event_hash', eventHash);
    } else {
      // Other events recorded for audit
      await supabaseAdmin
        .from('payment_webhook_events')
        .update({
          processing_status: 'PROCESSED',
          processed_at: new Date().toISOString(),
        })
        .eq('event_hash', eventHash);
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
