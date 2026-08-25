-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 013: COMMERCIAL PRICING ENGINE & RPCs
-- Server-Side Deterministic Pricing Resolution, Atomic Submission & State Transitions
-- ============================================================================

-- 1. Deterministic Server-Side Commercial Pricing Engine Function
CREATE OR REPLACE FUNCTION public.calculate_requisition_price(
    p_organization_id UUID,
    p_customer_id UUID,
    p_quarry_id UUID,
    p_material_id UUID,
    p_quantity NUMERIC,
    p_transportation_option public.transportation_option,
    p_truck_type_id UUID DEFAULT NULL,
    p_destination_id UUID DEFAULT NULL,
    p_delivery_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    v_quarry_active BOOLEAN;
    v_material_active BOOLEAN;
    v_quarry_mat_avail BOOLEAN;
    
    -- Material price variables
    v_mat_unit_price NUMERIC(18, 2) := 0.00;
    v_mat_price_source TEXT := 'NONE';
    v_mat_rule_id UUID;
    v_mat_amount NUMERIC(18, 2) := 0.00;
    
    -- Loading variables
    v_loading_rate_tonne NUMERIC(18, 2) := 0.00;
    v_loading_rate_trip NUMERIC(18, 2) := 0.00;
    v_loading_amount NUMERIC(18, 2) := 0.00;
    
    -- Haulage variables
    v_haulage_rate_trip NUMERIC(18, 2) := 0.00;
    v_haulage_rate_tonne NUMERIC(18, 2) := 0.00;
    v_haulage_min_tonnage NUMERIC(8, 2) := 30.00;
    v_haulage_amount NUMERIC(18, 2) := 0.00;
    v_haulage_source TEXT := 'NONE';
    v_haulage_rule_id UUID;
    
    -- Fuel surcharge variables
    v_fuel_surcharge_pct NUMERIC(6, 2) := 0.00;
    v_fuel_adj_amount NUMERIC(18, 2) := 0.00;
    
    -- Discount variables
    v_discount_name TEXT := 'None';
    v_discount_type public.discount_type;
    v_discount_val NUMERIC(10, 2) := 0.00;
    v_discount_amount NUMERIC(18, 2) := 0.00;
    v_discount_rule_id UUID;
    
    -- Commercial Totals
    v_subtotal NUMERIC(18, 2) := 0.00;
    v_total NUMERIC(18, 2) := 0.00;
    
    -- Control flags
    v_requires_review BOOLEAN := false;
    v_review_reasons TEXT[] := ARRAY[]::TEXT[];
    v_valid_until TIMESTAMPTZ := now() + INTERVAL '48 hours';
    v_target_date TIMESTAMPTZ := COALESCE(p_delivery_date::TIMESTAMPTZ, now());
BEGIN
    -- A. Validate Active Master Assets & Availability
    SELECT is_active INTO v_quarry_active FROM public.quarries WHERE id = p_quarry_id;
    IF v_quarry_active IS NOT TRUE THEN
        v_requires_review := true;
        v_review_reasons := array_append(v_review_reasons, 'QUARRY_INACTIVE_OR_UNAVAILABLE');
    END IF;

    SELECT is_active INTO v_material_active FROM public.materials WHERE id = p_material_id;
    IF v_material_active IS NOT TRUE THEN
        v_requires_review := true;
        v_review_reasons := array_append(v_review_reasons, 'MATERIAL_INACTIVE_OR_UNAVAILABLE');
    END IF;

    SELECT is_available INTO v_quarry_mat_avail FROM public.quarry_materials
    WHERE quarry_id = p_quarry_id AND material_id = p_material_id;
    IF v_quarry_mat_avail IS NOT TRUE AND v_quarry_mat_avail IS NOT NULL THEN
        v_requires_review := true;
        v_review_reasons := array_append(v_review_reasons, 'MATERIAL_NOT_EXTRACTED_AT_QUARRY');
    END IF;

    -- B. Material Price Precedence Resolution (if not HAULAGE_ONLY)
    IF p_transportation_option != 'HAULAGE_ONLY' THEN
        -- 1. Customer-Specific Negotiated Rate
        IF p_customer_id IS NOT NULL THEN
            SELECT id, special_price_per_unit INTO v_mat_rule_id, v_mat_unit_price
            FROM public.customer_prices
            WHERE customer_id = p_customer_id
              AND quarry_id = p_quarry_id
              AND material_id = p_material_id
              AND is_active = true
              AND effective_from <= v_target_date
              AND (effective_to IS NULL OR effective_to >= v_target_date)
            ORDER BY effective_from DESC LIMIT 1;

            IF v_mat_rule_id IS NOT NULL THEN
                v_mat_price_source := 'CUSTOMER_NEGOTIATED_PRICE';
            END IF;
        END IF;

        -- 2. Promotional Sourcing Price
        IF v_mat_price_source = 'NONE' THEN
            SELECT id, promo_price_per_unit INTO v_mat_rule_id, v_mat_unit_price
            FROM public.promotional_prices
            WHERE is_active = true
              AND (quarry_id IS NULL OR quarry_id = p_quarry_id)
              AND (material_id IS NULL OR material_id = p_material_id)
              AND effective_from <= v_target_date
              AND effective_to >= v_target_date
              AND promo_price_per_unit IS NOT NULL
            ORDER BY effective_from DESC LIMIT 1;

            IF v_mat_rule_id IS NOT NULL THEN
                v_mat_price_source := 'PROMOTIONAL_PRICE';
            END IF;
        END IF;

        -- 3. Standard Active Quarry Material Price
        IF v_mat_price_source = 'NONE' THEN
            SELECT id, price_per_unit INTO v_mat_rule_id, v_mat_unit_price
            FROM public.material_prices
            WHERE quarry_id = p_quarry_id
              AND material_id = p_material_id
              AND is_active = true
              AND effective_from <= v_target_date
              AND (effective_to IS NULL OR effective_to >= v_target_date)
            ORDER BY effective_from DESC LIMIT 1;

            IF v_mat_rule_id IS NOT NULL THEN
                v_mat_price_source := 'STANDARD_QUARRY_PRICE';
            ELSE
                v_requires_review := true;
                v_review_reasons := array_append(v_review_reasons, 'NO_ACTIVE_MATERIAL_PRICE_FOUND');
            END IF;
        END IF;

        v_mat_amount := ROUND(p_quantity * v_mat_unit_price, 2);
    ELSE
        v_mat_unit_price := 0.00;
        v_mat_amount := 0.00;
        v_mat_price_source := 'HAULAGE_ONLY_NO_MATERIAL';
    END IF;

    -- C. Loading Bay / Weighbridge Scale Charges (Configurable per transportation mode)
    IF p_transportation_option != 'HAULAGE_ONLY' THEN
        SELECT charge_per_tonne, charge_per_trip INTO v_loading_rate_tonne, v_loading_rate_trip
        FROM public.loading_charges
        WHERE quarry_id = p_quarry_id
          AND is_active = true
          AND (material_id IS NULL OR material_id = p_material_id)
          AND effective_from <= v_target_date
          AND (effective_to IS NULL OR effective_to >= v_target_date)
        ORDER BY material_id NULLS LAST, effective_from DESC LIMIT 1;

        IF v_loading_rate_tonne IS NULL THEN
            v_loading_rate_tonne := 0.00;
        END IF;
        IF v_loading_rate_trip IS NULL THEN
            v_loading_rate_trip := 0.00;
        END IF;

        v_loading_amount := ROUND((v_loading_rate_tonne * p_quantity) + v_loading_rate_trip, 2);
    ELSE
        -- For HAULAGE_ONLY, loading is handled at source by third party unless specifically configured
        v_loading_rate_tonne := 0.00;
        v_loading_rate_trip := 0.00;
        v_loading_amount := 0.00;
    END IF;

    -- D. Haulage Tariff Resolution
    IF p_transportation_option = 'SELF_PICKUP' THEN
        v_haulage_amount := 0.00;
        v_haulage_source := 'SELF_PICKUP_NO_HAULAGE';
    ELSE
        -- 1. Exact Quarry + Destination + Truck Type Match
        IF p_destination_id IS NOT NULL AND p_truck_type_id IS NOT NULL THEN
            SELECT id, rate_per_trip, rate_per_tonne, minimum_tonnage
            INTO v_haulage_rule_id, v_haulage_rate_trip, v_haulage_rate_tonne, v_haulage_min_tonnage
            FROM public.haulage_rates
            WHERE quarry_id = p_quarry_id
              AND destination_id = p_destination_id
              AND truck_type_id = p_truck_type_id
              AND is_active = true
              AND effective_from <= v_target_date
              AND (effective_to IS NULL OR effective_to >= v_target_date)
            ORDER BY effective_from DESC LIMIT 1;

            IF v_haulage_rule_id IS NOT NULL THEN
                v_haulage_source := 'DESTINATION_TRUCK_TARIFF';
            END IF;
        END IF;

        -- 2. Fallback Quarry + Destination Match (Generic truck rate)
        IF v_haulage_source = 'NONE' AND p_destination_id IS NOT NULL THEN
            SELECT id, rate_per_trip, rate_per_tonne, minimum_tonnage
            INTO v_haulage_rule_id, v_haulage_rate_trip, v_haulage_rate_tonne, v_haulage_min_tonnage
            FROM public.haulage_rates
            WHERE quarry_id = p_quarry_id
              AND destination_id = p_destination_id
              AND is_active = true
              AND effective_from <= v_target_date
              AND (effective_to IS NULL OR effective_to >= v_target_date)
            ORDER BY effective_from DESC LIMIT 1;

            IF v_haulage_rule_id IS NOT NULL THEN
                v_haulage_source := 'DESTINATION_GENERAL_TARIFF';
            END IF;
        END IF;

        IF v_haulage_source != 'NONE' THEN
            -- Calculate haulage using higher of actual tonnage or minimum billable tonnage
            IF v_haulage_rate_trip > 0 THEN
                v_haulage_amount := v_haulage_rate_trip;
            ELSE
                v_haulage_amount := ROUND(v_haulage_rate_tonne * GREATEST(p_quantity, v_haulage_min_tonnage), 2);
            END IF;
        ELSE
            v_haulage_amount := 0.00;
            v_requires_review := true;
            v_review_reasons := array_append(v_review_reasons, 'NO_APPROVED_HAULAGE_TARIFF');
        END IF;
    END IF;

    -- E. Macro Fuel Adjustment Surcharge (Applies to haulage component)
    IF v_haulage_amount > 0 THEN
        SELECT percentage_surcharge INTO v_fuel_surcharge_pct
        FROM public.fuel_adjustments
        WHERE is_active = true
          AND effective_from <= v_target_date
          AND (effective_to IS NULL OR effective_to >= v_target_date)
        ORDER BY effective_from DESC LIMIT 1;

        IF v_fuel_surcharge_pct IS NOT NULL AND v_fuel_surcharge_pct > 0 THEN
            v_fuel_adj_amount := ROUND((v_haulage_amount * v_fuel_surcharge_pct) / 100.0, 2);
        END IF;
    END IF;

    -- F. Bulk Volume Tiered Discounts
    SELECT id, name, discount_type, value INTO v_discount_rule_id, v_discount_name, v_discount_type, v_discount_val
    FROM public.discount_rules
    WHERE is_active = true
      AND min_quantity_tonnes <= p_quantity
      AND (max_quantity_tonnes IS NULL OR max_quantity_tonnes >= p_quantity)
      AND effective_from <= v_target_date
      AND (effective_to IS NULL OR effective_to >= v_target_date)
    ORDER BY min_quantity_tonnes DESC, value DESC LIMIT 1;

    IF v_discount_rule_id IS NOT NULL THEN
        IF v_discount_type = 'PERCENTAGE' THEN
            v_discount_amount := ROUND((v_mat_amount * v_discount_val) / 100.0, 2);
        ELSIF v_discount_type = 'FIXED_AMOUNT' THEN
            v_discount_amount := LEAST(v_discount_val, v_mat_amount);
        END IF;
    END IF;

    -- G. Authoritative Financial Summation
    v_subtotal := ROUND(v_mat_amount + v_loading_amount + v_haulage_amount + v_fuel_adj_amount, 2);
    v_total := ROUND(GREATEST(v_subtotal - v_discount_amount, 0.00), 2);

    -- Return Structured JSON Result
    RETURN jsonb_build_object(
        'currency', 'NGN',
        'quantity', p_quantity,
        'material', jsonb_build_object(
            'unitPrice', v_mat_unit_price,
            'quantity', p_quantity,
            'amount', v_mat_amount,
            'source', v_mat_price_source,
            'ruleId', v_mat_rule_id
        ),
        'loading', jsonb_build_object(
            'ratePerTonne', v_loading_rate_tonne,
            'ratePerTrip', v_loading_rate_trip,
            'amount', v_loading_amount
        ),
        'haulage', jsonb_build_object(
            'amount', v_haulage_amount,
            'source', v_haulage_source,
            'ruleId', v_haulage_rule_id
        ),
        'fuelAdjustment', jsonb_build_object(
            'percentage', COALESCE(v_fuel_surcharge_pct, 0.00),
            'amount', v_fuel_adj_amount
        ),
        'discounts', jsonb_build_array(
            jsonb_build_object(
                'name', v_discount_name,
                'amount', v_discount_amount,
                'ruleId', v_discount_rule_id
            )
        ),
        'subtotal', v_subtotal,
        'totalDiscount', v_discount_amount,
        'total', v_total,
        'requiresReview', v_requires_review,
        'reviewReasons', to_jsonb(v_review_reasons),
        'quotedAt', now(),
        'validUntil', v_valid_until
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. Atomic Requisition Submission RPC
-- Freezes authoritative price quote, assigns sequence number, and transitions DRAFT -> SUBMITTED
CREATE OR REPLACE FUNCTION public.submit_requisition(
    p_requisition_id UUID,
    p_expected_total NUMERIC DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_item RECORD;
    v_user_customer_ids UUID[];
    v_quote JSONB;
    v_calculated_total NUMERIC(18, 2);
    v_tolerance NUMERIC(18, 2) := 5.00; -- 5 Naira tolerance for minor fractional rounding
    v_ref_number TEXT;
BEGIN
    -- A. Validate Authenticated Session & Draft Ownership
    SELECT ARRAY_AGG(customer_id) INTO v_user_customer_ids
    FROM public.customer_users WHERE user_id = auth.uid() AND is_active = true;

    IF v_user_customer_ids IS NULL OR array_length(v_user_customer_ids, 1) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_NO_CUSTOMER_ACCOUNT');
    END IF;

    SELECT * INTO v_req FROM public.requisitions
    WHERE id = p_requisition_id AND customer_id = ANY(v_user_customer_ids)
    FOR UPDATE;

    IF v_req.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'REQUISITION_NOT_FOUND_OR_FORBIDDEN');
    END IF;

    IF v_req.status != 'DRAFT' THEN
        RETURN jsonb_build_object('success', false, 'error', 'ONLY_DRAFT_CAN_BE_SUBMITTED', 'currentStatus', v_req.status);
    END IF;

    -- B. Fetch Requisition Line Item
    SELECT * INTO v_item FROM public.requisition_items
    WHERE requisition_id = p_requisition_id LIMIT 1;

    IF v_item.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'REQUISITION_HAS_NO_ITEMS');
    END IF;

    -- C. Re-evaluate Live Authoritative Price Quote
    v_quote := public.calculate_requisition_price(
        v_req.organization_id,
        v_req.customer_id,
        v_req.quarry_id,
        v_item.material_id,
        v_item.quantity,
        v_req.transportation_option,
        v_req.truck_type_id,
        v_req.destination_id,
        v_req.requested_delivery_date
    );

    v_calculated_total := (v_quote->>'total')::NUMERIC(18, 2);

    -- D. Check Price Change / Drift
    IF p_expected_total IS NOT NULL AND ABS(p_expected_total - v_calculated_total) > v_tolerance THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'PRICE_CHANGED_CONFIRMATION_REQUIRED',
            'previousTotal', p_expected_total,
            'currentTotal', v_calculated_total,
            'quote', v_quote
        );
    END IF;

    -- E. Generate Reference Number if empty
    IF v_req.requisition_number IS NULL OR v_req.requisition_number = '' THEN
        v_ref_number := public.generate_requisition_number();
    ELSE
        v_ref_number := v_req.requisition_number;
    END IF;

    -- F. Freeze Commercial Snapshot & Atomically Update
    UPDATE public.requisitions SET
        requisition_number = v_ref_number,
        status = 'SUBMITTED',
        material_amount_snapshot = (v_quote->'material'->>'amount')::NUMERIC(18, 2),
        loading_amount_snapshot = (v_quote->'loading'->>'amount')::NUMERIC(18, 2),
        haulage_amount_snapshot = (v_quote->'haulage'->>'amount')::NUMERIC(18, 2),
        other_charges_snapshot = (v_quote->'fuelAdjustment'->>'amount')::NUMERIC(18, 2),
        discount_amount_snapshot = (v_quote->>'totalDiscount')::NUMERIC(18, 2),
        total_amount_snapshot = v_calculated_total,
        currency = 'NGN',
        notes = COALESCE(p_notes, v_req.notes),
        submitted_at = now(),
        updated_at = now()
    WHERE id = p_requisition_id;

    -- Update Requisition Line Item Price Snapshot
    UPDATE public.requisition_items SET
        unit_price_snapshot = (v_quote->'material'->>'unitPrice')::NUMERIC(18, 2),
        line_total = (v_quote->'material'->>'amount')::NUMERIC(18, 2),
        updated_at = now()
    WHERE id = v_item.id;

    -- G. Log Status Progression History
    INSERT INTO public.requisition_status_history (
        requisition_id,
        previous_status,
        new_status,
        changed_by,
        changed_at,
        reason
    ) VALUES (
        p_requisition_id,
        'DRAFT',
        'SUBMITTED',
        auth.uid(),
        now(),
        'Requisition submitted by customer with authoritative frozen price'
    );

    -- H. Record Security Audit Log
    INSERT INTO public.audit_logs (
        organization_id,
        actor_user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values
    ) VALUES (
        v_req.organization_id,
        auth.uid(),
        'REQUISITION_SUBMITTED',
        'requisition',
        p_requisition_id,
        jsonb_build_object('status', 'DRAFT'),
        jsonb_build_object(
            'status', 'SUBMITTED',
            'requisition_number', v_ref_number,
            'total_snapshot', v_calculated_total
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'requisitionId', p_requisition_id,
        'requisitionNumber', v_ref_number,
        'status', 'SUBMITTED',
        'totalAmount', v_calculated_total,
        'quote', v_quote
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 3. Controlled Status Transition State Machine RPC
CREATE OR REPLACE FUNCTION public.transition_requisition_status(
    p_requisition_id UUID,
    p_target_status public.order_status,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_is_owner BOOLEAN := false;
    v_can_approve BOOLEAN := false;
    v_can_manage_loading BOOLEAN := false;
    v_can_manage_delivery BOOLEAN := false;
    v_can_confirm_payment BOOLEAN := false;
    v_user_customer_ids UUID[];
BEGIN
    SELECT * INTO v_req FROM public.requisitions WHERE id = p_requisition_id FOR UPDATE;
    IF v_req.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'REQUISITION_NOT_FOUND');
    END IF;

    -- Evaluate User Capabilities
    SELECT ARRAY_AGG(customer_id) INTO v_user_customer_ids
    FROM public.customer_users WHERE user_id = auth.uid() AND is_active = true;

    IF v_req.customer_id = ANY(v_user_customer_ids) THEN
        v_is_owner := true;
    END IF;

    v_can_approve := public.has_permission('requisitions.approve');
    v_can_manage_loading := public.has_permission('loading.manage');
    v_can_manage_delivery := public.has_permission('delivery.manage');
    v_can_confirm_payment := public.has_permission('payments.confirm');

    -- Validate Transition Rules
    IF p_target_status = 'APPROVED' THEN
        IF v_req.status != 'SUBMITTED' OR NOT v_can_approve THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_OR_INVALID_STATE_FOR_APPROVAL');
        END IF;
        UPDATE public.requisitions SET status = 'APPROVED', approved_by = auth.uid(), approved_at = now() WHERE id = p_requisition_id;

    ELSIF p_target_status = 'REJECTED' THEN
        IF v_req.status != 'SUBMITTED' OR NOT v_can_approve THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_OR_INVALID_STATE_FOR_REJECTION');
        END IF;
        UPDATE public.requisitions SET status = 'REJECTED' WHERE id = p_requisition_id;

    ELSIF p_target_status = 'CANCELLED' THEN
        IF v_req.status NOT IN ('DRAFT', 'SUBMITTED', 'APPROVED') OR (NOT v_is_owner AND NOT v_can_approve) THEN
            RETURN jsonb_build_object('success', false, 'error', 'CANNOT_CANCEL_DISPATCHED_OR_INELIGIBLE_ORDER');
        END IF;
        UPDATE public.requisitions SET status = 'CANCELLED', cancelled_at = now() WHERE id = p_requisition_id;

    ELSIF p_target_status = 'PAYMENT_PENDING' THEN
        IF v_req.status != 'APPROVED' THEN
            RETURN jsonb_build_object('success', false, 'error', 'ORDER_MUST_BE_APPROVED_FIRST');
        END IF;
        UPDATE public.requisitions SET status = 'PAYMENT_PENDING' WHERE id = p_requisition_id;

    ELSIF p_target_status = 'PAYMENT_CONFIRMED' THEN
        IF v_req.status != 'PAYMENT_PENDING' OR NOT v_can_confirm_payment THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_OR_INVALID_STATE_FOR_PAYMENT_CONFIRMATION');
        END IF;
        UPDATE public.requisitions SET status = 'PAYMENT_CONFIRMED', payment_status = 'PAID' WHERE id = p_requisition_id;

    ELSIF p_target_status = 'LOADING_SCHEDULED' THEN
        IF v_req.status NOT IN ('APPROVED', 'PAYMENT_CONFIRMED') OR NOT v_can_manage_loading THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_OR_INVALID_STATE_FOR_LOADING_SCHEDULE');
        END IF;
        UPDATE public.requisitions SET status = 'LOADING_SCHEDULED' WHERE id = p_requisition_id;

    ELSIF p_target_status = 'LOADING' THEN
        IF v_req.status != 'LOADING_SCHEDULED' OR NOT v_can_manage_loading THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_OR_INVALID_STATE_FOR_LOADING');
        END IF;
        UPDATE public.requisitions SET status = 'LOADING' WHERE id = p_requisition_id;

    ELSIF p_target_status = 'DISPATCHED' THEN
        IF v_req.status != 'LOADING' OR NOT v_can_manage_delivery THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_OR_INVALID_STATE_FOR_DISPATCH');
        END IF;
        UPDATE public.requisitions SET status = 'DISPATCHED' WHERE id = p_requisition_id;

    ELSIF p_target_status = 'DELIVERED' THEN
        IF v_req.status != 'DISPATCHED' OR NOT v_can_manage_delivery THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_OR_INVALID_STATE_FOR_DELIVERY');
        END IF;
        UPDATE public.requisitions SET status = 'DELIVERED' WHERE id = p_requisition_id;

    ELSIF p_target_status = 'COMPLETED' THEN
        IF v_req.status != 'DELIVERED' OR NOT v_can_approve THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_OR_INVALID_STATE_FOR_COMPLETION');
        END IF;
        UPDATE public.requisitions SET status = 'COMPLETED', completed_at = now() WHERE id = p_requisition_id;

    ELSIF p_target_status = 'ON_HOLD' THEN
        IF NOT v_can_approve THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_FOR_ON_HOLD');
        END IF;
        UPDATE public.requisitions SET status = 'ON_HOLD' WHERE id = p_requisition_id;

    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'UNKNOWN_TARGET_STATUS');
    END IF;

    -- Record Status History
    INSERT INTO public.requisition_status_history (
        requisition_id,
        previous_status,
        new_status,
        changed_by,
        changed_at,
        reason
    ) VALUES (
        p_requisition_id,
        v_req.status,
        p_target_status,
        auth.uid(),
        now(),
        p_reason
    );

    RETURN jsonb_build_object(
        'success', true,
        'requisitionId', p_requisition_id,
        'previousStatus', v_req.status,
        'newStatus', p_target_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
