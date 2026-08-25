-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 009: AUDIT LOGS & NOTIFICATIONS
-- Enterprise Security Audit Trail and Operational Notification Foundation
-- ============================================================================

-- Immutable System Security Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g. "REQUISITION_CREATED", "PRICE_MODIFIED", "STATUS_UPDATED"
    entity_type VARCHAR(100) NOT NULL, -- e.g. "requisition", "material_price", "user_role"
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Operational Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g. "ORDER_DISPATCHED", "PAYMENT_CONFIRMED", "PRICE_UPDATE"
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel public.notification_channel NOT NULL DEFAULT 'IN_APP',
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_user_id, is_read);
CREATE INDEX idx_notifications_customer ON public.notifications(customer_id);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
