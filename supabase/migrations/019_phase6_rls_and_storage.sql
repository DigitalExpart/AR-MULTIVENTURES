-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 019: PHASE 6 RLS HARDENING & PRIVATE STORAGE
-- Row Level Security for Receipts, Gateway Attempts, Bank Accounts & Payment Proofs
-- ============================================================================

-- 1. Enable RLS on all new Phase 6 tables
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_note_items ENABLE ROW LEVEL SECURITY;

-- 2. Receipts RLS
-- Customers can view their own receipts; staff with finance permissions can view all
CREATE POLICY "Customer can view own receipts" ON public.receipts
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('reports.view')
        OR public.has_permission('payments.confirm')
    );

-- Block direct client writes; must route through generate_payment_receipt or process_verified_payment
CREATE POLICY "Block direct client receipt insertions" ON public.receipts
    FOR INSERT WITH CHECK (false);

CREATE POLICY "Block direct client receipt updates" ON public.receipts
    FOR UPDATE USING (false);

CREATE POLICY "Block direct client receipt deletes" ON public.receipts
    FOR DELETE USING (false);

-- 3. Company Bank Accounts RLS
-- Active accounts are viewable by any authenticated user for checkout/deposit purposes
CREATE POLICY "Authenticated users can view active bank accounts" ON public.company_bank_accounts
    FOR SELECT USING (
        is_active = true
        OR public.has_permission('payments.confirm')
        OR public.has_permission('settings.manage')
    );

CREATE POLICY "Finance management can manage company bank accounts" ON public.company_bank_accounts
    FOR ALL USING (
        public.has_permission('settings.manage')
        OR public.has_permission('payments.confirm')
    );

-- 4. Payment Attempts RLS
-- Customer can view own attempts; staff can view
CREATE POLICY "Customer can view own payment attempts" ON public.payment_attempts
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('reports.view')
        OR public.has_permission('payments.confirm')
    );

-- Client cannot directly insert/mutate attempt rows without RPC
CREATE POLICY "Block direct client attempt mutations" ON public.payment_attempts
    FOR INSERT WITH CHECK (false);

CREATE POLICY "Block direct client attempt updates" ON public.payment_attempts
    FOR UPDATE USING (false);

-- 5. Webhook Events RLS
-- Strictly service role / backend only. Direct client access is completely blocked.
CREATE POLICY "Block client access to webhook events" ON public.payment_webhook_events
    FOR ALL USING (false);

-- 6. Credit Notes & Items RLS
CREATE POLICY "Customer can view own credit notes" ON public.credit_notes
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('reports.view')
        OR public.has_permission('payments.confirm')
    );

CREATE POLICY "Staff can manage credit notes" ON public.credit_notes
    FOR ALL USING (public.has_permission('payments.confirm'));

CREATE POLICY "Credit note items viewable by note viewer" ON public.credit_note_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.credit_notes cn
            WHERE cn.id = credit_note_id
              AND (
                  cn.customer_id IN (SELECT public.get_user_customer_ids())
                  OR public.has_permission('reports.view')
                  OR public.has_permission('payments.confirm')
              )
        )
    );

-- 7. Debit Notes & Items RLS
CREATE POLICY "Customer can view own debit notes" ON public.debit_notes
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('reports.view')
        OR public.has_permission('payments.confirm')
    );

CREATE POLICY "Staff can manage debit notes" ON public.debit_notes
    FOR ALL USING (public.has_permission('payments.confirm'));

CREATE POLICY "Debit note items viewable by note viewer" ON public.debit_note_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.debit_notes dn
            WHERE dn.id = debit_note_id
              AND (
                  dn.customer_id IN (SELECT public.get_user_customer_ids())
                  OR public.has_permission('reports.view')
                  OR public.has_permission('payments.confirm')
              )
        )
    );

-- 8. Storage Configuration for Bank Transfer Proofs ('payment-proofs')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs',
    'payment-proofs',
    false, -- Private bucket: Signed URLs only
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

-- Storage RLS: Customers can upload into customer-scoped folder and read own proofs
DO $$ BEGIN
    CREATE POLICY "Customer upload own payment proof" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'payment-proofs'
            AND auth.role() = 'authenticated'
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Customer and Accounts view payment proof" ON storage.objects
        FOR SELECT USING (
            bucket_id = 'payment-proofs'
            AND (
                auth.role() = 'authenticated'
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;
