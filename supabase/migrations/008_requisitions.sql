-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 008: REQUISITIONS & ORDER LIFECYCLE
-- Requisition Master, Items, Commercial Snapshots & Status Audit History
-- ============================================================================

-- Requisitions Master Table
CREATE TABLE public.requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    requisition_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_address_id UUID REFERENCES public.customer_addresses(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    quarry_id UUID NOT NULL REFERENCES public.quarries(id) ON DELETE RESTRICT,
    transportation_option public.transportation_option NOT NULL DEFAULT 'SUPPLY_AND_HAULAGE',
    truck_type_id UUID REFERENCES public.truck_types(id) ON DELETE SET NULL,
    status public.order_status NOT NULL DEFAULT 'DRAFT',
    payment_status public.payment_status NOT NULL DEFAULT 'UNPAID',
    requested_delivery_date DATE NOT NULL,
    destination_name_cache VARCHAR(255) NOT NULL,
    destination_address_cache TEXT NOT NULL,
    notes TEXT,
    special_instructions TEXT,

    -- Immutable Commercial Price Snapshot (Preserves historical values when price tables change)
    material_amount_snapshot NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    loading_amount_snapshot NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    haulage_amount_snapshot NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    other_charges_snapshot NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    discount_amount_snapshot NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    total_amount_snapshot NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',

    -- Lifecycle Operational Milestones
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_requisition_org_number UNIQUE (organization_id, requisition_number)
);

-- Requisition Line Items (Multi-Material Support)
CREATE TABLE public.requisition_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_id UUID NOT NULL REFERENCES public.requisitions(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity >= 1.00),
    unit VARCHAR(50) NOT NULL DEFAULT 'tonnes',
    unit_price_snapshot NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    loaded_quantity NUMERIC(12, 2) DEFAULT 0.00, -- Foundation for weighbridge integration
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Full Status Progression & Audit History Table
CREATE TABLE public.requisition_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_id UUID NOT NULL REFERENCES public.requisitions(id) ON DELETE CASCADE,
    previous_status public.order_status,
    new_status public.order_status NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reason TEXT
);

-- Performance Indexes
CREATE INDEX idx_requisitions_org ON public.requisitions(organization_id);
CREATE INDEX idx_requisitions_customer ON public.requisitions(customer_id);
CREATE INDEX idx_requisitions_quarry ON public.requisitions(quarry_id);
CREATE INDEX idx_requisitions_status ON public.requisitions(status);
CREATE INDEX idx_requisitions_payment_status ON public.requisitions(payment_status);
CREATE INDEX idx_requisitions_del_date ON public.requisitions(requested_delivery_date);
CREATE INDEX idx_requisitions_created ON public.requisitions(created_at DESC);
CREATE INDEX idx_requisition_items_req ON public.requisition_items(requisition_id);
CREATE INDEX idx_requisition_status_history_req ON public.requisition_status_history(requisition_id);
