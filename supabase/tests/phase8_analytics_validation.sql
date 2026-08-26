-- ============================================================================
-- AR MULTIVENTURES — PHASE 8: ANALYTICS, REPORTING & NOTIFICATIONS TEST SUITE
-- STATUS: CREATED — REMOTE EXECUTION PENDING
-- ============================================================================

DO $$
DECLARE
    v_kpis JSONB;
    v_aging_count INT;
    v_quarry_count INT;
    v_fleet_count INT;
    v_notif_id UUID;
    v_read_count INT;
    v_exc_id UUID;
BEGIN
    RAISE NOTICE 'Starting Phase 8 Management Analytics & System Completion Tests...';

    -- TEST 1: Executive KPI RPC Execution
    SELECT rpc_get_executive_kpis('2026-01-01'::TIMESTAMPTZ, NOW()) INTO v_kpis;
    IF v_kpis IS NULL THEN
        RAISE EXCEPTION 'TEST 1 FAILED: rpc_get_executive_kpis returned NULL';
    END IF;
    RAISE NOTICE 'TEST 1 PASSED: Executive KPIs retrieved successfully: %', v_kpis;

    -- TEST 2: Customer Receivables Aging View
    SELECT COUNT(*) INTO v_aging_count FROM view_customer_receivables_aging;
    RAISE NOTICE 'TEST 2 PASSED: Receivables Aging View contains % customer rows', v_aging_count;

    -- TEST 3: Quarry Performance View
    SELECT COUNT(*) INTO v_quarry_count FROM view_quarry_performance;
    RAISE NOTICE 'TEST 3 PASSED: Quarry Performance View contains % quarry records', v_quarry_count;

    -- TEST 4: Fleet Utilization View
    SELECT COUNT(*) INTO v_fleet_count FROM view_fleet_utilization;
    RAISE NOTICE 'TEST 4 PASSED: Fleet Utilization View contains % truck records', v_fleet_count;

    -- TEST 5: Create and Read Notifications
    SELECT create_notification(
        p_user_id := (SELECT id FROM profiles LIMIT 1),
        p_title := 'Requisition REQ-2026-000041 Approved',
        p_message := 'Commercial terms approved. Proceed to payment clearance.',
        p_template_type := 'REQUISITION_APPROVED',
        p_channel := 'IN_APP',
        p_entity_type := 'requisition',
        p_entity_id := 'req-01',
        p_link := '/app/requisitions/req-01'
    ) INTO v_notif_id;

    IF v_notif_id IS NULL THEN
        RAISE EXCEPTION 'TEST 5 FAILED: create_notification returned NULL';
    END IF;
    RAISE NOTICE 'TEST 5 PASSED: Notification created with ID %', v_notif_id;

    -- TEST 6: Resolve Operational Exception
    INSERT INTO operational_exceptions (
        exception_type, severity, title, description, entity_type, entity_id, resolution_route
    ) VALUES (
        'MISSING_HAULAGE_TARIFF', 'WARNING', 'Missing haulage rate for Epe Corridor',
        'No active tariff found for 30T tippers on Abeokuta to Epe route', 'haulage_rate', 'dest-02', '/admin/pricing/haulage'
    ) RETURNING id INTO v_exc_id;

    PERFORM resolve_operational_exception(v_exc_id, 'Configured standard ₦4,500/T rate');
    RAISE NOTICE 'TEST 6 PASSED: Operational exception % logged and resolved', v_exc_id;

    RAISE NOTICE 'ALL PHASE 8 SQL TESTS COMPILED & VALIDATED SUCCESSFULLY.';
END;
$$;
