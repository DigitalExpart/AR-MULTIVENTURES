-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 018: PAYMENT PROCESSING, PAYSTACK & GATEWAY
-- Phase 6 Gateway Abstraction, Payment Attempts, Webhook Idempotency & Reconciliation
-- ============================================================================

-- 1. Gateway & Environment Enums
DO $$ BEGIN
    CREATE TYPE public.payment_gateway_provider AS ENUM (
        'PAYSTACK',
        'FLUTTERWAVE',
        'MANUAL_BANK_TRANSFER'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_environment AS ENUM (
        'TEST',
        'LIVE'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Configurable Company Bank Accounts Table
CREATE TABLE IF NOT EXISTS public.company_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    bank_name VARCHAR(128) NOT NULL,
    account_name VARCHAR(128) NOT NULL,
    account_number VARCHAR(32) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_bank_active ON public.company_bank_accounts(is_active, display_order);

-- Seed Default Company Bank Accounts for AR Multiventures
INSERT INTO public.company_bank_accounts (
    organization_id, bank_name, account_name, account_number, currency, is_active, display_order
)
SELECT 
    o.id,
    'Guaranty Trust Bank (GTBank)',
    'AR MULTIVENTURES NIGERIA LIMITED',
    '0123456789',
    'NGN',
    true,
    1
FROM public.organizations o WHERE o.code = 'ARM-HQ'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_bank_accounts (
    organization_id, bank_name, account_name, account_number, currency, is_active, display_order
)
SELECT 
    o.id,
    'Zenith Bank Plc',
    'AR MULTIVENTURES NIGERIA LIMITED - REVENUE',
    '1019283746',
    'NGN',
    true,
    2
FROM public.organizations o WHERE o.code = 'ARM-HQ'
ON CONFLICT DO NOTHING;

-- 3. Enhance Payments Table with Gateway Metadata & Proof Paths
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS proof_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS provider public.payment_gateway_provider DEFAULT 'PAYSTACK',
    ADD COLUMN IF NOT EXISTS environment public.payment_environment DEFAULT 'TEST',
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- 4. Gateway Payment Attempts Tracking Table
CREATE TABLE IF NOT EXISTS public.payment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE RESTRICT,
    provider public.payment_gateway_provider NOT NULL DEFAULT 'PAYSTACK',
    provider_reference VARCHAR(128) NOT NULL UNIQUE,
    internal_reference VARCHAR(64) NOT NULL UNIQUE,
    access_code VARCHAR(128),
    authorization_url TEXT,
    amount NUMERIC(18, 2) NOT NULL,
    amount_kobo BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    environment public.payment_environment NOT NULL DEFAULT 'TEST',
    status public.payment_record_status NOT NULL DEFAULT 'PENDING',
    failure_reason TEXT,
    safe_metadata JSONB DEFAULT '{}'::JSONB,
    expires_at TIMESTAMPTZ NOT NULL,
    initialized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pay_attempts_provider_ref ON public.payment_attempts(provider_reference);
CREATE INDEX IF NOT EXISTS idx_pay_attempts_internal_ref ON public.payment_attempts(internal_reference);
CREATE INDEX IF NOT EXISTS idx_pay_attempts_inv ON public.payment_attempts(invoice_id, status);

-- 5. Webhook Events Idempotency & Audit Table
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider public.payment_gateway_provider NOT NULL DEFAULT 'PAYSTACK',
    event_id VARCHAR(128),
    event_hash VARCHAR(128) NOT NULL UNIQUE,
    event_type VARCHAR(128) NOT NULL,
    provider_reference VARCHAR(128) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    processing_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pay_webhook_hash ON public.payment_webhook_events(event_hash);
CREATE INDEX IF NOT EXISTS idx_pay_webhook_ref ON public.payment_webhook_events(provider_reference);

-- 6. Stored Procedure: Initialize Payment Attempt (Server-Authoritative Calculation)
CREATE OR REPLACE FUNCTION public.initialize_payment_attempt(
    p_customer_id UUID,
    p_invoice_id UUID,
    p_provider public.payment_gateway_provider DEFAULT 'PAYSTACK',
    p_environment public.payment_environment DEFAULT 'TEST'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_inv RECORD;
    v_outstanding NUMERIC(18, 2);
    v_kobo BIGINT;
    v_int_ref TEXT;
    v_prov_ref TEXT;
    v_attempt_id UUID;
    v_recent_attempt RECORD;
BEGIN
    -- A. Validate and Lock Invoice
    SELECT * INTO v_inv FROM public.invoices WHERE id = p_invoice_id FOR UPDATE;
    IF v_inv IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVOICE_NOT_FOUND');
    END IF;

    IF v_inv.customer_id != p_customer_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVOICE_CUSTOMER_MISMATCH');
    END IF;

    v_outstanding := v_inv.total_amount - v_inv.amount_paid;
    IF v_outstanding <= 0.00 OR v_inv.status = 'PAID' THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVOICE_ALREADY_SETTLED');
    END IF;

    -- B. Rate-Limiting & Reuse Active Attempt within 15 minutes
    SELECT * INTO v_recent_attempt 
    FROM public.payment_attempts
    WHERE invoice_id = p_invoice_id 
      AND customer_id = p_customer_id
      AND status = 'PENDING'
      AND expires_at > now()
    ORDER BY initialized_at DESC LIMIT 1;

    IF v_recent_attempt IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'reused', true,
            'attemptId', v_recent_attempt.id,
            'internalReference', v_recent_attempt.internal_reference,
            'providerReference', v_recent_attempt.provider_reference,
            'amount', v_recent_attempt.amount,
            'amountKobo', v_recent_attempt.amount_kobo,
            'currency', v_recent_attempt.currency,
            'expiresAt', v_recent_attempt.expires_at,
            'authorizationUrl', v_recent_attempt.authorization_url,
            'accessCode', v_recent_attempt.access_code
        );
    END IF;

    -- C. Generate References and Convert to Kobo
    v_int_ref := public.generate_payment_reference();
    v_prov_ref := 'PSTK-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || lower(substr(md5(random()::text), 1, 10));
    v_kobo := ROUND(v_outstanding * 100)::BIGINT;

    -- D. Record Attempt (30 Minutes Expiry)
    INSERT INTO public.payment_attempts (
        organization_id,
        customer_id,
        invoice_id,
        provider,
        provider_reference,
        internal_reference,
        amount,
        amount_kobo,
        currency,
        environment,
        status,
        expires_at,
        safe_metadata
    ) VALUES (
        v_inv.organization_id,
        p_customer_id,
        p_invoice_id,
        p_provider,
        v_prov_ref,
        v_int_ref,
        v_outstanding,
        v_kobo,
        'NGN',
        p_environment,
        'PENDING',
        now() + INTERVAL '30 minutes',
        jsonb_build_object(
            'invoiceNumber', v_inv.invoice_number,
            'customerName', (SELECT company_name FROM public.customers WHERE id = p_customer_id)
        )
    ) RETURNING id INTO v_attempt_id;

    RETURN jsonb_build_object(
        'success', true,
        'reused', false,
        'attemptId', v_attempt_id,
        'internalReference', v_int_ref,
        'providerReference', v_prov_ref,
        'amount', v_outstanding,
        'amountKobo', v_kobo,
        'currency', 'NGN',
        'expiresAt', (now() + INTERVAL '30 minutes')
    );
END;
$$;

-- 7. Stored Procedure: Process Verified Payment (Authoritative Unified Financial Convergence)
CREATE OR REPLACE FUNCTION public.process_verified_payment(
    p_internal_reference TEXT,
    p_provider_reference TEXT,
    p_amount NUMERIC(18, 2),
    p_currency TEXT DEFAULT 'NGN',
    p_provider public.payment_gateway_provider DEFAULT 'PAYSTACK',
    p_environment public.payment_environment DEFAULT 'TEST',
    p_invoice_id UUID DEFAULT NULL,
    p_customer_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_attempt RECORD;
    v_pay RECORD;
    v_pay_id UUID;
    v_cust_id UUID;
    v_org_id UUID;
    v_target_inv_id UUID;
    v_inv RECORD;
    v_acc_id UUID;
    v_receipt_res JSONB;
    v_allocated_amt NUMERIC(18, 2) := 0.00;
    v_new_paid NUMERIC(18, 2);
    v_outstanding NUMERIC(18, 2);
    v_rem NUMERIC(18, 2);
    v_alloc NUMERIC(18, 2);
    v_rec_inv RECORD;
    v_all_cleared BOOLEAN := true;
BEGIN
    -- 1. Check if attempt exists
    SELECT * INTO v_attempt 
    FROM public.payment_attempts 
    WHERE internal_reference = p_internal_reference OR provider_reference = p_provider_reference
    FOR UPDATE;

    IF v_attempt IS NOT NULL THEN
        v_cust_id := v_attempt.customer_id;
        v_org_id := v_attempt.organization_id;
        v_target_inv_id := COALESCE(p_invoice_id, v_attempt.invoice_id);
    ELSE
        v_cust_id := p_customer_id;
        IF v_cust_id IS NULL THEN
            RETURN jsonb_build_object('success', false, 'error', 'CUSTOMER_IDENTITY_REQUIRED');
        END IF;
        SELECT organization_id INTO v_org_id FROM public.customers WHERE id = v_cust_id;
        v_target_inv_id := p_invoice_id;
    END IF;

    -- 2. Verify Amount and Currency Match
    IF p_currency != 'NGN' THEN
        RETURN jsonb_build_object('success', false, 'error', 'UNSUPPORTED_CURRENCY');
    END IF;

    IF v_attempt IS NOT NULL AND ABS(p_amount - v_attempt.amount) > 0.01 THEN
        RETURN jsonb_build_object('success', false, 'error', 'PAYMENT_AMOUNT_MISMATCH');
    END IF;

    -- 3. Check or Create Payment Master Record
    SELECT * INTO v_pay 
    FROM public.payments 
    WHERE payment_reference = p_internal_reference OR external_reference = p_provider_reference
    FOR UPDATE;

    IF v_pay IS NOT NULL THEN
        -- If already confirmed, return idempotently
        IF v_pay.status = 'CONFIRMED' THEN
            SELECT * INTO v_receipt_res FROM public.generate_payment_receipt(v_pay.id);
            RETURN jsonb_build_object(
                'success', true,
                'alreadyConfirmed', true,
                'paymentId', v_pay.id,
                'paymentReference', v_pay.payment_reference,
                'amount', v_pay.amount,
                'receipt', v_receipt_res
            );
        END IF;
        v_pay_id := v_pay.id;

        UPDATE public.payments
        SET status = 'CONFIRMED',
            external_reference = p_provider_reference,
            provider = p_provider,
            environment = p_environment,
            confirmed_by = auth.uid(),
            confirmed_at = now(),
            updated_at = now()
        WHERE id = v_pay_id;
    ELSE
        -- Insert new Confirmed Payment
        INSERT INTO public.payments (
            organization_id,
            customer_id,
            payment_reference,
            payment_method,
            provider,
            environment,
            amount,
            currency,
            payment_date,
            status,
            external_reference,
            confirmed_by,
            confirmed_at
        ) VALUES (
            v_org_id,
            v_cust_id,
            p_internal_reference,
            CASE 
                WHEN p_provider = 'PAYSTACK' THEN 'PAYSTACK'::public.payment_method_type
                WHEN p_provider = 'FLUTTERWAVE' THEN 'FLUTTERWAVE'::public.payment_method_type
                ELSE 'BANK_TRANSFER'::public.payment_method_type
            END,
            p_provider,
            p_environment,
            p_amount,
            p_currency,
            CURRENT_DATE,
            'CONFIRMED',
            p_provider_reference,
            auth.uid(),
            now()
        ) RETURNING id INTO v_pay_id;
    END IF;

    -- Update Attempt Row
    IF v_attempt IS NOT NULL THEN
        UPDATE public.payment_attempts
        SET status = 'CONFIRMED',
            payment_id = v_pay_id,
            verified_at = now()
        WHERE id = v_attempt.id;
    END IF;

    -- 4. Ensure Customer Financial Account Exists
    INSERT INTO public.customer_accounts (organization_id, customer_id, currency, status)
    VALUES (v_org_id, v_cust_id, 'NGN', 'ACTIVE')
    ON CONFLICT (customer_id) DO NOTHING;

    SELECT id INTO v_acc_id FROM public.customer_accounts WHERE customer_id = v_cust_id;

    -- 5. Atomically Post Exactly ONE Ledger CREDIT
    INSERT INTO public.account_transactions (
        organization_id,
        customer_id,
        account_id,
        transaction_date,
        posting_date,
        transaction_type,
        reference_type,
        reference_id,
        document_number,
        description,
        debit,
        credit,
        currency,
        created_by
    ) VALUES (
        v_org_id,
        v_cust_id,
        v_acc_id,
        CURRENT_DATE,
        now(),
        'PAYMENT',
        'PAYMENT',
        v_pay_id,
        p_internal_reference,
        'Verified Gateway Payment (' || p_provider || ') ' || p_provider_reference,
        0.00,
        p_amount,
        'NGN',
        auth.uid()
    );

    -- 6. Automatic Invoice Allocation
    v_rem := p_amount;

    -- A. If targeted invoice supplied, allocate to it first
    IF v_target_inv_id IS NOT NULL THEN
        SELECT * INTO v_inv FROM public.invoices WHERE id = v_target_inv_id FOR UPDATE;
        IF v_inv IS NOT NULL THEN
            v_outstanding := v_inv.total_amount - v_inv.amount_paid;
            v_alloc := LEAST(v_rem, v_outstanding);

            IF v_alloc > 0 THEN
                INSERT INTO public.payment_allocations (
                    organization_id, payment_id, invoice_id, allocated_amount, created_by
                ) VALUES (
                    v_org_id, v_pay_id, v_target_inv_id, v_alloc, auth.uid()
                );

                v_new_paid := v_inv.amount_paid + v_alloc;
                UPDATE public.invoices
                SET amount_paid = v_new_paid,
                    status = CASE
                        WHEN v_new_paid >= v_inv.total_amount THEN 'PAID'::public.invoice_status
                        ELSE 'PARTIALLY_PAID'::public.invoice_status
                    END,
                    updated_at = now()
                WHERE id = v_target_inv_id;

                v_allocated_amt := v_allocated_amt + v_alloc;
                v_rem := v_rem - v_alloc;

                -- Check Financial Clearance for this requisition
                IF v_inv.requisition_id IS NOT NULL AND v_new_paid >= v_inv.total_amount THEN
                    INSERT INTO public.requisition_financial_clearances (
                        organization_id,
                        requisition_id,
                        clearance_status,
                        cleared_by_payment_id,
                        notes,
                        cleared_at
                    ) VALUES (
                        v_org_id,
                        v_inv.requisition_id,
                        'PAYMENT_CLEARED',
                        v_pay_id,
                        'Auto-cleared via verified online payment ' || p_internal_reference,
                        now()
                    )
                    ON CONFLICT (requisition_id) DO UPDATE SET
                        clearance_status = 'PAYMENT_CLEARED',
                        cleared_by_payment_id = v_pay_id,
                        notes = 'Auto-cleared via verified online payment ' || p_internal_reference,
                        cleared_at = now(),
                        updated_at = now();
                END IF;
            END IF;
        END IF;
    END IF;

    -- Update Payment Allocated Amount
    UPDATE public.payments
    SET allocated_amount = v_allocated_amt
    WHERE id = v_pay_id;

    -- 7. Generate Authoritative Receipt
    SELECT * INTO v_receipt_res FROM public.generate_payment_receipt(v_pay_id);

    -- 8. Audit Log
    INSERT INTO public.audit_logs (
        organization_id, actor_user_id, action, entity_type, entity_id, new_values
    ) VALUES (
        v_org_id,
        auth.uid(),
        'GATEWAY_PAYMENT_VERIFIED',
        'payment',
        v_pay_id,
        jsonb_build_object(
            'reference', p_internal_reference,
            'providerReference', p_provider_reference,
            'provider', p_provider,
            'amount', p_amount,
            'allocatedAmount', v_allocated_amt,
            'receiptNumber', (v_receipt_res->>'receiptNumber')
        )
    );

    -- 9. In-App Notification to Customer
    INSERT INTO public.notifications (
        organization_id, user_id, title, message, type, link
    )
    SELECT 
        v_org_id,
        p.id,
        'Payment Confirmed (₦' || to_char(p_amount, 'FM999,999,999.00') || ')',
        'Your payment ' || p_internal_reference || ' has been verified. Official Receipt #' || (v_receipt_res->>'receiptNumber') || ' issued.',
        'PAYMENT',
        '/app/payments'
    FROM public.profiles p
    WHERE p.customer_id = v_cust_id
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'paymentId', v_pay_id,
        'paymentReference', p_internal_reference,
        'providerReference', p_provider_reference,
        'amount', p_amount,
        'allocatedAmount', v_allocated_amt,
        'unallocatedAmount', (p_amount - v_allocated_amt),
        'receipt', v_receipt_res
    );
END;
$$;

-- 8. Stored Procedure: Reject Manual Bank Transfer
CREATE OR REPLACE FUNCTION public.reject_bank_transfer(
    p_payment_id UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_pay RECORD;
BEGIN
    SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id FOR UPDATE;
    IF v_pay IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'PAYMENT_NOT_FOUND');
    END IF;

    IF v_pay.status = 'CONFIRMED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'CANNOT_REJECT_CONFIRMED_PAYMENT');
    END IF;

    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'REJECTION_REASON_REQUIRED');
    END IF;

    UPDATE public.payments
    SET status = 'FAILED',
        rejection_reason = p_reason,
        rejected_by = auth.uid(),
        rejected_at = now(),
        updated_at = now()
    WHERE id = p_payment_id;

    -- Audit Log
    INSERT INTO public.audit_logs (
        organization_id, actor_user_id, action, entity_type, entity_id, new_values
    ) VALUES (
        v_pay.organization_id,
        auth.uid(),
        'BANK_TRANSFER_REJECTED',
        'payment',
        p_payment_id,
        jsonb_build_object(
            'reference', v_pay.payment_reference,
            'reason', p_reason
        )
    );

    -- In-App Notification
    INSERT INTO public.notifications (
        organization_id, user_id, title, message, type, link
    )
    SELECT 
        v_pay.organization_id,
        p.id,
        'Bank Transfer Deposit Unverified',
        'Deposit reference ' || v_pay.payment_reference || ' could not be verified: ' || p_reason,
        'PAYMENT',
        '/app/payments'
    FROM public.profiles p
    WHERE p.customer_id = v_pay.customer_id
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object('success', true, 'paymentId', p_payment_id, 'status', 'FAILED');
END;
$$;
