-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 011: ROW LEVEL SECURITY (RLS) POLICIES
-- Enterprise Multi-Tenant & Customer Isolation Security Policies
-- ============================================================================

-- 1. Security Definer Helper Functions (Safe & Non-Recursive)

-- Check if current authenticated user is a platform super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_super_admin = true AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Get organization ID of current authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_user_org_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id
    FROM public.profiles
    WHERE id = auth.uid() AND is_active = true;
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Check if authenticated user has a specific role code
CREATE OR REPLACE FUNCTION public.has_role(role_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF public.is_super_admin() THEN
        RETURN true;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code = role_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Check if authenticated user has a specific permission code
CREATE OR REPLACE FUNCTION public.has_permission(perm_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF public.is_super_admin() THEN
        RETURN true;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = auth.uid()
        AND p.code = perm_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Get all Customer IDs associated with current authenticated user
CREATE OR REPLACE FUNCTION public.get_user_customer_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT customer_id FROM public.customer_users
    WHERE user_id = auth.uid() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- ============================================================================
-- 2. Enable RLS on ALL Application Tables
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarry_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarry_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarry_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truck_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haulage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loading_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisition_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Define Policies
-- ============================================================================

-- --- ORGANIZATIONS & PROFILES ---
CREATE POLICY "Public read for active organizations" ON public.organizations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR public.has_permission('users.manage'));

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- --- RBAC & PERMISSIONS ---
CREATE POLICY "Users can view roles in their organization" ON public.roles
    FOR SELECT USING (organization_id = public.get_auth_user_org_id() OR is_system = true);

CREATE POLICY "Permissions readable by authenticated users" ON public.permissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "User roles readable by owner or admins" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid() OR public.has_permission('users.manage'));

-- --- MASTER CATALOGS (Quarries, Materials, Destinations, Truck Types) ---
-- Public / Authenticated catalog reading for active sourcing options
CREATE POLICY "Active quarries viewable by authenticated users" ON public.quarries
    FOR SELECT USING (is_active = true OR public.has_permission('quarries.manage'));

CREATE POLICY "Quarry hours readable" ON public.quarry_operating_hours
    FOR SELECT USING (true);

CREATE POLICY "Active materials viewable by authenticated users" ON public.materials
    FOR SELECT USING (is_active = true OR public.has_permission('materials.manage'));

CREATE POLICY "Quarry materials viewable" ON public.quarry_materials
    FOR SELECT USING (is_available = true OR public.has_permission('quarries.manage'));

CREATE POLICY "Active destinations viewable by authenticated users" ON public.destinations
    FOR SELECT USING (is_active = true OR public.has_permission('destinations.manage'));

CREATE POLICY "Truck types readable by authenticated users" ON public.truck_types
    FOR SELECT USING (is_active = true OR public.has_permission('fleet.view'));

-- --- PRICING TABLES (Strict Protection: Customer CANNOT Modify) ---
CREATE POLICY "Customers can view standard active prices" ON public.material_prices
    FOR SELECT USING (is_active = true AND (effective_to IS NULL OR effective_to > now()));

CREATE POLICY "Customers can view active haulage rates" ON public.haulage_rates
    FOR SELECT USING (is_active = true AND (effective_to IS NULL OR effective_to > now()));

CREATE POLICY "Customers can view loading charges" ON public.loading_charges
    FOR SELECT USING (is_active = true);

CREATE POLICY "Customers can view their negotiated prices" ON public.customer_prices
    FOR SELECT USING (customer_id IN (SELECT public.get_user_customer_ids()) OR public.has_permission('pricing.manage'));

CREATE POLICY "Customers can view active promotional prices" ON public.promotional_prices
    FOR SELECT USING (is_active = true AND effective_to > now() AND effective_from <= now());

CREATE POLICY "Customers can view active discount rules" ON public.discount_rules
    FOR SELECT USING (is_active = true AND (effective_to IS NULL OR effective_to > now()));

CREATE POLICY "Staff with pricing.manage can manage prices" ON public.material_prices
    FOR ALL USING (public.has_permission('pricing.manage'));

CREATE POLICY "Staff with pricing.manage can manage haulage" ON public.haulage_rates
    FOR ALL USING (public.has_permission('pricing.manage'));

CREATE POLICY "Staff with pricing.manage can manage loading" ON public.loading_charges
    FOR ALL USING (public.has_permission('pricing.manage'));

CREATE POLICY "Staff with pricing.manage can manage customer prices" ON public.customer_prices
    FOR ALL USING (public.has_permission('pricing.manage'));

CREATE POLICY "Staff with pricing.manage can manage promotions" ON public.promotional_prices
    FOR ALL USING (public.has_permission('pricing.manage'));

CREATE POLICY "Staff with pricing.manage can manage discounts" ON public.discount_rules
    FOR ALL USING (public.has_permission('pricing.manage'));

CREATE POLICY "Staff with pricing.manage can manage fuel adjustments" ON public.fuel_adjustments
    FOR ALL USING (public.has_permission('pricing.manage'));

-- --- CUSTOMERS & ADDRESSES (Customer Account Isolation) ---
CREATE POLICY "Customers view own account" ON public.customers
    FOR SELECT USING (
        id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('customers.view')
    );

CREATE POLICY "Staff can manage customers" ON public.customers
    FOR ALL USING (public.has_permission('customers.manage'));

CREATE POLICY "Customers view own users" ON public.customer_users
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('customers.view')
    );

CREATE POLICY "Customers manage own delivery addresses" ON public.customer_addresses
    FOR ALL USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('customers.manage')
    );

CREATE POLICY "Customers create and view destination requests" ON public.destination_requests
    FOR ALL USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('destinations.manage')
    );

-- --- REQUISITIONS & REQUISITION ITEMS (Zero Cross-Customer Data Leakage) ---
CREATE POLICY "Customer can view only own requisitions" ON public.requisitions
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('requisitions.view')
    );

-- Customer can create a DRAFT requisition
CREATE POLICY "Customer can insert own DRAFT requisition" ON public.requisitions
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT public.get_user_customer_ids())
        AND status = 'DRAFT'
    );

-- Customer can ONLY update their own DRAFT requisition; once SUBMITTED, direct row update is forbidden
CREATE POLICY "Customer can update own DRAFT requisition" ON public.requisitions
    FOR UPDATE USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        AND status = 'DRAFT'
    ) WITH CHECK (
        customer_id IN (SELECT public.get_user_customer_ids())
        AND status = 'DRAFT'
    );

-- Staff with requisitions.approve can update requisitions according to workflow
CREATE POLICY "Staff with requisitions.approve can update all requisitions" ON public.requisitions
    FOR UPDATE USING (public.has_permission('requisitions.approve'));

CREATE POLICY "Customer can view items for own requisitions" ON public.requisition_items
    FOR SELECT USING (
        requisition_id IN (
            SELECT id FROM public.requisitions
            WHERE customer_id IN (SELECT public.get_user_customer_ids())
        )
        OR public.has_permission('requisitions.view')
    );

-- Customer can modify items ONLY for own DRAFT requisitions
CREATE POLICY "Customer can modify items for own DRAFT requisitions" ON public.requisition_items
    FOR ALL USING (
        requisition_id IN (
            SELECT id FROM public.requisitions
            WHERE customer_id IN (SELECT public.get_user_customer_ids())
            AND status = 'DRAFT'
        )
    ) WITH CHECK (
        requisition_id IN (
            SELECT id FROM public.requisitions
            WHERE customer_id IN (SELECT public.get_user_customer_ids())
            AND status = 'DRAFT'
        )
    );

CREATE POLICY "Status history viewable by requisition owner or staff" ON public.requisition_status_history
    FOR SELECT USING (
        requisition_id IN (
            SELECT id FROM public.requisitions
            WHERE customer_id IN (SELECT public.get_user_customer_ids())
        )
        OR public.has_permission('requisitions.view')
    );

-- --- AUDIT LOGS (Immutable & Staff-Only View) ---
CREATE POLICY "Audit logs viewable only by authorized staff" ON public.audit_logs
    FOR SELECT USING (public.has_permission('reports.view') OR public.is_super_admin());

-- --- NOTIFICATIONS (Strict User Isolation) ---
CREATE POLICY "Users can only view and update own notifications" ON public.notifications
    FOR ALL USING (recipient_user_id = auth.uid());
