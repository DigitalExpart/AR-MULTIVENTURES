-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 021: DELIVERY TRIPS, WEIGHBRIDGE & LOADING
-- ============================================================================

-- 1. TRIP STATUS ENUM
DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM (
        'PLANNED',
        'ASSIGNED',
        'SCHEDULED',
        'AT_QUARRY',
        'LOADING',
        'LOADED',
        'DISPATCHED',
        'IN_TRANSIT',
        'ARRIVED',
        'DELIVERED',
        'POD_CONFIRMED',
        'COMPLETED',
        'CANCELLED',
        'ON_HOLD'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. TRIP NUMBER SEQUENCE & GENERATOR
CREATE SEQUENCE IF NOT EXISTS trip_number_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_trip_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    v_year TEXT;
    v_next_val BIGINT;
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    v_next_val := NEXTVAL('trip_number_seq');
    RETURN 'TRP-' || v_year || '-' || LPAD(v_next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 3. DELIVERY TRIPS TABLE
CREATE TABLE IF NOT EXISTS delivery_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requisition_id UUID NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    trip_number VARCHAR(50) NOT NULL UNIQUE,
    trip_index INT NOT NULL DEFAULT 1,
    total_trips_in_order INT NOT NULL DEFAULT 1,
    planned_quantity_tonnes NUMERIC(10, 2) NOT NULL DEFAULT 30.00,
    truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    quarry_id UUID NOT NULL REFERENCES quarries(id),
    destination_id UUID NOT NULL REFERENCES destinations(id),
    material_id UUID NOT NULL REFERENCES materials(id),
    status trip_status NOT NULL DEFAULT 'PLANNED',
    scheduled_date DATE,
    quarry_arrival_at TIMESTAMPTZ,
    loading_started_at TIMESTAMPTZ,
    loading_completed_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    arrived_site_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_by UUID REFERENCES profiles(id),
    assigned_by UUID REFERENCES profiles(id),
    dispatched_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_trip_planned_qty_positive CHECK (planned_quantity_tonnes > 0)
);

CREATE INDEX IF NOT EXISTS idx_trips_org ON delivery_trips(organization_id);
CREATE INDEX IF NOT EXISTS idx_trips_req ON delivery_trips(requisition_id);
CREATE INDEX IF NOT EXISTS idx_trips_customer ON delivery_trips(customer_id);
CREATE INDEX IF NOT EXISTS idx_trips_truck ON delivery_trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON delivery_trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON delivery_trips(status);

-- 4. TRIP WEIGHBRIDGE & LOADING RECORDS TABLE
CREATE TABLE IF NOT EXISTS trip_weighbridge_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES delivery_trips(id) ON DELETE CASCADE UNIQUE,
    weighbridge_ticket_number VARCHAR(100) NOT NULL,
    loading_ticket_number VARCHAR(100),
    gross_weight_tonnes NUMERIC(10, 2) NOT NULL,
    tare_weight_tonnes NUMERIC(10, 2) NOT NULL,
    net_weight_tonnes NUMERIC(10, 2) NOT NULL,
    planned_weight_tonnes NUMERIC(10, 2) NOT NULL,
    variance_tonnes NUMERIC(10, 2) NOT NULL,
    variance_percent NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    loading_officer_id UUID REFERENCES profiles(id),
    loading_bay VARCHAR(50),
    ticket_storage_path TEXT,
    remarks TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_gross_gt_tare CHECK (gross_weight_tonnes > tare_weight_tonnes),
    CONSTRAINT chk_tare_non_negative CHECK (tare_weight_tonnes >= 0),
    CONSTRAINT chk_net_weight_positive CHECK (net_weight_tonnes > 0)
);

CREATE INDEX IF NOT EXISTS idx_trip_weighbridge_trip ON trip_weighbridge_records(trip_id);

-- 5. RPC: SCHEDULE MULTI-TRIP ORDER (WITH FINANCIAL CLEARANCE ENFORCEMENT)
CREATE OR REPLACE FUNCTION schedule_requisition_trips(
    p_requisition_id UUID,
    p_trip_capacities NUMERIC[] DEFAULT ARRAY[30.00]
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_clearance RECORD;
    v_total_planned NUMERIC := 0;
    v_trip_id UUID;
    v_trip_num VARCHAR(50);
    v_total_trips INT;
    v_index INT := 1;
    v_cap NUMERIC;
    v_trips_created JSONB := '[]'::JSONB;
BEGIN
    -- 1. Load requisition
    SELECT * INTO v_req FROM requisitions WHERE id = p_requisition_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Requisition % not found', p_requisition_id;
    END IF;

    -- 2. Verify Financial Clearance Gate
    SELECT * INTO v_clearance FROM requisition_financial_clearances WHERE requisition_id = p_requisition_id;
    IF v_clearance IS NULL OR v_clearance.clearance_status NOT IN ('PAYMENT_CLEARED', 'CREDIT_APPROVED', 'MANAGEMENT_OVERRIDE') THEN
        RAISE EXCEPTION 'Requisition % is not financially cleared for logistics dispatch. Current clearance status: %', 
            p_requisition_id, COALESCE(v_clearance.clearance_status::TEXT, 'NO_CLEARANCE');
    END IF;

    v_total_trips := array_length(p_trip_capacities, 1);
    IF v_total_trips IS NULL OR v_total_trips = 0 THEN
        v_total_trips := CEIL(v_req.quantity / 30.0);
        p_trip_capacities := ARRAY[]::NUMERIC[];
        FOR i IN 1..v_total_trips LOOP
            p_trip_capacities := array_append(p_trip_capacities, 30.00);
        END LOOP;
    END IF;

    -- 3. Create distinct delivery trips
    FOREACH v_cap IN ARRAY p_trip_capacities LOOP
        v_trip_num := generate_trip_number();
        
        INSERT INTO delivery_trips (
            organization_id,
            requisition_id,
            customer_id,
            trip_number,
            trip_index,
            total_trips_in_order,
            planned_quantity_tonnes,
            quarry_id,
            destination_id,
            material_id,
            status,
            created_by
        ) VALUES (
            v_req.organization_id,
            v_req.id,
            v_req.customer_id,
            v_trip_num,
            v_index,
            v_total_trips,
            v_cap,
            v_req.quarry_id,
            v_req.destination_id,
            v_req.material_id,
            'PLANNED',
            auth.uid()
        ) RETURNING id INTO v_trip_id;

        v_trips_created := v_trips_created || jsonb_build_object(
            'tripId', v_trip_id,
            'tripNumber', v_trip_num,
            'tripIndex', v_index,
            'plannedQuantity', v_cap
        );

        v_index := v_index + 1;
    END LOOP;

    -- 4. Update Requisition Status to LOADING_SCHEDULED
    UPDATE requisitions 
    SET status = 'LOADING_SCHEDULED', updated_at = NOW() 
    WHERE id = p_requisition_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'requisitionId', p_requisition_id,
        'totalTrips', v_total_trips,
        'trips', v_trips_created
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: ASSIGN TRUCK & DRIVER WITH SAFETY/MAINTENANCE CONSTRAINTS
CREATE OR REPLACE FUNCTION assign_trip_truck_and_driver(
    p_trip_id UUID,
    p_truck_id UUID,
    p_driver_id UUID,
    p_scheduled_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    v_trip RECORD;
    v_truck RECORD;
    v_driver RECORD;
BEGIN
    SELECT * INTO v_trip FROM delivery_trips WHERE id = p_trip_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trip % not found', p_trip_id;
    END IF;

    -- Validate Truck
    SELECT * INTO v_truck FROM trucks WHERE id = p_truck_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Truck % not found', p_truck_id;
    END IF;
    IF NOT v_truck.is_active THEN
        RAISE EXCEPTION 'Truck % is currently inactive', v_truck.registration_number;
    END IF;
    IF v_truck.maintenance_status IN ('UNDER_MAINTENANCE', 'GROUNDED', 'DECOMMISSIONED') THEN
        RAISE EXCEPTION 'Truck % cannot be assigned due to maintenance status: %', v_truck.registration_number, v_truck.maintenance_status;
    END IF;
    IF v_truck.insurance_expiry IS NOT NULL AND v_truck.insurance_expiry < CURRENT_DATE THEN
        RAISE EXCEPTION 'Truck % has expired insurance (% expired on %)', v_truck.registration_number, v_truck.insurance_expiry;
    END IF;
    IF v_truck.roadworthiness_expiry IS NOT NULL AND v_truck.roadworthiness_expiry < CURRENT_DATE THEN
        RAISE EXCEPTION 'Truck % has expired roadworthiness certificate (% expired on %)', v_truck.registration_number, v_truck.roadworthiness_expiry;
    END IF;

    -- Validate Driver
    SELECT * INTO v_driver FROM drivers WHERE id = p_driver_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Driver % not found', p_driver_id;
    END IF;
    IF NOT v_driver.is_active THEN
        RAISE EXCEPTION 'Driver % % is inactive', v_driver.first_name, v_driver.last_name;
    END IF;
    IF v_driver.availability_status IN ('ON_LEAVE', 'SUSPENDED', 'TERMINATED') THEN
        RAISE EXCEPTION 'Driver % % is not available: %', v_driver.first_name, v_driver.last_name, v_driver.availability_status;
    END IF;
    IF v_driver.license_expiry < CURRENT_DATE THEN
        RAISE EXCEPTION 'Driver % % has an expired driver license (expired %)', v_driver.first_name, v_driver.last_name, v_driver.license_expiry;
    END IF;

    -- Assign to Trip
    UPDATE delivery_trips
    SET 
        truck_id = p_truck_id,
        driver_id = p_driver_id,
        scheduled_date = p_scheduled_date,
        status = 'ASSIGNED',
        assigned_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_trip_id;

    -- Update Driver status
    UPDATE drivers
    SET availability_status = 'ASSIGNED_TO_TRIP', assigned_truck_id = p_truck_id, updated_at = NOW()
    WHERE id = p_driver_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'tripId', p_trip_id,
        'truck', v_truck.registration_number,
        'driver', v_driver.first_name || ' ' || v_driver.last_name,
        'status', 'ASSIGNED'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: RECORD WEIGHBRIDGE & LOADING
CREATE OR REPLACE FUNCTION record_weighbridge_and_loading(
    p_trip_id UUID,
    p_ticket_number VARCHAR(100),
    p_gross_weight NUMERIC,
    p_tare_weight NUMERIC,
    p_loading_ticket_number VARCHAR(100) DEFAULT NULL,
    p_ticket_storage_path TEXT DEFAULT NULL,
    p_loading_bay VARCHAR(50) DEFAULT 'BAY-01',
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_trip RECORD;
    v_net NUMERIC;
    v_var NUMERIC;
    v_var_pct NUMERIC;
BEGIN
    SELECT * INTO v_trip FROM delivery_trips WHERE id = p_trip_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trip % not found', p_trip_id;
    END IF;

    IF p_gross_weight <= p_tare_weight THEN
        RAISE EXCEPTION 'Gross weight (%) must be strictly greater than Tare weight (%)', p_gross_weight, p_tare_weight;
    END IF;

    v_net := p_gross_weight - p_tare_weight;
    v_var := v_net - v_trip.planned_quantity_tonnes;
    v_var_pct := ROUND(((v_var / v_trip.planned_quantity_tonnes) * 100.0), 2);

    INSERT INTO trip_weighbridge_records (
        trip_id,
        weighbridge_ticket_number,
        loading_ticket_number,
        gross_weight_tonnes,
        tare_weight_tonnes,
        net_weight_tonnes,
        planned_weight_tonnes,
        variance_tonnes,
        variance_percent,
        loading_officer_id,
        loading_bay,
        ticket_storage_path,
        remarks,
        recorded_at
    ) VALUES (
        p_trip_id,
        p_ticket_number,
        p_loading_ticket_number,
        p_gross_weight,
        p_tare_weight,
        v_net,
        v_trip.planned_quantity_tonnes,
        v_var,
        v_var_pct,
        auth.uid(),
        p_loading_bay,
        p_ticket_storage_path,
        p_remarks,
        NOW()
    ) ON CONFLICT (trip_id) DO UPDATE SET
        weighbridge_ticket_number = EXCLUDED.weighbridge_ticket_number,
        loading_ticket_number = EXCLUDED.loading_ticket_number,
        gross_weight_tonnes = EXCLUDED.gross_weight_tonnes,
        tare_weight_tonnes = EXCLUDED.tare_weight_tonnes,
        net_weight_tonnes = EXCLUDED.net_weight_tonnes,
        variance_tonnes = EXCLUDED.variance_tonnes,
        variance_percent = EXCLUDED.variance_percent,
        ticket_storage_path = EXCLUDED.ticket_storage_path,
        remarks = EXCLUDED.remarks,
        recorded_at = NOW();

    -- Transition Trip Status to LOADED
    UPDATE delivery_trips
    SET 
        status = 'LOADED',
        loading_completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_trip_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'tripId', p_trip_id,
        'ticketNumber', p_ticket_number,
        'netWeight', v_net,
        'variance', v_var,
        'variancePercent', v_var_pct,
        'status', 'LOADED'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC: DISPATCH TRIP
CREATE OR REPLACE FUNCTION dispatch_trip(p_trip_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_trip RECORD;
BEGIN
    SELECT * INTO v_trip FROM delivery_trips WHERE id = p_trip_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trip % not found', p_trip_id;
    END IF;

    IF v_trip.truck_id IS NULL OR v_trip.driver_id IS NULL THEN
        RAISE EXCEPTION 'Cannot dispatch trip % without assigned truck and driver', v_trip.trip_number;
    END IF;

    IF v_trip.status NOT IN ('LOADED', 'SCHEDULED', 'ASSIGNED') THEN
        RAISE EXCEPTION 'Trip % must be loaded before dispatch (current: %)', v_trip.trip_number, v_trip.status;
    END IF;

    UPDATE delivery_trips
    SET 
        status = 'DISPATCHED',
        dispatched_at = NOW(),
        dispatched_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_trip_id;

    -- Update Requisition Status to DISPATCHED / IN_TRANSIT
    UPDATE requisitions
    SET status = 'IN_TRANSIT', updated_at = NOW()
    WHERE id = v_trip.requisition_id AND status != 'DELIVERED';

    RETURN jsonb_build_object(
        'success', TRUE,
        'tripId', p_trip_id,
        'tripNumber', v_trip.trip_number,
        'status', 'DISPATCHED',
        'dispatchedAt', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
