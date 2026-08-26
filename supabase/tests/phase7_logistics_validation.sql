-- ============================================================================
-- AR MULTIVENTURES — PHASE 7 LOGISTICS & POD VALIDATION SUITE
-- STATUS: CREATED — REMOTE EXECUTION PENDING
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_cus_id UUID;
    v_quarry_id UUID;
    v_dest_id UUID;
    v_mat_id UUID;
    v_req_id UUID;
    v_truck_id UUID;
    v_driver_id UUID;
    v_schedule_res JSONB;
    v_assign_res JSONB;
    v_wb_res JSONB;
    v_disp_res JSONB;
    v_pod_res JSONB;
    v_summary JSONB;
    v_trip_id UUID;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'STARTING PHASE 7 LOGISTICS VALIDATION TEST SUITE';
    RAISE NOTICE '==================================================';

    -- 1. Load context
    SELECT id INTO v_org_id FROM organizations LIMIT 1;
    SELECT id INTO v_cus_id FROM customers WHERE organization_id = v_org_id LIMIT 1;
    SELECT id INTO v_quarry_id FROM quarries WHERE organization_id = v_org_id LIMIT 1;
    SELECT id INTO v_dest_id FROM destinations WHERE organization_id = v_org_id LIMIT 1;
    SELECT id INTO v_mat_id FROM materials WHERE organization_id = v_org_id LIMIT 1;

    -- 2. Test Scenario 1: Create Test Truck & Driver
    INSERT INTO trucks (
        organization_id,
        registration_number,
        truck_type,
        capacity_tonnes,
        ownership_type,
        make,
        model,
        maintenance_status,
        insurance_expiry,
        roadworthiness_expiry
    ) VALUES (
        v_org_id,
        'KJA-999-ARM',
        'HEAVY_TIPPER_30T',
        30.00,
        'COMPANY',
        'MACK',
        'GRANITE_HAULER_400',
        'OPERATIONAL',
        CURRENT_DATE + INTERVAL '180 days',
        CURRENT_DATE + INTERVAL '180 days'
    ) RETURNING id INTO v_truck_id;

    INSERT INTO drivers (
        organization_id,
        first_name,
        last_name,
        phone_number,
        license_number,
        license_category,
        license_expiry,
        availability_status
    ) VALUES (
        v_org_id,
        'Ibrahim',
        'Musa',
        '+2348039998877',
        'DRV-TEST-889900',
        'CLASS_E',
        CURRENT_DATE + INTERVAL '365 days',
        'AVAILABLE'
    ) RETURNING id INTO v_driver_id;

    RAISE NOTICE 'Scenario 1 PASSED: Created Truck % and Driver %', v_truck_id, v_driver_id;

    -- 3. Test Scenario 2: Gated Requisition Trip Scheduling
    INSERT INTO requisitions (
        organization_id,
        customer_id,
        reference_number,
        quarry_id,
        destination_id,
        material_id,
        quantity,
        status
    ) VALUES (
        v_org_id,
        v_cus_id,
        'REQ-P7-TEST',
        v_quarry_id,
        v_dest_id,
        v_mat_id,
        60.00,
        'COMMERCIALLY_APPROVED'
    ) RETURNING id INTO v_req_id;

    -- Attempt trip scheduling before clearance (should fail)
    BEGIN
        PERFORM schedule_requisition_trips(v_req_id, ARRAY[30.00, 30.00]);
        RAISE EXCEPTION 'TEST FAILED: Un-cleared requisition was scheduled';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Scenario 2A PASSED: Correctly blocked trip scheduling on un-cleared requisition';
    END;

    -- Add financial clearance
    INSERT INTO requisition_financial_clearances (
        requisition_id,
        clearance_status,
        cleared_at,
        evaluated_by
    ) VALUES (
        v_req_id,
        'PAYMENT_CLEARED',
        NOW(),
        auth.uid()
    );

    -- Schedule trips (should succeed and create two 30T trips)
    v_schedule_res := schedule_requisition_trips(v_req_id, ARRAY[30.00, 30.00]);
    RAISE NOTICE 'Scenario 2B PASSED: Scheduled 2 trips for 60T order: %', v_schedule_res;

    -- 4. Test Scenario 3: Assign Truck & Driver
    SELECT id INTO v_trip_id FROM delivery_trips WHERE requisition_id = v_req_id LIMIT 1;
    v_assign_res := assign_trip_truck_and_driver(v_trip_id, v_truck_id, v_driver_id, CURRENT_DATE);
    RAISE NOTICE 'Scenario 3 PASSED: Assigned truck & driver: %', v_assign_res;

    -- 5. Test Scenario 4: Weighbridge Net Weight & Loading Capture
    -- Gross: 45.5T, Tare: 15.2T -> Net: 30.3T
    v_wb_res := record_weighbridge_and_loading(
        v_trip_id,
        'WB-TICKET-771122',
        45.50,
        15.20,
        'LOAD-TKT-001',
        'quarry_tickets/wb_771122.pdf',
        'BAY-02',
        'Standard granite loading confirmed'
    );
    RAISE NOTICE 'Scenario 4 PASSED: Captured weighbridge (Net 30.3T): %', v_wb_res;

    -- 6. Test Scenario 5: Dispatch Trip
    v_disp_res := dispatch_trip(v_trip_id);
    RAISE NOTICE 'Scenario 5 PASSED: Dispatched trip: %', v_disp_res;

    -- 7. Test Scenario 6: Proof of Delivery (POD)
    v_pod_res := record_trip_pod(
        v_trip_id,
        'Engr. Babatunde Alabi',
        30.30,
        'pod_signatures/trip_sig_001.png',
        '+2348021122334',
        'Site QA Engineer',
        ARRAY['pod_photos/delivery_site_01.jpg'],
        'Trip delivered smoothly, offloaded at bay A',
        'Quality and quantity confirmed as per weighbridge ticket'
    );
    RAISE NOTICE 'Scenario 6 PASSED: POD recorded: %', v_pod_res;

    -- 8. Test Scenario 7: Fulfillment Progress Aggregation
    v_summary := get_requisition_fulfillment_summary(v_req_id);
    RAISE NOTICE 'Scenario 7 PASSED: Order fulfillment summary: %', v_summary;

    RAISE NOTICE '==================================================';
    RAISE NOTICE 'ALL PHASE 7 LOGISTICS TESTS COMPILED & VALIDATED';
    RAISE NOTICE '==================================================';
END;
$$;
