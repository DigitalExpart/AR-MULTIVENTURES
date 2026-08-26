// ============================================================================
// AR MULTIVENTURES — EDGE FUNCTION: VERIFY-PAYMENT
// Verifies transaction with Paystack gateway and triggers atomic ledger posting
// ============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';
import { koboToNaira } from '../_shared/paystack.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { reference } = await req.json();
    if (!reference) {
      return new Response(JSON.stringify({ error: 'BAD_REQUEST: Missing reference' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    let verifiedAmountNaira = 0;
    let providerRef = reference;
    let currency = 'NGN';
    let gatewayStatus = 'success';

    if (paystackSecretKey) {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.status || verifyData.data.status !== 'success') {
        return new Response(JSON.stringify({
          success: false,
          error: `PAYMENT_UNVERIFIED: ${verifyData.data?.gateway_response || verifyData.message || 'Payment not successful'}`,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      verifiedAmountNaira = koboToNaira(verifyData.data.amount);
      providerRef = verifyData.data.reference || reference;
      currency = verifyData.data.currency || 'NGN';
    } else {
      // Offline / Test Mock verification: Read attempt from DB to retrieve expected amount
      const { data: attempt } = await supabaseAdmin
        .from('payment_attempts')
        .select('amount, currency, provider_reference')
        .or(`internal_reference.eq.${reference},provider_reference.eq.${reference}`)
        .single();

      if (!attempt) {
        return new Response(JSON.stringify({ error: 'ATTEMPT_NOT_FOUND: Could not locate payment attempt record' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      verifiedAmountNaira = attempt.amount;
      providerRef = attempt.provider_reference || reference;
      currency = attempt.currency || 'NGN';
    }

    // Call Authoritative Database Procedure
    const { data: procRes, error: procError } = await supabaseAdmin.rpc('process_verified_payment', {
      p_internal_reference: reference,
      p_provider_reference: providerRef,
      p_amount: verifiedAmountNaira,
      p_currency: currency,
      p_provider: 'PAYSTACK',
      p_environment: paystackSecretKey?.startsWith('sk_live_') ? 'LIVE' : 'TEST',
    });

    if (procError || !procRes?.success) {
      return new Response(JSON.stringify({
        success: false,
        error: procRes?.error || procError?.message || 'Database payment processing failed',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      paymentId: procRes.paymentId,
      paymentReference: procRes.paymentReference,
      amount: procRes.amount,
      allocatedAmount: procRes.allocatedAmount,
      receiptNumber: procRes.receipt?.receiptNumber,
      receiptId: procRes.receipt?.receiptId,
      issuedAt: procRes.receipt?.issuedAt,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
