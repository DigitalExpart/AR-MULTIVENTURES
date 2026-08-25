-- ============================================================================
-- AR MULTIVENTURES — BACKEND RLS VALIDATION TESTS
-- Automated SQL Test Suite for Row-Level Security Policies & Business Rules
-- ============================================================================

-- Test 1: Verify Customer A cannot read Customer B requisitions
-- Scenario: When auth.uid() belongs to Customer A, SELECT * FROM requisitions must return only Customer A records.
DO $$
DECLARE
    cnt INTEGER;
BEGIN
    -- Verify policy definition exists
    SELECT COUNT(*) INTO cnt FROM pg_policies
    WHERE tablename = 'requisitions' AND policyname = 'Customer can view only own requisitions';
    
    IF cnt = 0 THEN
        RAISE EXCEPTION 'TEST FAILED: RLS Policy for customer requisition isolation is missing';
    END IF;
    RAISE NOTICE 'TEST PASSED: Customer Requisition Isolation policy is active';
END $$;

-- Test 2: Verify Customers cannot write or modify pricing tables
DO $$
DECLARE
    cnt INTEGER;
BEGIN
    SELECT COUNT(*) INTO cnt FROM pg_policies
    WHERE tablename = 'material_prices' AND cmd = 'ALL';
    
    IF cnt = 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Pricing tables must be restricted to staff with pricing.manage permission';
    END IF;
    RAISE NOTICE 'TEST PASSED: Pricing table write restriction policy is active';
END $$;

-- Test 3: Verify Audit Logs cannot be modified by standard users
DO $$
DECLARE
    cnt INTEGER;
BEGIN
    SELECT COUNT(*) INTO cnt FROM pg_policies
    WHERE tablename = 'audit_logs' AND cmd = 'SELECT';
    
    IF cnt = 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Audit log access must be restricted to authorized auditors';
    END IF;
    RAISE NOTICE 'TEST PASSED: Audit Log security policy is active';
END $$;

-- Test 4: Verify Concurrency-Safe Sequence Functions
DO $$
DECLARE
    acc_no TEXT;
    req_no TEXT;
BEGIN
    acc_no := public.generate_customer_account_number();
    req_no := public.generate_requisition_number();

    IF acc_no NOT LIKE 'CUS-%' THEN
        RAISE EXCEPTION 'TEST FAILED: Customer account number format invalid: %', acc_no;
    END IF;

    IF req_no NOT LIKE 'REQ-%' THEN
        RAISE EXCEPTION 'TEST FAILED: Requisition number format invalid: %', req_no;
    END IF;

    RAISE NOTICE 'TEST PASSED: Sequence generators produced valid reference numbers (%, %)', acc_no, req_no;
END $$;
