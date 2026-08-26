-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 025: NOTIFICATIONS, PREFERENCES & EXCEPTION CENTER
-- ============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE notification_template_type AS ENUM (
        'REQUISITION_SUBMITTED',
        'REQUISITION_APPROVED',
        'REQUISITION_REJECTED',
        'PAYMENT_REQUIRED',
        'PAYMENT_CONFIRMED',
        'LOADING_SCHEDULED',
        'TRIP_LOADED',
        'TRIP_DISPATCHED',
        'DELIVERY_COMPLETED',
        'POD_AVAILABLE',
        'CREDIT_LIMIT_WARNING',
        'DOCUMENT_EXPIRY_WARNING',
        'LOADING_VARIANCE_ALERT'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE exception_severity AS ENUM ('CRITICAL', 'WARNING', 'INFO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    template_type notification_template_type NOT NULL,
    channel notification_channel NOT NULL DEFAULT 'IN_APP',
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 3. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL,
    template_type notification_template_type NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_channel_template UNIQUE(user_id, channel, template_type)
);

-- 4. OPERATIONAL EXCEPTIONS / ALERT CENTER TABLE
CREATE TABLE IF NOT EXISTS operational_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exception_type VARCHAR(100) NOT NULL,
    severity exception_severity NOT NULL DEFAULT 'WARNING',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    resolution_route TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exceptions_unresolved ON operational_exceptions(is_resolved, severity);

-- 5. RPC: CREATE NOTIFICATION
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_message TEXT,
    p_template_type notification_template_type,
    p_customer_id UUID DEFAULT NULL,
    p_channel notification_channel DEFAULT 'IN_APP',
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id VARCHAR(100) DEFAULT NULL,
    p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id, customer_id, title, message, template_type,
        channel, entity_type, entity_id, link, is_read
    ) VALUES (
        p_user_id, p_customer_id, p_title, p_message, p_template_type,
        p_channel, p_entity_type, p_entity_id, p_link, FALSE
    ) RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: MARK ALL NOTIFICATIONS READ
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id AND is_read = FALSE;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: RESOLVE OPERATIONAL EXCEPTION
CREATE OR REPLACE FUNCTION resolve_operational_exception(
    p_exception_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE operational_exceptions
    SET is_resolved = TRUE,
        resolved_by = auth.uid(),
        resolved_at = NOW(),
        resolution_notes = p_notes
    WHERE id = p_exception_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
