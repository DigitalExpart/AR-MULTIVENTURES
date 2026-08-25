-- ============================================================================
-- AR MULTIVENTURES — PRICING ENGINE & SECURITY VALIDATION TESTS
-- Automated SQL Test Suite for Commercial Pricing Precedence & Atomic RPCs
-- ============================================================================

DO $$
DECLARE
    org_id UUID;
    cust_a_id UUID;
    cust_b_id UUID;
    qry_abk UUID := '11111111-1111-4111-a111-111111111111';
    mat_34 UUID := 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
    mat_20 UUID := 'dddddddd-dddd-4ddd-dddd-dddddddddddd';
    trk_30t UUID := '99999999-9999-4999-a999-999999999930';
    dst_lekki UUID := '88888888-8888-4888-a888-888888888801';
    
    quote_json JSONB;
    quote_total NUMERIC(18, 2);
    quote_mat_src TEXT;
    quote_haul_src TEXT;
    quote_disc NUMERIC(18, 2);
    quote_fuel NUMERIC(18, 2);
BEGIN
    SELECT id INTO org_id FROM public.organizations WHERE code = 'ARM-HQ' LIMIT 1;
    
    -- Setup Test Customers
    INSERT INTO public.customers (
        organization_id, account_number, customer_type, company_name, phone, email, status
    ) VALUES 
        (org_id, 'CUS-TEST-01', 'COMPANY', 'Test Construction A Ltd', '+234 801 111 1111', 'testa@build.ng', 'ACTIVE'),
        (org_id, 'CUS-TEST-02', 'COMPANY', 'Test Infrastructure B Ltd', '+234 802 222 2222', 'testb@build.ng', 'ACTIVE')
    ON CONFLICT (organization_id, account_number) DO NOTHING;

    SELECT id INTO cust_a_id FROM public.customers WHERE account_number = 'CUS-TEST-01';
    SELECT id INTO cust_b_id FROM public.customers WHERE account_number = 'CUS-TEST-02';

    -- ------------------------------------------------------------------------
    -- TEST 1: Standard Quarry Material Pricing & Supply-and-Haulage Calculation
    -- ------------------------------------------------------------------------
    quote_json := public.calculate_requisition_price(
        org_id, cust_b_id, qry_abk, mat_20, 30.00, 'SUPPLY_AND_HAULAGE', trk_30t, dst_lekki
    );
    
    quote_total := (quote_json->>'total')::NUMERIC(18, 2);
    quote_mat_src := quote_json->'material'->>'source';
    quote_haul_src := quote_json->'haulage'->>'source';
    quote_fuel := (quote_json->'fuelAdjustment'->>'amount')::NUMERIC(18, 2);

    -- Expected: Mat(30T * 8000 = 240,000) + Load(30T * 500 = 15,000) + Haul(85,000) + Fuel(2.5% of 85k = 2,125) = 342,125
    IF quote_total != 342125.00 THEN
        RAISE EXCEPTION 'TEST 1 FAILED: Expected total 342,125.00 but got %', quote_total;
    END IF;
    IF quote_mat_src != 'STANDARD_QUARRY_PRICE' THEN
        RAISE EXCEPTION 'TEST 1 FAILED: Expected source STANDARD_QUARRY_PRICE but got %', quote_mat_src;
    END IF;
    RAISE NOTICE 'TEST 1 PASSED: Standard Quarry Pricing resolved correctly (Total: ₦%)', quote_total;

    -- ------------------------------------------------------------------------
    -- TEST 2: Self-Pickup Excludes Haulage & Fuel Surcharge
    -- ------------------------------------------------------------------------
    quote_json := public.calculate_requisition_price(
        org_id, cust_b_id, qry_abk, mat_20, 30.00, 'SELF_PICKUP'
    );
    quote_total := (quote_json->>'total')::NUMERIC(18, 2);
    
    -- Expected: Mat(240,000) + Load(15,000) + Haul(0) = 255,000
    IF quote_total != 255000.00 THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Expected Self-Pickup total 255,000.00 but got %', quote_total;
    END IF;
    RAISE NOTICE 'TEST 2 PASSED: Self-Pickup correctly zeroes haulage & fuel charges (Total: ₦%)', quote_total;

    -- ------------------------------------------------------------------------
    -- TEST 3: Customer-Specific Negotiated Price Precedence
    -- ------------------------------------------------------------------------
    INSERT INTO public.customer_prices (
        organization_id, customer_id, quarry_id, material_id, special_price_per_unit, currency, effective_from
    ) VALUES (
        org_id, cust_a_id, qry_abk, mat_20, 7200.00, 'NGN', now() - INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;

    quote_json := public.calculate_requisition_price(
        org_id, cust_a_id, qry_abk, mat_20, 30.00, 'SELF_PICKUP'
    );
    quote_total := (quote_json->>'total')::NUMERIC(18, 2);
    quote_mat_src := quote_json->'material'->>'source';

    -- Expected: Mat(30T * 7200 = 216,000) + Load(15,000) = 231,000
    IF quote_total != 231000.00 OR quote_mat_src != 'CUSTOMER_NEGOTIATED_PRICE' THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Customer negotiated price was not applied properly (Total: %, Source: %)', quote_total, quote_mat_src;
    END IF;
    RAISE NOTICE 'TEST 3 PASSED: Negotiated customer rate takes precedence over standard price (Total: ₦%)', quote_total;

    -- ------------------------------------------------------------------------
    -- TEST 4: Volume Tiered Discount Application (>= 60 Tonnes)
    -- ------------------------------------------------------------------------
    quote_json := public.calculate_requisition_price(
        org_id, cust_b_id, qry_abk, mat_20, 60.00, 'SELF_PICKUP'
    );
    quote_disc := (quote_json->>'totalDiscount')::NUMERIC(18, 2);
    
    -- Expected: Mat(60T * 8000 = 480,000) -> 3% discount = 14,400
    IF quote_disc != 14400.00 THEN
        RAISE EXCEPTION 'TEST 4 FAILED: Expected 3%% bulk discount (14,400) but got %', quote_disc;
    END IF;
    RAISE NOTICE 'TEST 4 PASSED: Bulk volume discount applied correctly (Discount: ₦%)', quote_disc;

    -- ------------------------------------------------------------------------
    -- TEST 5: Missing Approved Tariff Returns Requires Review Flag
    -- ------------------------------------------------------------------------
    quote_json := public.calculate_requisition_price(
        org_id, cust_b_id, qry_abk, mat_20, 30.00, 'SUPPLY_AND_HAULAGE', trk_30t, '99999999-0000-0000-0000-000000000000' -- Nonexistent destination
    );
    
    IF (quote_json->>'requiresReview')::BOOLEAN IS NOT TRUE THEN
        RAISE EXCEPTION 'TEST 5 FAILED: Unmapped destination must trigger requiresReview = true';
    END IF;
    RAISE NOTICE 'TEST 5 PASSED: Unmapped destination correctly flagged for manual logistics review';

    RAISE NOTICE '=========================================================';
    RAISE NOTICE 'ALL 5 PRICING ENGINE VALIDATION TESTS PASSED 100%%!';
    RAISE NOTICE '=========================================================';
END $$;
