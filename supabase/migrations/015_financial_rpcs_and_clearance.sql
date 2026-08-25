-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 015: FINANCIAL RPCS, LEDGER POSTING & CLEARANCE
-- Phase 5 Financial Stored Procedures & Security Definier Operations
-- ============================================================================

-- 1. Helper: Compute authoritative Customer Receivable Balance from Sub-Ledger
CREATE OR REPLACE FUNCTION public.get_customer_balance(p_customer_id UUID)
RETURNS TABLE (
    total_debit NUMERIC(18, 2),
    total_credit NUMERIC(18, 2),
    outstanding_receivable NUMERIC(18, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_dr NUMERIC(18, 2) := 0.00;
    v_cr NUMERIC(18, 2) := 0.00;
BEGIN
    SELECT 
        COALESCE(SUM(debit), 0.00),
        COALESCE(SUM(credit), 0.00)
    INTO v_dr, v_cr
    FROM public.account_transactions
    WHERE customer_id = p_customer_id;

    RETURN QUERY SELECT v_dr, v_cr, (v_dr - v_cr);
END;
$$;

-- 2. Stored Procedure: Issue Invoice For Requisition
CREATE OR REPLACE FUNCTION public.issue_invoice_for_requisition(
    p_requisition_id UUID,
    p_invoice_type public.invoice_type DEFAULT 'INVOICE'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_req RECORD;
    v_inv_id UUID;
    v_inv_number TEXT;
    v_acc_id UUID;
    v_credit_profile RECORD;
    v_due_date DATE;
    v_item RECORD;
BEGIN
    -- A. Fetch and Lock Requisition
    SELECT * INTO v_req FROM public.requisitions WHERE id = p_requisition_id FOR UPDATE;
    IF v_req IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'REQUISITION_NOT_FOUND');
    END IF;

    -- Prevent duplicate final invoices for the same requisition
    IF p_invoice_type != 'PROFORMA' THEN
        SELECT id, invoice_number INTO v_inv_id, v_inv_number
        FROM public.invoices
        WHERE requisition_id = p_requisition_id AND invoice_type != 'PROFORMA'
        LIMIT 1;

        IF v_inv_id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', true,
                'alreadyIssued', true,
                'invoiceId', v_inv_id,
                'invoiceNumber', v_inv_number
            );
        END IF;
    END IF;

    -- B. Ensure Customer Financial Account Exists
    INSERT INTO public.customer_accounts (organization_id, customer_id, currency, status)
    VALUES (v_req.organization_id, v_req.customer_id, 'NGN', 'ACTIVE')
    ON CONFLICT (customer_id) DO NOTHING;

    SELECT id INTO v_acc_id FROM public.customer_accounts WHERE customer_id = v_req.customer_id;

    -- C. Determine Payment Terms & Due Date
    SELECT credit_period_days INTO v_credit_profile
    FROM public.customer_credit_profiles
    WHERE customer_id = v_req.customer_id;

    IF v_credit_profile.credit_period_days > 0 THEN
        v_due_date := CURRENT_DATE + (v_credit_profile.credit_period_days || ' days')::INTERVAL;
    ELSE
        v_due_date := CURRENT_DATE + INTERVAL '7 days';
    END IF;

    -- D. Generate Document Number
    IF p_invoice_type = 'PROFORMA' THEN
        v_inv_number := public.generate_proforma_number();
    ELSE
        v_inv_number := public.generate_invoice_number();
    END IF;

    -- E. Insert Invoice Record
    INSERT INTO public.invoices (
        organization_id,
        customer_id,
        requisition_id,
        invoice_number,
        invoice_type,
        issue_date,
        due_date,
        currency,
        subtotal,
        discount_amount,
        loading_amount,
        haulage_amount,
        fuel_adjustment_amount,
        tax_amount,
        total_amount,
        amount_paid,
        status,
        created_by
    ) VALUES (
        v_req.organization_id,
        v_req.customer_id,
        v_req.id,
        v_inv_number,
        p_invoice_type,
        CURRENT_DATE,
        v_due_date,
        'NGN',
        v_req.material_amount_snapshot,
        v_req.discount_amount_snapshot,
        v_req.loading_amount_snapshot,
        v_req.haulage_amount_snapshot,
        v_req.other_charges_snapshot,
        0.00,
        v_req.total_amount_snapshot,
        0.00,
        'ISSUED',
        auth.uid()
    ) RETURNING id INTO v_inv_id;

    -- F. Clone Line Items
    FOR v_item IN SELECT * FROM public.requisition_items WHERE requisition_id = p_requisition_id LOOP
        INSERT INTO public.invoice_items (
            invoice_id,
            material_id,
            description,
            quantity,
            unit,
            unit_price,
            line_total
        ) VALUES (
            v_inv_id,
            v_item.material_id,
            'Granite Aggregate Supply',
            v_item.quantity,
            v_item.unit,
            v_item.unit_price_snapshot,
            v_item.line_total
        );
    END LOOP;

    -- G. CRITICAL: Post DEBIT to Financial Sub-Ledger only for Final / Tax Invoices
    IF p_invoice_type != 'PROFORMA' THEN
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
            v_req.organization_id,
            v_req.customer_id,
            v_acc_id,
            CURRENT_DATE,
            now(),
            'INVOICE',
            'INVOICE',
            v_inv_id,
            v_inv_number,
            'Tax Invoice for Requisition ' || v_req.requisition_number,
            v_req.total_amount_snapshot,
            0.00,
            'NGN',
            auth.uid()
        );
    END IF;

    -- Audit Log
    INSERT INTO public.audit_logs (
        organization_id, actor_user_id, action, entity_type, entity_id, new_values
    ) VALUES (
        v_req.organization_id,
        auth.uid(),
        'INVOICE_ISSUED',
        'invoice',
        v_inv_id,
        jsonb_build_object(
            'invoiceNumber', v_inv_number,
            'invoiceType', p_invoice_type,
            'total', v_req.total_amount_snapshot
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'invoiceId', v_inv_id,
        'invoiceNumber', v_inv_number,
        'invoiceType', p_invoice_type,
        'totalAmount', v_req.total_amount_snapshot
    );
END;
$$;

-- 3. Stored Procedure: Confirm Payment & Post Sub-Ledger Credit
CREATE OR REPLACE FUNCTION public.confirm_payment(
    p_payment_id UUID,
    p_bank_reference TEXT DEFAULT NULL,
    p_allocations JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_pay RECORD;
    v_acc_id UUID;
    v_alloc RECORD;
    v_alloc_total NUMERIC(18, 2) := 0.00;
    v_inv RECORD;
    v_elem JSONB;
    v_target_inv_id UUID;
    v_alloc_amt NUMERIC(18, 2);
    v_new_paid NUMERIC(18, 2);
BEGIN
    -- A. Lock Payment Row
    SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id FOR UPDATE;
    IF v_pay IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'PAYMENT_NOT_FOUND');
    END IF;

    IF v_pay.status = 'CONFIRMED' THEN
        RETURN jsonb_build_object('success', true, 'alreadyConfirmed', true);
    END IF;

    -- B. Ensure Customer Financial Account Exists
    INSERT INTO public.customer_accounts (organization_id, customer_id, currency, status)
    VALUES (v_pay.organization_id, v_pay.customer_id, 'NGN', 'ACTIVE')
    ON CONFLICT (customer_id) DO NOTHING;

    SELECT id INTO v_acc_id FROM public.customer_accounts WHERE customer_id = v_pay.customer_id;

    -- C. Update Payment Status to CONFIRMED
    UPDATE public.payments
    SET status = 'CONFIRMED',
        bank_reference = COALESCE(p_bank_reference, bank_reference),
        confirmed_by = auth.uid(),
        confirmed_at = now(),
        updated_at = now()
    WHERE id = p_payment_id;

    -- D. Post CREDIT Transaction to Immutable Financial Sub-Ledger
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
        v_pay.organization_id,
        v_pay.customer_id,
        v_acc_id,
        v_pay.payment_date,
        now(),
        'PAYMENT',
        'PAYMENT',
        p_payment_id,
        v_pay.payment_reference,
        'Confirmed Payment (' || v_pay.payment_method || ') ' || COALESCE(p_bank_reference, ''),
        0.00,
        v_pay.amount,
        'NGN',
        auth.uid()
    );

    -- E. Process Invoice Allocations (if supplied)
    IF jsonb_array_length(p_allocations) > 0 THEN
        FOR v_elem IN SELECT * FROM jsonb_array_elements(p_allocations) LOOP
            v_target_inv_id := (v_elem->>'invoiceId')::UUID;
            v_alloc_amt := (v_elem->>'amount')::NUMERIC(18, 2);

            IF v_target_inv_id IS NOT NULL AND v_alloc_amt > 0 THEN
                SELECT * INTO v_inv FROM public.invoices WHERE id = v_target_inv_id FOR UPDATE;

                IF v_inv IS NOT NULL THEN
                    INSERT INTO public.payment_allocations (
                        organization_id,
                        payment_id,
                        invoice_id,
                        allocated_amount,
                        created_by
                    ) VALUES (
                        v_pay.organization_id,
                        p_payment_id,
                        v_target_inv_id,
                        v_alloc_amt,
                        auth.uid()
                    );

                    v_new_paid := v_inv.amount_paid + v_alloc_amt;
                    UPDATE public.invoices
                    SET amount_paid = v_new_paid,
                        status = CASE
                            WHEN v_new_paid >= v_inv.total_amount THEN 'PAID'::public.invoice_status
                            ELSE 'PARTIALLY_PAID'::public.invoice_status
                        END,
                        updated_at = now()
                    WHERE id = v_target_inv_id;

                    v_alloc_total := v_alloc_total + v_alloc_amt;

                    -- Update Requisition Financial Clearance if invoice is fully paid
                    IF v_inv.requisition_id IS NOT NULL AND v_new_paid >= v_inv.total_amount THEN
                        INSERT INTO public.requisition_financial_clearances (
                            organization_id,
                            requisition_id,
                            clearance_status,
                            cleared_by_payment_id,
                            notes,
                            cleared_at
                        ) VALUES (
                            v_pay.organization_id,
                            v_inv.requisition_id,
                            'PAYMENT_CLEARED',
                            p_payment_id,
                            'Cleared via confirmed payment ' || v_pay.payment_reference,
                            now()
                        )
                        ON CONFLICT (requisition_id) DO UPDATE SET
                            clearance_status = 'PAYMENT_CLEARED',
                            cleared_by_payment_id = p_payment_id,
                            cleared_at = now(),
                            updated_at = now();
                    END IF;
                END IF;
            END IF;
        END LOOP;

        UPDATE public.payments
        SET allocated_amount = v_alloc_total
        WHERE id = p_payment_id;
    END IF;

    -- Audit Log
    INSERT INTO public.audit_logs (
        organization_id, actor_user_id, action, entity_type, entity_id, new_values
    ) VALUES (
        v_pay.organization_id,
        auth.uid(),
        'PAYMENT_CONFIRMED',
        'payment',
        p_payment_id,
        jsonb_build_object(
            'reference', v_pay.payment_reference,
            'amount', v_pay.amount,
            'allocated', v_alloc_total
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'paymentId', p_payment_id,
        'amount', v_pay.amount,
        'allocatedAmount', v_alloc_total,
        'unallocatedCredit', (v_pay.amount - v_alloc_total)
    );
END;
$$;

-- 4. Stored Procedure: Evaluate Credit Facility For Requisition
CREATE OR REPLACE FUNCTION public.evaluate_credit_for_requisition(p_requisition_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_req RECORD;
    v_credit RECORD;
    v_current_rec NUMERIC(18, 2) := 0.00;
    v_proj_exposure NUMERIC(18, 2);
    v_overdue_count INT := 0;
    v_override RECORD;
BEGIN
    SELECT * INTO v_req FROM public.requisitions WHERE id = p_requisition_id;
    IF v_req IS NULL THEN
        RETURN jsonb_build_object('decision', 'BLOCKED', 'reason', 'REQUISITION_NOT_FOUND');
    END IF;

    -- Check for Active Management Override
    SELECT * INTO v_override
    FROM public.credit_overrides
    WHERE requisition_id = p_requisition_id
      AND (expires_at IS NULL OR expires_at >= now())
    ORDER BY created_at DESC LIMIT 1;

    IF v_override IS NOT NULL THEN
        RETURN jsonb_build_object(
            'decision', 'MANAGEMENT_OVERRIDE',
            'authorizedBy', v_override.authorized_by,
            'reason', v_override.override_reason
        );
    END IF;

    -- Fetch Credit Profile
    SELECT * INTO v_credit
    FROM public.customer_credit_profiles
    WHERE customer_id = v_req.customer_id;

    IF v_credit IS NULL OR v_credit.credit_status != 'ACTIVE_CREDIT' OR v_credit.credit_limit <= 0 THEN
        RETURN jsonb_build_object(
            'decision', 'BLOCKED',
            'creditLimit', 0.00,
            'reason', 'NO_ACTIVE_CREDIT_FACILITY'
        );
    END IF;

    -- Check for Overdue Invoices
    SELECT COUNT(*) INTO v_overdue_count
    FROM public.invoices
    WHERE customer_id = v_req.customer_id
      AND status IN ('ISSUED', 'PARTIALLY_PAID')
      AND due_date < CURRENT_DATE;

    IF v_overdue_count > 0 THEN
        RETURN jsonb_build_object(
            'decision', 'BLOCKED',
            'overdueInvoicesCount', v_overdue_count,
            'reason', 'CUSTOMER_HAS_OVERDUE_INVOICES'
        );
    END IF;

    -- Compute Current Sub-Ledger Outstanding Receivable
    SELECT COALESCE(SUM(debit) - SUM(credit), 0.00) INTO v_current_rec
    FROM public.account_transactions
    WHERE customer_id = v_req.customer_id;

    v_proj_exposure := v_current_rec + v_req.total_amount_snapshot;

    IF v_proj_exposure > v_credit.credit_limit THEN
        RETURN jsonb_build_object(
            'decision', 'MANAGEMENT_REVIEW',
            'creditLimit', v_credit.credit_limit,
            'currentExposure', v_current_rec,
            'requisitionValue', v_req.total_amount_snapshot,
            'projectedExposure', v_proj_exposure,
            'availableCredit', (v_credit.credit_limit - v_current_rec),
            'reason', 'CREDIT_LIMIT_EXCEEDED'
        );
    END IF;

    -- Passed Credit Check
    RETURN jsonb_build_object(
        'decision', 'APPROVED',
        'creditLimit', v_credit.credit_limit,
        'currentExposure', v_current_rec,
        'requisitionValue', v_req.total_amount_snapshot,
        'projectedExposure', v_proj_exposure,
        'availableCredit', (v_credit.credit_limit - v_proj_exposure),
        'reason', 'WITHIN_APPROVED_CREDIT_FACILITY'
    );
END;
$$;

-- 5. Stored Procedure: Grant Management Credit Override
CREATE OR REPLACE FUNCTION public.grant_management_credit_override(
    p_requisition_id UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_req RECORD;
    v_ovr_id UUID;
BEGIN
    SELECT * INTO v_req FROM public.requisitions WHERE id = p_requisition_id;
    IF v_req IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'REQUISITION_NOT_FOUND');
    END IF;

    INSERT INTO public.credit_overrides (
        organization_id,
        requisition_id,
        customer_id,
        override_reason,
        authorized_by,
        expires_at
    ) VALUES (
        v_req.organization_id,
        p_requisition_id,
        v_req.customer_id,
        p_reason,
        auth.uid(),
        now() + INTERVAL '14 days'
    ) RETURNING id INTO v_ovr_id;

    INSERT INTO public.requisition_financial_clearances (
        organization_id,
        requisition_id,
        clearance_status,
        cleared_by_override_id,
        notes,
        cleared_at
    ) VALUES (
        v_req.organization_id,
        p_requisition_id,
        'MANAGEMENT_OVERRIDE',
        v_ovr_id,
        p_reason,
        now()
    )
    ON CONFLICT (requisition_id) DO UPDATE SET
        clearance_status = 'MANAGEMENT_OVERRIDE',
        cleared_by_override_id = v_ovr_id,
        notes = p_reason,
        cleared_at = now(),
        updated_at = now();

    -- Audit Log
    INSERT INTO public.audit_logs (
        organization_id, actor_user_id, action, entity_type, entity_id, new_values
    ) VALUES (
        v_req.organization_id,
        auth.uid(),
        'CREDIT_OVERRIDE_GRANTED',
        'requisition',
        p_requisition_id,
        jsonb_build_object('reason', p_reason)
    );

    RETURN jsonb_build_object('success', true, 'overrideId', v_ovr_id);
END;
$$;

-- 6. Stored Procedure: Get Customer Statement With Running Ledger Balances
CREATE OR REPLACE FUNCTION public.get_customer_statement(
    p_customer_id UUID,
    p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '90 days')::DATE,
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_open_dr NUMERIC(18, 2) := 0.00;
    v_open_cr NUMERIC(18, 2) := 0.00;
    v_open_bal NUMERIC(18, 2) := 0.00;
    v_running_bal NUMERIC(18, 2) := 0.00;
    v_tot_dr NUMERIC(18, 2) := 0.00;
    v_tot_cr NUMERIC(18, 2) := 0.00;
    v_txns JSONB := '[]'::JSONB;
    v_row RECORD;
BEGIN
    -- Opening Balance prior to start_date
    SELECT 
        COALESCE(SUM(debit), 0.00),
        COALESCE(SUM(credit), 0.00)
    INTO v_open_dr, v_open_cr
    FROM public.account_transactions
    WHERE customer_id = p_customer_id
      AND transaction_date < p_start_date;

    v_open_bal := v_open_dr - v_open_cr;
    v_running_bal := v_open_bal;

    -- Iteratively build chronological ledger with running balance
    FOR v_row IN 
        SELECT 
            id,
            transaction_date,
            posting_date,
            transaction_type,
            reference_type,
            reference_id,
            document_number,
            description,
            debit,
            credit
        FROM public.account_transactions
        WHERE customer_id = p_customer_id
          AND transaction_date >= p_start_date
          AND transaction_date <= p_end_date
        ORDER BY transaction_date ASC, posting_date ASC
    LOOP
        v_running_bal := v_running_bal + v_row.debit - v_row.credit;
        v_tot_dr := v_tot_dr + v_row.debit;
        v_tot_cr := v_tot_cr + v_row.credit;

        v_txns := v_txns || jsonb_build_object(
            'id', v_row.id,
            'date', v_row.transaction_date,
            'documentNumber', v_row.document_number,
            'description', v_row.description,
            'type', v_row.transaction_type,
            'debit', v_row.debit,
            'credit', v_row.credit,
            'runningBalance', v_running_bal
        );
    END LOOP;

    RETURN jsonb_build_object(
        'customerId', p_customer_id,
        'startDate', p_start_date,
        'endDate', p_end_date,
        'openingBalance', v_open_bal,
        'totalDebit', v_tot_dr,
        'totalCredit', v_tot_cr,
        'closingBalance', v_running_bal,
        'transactions', v_txns
    );
END;
$$;
