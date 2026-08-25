-- ============================================================================
-- AR MULTIVENTURES — FINANCIAL SUB-LEDGER & INVOICING VALIDATION TESTS
-- Automated SQL Test Suite for Financial Integrity, Sign Convention & Postings
-- ============================================================================

DO $$
DECLARE
    org_id UUID;
    cust_id UUID;
    acc_id UUID;
    bal_record RECORD;
    inv_res JSONB;
    inv_id UUID;
    pay_id UUID;
    pay_res JSONB;
    credit_res JSONB;
    statement_res JSONB;
    running_bal NUMERIC(18, 2);
BEGIN
    SELECT id INTO org_id FROM public.organizations WHERE code = 'ARM-HQ' LIMIT 1;

    -- 1. Setup Customer & Credit Facility
    INSERT INTO public.customers (
        organization_id, account_number, customer_type, company_name, phone, email, status
    ) VALUES (
        org_id, 'CUS-FIN-TEST', 'COMPANY', 'Apex Construction Financial Test Ltd', '+234 809 999 8888', 'finance@apex.ng', 'ACTIVE'
    ) ON CONFLICT (organization_id, account_number) DO NOTHING;

    SELECT id INTO cust_id FROM public.customers WHERE account_number = 'CUS-FIN-TEST';

    INSERT INTO public.customer_accounts (organization_id, customer_id, currency, status)
    VALUES (org_id, cust_id, 'NGN', 'ACTIVE')
    ON CONFLICT (customer_id) DO NOTHING;

    SELECT id INTO acc_id FROM public.customer_accounts WHERE customer_id = cust_id;

    -- Setup ₦5,000,000 Credit Limit
    INSERT INTO public.customer_credit_profiles (
        organization_id, customer_id, credit_status, credit_limit, credit_period_days, effective_from
    ) VALUES (
        org_id, cust_id, 'ACTIVE_CREDIT', 5000000.00, 30, CURRENT_DATE
    ) ON CONFLICT (customer_id) DO UPDATE SET
        credit_status = 'ACTIVE_CREDIT',
        credit_limit = 5000000.00,
        credit_period_days = 30;

    -- ------------------------------------------------------------------------
    -- TEST 1: Opening Balance Posting (₦100,000 Debit)
    -- ------------------------------------------------------------------------
    INSERT INTO public.account_transactions (
        organization_id, customer_id, account_id, transaction_date, transaction_type,
        reference_type, document_number, description, debit, credit
    ) VALUES (
        org_id, cust_id, acc_id, CURRENT_DATE - 10, 'OPENING_BALANCE_DR',
        'MANUAL', 'OPB-001', 'Migrated Opening Ledger Balance', 100000.00, 0.00
    );

    SELECT * INTO bal_record FROM public.get_customer_balance(cust_id);
    IF bal_record.outstanding_receivable != 100000.00 THEN
        RAISE EXCEPTION 'TEST 1 FAILED: Expected 100,000.00 receivable but got %', bal_record.outstanding_receivable;
    END IF;
    RAISE NOTICE 'TEST 1 PASSED: Opening Balance posted correctly (Receivable: ₦%)', bal_record.outstanding_receivable;

    -- ------------------------------------------------------------------------
    -- TEST 2: Tax Invoice Posting (₦500,000 Debit)
    -- ------------------------------------------------------------------------
    INSERT INTO public.invoices (
        organization_id, customer_id, invoice_number, invoice_type, issue_date, due_date,
        subtotal, total_amount, amount_paid, status
    ) VALUES (
        org_id, cust_id, 'INV-TEST-001', 'TAX_INVOICE', CURRENT_DATE - 5, CURRENT_DATE + 25,
        500000.00, 500000.00, 0.00, 'ISSUED'
    ) RETURNING id INTO inv_id;

    INSERT INTO public.account_transactions (
        organization_id, customer_id, account_id, transaction_date, transaction_type,
        reference_type, reference_id, document_number, description, debit, credit
    ) VALUES (
        org_id, cust_id, acc_id, CURRENT_DATE - 5, 'INVOICE',
        'INVOICE', inv_id, 'INV-TEST-001', 'Tax Invoice Supply #INV-TEST-001', 500000.00, 0.00
    );

    SELECT * INTO bal_record FROM public.get_customer_balance(cust_id);
    -- 100,000 + 500,000 = 600,000
    IF bal_record.outstanding_receivable != 600000.00 THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Expected 600,000.00 receivable but got %', bal_record.outstanding_receivable;
    END IF;
    RAISE NOTICE 'TEST 2 PASSED: Tax Invoice debited customer sub-ledger (Receivable: ₦%)', bal_record.outstanding_receivable;

    -- ------------------------------------------------------------------------
    -- TEST 3: Payment Confirmation & Partial Invoice Allocation (₦300,000 Credit)
    -- ------------------------------------------------------------------------
    INSERT INTO public.payments (
        organization_id, customer_id, payment_reference, payment_method, amount,
        payment_date, status, bank_reference
    ) VALUES (
        org_id, cust_id, 'PAY-TEST-001', 'BANK_TRANSFER', 300000.00,
        CURRENT_DATE, 'PENDING', 'ZENITH-TRF-994411'
    ) RETURNING id INTO pay_id;

    -- Call Atomic Payment Confirmation RPC
    pay_res := public.confirm_payment(
        pay_id,
        'ZENITH-TRF-994411',
        jsonb_build_array(jsonb_build_object('invoiceId', inv_id, 'amount', 300000.00))
    );

    SELECT * INTO bal_record FROM public.get_customer_balance(cust_id);
    -- 600,000 - 300,000 = 300,000
    IF bal_record.outstanding_receivable != 300000.00 THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Expected 300,000.00 receivable after payment but got %', bal_record.outstanding_receivable;
    END IF;
    RAISE NOTICE 'TEST 3 PASSED: Payment confirmed and sub-ledger credited (Receivable: ₦%)', bal_record.outstanding_receivable;

    -- Check Invoice Status is PARTIALLY_PAID
    IF (SELECT status FROM public.invoices WHERE id = inv_id) != 'PARTIALLY_PAID' THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Invoice status must be PARTIALLY_PAID';
    END IF;

    -- ------------------------------------------------------------------------
    -- TEST 4: Credit Note Posting (₦50,000 Credit)
    -- ------------------------------------------------------------------------
    INSERT INTO public.account_transactions (
        organization_id, customer_id, account_id, transaction_date, transaction_type,
        reference_type, document_number, description, debit, credit
    ) VALUES (
        org_id, cust_id, acc_id, CURRENT_DATE, 'CREDIT_NOTE',
        'CREDIT_NOTE', 'CRN-TEST-001', 'CRN-TEST-001', 'Credit Note: Haulage adjustment concession', 0.00, 50000.00
    );

    SELECT * INTO bal_record FROM public.get_customer_balance(cust_id);
    -- 300,000 - 50,000 = 250,000
    IF bal_record.outstanding_receivable != 250000.00 THEN
        RAISE EXCEPTION 'TEST 4 FAILED: Expected 250,000.00 receivable after credit note but got %', bal_record.outstanding_receivable;
    END IF;
    RAISE NOTICE 'TEST 4 PASSED: Credit Note posted correctly (Receivable: ₦%)', bal_record.outstanding_receivable;

    -- ------------------------------------------------------------------------
    -- TEST 5: Customer Statement Running Ledger Verification
    -- ------------------------------------------------------------------------
    statement_res := public.get_customer_statement(cust_id, CURRENT_DATE - 30, CURRENT_DATE);
    running_bal := (statement_res->>'closingBalance')::NUMERIC(18, 2);

    IF running_bal != 250000.00 THEN
        RAISE EXCEPTION 'TEST 5 FAILED: Expected Statement Closing Balance 250,000.00 but got %', running_bal;
    END IF;
    RAISE NOTICE 'TEST 5 PASSED: Customer Statement computed chronologically (Closing Balance: ₦%)', running_bal;

    RAISE NOTICE '=========================================================';
    RAISE NOTICE 'ALL 5 FINANCIAL SUB-LEDGER TESTS PASSED 100%%!';
    RAISE NOTICE '=========================================================';
END $$;
