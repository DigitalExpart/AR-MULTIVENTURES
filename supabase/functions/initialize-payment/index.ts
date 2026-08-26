// ============================================================================
// AR MULTIVENTURES — EDGE FUNCTION: INITIALIZE-PAYMENT
// Authenticates customer, calculates authoritative invoice amount, calls Paystack API
// ============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin, getSupabaseUserClient } from '../_shared/supabase.ts';
import { nairaToKobo } from '../_shared/paystack.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED: Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invoiceId, callbackUrl } = await req.json();
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: 'BAD_REQUEST: Missing invoiceId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const userClient = getSupabaseUserClient(authHeader);

    // 1. Authenticate calling customer
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED: Invalid JWT token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get customer record
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, customer_id, email, full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.customer_id) {
      return new Response(JSON.stringify({ error: 'FORBIDDEN: User does not belong to a valid customer entity' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Authoritative Database Initialization via RPC
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const environment = paystackSecretKey?.startsWith('sk_live_') ? 'LIVE' : 'TEST';

    const { data: initData, error: initError } = await supabaseAdmin.rpc('initialize_payment_attempt', {
      p_customer_id: profile.customer_id,
      p_invoice_id: invoiceId,
      p_provider: 'PAYSTACK',
      p_environment: environment,
    });

    if (initError || !initData?.success) {
      return new Response(JSON.stringify({ error: initData?.error || initError?.message || 'Failed to initialize payment attempt' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If active attempt is reused with existing authorization url, return it directly
    if (initData.reused && initData.authorizationUrl) {
      return new Response(JSON.stringify({
        success: true,
        reused: true,
        reference: initData.internalReference,
        providerReference: initData.providerReference,
        amount: initData.amount,
        amountKobo: initData.amountKobo,
        authorizationUrl: initData.authorizationUrl,
        accessCode: initData.accessCode,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let authUrl = '';
    let accessCode = '';

    // 3. Call Paystack API to initialize transaction (if secret key configured)
    if (paystackSecretKey) {
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profile.email || user.email,
          amount: initData.amountKobo,
          reference: initData.internalReference,
          callback_url: callbackUrl || `${Deno.env.get('APP_BASE_URL') || 'http://localhost:5173'}/app/payments`,
          metadata: {
            customer_id: profile.customer_id,
            invoice_id: invoiceId,
            internal_reference: initData.internalReference,
          },
        }),
      });

      const paystackData = await paystackRes.json();
      if (!paystackData.status) {
        return new Response(JSON.stringify({ error: `Paystack initialization failed: ${paystackData.message}` }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      authUrl = paystackData.data.authorization_url;
      accessCode = paystackData.data.access_code;

      // Update attempt row with authorizationUrl and accessCode
      await supabaseAdmin
        .from('payment_attempts')
        .update({
          authorization_url: authUrl,
          access_code: accessCode,
        })
        .eq('id', initData.attemptId);
    } else {
      // Mock / Offline Development URL
      authUrl = `${Deno.env.get('APP_BASE_URL') || 'http://localhost:5173'}/app/payments?mock_reference=${initData.internalReference}&status=success`;
      accessCode = `MOCK_ACCESS_${initData.internalReference}`;
    }

    return new Response(JSON.stringify({
      success: true,
      reference: initData.internalReference,
      providerReference: initData.providerReference,
      amount: initData.amount,
      amountKobo: initData.amountKobo,
      authorizationUrl: authUrl,
      accessCode: accessCode,
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
