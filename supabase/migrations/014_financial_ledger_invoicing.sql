-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 014: FINANCIAL SUB-LEDGER, INVOICING & CREDIT
-- Phase 5 Financial Architecture Foundation
-- ============================================================================

-- A. Financial Enums
DO $$ BEGIN
    CREATE TYPE public.invoice_type AS ENUM (
        'PROFORMA',
        'INVOICE',
        'TAX_INVOICE'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.invoice_status AS ENUM (
        'DRAFT',
        'ISSUED',
        'PARTIALLY_PAID',
        'PAID',
        'OVERDUE',
        'VOID',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.financial_transaction_type AS ENUM (
        'OPENING_BALANCE_DR',
        'OPENING_BALANCE_CR',
        'INVOICE',
        'DEBIT_NOTE',
        'PAYMENT',
        'CREDIT_NOTE',
        'ADJUSTMENT'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.financial_reference_type AS ENUM (
        'INVOICE',
        'PAYMENT',
        'CREDIT_NOTE',
        'DEBIT_NOTE',
        'REQUISITION',
        'MANUAL'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_method_type AS ENUM (
        'BANK_TRANSFER',
        'PAYSTACK',
        'FLUTTERWAVE',
        'CASH',
        'ACCOUNT_CREDIT',
        'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_record_status AS ENUM (
        'PENDING',
        'CONFIRMED',
        'FAILED',
        'REVERSED',
        'REFUNDED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.customer_credit_status AS ENUM (
        'NO_CREDIT',
        'ACTIVE_CREDIT',
        'SUSPENDED_CREDIT',
        'OVERDUE_LOCKED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.financial_clearance_status AS ENUM (
        'PENDING',
        'PAYMENT_CLEARED',
        'CREDIT_APPROVED',
        'MANAGEMENT_OVERRIDE',
        'BLOCKED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- B. Customer Financial Accounts Shell
CREATE TABLE IF NOT EXISTS public.customer_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE RESTRICT,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    status public.customer_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- C. Financial Transaction Sub-Ledger (Immutable Postings)
CREATE TABLE IF NOT EXISTS public.account_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES public.customer_accounts(id) ON DELETE RESTRICT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    posting_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    transaction_type public.financial_transaction_type NOT NULL,
    reference_type public.financial_reference_type NOT NULL,
    reference_id UUID,
    document_number VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    debit NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_debit_non_negative CHECK (debit >= 0.00),
    CONSTRAINT chk_credit_non_negative CHECK (credit >= 0.00),
    CONSTRAINT chk_transaction_non_zero CHECK (debit > 0.00 OR credit > 0.00),
    CONSTRAINT chk_debit_credit_exclusive CHECK (NOT (debit > 0.00 AND credit > 0.00))
);

CREATE INDEX IF NOT EXISTS idx_acc_txn_customer ON public.account_transactions(customer_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_acc_txn_doc_number ON public.account_transactions(document_number);
CREATE INDEX IF NOT EXISTS idx_acc_txn_ref ON public.account_transactions(reference_type, reference_id);

-- D. Customer Credit Profiles
CREATE TABLE IF NOT EXISTS public.customer_credit_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE RESTRICT,
    credit_status public.customer_credit_status NOT NULL DEFAULT 'NO_CREDIT',
    credit_limit NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    credit_period_days INT NOT NULL DEFAULT 0,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_credit_limit_non_negative CHECK (credit_limit >= 0.00),
    CONSTRAINT chk_credit_period_non_negative CHECK (credit_period_days >= 0)
);

-- E. Invoices (Proforma & Final/Tax Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    requisition_id UUID REFERENCES public.requisitions(id) ON DELETE SET NULL,
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    invoice_type public.invoice_type NOT NULL DEFAULT 'INVOICE',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    subtotal NUMERIC(18, 2) NOT NULL,
    discount_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    loading_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    haulage_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    fuel_adjustment_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(18, 2) NOT NULL,
    amount_paid NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    status public.invoice_status NOT NULL DEFAULT 'ISSUED',
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id, issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_requisition ON public.invoices(requisition_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- F. Invoice Items (Frozen Line Items)
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(32) NOT NULL DEFAULT 'tonnes',
    unit_price NUMERIC(18, 2) NOT NULL,
    line_total NUMERIC(18, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_inv ON public.invoice_items(invoice_id);

-- G. Payments Master
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    payment_reference VARCHAR(64) NOT NULL UNIQUE,
    payment_method public.payment_method_type NOT NULL DEFAULT 'BANK_TRANSFER',
    amount NUMERIC(18, 2) NOT NULL,
    allocated_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status public.payment_record_status NOT NULL DEFAULT 'PENDING',
    bank_reference VARCHAR(128),
    external_reference VARCHAR(128),
    notes TEXT,
    confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_payment_amount_positive CHECK (amount > 0.00),
    CONSTRAINT chk_allocated_within_amount CHECK (allocated_amount <= amount)
);

CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- H. Payment Allocations (Invoice Payment Allocation Matrix)
CREATE TABLE IF NOT EXISTS public.payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    allocated_amount NUMERIC(18, 2) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_allocated_amount_positive CHECK (allocated_amount > 0.00)
);

CREATE INDEX IF NOT EXISTS idx_allocations_payment ON public.payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_allocations_invoice ON public.payment_allocations(invoice_id);

-- I. Credit Notes & Debit Notes
CREATE TABLE IF NOT EXISTS public.credit_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    credit_note_number VARCHAR(64) NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    amount NUMERIC(18, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'ISSUED',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_credit_note_amount_positive CHECK (amount > 0.00)
);

CREATE TABLE IF NOT EXISTS public.debit_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    debit_note_number VARCHAR(64) NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    amount NUMERIC(18, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'ISSUED',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_debit_note_amount_positive CHECK (amount > 0.00)
);

-- J. Management Credit Overrides & Requisition Financial Clearance
CREATE TABLE IF NOT EXISTS public.credit_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    requisition_id UUID NOT NULL REFERENCES public.requisitions(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    override_reason TEXT NOT NULL,
    authorized_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requisition_financial_clearances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    requisition_id UUID NOT NULL UNIQUE REFERENCES public.requisitions(id) ON DELETE RESTRICT,
    clearance_status public.financial_clearance_status NOT NULL DEFAULT 'PENDING',
    cleared_by_payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    cleared_by_override_id UUID REFERENCES public.credit_overrides(id) ON DELETE SET NULL,
    notes TEXT,
    cleared_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sequences for concurrency-safe financial document numbers
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.proforma_number_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.payment_reference_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.credit_note_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.debit_note_seq START WITH 1 INCREMENT BY 1;

-- Functions to generate formatted numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
    v_seq BIGINT := nextval('public.invoice_number_seq');
BEGIN
    RETURN 'INV-' || v_year || '-' || lpad(v_seq::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_proforma_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
    v_seq BIGINT := nextval('public.proforma_number_seq');
BEGIN
    RETURN 'PRO-' || v_year || '-' || lpad(v_seq::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_payment_reference()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
    v_seq BIGINT := nextval('public.payment_reference_seq');
BEGIN
    RETURN 'PAY-' || v_year || '-' || lpad(v_seq::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_credit_note_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
    v_seq BIGINT := nextval('public.credit_note_seq');
BEGIN
    RETURN 'CRN-' || v_year || '-' || lpad(v_seq::TEXT, 6, '0');
END;
$$;
