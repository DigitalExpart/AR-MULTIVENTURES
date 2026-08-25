-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 006: DESTINATIONS & DESTINATION REQUESTS
-- Standardized Geographic Zones and Customer Site Registration
-- ============================================================================

-- Standardized Delivery Destinations & Regional Zones
CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area_zone VARCHAR(100), -- e.g. "Lagos Island", "Ikeja Industrial", "Epe Corridor"
    address_description TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_destination_org_code UNIQUE (organization_id, code)
);

-- Customer Requests for New Sourcing Destination Locations
CREATE TABLE public.destination_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    requested_name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    full_address TEXT NOT NULL,
    landmark TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    site_contact_name VARCHAR(100) NOT NULL,
    site_contact_phone VARCHAR(50) NOT NULL,
    status public.destination_request_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX idx_destinations_org ON public.destinations(organization_id);
CREATE INDEX idx_destinations_state_city ON public.destinations(state, city);
CREATE INDEX idx_destination_requests_customer ON public.destination_requests(customer_id);
CREATE INDEX idx_destination_requests_status ON public.destination_requests(status);
