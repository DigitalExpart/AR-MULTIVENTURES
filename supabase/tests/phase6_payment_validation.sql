-- ============================================================================
-- AR MULTIVENTURES — PHASE 6 PAYMENT PROCESSING & RECONCILIATION TEST SUITE
-- Automated SQL Test Suite for Paystack, Bank Transfers, Receipts & Clearances
-- ============================================================================

DO $$
DECLARE
    org_id UUID;
    cust_id UUID;
    acc_id UUID;
    inv_id UUID;
    req_id UUID;
    attempt_res JSONB;
    attempt_id UUID;
    int_ref TEXT;
    prov_ref TEXT;
    pay_proc_res JSONB;
    pay_id UUID;
    receipt_res JSONB;
    rec_count INT;
    bal_record RECORD;
    clearance_rec RECORD;
    dup_res JSONB;
    bt_pay_id UUID;
    bt_confirm_res JSONB;
    reject_res JSONB;
    crn_res JSONB;
    dbn_res JSONB;
BEGIN
    SELECT id INTO org_id FROM public.organizations WHERE code = 'ARM-HQ' LIMIT 1;

    -- 1. Setup Customer & Accounts
    INSERT INTO public.customers (
        organization_id, account_number, customer_type, company_name, phone, email, status
    ) VALUES (
        org_id, 'CUS-PSTK-TEST', 'COMPANY', 'Zenith Granite Contractors Ltd', '+234 802 333 4444', 'payments@zenithgranite.ng', 'ACTIVE'
    ) ON CONFLICT (organization_id, account_number) DO NOTHING;

    SELECT id INTO cust_id FROM public.customers WHERE account_number = 'CUS-PSTK-TEST';

    INSERT INTO public.customer_accounts (organization_id, customer_id, currency, status)
    VALUES (org_id, cust_id, 'NGN', 'ACTIVE')
    ON CONFLICT (customer_id) DO NOTHING;

    SELECT id INTO acc_id FROM public.customer_accounts WHERE customer_id = cust_id;

    -- Create Requisition
    INSERT INTO public.requisitions (
        organization_id, customer_id, requisition_number, status, site_contact_name, site_contact_phone,
        total_tonnage, material_amount_snapshot, loading_amount_snapshot, haulage_amount_snapshot,
        other_charges_snapshot, total_amount_snapshot
    ) VALUES (
        org_id, cust_id, 'REQ-PSTK-001', 'APPROVED', 'Engr. Daniel', '+234 802 333 4444',
        60.00, 400000.00, 20000.00, 80000.00, 0.00, 500000.00
    ) RETURNING id INTO req_id;

    -- Create Invoice for Requisition (₦500,000)
    INSERT INTO public.invoices (
        organization_id, customer_id, requisition_id, invoice_number, invoice_type, issue_date, due_date,
        subtotal, total_amount, amount_paid, status
    ) VALUES (
        org_id, cust_id, req_id, 'INV-PSTK-001', 'INVOICE', CURRENT_DATE, CURRENT_DATE + 7,
        500000.00, 500000.00, 0.00, 'ISSUED'
    ) RETURNING id INTO inv_id;

    -- Post Initial Debit of ₦500,000 for the Invoice
    INSERT INTO public.account_transactions (
        organization_id, customer_id, account_id, transaction_date, transaction_type,
        reference_type, reference_id, document_number, description, debit, credit
    ) VALUES (
        org_id, cust_id, acc_id, CURRENT_DATE, 'INVOICE',
        'INVOICE', inv_id, 'INV-PSTK-001', 'Tax Invoice for Supply', 500000.00, 0.00
    );

    -- ------------------------------------------------------------------------
    -- TEST 1: Payment Attempt Initialization & Kobo Precision
    -- ------------------------------------------------------------------------
    attempt_res := public.initialize_payment_attempt(cust_id, inv_id, 'PAYSTACK', 'TEST');
    IF (attempt_res->>'success')::BOOLEAN != true THEN
        RAISE EXCEPTION 'TEST 1 FAILED: Payment attempt initialization failed with %', attempt_res;
    END IF;

    IF (attempt_res->>'amountKobo')::BIGINT != 50000000 THEN
        RAISE EXCEPTION 'TEST 1 FAILED: Expected 50,000,000 kobo for ₦500,000 but got %', (attempt_res->>'amountKobo');
    END IF;

    int_ref := attempt_res->>'internalReference';
    prov_ref := attempt_res->>'providerReference';
    RAISE NOTICE 'TEST 1 PASSED: Initialized attempt % with 50,000,000 Kobo', int_ref;

    -- ------------------------------------------------------------------------
    -- TEST 2: Process Verified Payment (₦500,000 Paystack Gateway)
    -- ------------------------------------------------------------------------
    pay_proc_res := public.process_verified_payment(
        int_ref, prov_ref, 500000.00, 'NGN', 'PAYSTACK', 'TEST', inv_id, cust_id
    );

    IF (pay_proc_res->>'success')::BOOLEAN != true THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Verified payment processing failed: %', pay_proc_res;
    END IF;

    pay_id := (pay_proc_res->>'paymentId')::UUID;

    -- Check Sub-Ledger Balance: 500,000 Debit - 500,000 Credit = 0.00
    SELECT * INTO bal_record FROM public.get_customer_balance(cust_id);
    IF bal_record.outstanding_receivable != 0.00 THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Expected 0.00 receivable after payment but got %', bal_record.outstanding_receivable;
    END IF;

    -- Check Invoice Status is PAID
    IF (SELECT status FROM public.invoices WHERE id = inv_id) != 'PAID' THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Invoice status must be PAID';
    END IF;

    -- Check Authoritative Receipt is issued
    SELECT COUNT(*) INTO rec_count FROM public.receipts WHERE payment_id = pay_id;
    IF rec_count != 1 THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Exactly 1 receipt must be generated for confirmed payment';
    END IF;

    -- Check Financial Clearance is PAYMENT_CLEARED
    SELECT * INTO clearance_rec FROM public.requisition_financial_clearances WHERE requisition_id = req_id;
    IF clearance_rec.clearance_status != 'PAYMENT_CLEARED' THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Expected Requisition Clearance PAYMENT_CLEARED but got %', clearance_rec.clearance_status;
    END IF;

    RAISE NOTICE 'TEST 2 PASSED: Verified Paystack payment posted 1 credit, allocated invoice, issued receipt %, and cleared requisition!', 
        (pay_proc_res->'receipt'->>'receiptNumber');

    -- ------------------------------------------------------------------------
    -- TEST 3: Idempotency (Duplicate Webhook / Callback Call)
    -- ------------------------------------------------------------------------
    dup_res := public.process_verified_payment(
        int_ref, prov_ref, 500000.00, 'NGN', 'PAYSTACK', 'TEST', inv_id, cust_id
    );

    IF (dup_res->>'alreadyConfirmed')::BOOLEAN != true THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Expected alreadyConfirmed=true on duplicate call';
    END IF;

    -- Verify still exactly 1 credit in sub-ledger
    SELECT * INTO bal_record FROM public.get_customer_balance(cust_id);
    IF bal_record.total_credit != 500000.00 THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Sub-ledger total credit must remain 500,000.00, got %', bal_record.total_credit;
    END IF;

    -- Verify still exactly 1 receipt
    SELECT COUNT(*) INTO rec_count FROM public.receipts WHERE payment_id = pay_id;
    IF rec_count != 1 THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Duplicate webhook created duplicate receipts!';
    END IF;
    RAISE NOTICE 'TEST 3 PASSED: Webhook/Callback idempotency verified (No duplicate credits or receipts)';

    -- ------------------------------------------------------------------------
    -- TEST 4: Manual Bank Transfer Submission (Pending -> Zero Ledger Credit)
    -- ------------------------------------------------------------------------
    INSERT INTO public.payments (
        organization_id, customer_id, payment_reference, payment_method, amount,
        currency, payment_date, status, bank_reference, proof_storage_path
    ) VALUES (
        org_id, cust_id, 'PAY-BT-TEST-001', 'BANK_TRANSFER', 250000.00,
        'NGN', CURRENT_DATE, 'PENDING', 'GTB-DEPOSIT-883311', 'customer_proofs/slip_001.pdf'
    ) RETURNING id INTO bt_pay_id;

    -- Sub-ledger must NOT have credited the pending transfer
    SELECT * INTO bal_record FROM public.get_customer_balance(cust_id);
    IF bal_record.total_credit != 500000.00 THEN
        RAISE EXCEPTION 'TEST 4 FAILED: Pending bank transfer MUST NOT post credit to sub-ledger';
    END IF;
    RAISE NOTICE 'TEST 4 PASSED: Bank transfer submitted with PENDING status (Zero ledger impact)';

    -- ------------------------------------------------------------------------
    -- TEST 5: Manual Bank Transfer Rejection
    -- ------------------------------------------------------------------------
    reject_res := public.reject_bank_transfer(bt_pay_id, 'Teller reference unverified on GTBank statement');
    IF (reject_res->>'status') != 'FAILED' THEN
        RAISE EXCEPTION 'TEST 5 FAILED: Bank transfer rejection failed: %', reject_res;
    END IF;

    IF (SELECT rejection_reason FROM public.payments WHERE id = bt_pay_id) IS NULL THEN
        RAISE EXCEPTION 'TEST 5 FAILED: Rejection reason was not saved';
    END IF;
    RAISE NOTICE 'TEST 5 PASSED: Rejected bank transfer updated to FAILED with reason and zero ledger impact';

    -- ------------------------------------------------------------------------
    -- TEST 6: Credit Note Posting (Atomically Posts Exactly ONE Credit)
    -- ------------------------------------------------------------------------
    crn_res := public.issue_credit_note(
        cust_id,
        inv_id,
        'Haulage fuel rebate concession',
        jsonb_build_array(
            jsonb_build_object('description', 'Volume rebate 10T', 'quantity', 10, 'unit', 'tonnes', 'unitPrice', 1500.00, 'lineTotal', 15000.00)
        )
    );

    IF (crn_res->>'success')::BOOLEAN != true THEN
        RAISE EXCEPTION 'TEST 6 FAILED: Credit Note issuance failed: %', crn_res;
    END IF;

    SELECT * INTO bal_record FROM public.get_customer_balance(cust_id);
    -- Total Credit: 500,000 (Paystack) + 15,000 (Credit Note) = 515,000
    IF bal_record.total_credit != 515000.00 THEN
        RAISE EXCEPTION 'TEST 6 FAILED: Expected 515,000.00 total credit after credit note, got %', bal_record.total_credit;
    END IF;
    RAISE NOTICE 'TEST 6 PASSED: Credit Note % issued and debited/credited ledger correctly!', (crn_res->>'creditNoteNumber');

    -- ------------------------------------------------------------------------
    -- TEST 7: Debit Note Posting (Atomically Posts Exactly ONE Debit)
    -- ------------------------------------------------------------------------
    dbn_res := public.issue_debit_note(
        cust_id,
        inv_id,
        'Overtime night demurrage fee',
        jsonb_build_array(
            jsonb_build_object('description', 'Demurrage 2 hours', 'quantity', 2, 'unit', 'hours', 'unitPrice', 10000.00, 'lineTotal', 20000.00)
        )
    );

    IF (dbn_res->>'success')::BOOLEAN != true THEN
        RAISE EXCEPTION 'TEST 7 FAILED: Debit Note issuance failed: %', dbn_res;
    END IF;

    SELECT * INTO bal_record FROM public.get_customer_balance(cust_id);
    -- Total Debit: 500,000 + 20,000 = 520,000; Total Credit: 515,000; Outstanding = 5,000
    IF bal_record.outstanding_receivable != 5000.00 THEN
        RAISE EXCEPTION 'TEST 7 FAILED: Expected 5,000.00 net receivable after debit note, got %', bal_record.outstanding_receivable;
    END IF;
    RAISE NOTICE 'TEST 7 PASSED: Debit Note % issued and posted debit correctly!', (dbn_res->>'debitNoteNumber');

    RAISE NOTICE '=========================================================';
    RAISE NOTICE 'ALL 7 PHASE 6 PAYMENT & FINANCIAL TESTS PASSED 100%%!';
    RAISE NOTICE '=========================================================';
END $$;
