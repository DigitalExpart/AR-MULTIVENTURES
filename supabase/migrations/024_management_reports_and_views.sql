-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 024: MANAGEMENT ANALYTICS, REPORTING VIEWS & RPCs
-- ============================================================================

-- 1. VIEW: SALES & ORDERS SUMMARY
CREATE OR REPLACE VIEW view_sales_summary AS
SELECT
    r.id AS requisition_id,
    r.organization_id,
    r.reference_number,
    r.customer_id,
    c.name AS customer_name,
    r.quarry_id,
    q.name AS quarry_name,
    r.destination_id,
    d.name AS destination_name,
    r.status,
    r.financial_clearance_status,
    r.total_amount_snapshot AS total_amount,
    r.subtotal_snapshot AS subtotal,
    r.vat_snapshot AS vat,
    r.material_amount_snapshot AS material_amount,
    r.haulage_amount_snapshot AS haulage_amount,
    r.loading_amount_snapshot AS loading_amount,
    r.created_at,
    r.updated_at
FROM requisitions r
LEFT JOIN customers c ON r.customer_id = c.id
LEFT JOIN quarries q ON r.quarry_id = q.id
LEFT JOIN destinations d ON r.destination_id = d.id;

-- 2. VIEW: CUSTOMER RECEIVABLES AGING BUCKETS
CREATE OR REPLACE VIEW view_customer_receivables_aging AS
WITH invoice_balances AS (
    SELECT
        inv.id AS invoice_id,
        inv.customer_id,
        inv.invoice_number,
        inv.due_date,
        inv.total_amount,
        inv.amount_paid,
        (inv.total_amount - inv.amount_paid) AS outstanding_amount,
        GREATEST(0, (CURRENT_DATE - inv.due_date::DATE)) AS days_overdue
    FROM invoices inv
    WHERE inv.status NOT IN ('PAID', 'CANCELLED')
      AND (inv.total_amount - inv.amount_paid) > 0
)
SELECT
    c.id AS customer_id,
    c.name AS customer_name,
    c.reference_number AS customer_reference,
    COALESCE(SUM(ib.outstanding_amount), 0) AS total_outstanding,
    COALESCE(SUM(CASE WHEN ib.days_overdue = 0 THEN ib.outstanding_amount ELSE 0 END), 0) AS bucket_current,
    COALESCE(SUM(CASE WHEN ib.days_overdue BETWEEN 1 AND 30 THEN ib.outstanding_amount ELSE 0 END), 0) AS bucket_1_30,
    COALESCE(SUM(CASE WHEN ib.days_overdue BETWEEN 31 AND 60 THEN ib.outstanding_amount ELSE 0 END), 0) AS bucket_31_60,
    COALESCE(SUM(CASE WHEN ib.days_overdue BETWEEN 61 AND 90 THEN ib.outstanding_amount ELSE 0 END), 0) AS bucket_61_90,
    COALESCE(SUM(CASE WHEN ib.days_overdue > 90 THEN ib.outstanding_amount ELSE 0 END), 0) AS bucket_90_plus
FROM customers c
LEFT JOIN invoice_balances ib ON c.id = ib.customer_id
GROUP BY c.id, c.name, c.reference_number;

-- 3. VIEW: QUARRY OPERATIONS & LOADING PERFORMANCE
CREATE OR REPLACE VIEW view_quarry_performance AS
SELECT
    q.id AS quarry_id,
    q.name AS quarry_name,
    q.state,
    COUNT(DISTINCT dt.id) AS total_trips,
    COALESCE(SUM(dt.planned_quantity_tonnes), 0) AS planned_tonnes,
    COALESCE(SUM(wb.net_weight_tonnes), 0) AS actual_loaded_tonnes,
    COALESCE(SUM(wb.variance_tonnes), 0) AS total_variance_tonnes,
    CASE 
        WHEN COUNT(wb.id) > 0 THEN ROUND(AVG(wb.variance_tonnes), 3)
        ELSE 0 
    END AS avg_variance_tonnes,
    COUNT(CASE WHEN dt.status = 'DELIVERED' THEN 1 END) AS delivered_trips
FROM quarries q
LEFT JOIN delivery_trips dt ON q.id = dt.quarry_id
LEFT JOIN trip_weighbridge_records wb ON dt.id = wb.trip_id
GROUP BY q.id, q.name, q.state;

-- 4. VIEW: FLEET UTILIZATION SUMMARY
CREATE OR REPLACE VIEW view_fleet_utilization AS
SELECT
    t.id AS truck_id,
    t.registration_number,
    t.make,
    t.model,
    t.ownership_type,
    t.capacity_tonnes,
    t.maintenance_status,
    COUNT(dt.id) AS total_trips_assigned,
    COUNT(CASE WHEN dt.status = 'DELIVERED' THEN 1 END) AS completed_trips,
    COALESCE(SUM(CASE WHEN dt.status = 'DELIVERED' THEN dt.planned_quantity_tonnes ELSE 0 END), 0) AS total_tonnes_hauled,
    COALESCE(SUM(mr.cost), 0) AS total_maintenance_cost
FROM trucks t
LEFT JOIN delivery_trips dt ON t.id = dt.truck_id
LEFT JOIN truck_maintenance_records mr ON t.id = mr.truck_id
GROUP BY t.id, t.registration_number, t.make, t.model, t.ownership_type, t.capacity_tonnes, t.maintenance_status;

-- 5. RPC: GET EXECUTIVE MANAGEMENT KPIS (DATE RANGE FILTERED)
CREATE OR REPLACE FUNCTION rpc_get_executive_kpis(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_start TIMESTAMPTZ := COALESCE(p_start_date, '1970-01-01'::TIMESTAMPTZ);
    v_end TIMESTAMPTZ := COALESCE(p_end_date, NOW());
    v_total_reqs INT;
    v_approved_orders INT;
    v_completed_orders INT;
    v_total_order_value NUMERIC;
    v_payments_received NUMERIC;
    v_outstanding_receivables NUMERIC;
    v_credit_exposure NUMERIC;
    v_tonnes_ordered NUMERIC;
    v_tonnes_loaded NUMERIC;
    v_tonnes_delivered NUMERIC;
    v_trips_in_transit INT;
    v_active_customers INT;
BEGIN
    -- Requisition metrics
    SELECT
        COUNT(*),
        COUNT(CASE WHEN status IN ('APPROVED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED') THEN 1 END),
        COUNT(CASE WHEN status IN ('DELIVERED', 'COMPLETED') THEN 1 END),
        COALESCE(SUM(CASE WHEN status != 'REJECTED' THEN total_amount_snapshot ELSE 0 END), 0)
    INTO v_total_reqs, v_approved_orders, v_completed_orders, v_total_order_value
    FROM requisitions
    WHERE created_at BETWEEN v_start AND v_end;

    -- Confirmed Payments (strictly exclude pending transfers or failed payments)
    SELECT COALESCE(SUM(amount), 0) INTO v_payments_received
    FROM payments
    WHERE status = 'CONFIRMED' AND confirmed_at BETWEEN v_start AND v_end;

    -- Outstanding Receivables from active unpaid invoices
    SELECT COALESCE(SUM(total_amount - amount_paid), 0) INTO v_outstanding_receivables
    FROM invoices
    WHERE status NOT IN ('PAID', 'CANCELLED');

    -- Total Credit Exposure
    SELECT COALESCE(SUM(credit_limit), 0) INTO v_credit_exposure
    FROM customer_credit_profiles;

    -- Tonnage & Trip Logistics
    SELECT
        COALESCE(SUM(planned_quantity_tonnes), 0),
        COUNT(CASE WHEN status IN ('IN_TRANSIT', 'DISPATCHED') THEN 1 END)
    INTO v_tonnes_ordered, v_trips_in_transit
    FROM delivery_trips
    WHERE created_at BETWEEN v_start AND v_end;

    SELECT COALESCE(SUM(net_weight_tonnes), 0) INTO v_tonnes_loaded
    FROM trip_weighbridge_records
    WHERE created_at BETWEEN v_start AND v_end;

    SELECT COALESCE(SUM(delivered_quantity_tonnes), 0) INTO v_tonnes_delivered
    FROM trip_proof_of_delivery
    WHERE delivery_time BETWEEN v_start AND v_end;

    -- Active Customers count
    SELECT COUNT(DISTINCT customer_id) INTO v_active_customers
    FROM requisitions
    WHERE created_at BETWEEN v_start AND v_end;

    RETURN jsonb_build_object(
        'totalRequisitions', v_total_reqs,
        'approvedOrders', v_approved_orders,
        'completedOrders', v_completed_orders,
        'totalOrderValue', v_total_order_value,
        'paymentsReceived', v_payments_received,
        'outstandingReceivables', v_outstanding_receivables,
        'outstandingCreditExposure', v_credit_exposure,
        'tonnesOrdered', v_tonnes_ordered,
        'tonnesLoaded', v_tonnes_loaded,
        'tonnesDelivered', v_tonnes_delivered,
        'tripsInTransit', v_trips_in_transit,
        'activeCustomers', v_active_customers,
        'periodStart', v_start,
        'periodEnd', v_end
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. REPORTING ACCESS INDEXES
CREATE INDEX IF NOT EXISTS idx_req_report_created ON requisitions(created_at, status);
CREATE INDEX IF NOT EXISTS idx_inv_report_due ON invoices(due_date, status);
CREATE INDEX IF NOT EXISTS idx_pay_report_confirmed ON payments(status, confirmed_at);
CREATE INDEX IF NOT EXISTS idx_trips_report_status ON delivery_trips(status, created_at);
