-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 020: FLEET & DRIVER MANAGEMENT
-- ============================================================================

-- 1. ENUMS FOR FLEET & DRIVERS
DO $$ BEGIN
    CREATE TYPE truck_ownership_type AS ENUM ('COMPANY', 'CONTRACTOR', 'THIRD_PARTY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE truck_maintenance_status AS ENUM ('OPERATIONAL', 'DUE_FOR_SERVICE', 'UNDER_MAINTENANCE', 'GROUNDED', 'DECOMMISSIONED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE driver_availability_status AS ENUM ('AVAILABLE', 'ASSIGNED_TO_TRIP', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. TRUCKS MASTER TABLE
CREATE TABLE IF NOT EXISTS trucks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    registration_number VARCHAR(50) NOT NULL,
    truck_type VARCHAR(50) NOT NULL DEFAULT 'HEAVY_TIPPER_30T',
    capacity_tonnes NUMERIC(10, 2) NOT NULL DEFAULT 30.00,
    ownership_type truck_ownership_type NOT NULL DEFAULT 'COMPANY',
    contractor_name VARCHAR(255),
    make VARCHAR(100),
    model VARCHAR(100),
    year_of_manufacture INT,
    chassis_number VARCHAR(100),
    engine_number VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    maintenance_status truck_maintenance_status NOT NULL DEFAULT 'OPERATIONAL',
    insurance_expiry DATE,
    roadworthiness_expiry DATE,
    registration_expiry DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_truck_registration UNIQUE (organization_id, registration_number),
    CONSTRAINT chk_truck_capacity_positive CHECK (capacity_tonnes > 0)
);

CREATE INDEX IF NOT EXISTS idx_trucks_org ON trucks(organization_id);
CREATE INDEX IF NOT EXISTS idx_trucks_status ON trucks(is_active, maintenance_status);

-- 3. TRUCK DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS truck_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'INSURANCE', 'ROADWORTHINESS', 'REGISTRATION', 'HACKNEY', 'OTHER'
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    storage_path TEXT NOT NULL,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_truck_docs_truck ON truck_documents(truck_id);

-- 4. TRUCK MAINTENANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS truck_maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL, -- 'ROUTINE_SERVICE', 'TIRE_REPLACEMENT', 'ENGINE_OVERHAUL', 'BRAKE_SYSTEM', 'EMERGENCY_REPAIR'
    description TEXT NOT NULL,
    service_provider VARCHAR(255),
    cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'
    odometer_reading NUMERIC(12, 2),
    performed_by VARCHAR(255),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_truck_maint_truck ON truck_maintenance_records(truck_id);

-- 5. DRIVERS MASTER TABLE
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- Optional linked auth identity for driver mobile portal
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    alternate_phone VARCHAR(30),
    email VARCHAR(255),
    license_number VARCHAR(100) NOT NULL,
    license_category VARCHAR(20) NOT NULL DEFAULT 'CLASS_E', -- Heavy articulated / commercial tipper
    license_expiry DATE NOT NULL,
    assigned_truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    availability_status driver_availability_status NOT NULL DEFAULT 'AVAILABLE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_driver_license UNIQUE (organization_id, license_number)
);

CREATE INDEX IF NOT EXISTS idx_drivers_org ON drivers(organization_id);
CREATE INDEX IF NOT EXISTS idx_drivers_availability ON drivers(availability_status, is_active);
CREATE INDEX IF NOT EXISTS idx_drivers_assigned_truck ON drivers(assigned_truck_id);

-- 6. DRIVER DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'DRIVERS_LICENSE', 'MEDICAL_CERTIFICATE', 'LASDRI_CARD', 'NATIONAL_ID'
    document_number VARCHAR(100),
    expiry_date DATE,
    storage_path TEXT NOT NULL,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_docs_driver ON driver_documents(driver_id);

-- 7. DRIVER TRUCK ASSIGNMENT HISTORY
CREATE TABLE IF NOT EXISTS driver_truck_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ,
    assigned_by UUID REFERENCES profiles(id),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_driver_truck_hist ON driver_truck_assignments(driver_id, truck_id);
