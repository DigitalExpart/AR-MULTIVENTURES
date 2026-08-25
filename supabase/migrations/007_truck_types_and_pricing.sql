-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 007: TRUCK TYPES & PRICING ARCHITECTURE
-- Normalized Pricing Matrix Supporting Material, Haulage, Loading, Customer Overrides,
-- Promotions, Bulk Discounts & Fuel Adjustments
-- ============================================================================

-- Truck Types Master (Capacity & Classification for Rate Computation)
CREATE TABLE public.truck_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity_tonnes NUMERIC(6, 2) NOT NULL,
    axle_configuration VARCHAR(50), -- e.g. "6x4", "8x4", "10-Wheeler", "Articulated"
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_truck_type_org_code UNIQUE (organization_id, code)
);

-- 1. Base Material Quarry Sourcing Prices (Effective Date Matrix)
CREATE TABLE public.material_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    quarry_id UUID NOT NULL REFERENCES public.quarries(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE RESTRICT,
    price_per_unit NUMERIC(18, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_material_price_dates CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- 2. Heavy Fleet Haulage Rates (By Quarry, Destination & Truck Type)
CREATE TABLE public.haulage_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    quarry_id UUID NOT NULL REFERENCES public.quarries(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE RESTRICT,
    truck_type_id UUID NOT NULL REFERENCES public.truck_types(id) ON DELETE RESTRICT,
    rate_per_trip NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    rate_per_tonne NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    minimum_tonnage NUMERIC(8, 2) NOT NULL DEFAULT 30.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_haulage_rate_dates CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- 3. Automated Quarry Loading & Weighbridge Charges
CREATE TABLE public.loading_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    quarry_id UUID NOT NULL REFERENCES public.quarries(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
    charge_per_tonne NUMERIC(18, 2) NOT NULL DEFAULT 500.00,
    charge_per_trip NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_loading_charge_dates CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- 4. Customer-Specific Negotiated Material Prices (Overrides Base Rate)
CREATE TABLE public.customer_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    quarry_id UUID NOT NULL REFERENCES public.quarries(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE RESTRICT,
    special_price_per_unit NUMERIC(18, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_to TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_customer_price_dates CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- 5. Promotional Sourcing Prices (Dedicated Table with Effective Date Window)
CREATE TABLE public.promotional_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    quarry_id UUID REFERENCES public.quarries(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    promo_price_per_unit NUMERIC(18, 2),
    discount_percentage NUMERIC(6, 2),
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_to TIMESTAMPTZ NOT NULL,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_promo_price_dates CHECK (effective_to > effective_from)
);

-- 6. Volume Tiered Discounts
CREATE TABLE public.discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    discount_type public.discount_type NOT NULL DEFAULT 'PERCENTAGE',
    value NUMERIC(10, 2) NOT NULL, -- e.g. 5.00 for 5% or 10000.00 for fixed Naira
    min_quantity_tonnes NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    max_quantity_tonnes NUMERIC(10, 2),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_discount_dates CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- 7. Macro Fuel Surcharges & Adjustments
CREATE TABLE public.fuel_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    percentage_surcharge NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_to TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_fuel_adj_dates CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- Performance Indexes
CREATE INDEX idx_material_prices_query ON public.material_prices(quarry_id, material_id, is_active);
CREATE INDEX idx_haulage_rates_query ON public.haulage_rates(quarry_id, destination_id, truck_type_id, is_active);
CREATE INDEX idx_loading_charges_query ON public.loading_charges(quarry_id, material_id, is_active);
CREATE INDEX idx_customer_prices_query ON public.customer_prices(customer_id, quarry_id, material_id, is_active);
CREATE INDEX idx_promotional_prices_query ON public.promotional_prices(quarry_id, material_id, is_active);
CREATE INDEX idx_discount_rules_query ON public.discount_rules(is_active, min_quantity_tonnes);
