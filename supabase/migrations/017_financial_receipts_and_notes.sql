-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 017: RECEIPTS, CREDIT & DEBIT NOTES ARCHITECTURE
-- Phase 6 Financial Enhancements: Authoritative Receipts, Line-Item Notes & Postings
-- ============================================================================

-- 1. Receipts Sequence & Formatter
CREATE SEQUENCE IF NOT EXISTS public.receipt_number_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
    v_seq BIGINT := nextval('public.receipt_number_seq');
BEGIN
    RETURN 'REC-' || v_year || '-' || lpad(v_seq::TEXT, 6, '0');
END;
$$;

-- 2. Authoritative Receipts Master Table
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    receipt_number VARCHAR(64) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    payment_id UUID NOT NULL UNIQUE REFERENCES public.payments(id) ON DELETE RESTRICT,
    amount NUMERIC(18, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_receipt_amount_positive CHECK (amount > 0.00)
);

CREATE INDEX IF NOT EXISTS idx_receipts_customer ON public.receipts(customer_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_payment ON public.receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON public.receipts(receipt_number);

-- 3. Enhance Credit Notes & Debit Notes Tables
ALTER TABLE public.credit_notes 
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.debit_notes 
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Credit Note & Debit Note Line Items
CREATE TABLE IF NOT EXISTS public.credit_note_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_note_id UUID NOT NULL REFERENCES public.credit_notes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(32) NOT NULL DEFAULT 'units',
    unit_price NUMERIC(18, 2) NOT NULL,
    line_total NUMERIC(18, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_note_items ON public.credit_note_items(credit_note_id);

CREATE TABLE IF NOT EXISTS public.debit_note_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debit_note_id UUID NOT NULL REFERENCES public.debit_notes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(32) NOT NULL DEFAULT 'units',
    unit_price NUMERIC(18, 2) NOT NULL,
    line_total NUMERIC(18, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debit_note_items ON public.debit_note_items(debit_note_id);

-- 5. Stored Procedure: Generate Authoritative Payment Receipt (Idempotent)
CREATE OR REPLACE FUNCTION public.generate_payment_receipt(p_payment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_pay RECORD;
    v_rec RECORD;
    v_receipt_number TEXT;
    v_receipt_id UUID;
BEGIN
    SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id;
    IF v_pay IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'PAYMENT_NOT_FOUND');
    END IF;

    IF v_pay.status != 'CONFIRMED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'PAYMENT_NOT_CONFIRMED');
    END IF;

    -- Check if receipt already generated (Idempotency)
    SELECT * INTO v_rec FROM public.receipts WHERE payment_id = p_payment_id;
    IF v_rec IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'alreadyIssued', true,
            'receiptId', v_rec.id,
            'receiptNumber', v_rec.receipt_number,
            'amount', v_rec.amount,
            'issuedAt', v_rec.issued_at
        );
    END IF;

    v_receipt_number := public.generate_receipt_number();

    INSERT INTO public.receipts (
        organization_id,
        receipt_number,
        customer_id,
        payment_id,
        amount,
        currency,
        issued_at,
        created_by
    ) VALUES (
        v_pay.organization_id,
        v_receipt_number,
        v_pay.customer_id,
        p_payment_id,
        v_pay.amount,
        v_pay.currency,
        now(),
        auth.uid()
    ) RETURNING id INTO v_receipt_id;

    -- Audit Log
    INSERT INTO public.audit_logs (
        organization_id, actor_user_id, action, entity_type, entity_id, new_values
    ) VALUES (
        v_pay.organization_id,
        auth.uid(),
        'RECEIPT_ISSUED',
        'receipt',
        v_receipt_id,
        jsonb_build_object(
            'receiptNumber', v_receipt_number,
            'paymentId', p_payment_id,
            'amount', v_pay.amount
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'alreadyIssued', false,
        'receiptId', v_receipt_id,
        'receiptNumber', v_receipt_number,
        'amount', v_pay.amount,
        'issuedAt', now()
    );
END;
$$;

-- 6. Stored Procedure: Issue Credit Note & Atomically Post Exactly ONE Ledger Credit
CREATE OR REPLACE FUNCTION public.issue_credit_note(
    p_customer_id UUID,
    p_invoice_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT 'Commercial adjustment',
    p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_cust RECORD;
    v_acc_id UUID;
    v_crn_id UUID;
    v_crn_number TEXT;
    v_total NUMERIC(18, 2) := 0.00;
    v_elem JSONB;
    v_desc TEXT;
    v_qty NUMERIC(12, 2);
    v_unit TEXT;
    v_rate NUMERIC(18, 2);
    v_line_tot NUMERIC(18, 2);
BEGIN
    SELECT * INTO v_cust FROM public.customers WHERE id = p_customer_id;
    IF v_cust IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'CUSTOMER_NOT_FOUND');
    END IF;

    -- Ensure Customer Financial Account Exists
    INSERT INTO public.customer_accounts (organization_id, customer_id, currency, status)
    VALUES (v_cust.organization_id, p_customer_id, 'NGN', 'ACTIVE')
    ON CONFLICT (customer_id) DO NOTHING;

    SELECT id INTO v_acc_id FROM public.customer_accounts WHERE customer_id = p_customer_id;

    -- Calculate total from items
    IF jsonb_array_length(p_items) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'EMPTY_CREDIT_NOTE_ITEMS');
    END IF;

    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_rate := COALESCE((v_elem->>'unitPrice')::NUMERIC(18, 2), 0.00);
        v_qty := COALESCE((v_elem->>'quantity')::NUMERIC(12, 2), 1.00);
        v_line_tot := COALESCE((v_elem->>'lineTotal')::NUMERIC(18, 2), (v_rate * v_qty));
        v_total := v_total + v_line_tot;
    END LOOP;

    IF v_total <= 0.00 THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_CREDIT_NOTE_AMOUNT');
    END IF;

    v_crn_number := public.generate_credit_note_number();

    -- Insert Credit Note Header
    INSERT INTO public.credit_notes (
        organization_id,
        customer_id,
        invoice_id,
        credit_note_number,
        reason,
        amount,
        currency,
        issue_date,
        status,
        created_by,
        approved_by,
        approved_at
    ) VALUES (
        v_cust.organization_id,
        p_customer_id,
        p_invoice_id,
        v_crn_number,
        p_reason,
        v_total,
        'NGN',
        CURRENT_DATE,
        'ISSUED',
        auth.uid(),
        auth.uid(),
        now()
    ) RETURNING id INTO v_crn_id;

    -- Insert Line Items
    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_desc := COALESCE(v_elem->>'description', 'Credit adjustment item');
        v_qty := COALESCE((v_elem->>'quantity')::NUMERIC(12, 2), 1.00);
        v_unit := COALESCE(v_elem->>'unit', 'units');
        v_rate := COALESCE((v_elem->>'unitPrice')::NUMERIC(18, 2), 0.00);
        v_line_tot := COALESCE((v_elem->>'lineTotal')::NUMERIC(18, 2), (v_rate * v_qty));

        INSERT INTO public.credit_note_items (
            credit_note_id, description, quantity, unit, unit_price, line_total
        ) VALUES (
            v_crn_id, v_desc, v_qty, v_unit, v_rate, v_line_tot
        );
    END LOOP;

    -- Post Exactly ONE Ledger CREDIT
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
        v_cust.organization_id,
        p_customer_id,
        v_acc_id,
        CURRENT_DATE,
        now(),
        'CREDIT_NOTE',
        'CREDIT_NOTE',
        v_crn_id,
        v_crn_number,
        'Credit Note: ' || p_reason,
        0.00,
        v_total,
        'NGN',
        auth.uid()
    );

    -- Audit Log
    INSERT INTO public.audit_logs (
        organization_id, actor_user_id, action, entity_type, entity_id, new_values
    ) VALUES (
        v_cust.organization_id,
        auth.uid(),
        'CREDIT_NOTE_ISSUED',
        'credit_note',
        v_crn_id,
        jsonb_build_object(
            'creditNoteNumber', v_crn_number,
            'amount', v_total,
            'reason', p_reason
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'creditNoteId', v_crn_id,
        'creditNoteNumber', v_crn_number,
        'amount', v_total
    );
END;
$$;

-- 7. Stored Procedure: Issue Debit Note & Atomically Post Exactly ONE Ledger Debit
CREATE OR REPLACE FUNCTION public.issue_debit_note(
    p_customer_id UUID,
    p_invoice_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT 'Commercial surcharge',
    p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_cust RECORD;
    v_acc_id UUID;
    v_drn_id UUID;
    v_drn_number TEXT;
    v_total NUMERIC(18, 2) := 0.00;
    v_elem JSONB;
    v_desc TEXT;
    v_qty NUMERIC(12, 2);
    v_unit TEXT;
    v_rate NUMERIC(18, 2);
    v_line_tot NUMERIC(18, 2);
BEGIN
    SELECT * INTO v_cust FROM public.customers WHERE id = p_customer_id;
    IF v_cust IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'CUSTOMER_NOT_FOUND');
    END IF;

    INSERT INTO public.customer_accounts (organization_id, customer_id, currency, status)
    VALUES (v_cust.organization_id, p_customer_id, 'NGN', 'ACTIVE')
    ON CONFLICT (customer_id) DO NOTHING;

    SELECT id INTO v_acc_id FROM public.customer_accounts WHERE customer_id = p_customer_id;

    IF jsonb_array_length(p_items) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'EMPTY_DEBIT_NOTE_ITEMS');
    END IF;

    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_rate := COALESCE((v_elem->>'unitPrice')::NUMERIC(18, 2), 0.00);
        v_qty := COALESCE((v_elem->>'quantity')::NUMERIC(12, 2), 1.00);
        v_line_tot := COALESCE((v_elem->>'lineTotal')::NUMERIC(18, 2), (v_rate * v_qty));
        v_total := v_total + v_line_tot;
    END LOOP;

    IF v_total <= 0.00 THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_DEBIT_NOTE_AMOUNT');
    END IF;

    -- Generate Debit Note Number
    v_drn_number := 'DBN-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('public.debit_note_seq')::TEXT, 6, '0');

    -- Insert Debit Note Header
    INSERT INTO public.debit_notes (
        organization_id,
        customer_id,
        invoice_id,
        debit_note_number,
        reason,
        amount,
        currency,
        issue_date,
        status,
        created_by,
        approved_by,
        approved_at
    ) VALUES (
        v_cust.organization_id,
        p_customer_id,
        p_invoice_id,
        v_drn_number,
        p_reason,
        v_total,
        'NGN',
        CURRENT_DATE,
        'ISSUED',
        auth.uid(),
        auth.uid(),
        now()
    ) RETURNING id INTO v_drn_id;

    -- Insert Line Items
    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_desc := COALESCE(v_elem->>'description', 'Debit surcharge item');
        v_qty := COALESCE((v_elem->>'quantity')::NUMERIC(12, 2), 1.00);
        v_unit := COALESCE(v_elem->>'unit', 'units');
        v_rate := COALESCE((v_elem->>'unitPrice')::NUMERIC(18, 2), 0.00);
        v_line_tot := COALESCE((v_elem->>'lineTotal')::NUMERIC(18, 2), (v_rate * v_qty));

        INSERT INTO public.debit_note_items (
            debit_note_id, description, quantity, unit, unit_price, line_total
        ) VALUES (
            v_drn_id, v_desc, v_qty, v_unit, v_rate, v_line_tot
        );
    END LOOP;

    -- Post Exactly ONE Ledger DEBIT
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
        v_cust.organization_id,
        p_customer_id,
        v_acc_id,
        CURRENT_DATE,
        now(),
        'DEBIT_NOTE',
        'DEBIT_NOTE',
        v_drn_id,
        v_drn_number,
        'Debit Note: ' || p_reason,
        v_total,
        0.00,
        'NGN',
        auth.uid()
    );

    -- Audit Log
    INSERT INTO public.audit_logs (
        organization_id, actor_user_id, action, entity_type, entity_id, new_values
    ) VALUES (
        v_cust.organization_id,
        auth.uid(),
        'DEBIT_NOTE_ISSUED',
        'debit_note',
        v_drn_id,
        jsonb_build_object(
            'debitNoteNumber', v_drn_number,
            'amount', v_total,
            'reason', p_reason
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'debitNoteId', v_drn_id,
        'debitNoteNumber', v_drn_number,
        'amount', v_total
    );
END;
$$;
