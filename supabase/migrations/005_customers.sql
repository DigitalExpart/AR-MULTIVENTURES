-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 005: CUSTOMERS & CLIENT ACCOUNTS
-- Normalized Customer Organization, User Association, Contacts & Delivery Locations
-- ============================================================================

-- Customers Master Table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    account_number VARCHAR(50) NOT NULL,
    customer_type public.customer_type NOT NULL DEFAULT 'COMPANY',
    company_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    rc_number VARCHAR(100),
    tax_id VARCHAR(100),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    credit_limit NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    payment_terms_days INTEGER NOT NULL DEFAULT 0,
    status public.customer_status NOT NULL DEFAULT 'ACTIVE',
    preferred_quarry_id UUID REFERENCES public.quarries(id) ON DELETE SET NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_customer_org_account UNIQUE (organization_id, account_number)
);

-- Customer User Linkage (Many-to-Many allowing multiple users per corporate client)
CREATE TABLE public.customer_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_in_customer VARCHAR(50) NOT NULL DEFAULT 'OPERATOR', -- e.g. OWNER, PROCUREMENT_MANAGER, SITE_ENGINEER
    is_primary_contact BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_customer_user UNIQUE (customer_id, user_id)
);

-- Customer Key Contacts / Procurement Personnel
CREATE TABLE public.customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    is_emergency_contact BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer Delivery Addresses & Construction Sites
CREATE TABLE public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL, -- e.g. "Lekki Phase 1 Project Site", "Head Office"
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    landmark TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    site_contact_person VARCHAR(100),
    site_contact_phone VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX idx_customers_org ON public.customers(organization_id);
CREATE INDEX idx_customers_account ON public.customers(account_number);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customer_users_customer ON public.customer_users(customer_id);
CREATE INDEX idx_customer_users_user ON public.customer_users(user_id);
CREATE INDEX idx_customer_contacts_customer ON public.customer_contacts(customer_id);
CREATE INDEX idx_customer_addresses_customer ON public.customer_addresses(customer_id);
