-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 022: PROOF OF DELIVERY (POD) & FULFILLMENT TRACKING
-- ============================================================================

-- 1. PROOF OF DELIVERY (POD) TABLE
CREATE TABLE IF NOT EXISTS trip_proof_of_delivery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES delivery_trips(id) ON DELETE CASCADE UNIQUE,
    requisition_id UUID NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(50),
    received_by_designation VARCHAR(100) DEFAULT 'Site Receiving Engineer / Supervisor',
    delivered_quantity_tonnes NUMERIC(10, 2) NOT NULL,
    delivery_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signature_storage_path TEXT NOT NULL,
    photo_storage_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
    driver_remarks TEXT,
    receiver_remarks TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pod_qty_positive CHECK (delivered_quantity_tonnes > 0)
);

CREATE INDEX IF NOT EXISTS idx_pod_trip ON trip_proof_of_delivery(trip_id);
CREATE INDEX IF NOT EXISTS idx_pod_req ON trip_proof_of_delivery(requisition_id);
CREATE INDEX IF NOT EXISTS idx_pod_customer ON trip_proof_of_delivery(customer_id);

-- 2. RPC: RECORD PROOF OF DELIVERY (ATOMIC TRIP & REQUISITION TRANSITION)
CREATE OR REPLACE FUNCTION record_trip_pod(
    p_trip_id UUID,
    p_receiver_name VARCHAR(255),
    p_delivered_quantity NUMERIC,
    p_signature_storage_path TEXT,
    p_receiver_phone VARCHAR(50) DEFAULT NULL,
    p_receiver_designation VARCHAR(100) DEFAULT 'Site Supervisor',
    p_photo_storage_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_driver_remarks TEXT DEFAULT NULL,
    p_receiver_remarks TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_trip RECORD;
    v_pod_id UUID;
    v_total_trips INT;
    v_delivered_trips INT;
    v_driver_id UUID;
BEGIN
    SELECT * INTO v_trip FROM delivery_trips WHERE id = p_trip_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trip % not found', p_trip_id;
    END IF;

    IF v_trip.status NOT IN ('DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'LOADED') THEN
        RAISE EXCEPTION 'Trip % cannot receive POD in status: %', v_trip.trip_number, v_trip.status;
    END IF;

    -- Insert POD Record
    INSERT INTO trip_proof_of_delivery (
        trip_id,
        requisition_id,
        customer_id,
        receiver_name,
        receiver_phone,
        received_by_designation,
        delivered_quantity_tonnes,
        delivery_time,
        signature_storage_path,
        photo_storage_paths,
        driver_remarks,
        receiver_remarks,
        recorded_by
    ) VALUES (
        p_trip_id,
        v_trip.requisition_id,
        v_trip.customer_id,
        p_receiver_name,
        p_receiver_phone,
        p_receiver_designation,
        p_delivered_quantity,
        NOW(),
        p_signature_storage_path,
        p_photo_storage_paths,
        p_driver_remarks,
        p_receiver_remarks,
        auth.uid()
    ) RETURNING id INTO v_pod_id;

    -- Update Trip to POD_CONFIRMED / DELIVERED
    UPDATE delivery_trips
    SET 
        status = 'DELIVERED',
        delivered_at = NOW(),
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_trip_id;

    -- Release Driver & Truck availability without overwriting maintenance status
    IF v_trip.driver_id IS NOT NULL THEN
        UPDATE drivers 
        SET availability_status = 'AVAILABLE', updated_at = NOW()
        WHERE id = v_trip.driver_id 
          AND is_active = TRUE 
          AND availability_status NOT IN ('SUSPENDED', 'TERMINATED', 'ON_LEAVE');
    END IF;

    IF v_trip.truck_id IS NOT NULL THEN
        UPDATE trucks 
        SET availability_status = 'AVAILABLE', updated_at = NOW()
        WHERE id = v_trip.truck_id 
          AND is_active = TRUE 
          AND availability_status NOT IN ('UNAVAILABLE', 'INACTIVE');
    END IF;

    -- Check overall Requisition completion
    SELECT COUNT(*) INTO v_total_trips FROM delivery_trips WHERE requisition_id = v_trip.requisition_id;
    SELECT COUNT(*) INTO v_delivered_trips FROM delivery_trips WHERE requisition_id = v_trip.requisition_id AND status = 'DELIVERED';

    IF v_delivered_trips >= v_total_trips AND v_total_trips > 0 THEN
        UPDATE requisitions
        SET status = 'DELIVERED', updated_at = NOW()
        WHERE id = v_trip.requisition_id;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'podId', v_pod_id,
        'tripId', p_trip_id,
        'tripNumber', v_trip.trip_number,
        'deliveredQuantity', p_delivered_quantity,
        'allTripsDelivered', (v_delivered_trips >= v_total_trips),
        'status', 'DELIVERED'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC: GET ORDER FULFILLMENT PROGRESS (MULTI-TRIP AGGREGATION)
CREATE OR REPLACE FUNCTION get_requisition_fulfillment_summary(p_requisition_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_trips JSONB := '[]'::JSONB;
    v_ordered NUMERIC;
    v_planned NUMERIC := 0;
    v_loaded NUMERIC := 0;
    v_dispatched NUMERIC := 0;
    v_delivered NUMERIC := 0;
    v_remaining NUMERIC := 0;
    v_percent NUMERIC := 0;
    t RECORD;
BEGIN
    SELECT * INTO v_req FROM requisitions WHERE id = p_requisition_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Requisition % not found', p_requisition_id;
    END IF;

    v_ordered := v_req.quantity;

    FOR t IN 
        SELECT 
            dt.id,
            dt.trip_number,
            dt.trip_index,
            dt.total_trips_in_order,
            dt.planned_quantity_tonnes,
            dt.status,
            dt.scheduled_date,
            dt.dispatched_at,
            dt.delivered_at,
            tr.registration_number AS truck_number,
            tr.make AS truck_make,
            dr.first_name || ' ' || dr.last_name AS driver_name,
            dr.phone_number AS driver_phone,
            wb.gross_weight_tonnes,
            wb.tare_weight_tonnes,
            wb.net_weight_tonnes,
            wb.weighbridge_ticket_number,
            pod.receiver_name,
            pod.signature_storage_path,
            pod.delivered_quantity_tonnes
        FROM delivery_trips dt
        LEFT JOIN trucks tr ON dt.truck_id = tr.id
        LEFT JOIN drivers dr ON dt.driver_id = dr.id
        LEFT JOIN trip_weighbridge_records wb ON dt.id = wb.trip_id
        LEFT JOIN trip_proof_of_delivery pod ON dt.id = pod.trip_id
        WHERE dt.requisition_id = p_requisition_id
        ORDER BY dt.trip_index ASC
    LOOP
        v_planned := v_planned + t.planned_quantity_tonnes;
        
        IF t.net_weight_tonnes IS NOT NULL THEN
            v_loaded := v_loaded + t.net_weight_tonnes;
        END IF;

        IF t.status IN ('DISPATCHED', 'IN_TRANSIT', 'ARRIVED') THEN
            v_dispatched := v_dispatched + COALESCE(t.net_weight_tonnes, t.planned_quantity_tonnes);
        END IF;

        IF t.status = 'DELIVERED' THEN
            v_delivered := v_delivered + COALESCE(t.delivered_quantity_tonnes, t.net_weight_tonnes, t.planned_quantity_tonnes);
        END IF;

        v_trips := v_trips || jsonb_build_object(
            'id', t.id,
            'tripNumber', t.trip_number,
            'tripIndex', t.trip_index,
            'totalTrips', t.total_trips_in_order,
            'plannedQuantity', t.planned_quantity_tonnes,
            'status', t.status,
            'truckNumber', t.truck_number,
            'driverName', t.driver_name,
            'driverPhone', t.driver_phone,
            'netWeight', t.net_weight_tonnes,
            'ticketNumber', t.weighbridge_ticket_number,
            'deliveredQuantity', t.delivered_quantity_tonnes,
            'receiverName', t.receiver_name,
            'dispatchedAt', t.dispatched_at,
            'deliveredAt', t.delivered_at
        );
    END LOOP;

    v_remaining := GREATEST(0, v_ordered - v_delivered);
    IF v_ordered > 0 THEN
        v_percent := LEAST(100.0, ROUND(((v_delivered / v_ordered) * 100.0), 1));
    END IF;

    RETURN jsonb_build_object(
        'requisitionId', p_requisition_id,
        'referenceNumber', v_req.reference_number,
        'orderedQuantity', v_ordered,
        'plannedQuantity', v_planned,
        'loadedQuantity', v_loaded,
        'dispatchedQuantity', v_dispatched,
        'deliveredQuantity', v_delivered,
        'remainingQuantity', v_remaining,
        'fulfillmentPercent', v_percent,
        'trips', v_trips
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
