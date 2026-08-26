-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 026: PHASE 8 RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_exceptions ENABLE ROW LEVEL SECURITY;

-- 1. NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (
    auth.uid() = user_id
    OR (
        customer_id IS NOT NULL 
        AND customer_id IN (
            SELECT customer_id FROM customer_users WHERE user_id = auth.uid()
        )
    )
    OR public.is_super_admin()
    OR public.has_role('ADMIN')
    OR public.has_role('EXECUTIVE')
    OR public.has_role('OPERATIONS_MANAGER')
);

DROP POLICY IF EXISTS "Users can update own notifications read status" ON notifications;
CREATE POLICY "Users can update own notifications read status"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. NOTIFICATION PREFERENCES POLICIES
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON notification_preferences;
CREATE POLICY "Users can manage own notification preferences"
ON notification_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. OPERATIONAL EXCEPTIONS POLICIES
DROP POLICY IF EXISTS "Staff can view operational exceptions" ON operational_exceptions;
CREATE POLICY "Staff can view operational exceptions"
ON operational_exceptions FOR SELECT
USING (
    public.is_super_admin()
    OR public.has_role('ADMIN')
    OR public.has_role('EXECUTIVE')
    OR public.has_role('OPERATIONS_MANAGER')
    OR public.has_role('SALES_OFFICER')
    OR public.has_role('FINANCE_OFFICER')
);

DROP POLICY IF EXISTS "Staff can resolve operational exceptions" ON operational_exceptions;
CREATE POLICY "Staff can resolve operational exceptions"
ON operational_exceptions FOR UPDATE
USING (
    public.is_super_admin()
    OR public.has_role('ADMIN')
    OR public.has_role('EXECUTIVE')
    OR public.has_role('OPERATIONS_MANAGER')
    OR public.has_role('FINANCE_OFFICER')
);
