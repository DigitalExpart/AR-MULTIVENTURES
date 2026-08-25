-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 004: QUARRIES & MATERIALS CATALOG
-- Certified Extraction Hubs and Normalized Aggregate Catalog
-- ============================================================================

-- Quarries Master Table
CREATE TABLE public.quarries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    loading_capacity_tonnes_per_day NUMERIC(12, 2) NOT NULL DEFAULT 5000.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_quarry_org_code UNIQUE (organization_id, code)
);

-- Quarry Operating Hours
CREATE TABLE public.quarry_operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quarry_id UUID NOT NULL REFERENCES public.quarries(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
    open_time TIME NOT NULL DEFAULT '06:00:00',
    close_time TIME NOT NULL DEFAULT '18:00:00',
    is_closed BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT uq_quarry_day UNIQUE (quarry_id, day_of_week)
);

-- Quarry Operational Restrictions / Axle Limits
CREATE TABLE public.quarry_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quarry_id UUID NOT NULL REFERENCES public.quarries(id) ON DELETE CASCADE,
    restriction_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    max_truck_weight_tonnes NUMERIC(8, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Centralized Material & Aggregate Master Catalog
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('granite', 'dust', 'sand', 'hardcore')),
    specification VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL DEFAULT 'tonnes',
    density_ton_per_cbm NUMERIC(6, 3),
    min_order_quantity NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_material_org_code UNIQUE (organization_id, code)
);

-- Quarry-Specific Material Availability & Stock Junction Table
CREATE TABLE public.quarry_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quarry_id UUID NOT NULL REFERENCES public.quarries(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE RESTRICT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    current_stock_estimate_tonnes NUMERIC(12, 2) DEFAULT 0.00,
    daily_extraction_capacity_tonnes NUMERIC(12, 2) DEFAULT 1000.00,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_quarry_material UNIQUE (quarry_id, material_id)
);

-- Performance Indexes
CREATE INDEX idx_quarries_org ON public.quarries(organization_id);
CREATE INDEX idx_quarries_state ON public.quarries(state);
CREATE INDEX idx_materials_org ON public.materials(organization_id);
CREATE INDEX idx_materials_category ON public.materials(category);
CREATE INDEX idx_quarry_materials_quarry ON public.quarry_materials(quarry_id);
CREATE INDEX idx_quarry_materials_material ON public.quarry_materials(material_id);
