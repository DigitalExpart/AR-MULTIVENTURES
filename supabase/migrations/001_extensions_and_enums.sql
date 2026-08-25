-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 001: EXTENSIONS & ENUMS
-- Phase 2 Database Foundation
-- ============================================================================

-- Enable required cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- System & Application Roles
CREATE TYPE public.app_role AS ENUM (
    'SUPER_ADMIN',
    'MANAGEMENT',
    'SALES',
    'ACCOUNTS',
    'OPERATIONS',
    'QUARRY_OFFICER',
    'DISPATCHER',
    'CUSTOMER'
);

-- Customer Classification Types
CREATE TYPE public.customer_type AS ENUM (
    'INDIVIDUAL',
    'COMPANY',
    'GOVERNMENT',
    'PARTNER'
);

-- Customer Account Status
CREATE TYPE public.customer_status AS ENUM (
    'PENDING_VERIFICATION',
    'ACTIVE',
    'SUSPENDED',
    'INACTIVE'
);

-- Transportation Options
CREATE TYPE public.transportation_option AS ENUM (
    'SELF_PICKUP',
    'SUPPLY_AND_HAULAGE',
    'HAULAGE_ONLY'
);

-- Order / Requisition Lifecycle Status (13 Controlled States)
CREATE TYPE public.order_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'PAYMENT_PENDING',
    'PAYMENT_CONFIRMED',
    'LOADING_SCHEDULED',
    'LOADING',
    'DISPATCHED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
    'ON_HOLD'
);

-- Commercial Payment Status
CREATE TYPE public.payment_status AS ENUM (
    'UNPAID',
    'PENDING',
    'PARTIALLY_PAID',
    'PAID',
    'FAILED',
    'REFUNDED'
);

-- Destination Request Status
CREATE TYPE public.destination_request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

-- Notification Channels
CREATE TYPE public.notification_channel AS ENUM (
    'IN_APP',
    'EMAIL',
    'SMS',
    'WHATSAPP'
);

-- Discount Calculation Types
CREATE TYPE public.discount_type AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'TIERED_VOLUME'
);
