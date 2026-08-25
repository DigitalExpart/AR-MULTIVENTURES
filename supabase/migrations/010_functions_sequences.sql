-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 010: FUNCTIONS, SEQUENCES & TRIGGERS
-- Concurrency-Safe Number Generators, Automated Auditing & Auth Hooks
-- ============================================================================

-- 1. Reusable Updated_At Trigger Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach updated_at triggers
CREATE TRIGGER trg_org_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_branch_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profile_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_role_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_quarry_updated_at BEFORE UPDATE ON public.quarries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_material_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_customer_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_destination_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_requisition_updated_at BEFORE UPDATE ON public.requisitions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_req_item_updated_at BEFORE UPDATE ON public.requisition_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Concurrency-Safe Number Generator Sequences
CREATE SEQUENCE IF NOT EXISTS public.customer_account_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.requisition_number_seq START 1;

-- Concurrency-Safe Customer Account Number Generator (e.g. CUS-000001)
CREATE OR REPLACE FUNCTION public.generate_customer_account_number()
RETURNS TEXT AS $$
DECLARE
    next_val BIGINT;
BEGIN
    next_val := nextval('public.customer_account_seq');
    RETURN 'CUS-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Concurrency-Safe Requisition Number Generator (e.g. REQ-2026-000001)
CREATE OR REPLACE FUNCTION public.generate_requisition_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_val BIGINT;
BEGIN
    current_year := TO_CHAR(now(), 'YYYY');
    next_val := nextval('public.requisition_number_seq');
    RETURN 'REQ-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-assign Requisition Number on insert if not provided
CREATE OR REPLACE FUNCTION public.set_requisition_number_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.requisition_number IS NULL OR NEW.requisition_number = '' THEN
        NEW.requisition_number := public.generate_requisition_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_set_requisition_number
BEFORE INSERT ON public.requisitions
FOR EACH ROW EXECUTE FUNCTION public.set_requisition_number_on_insert();

-- 3. Automated Requisition Status Progression & History Logger
CREATE OR REPLACE FUNCTION public.log_requisition_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.requisition_status_history (
            requisition_id,
            previous_status,
            new_status,
            changed_by,
            changed_at,
            reason
        ) VALUES (
            NEW.id,
            NULL,
            NEW.status,
            NEW.created_by,
            now(),
            'Requisition initialized'
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.requisition_status_history (
            requisition_id,
            previous_status,
            new_status,
            changed_by,
            changed_at,
            reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid(),
            now(),
            COALESCE(NEW.notes, 'Status transitioned')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE TRIGGER trg_log_requisition_status
AFTER INSERT OR UPDATE OF status ON public.requisitions
FOR EACH ROW EXECUTE FUNCTION public.log_requisition_status_change();

-- 4. Supabase Auth New User Hook
-- Automatically provisions profile and default CUSTOMER role upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    customer_role_id UUID;
    first_name_val TEXT;
    last_name_val TEXT;
    phone_val TEXT;
    company_val TEXT;
    new_customer_id UUID;
    account_num_val TEXT;
BEGIN
    -- Select default primary organization (AR Multiventures)
    SELECT id INTO default_org_id FROM public.organizations WHERE code = 'ARM-HQ' LIMIT 1;
    IF default_org_id IS NULL THEN
        SELECT id INTO default_org_id FROM public.organizations LIMIT 1;
    END IF;

    -- Extract metadata safely
    first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', 'Valued');
    last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', 'Customer');
    phone_val := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone);
    company_val := COALESCE(NEW.raw_user_meta_data->>'company_name', last_name_val || ' Enterprise');

    -- Create public.profiles record
    INSERT INTO public.profiles (
        id,
        organization_id,
        first_name,
        last_name,
        phone,
        is_active,
        is_super_admin
    ) VALUES (
        NEW.id,
        default_org_id,
        first_name_val,
        last_name_val,
        phone_val,
        true,
        false
    );

    -- Find CUSTOMER role
    SELECT id INTO customer_role_id FROM public.roles WHERE code = 'CUSTOMER' LIMIT 1;
    IF customer_role_id IS NOT NULL AND default_org_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id, organization_id)
        VALUES (NEW.id, customer_role_id, default_org_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Automatically provision a matching Customer Entity if public registration
    IF default_org_id IS NOT NULL THEN
        account_num_val := public.generate_customer_account_number();
        INSERT INTO public.customers (
            organization_id,
            account_number,
            customer_type,
            company_name,
            phone,
            email,
            status,
            created_by
        ) VALUES (
            default_org_id,
            account_num_val,
            'COMPANY',
            company_val,
            COALESCE(phone_val, '+234-000-0000'),
            COALESCE(NEW.email, 'contact@customer.com'),
            'ACTIVE',
            NEW.id
        ) RETURNING id INTO new_customer_id;

        -- Link the user to the customer record
        INSERT INTO public.customer_users (
            customer_id,
            user_id,
            role_in_customer,
            is_primary_contact,
            is_active
        ) VALUES (
            new_customer_id,
            NEW.id,
            'OWNER',
            true,
            true
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Attach Auth Hook Trigger (fires on Supabase Auth user creation)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
