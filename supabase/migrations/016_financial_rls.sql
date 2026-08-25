-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 016: FINANCIAL ROW-LEVEL SECURITY
-- Phase 5 Financial RLS Hardening & Direct Ledger Write Lockouts
-- ============================================================================

-- Enable RLS on all financial tables
ALTER TABLE public.customer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_credit_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisition_financial_clearances ENABLE ROW LEVEL SECURITY;

-- 1. customer_accounts
CREATE POLICY "Customer can view own financial account" ON public.customer_accounts
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('customers.view')
        OR public.has_permission('reports.view')
    );

CREATE POLICY "Internal staff can manage financial accounts" ON public.customer_accounts
    FOR ALL USING (public.has_permission('customers.manage'));

-- 2. account_transactions (IMMUTABLE SUB-LEDGER)
-- Read: Customers see own transactions, staff with financial view
CREATE POLICY "Customer can view own ledger postings" ON public.account_transactions
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('reports.view')
        OR public.has_permission('payments.confirm')
    );

-- Direct client INSERT/UPDATE/DELETE is strictly BLOCKED. Ledger writes must occur via Security Definer RPCs.
CREATE POLICY "Block direct client ledger mutations" ON public.account_transactions
    FOR INSERT WITH CHECK (false);

CREATE POLICY "Block direct client ledger updates" ON public.account_transactions
    FOR UPDATE USING (false);

CREATE POLICY "Block direct client ledger deletes" ON public.account_transactions
    FOR DELETE USING (false);

-- 3. customer_credit_profiles
CREATE POLICY "Customer can view own credit profile" ON public.customer_credit_profiles
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('customers.view')
    );

CREATE POLICY "Management can modify credit profiles" ON public.customer_credit_profiles
    FOR ALL USING (public.has_permission('customers.manage'));

-- 4. invoices & invoice_items
CREATE POLICY "Customer can view own invoices" ON public.invoices
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('reports.view')
        OR public.has_permission('requisitions.view')
    );

CREATE POLICY "Staff can manage invoices" ON public.invoices
    FOR ALL USING (public.has_permission('requisitions.approve') OR public.has_permission('reports.view'));

CREATE POLICY "Invoice items viewable by invoice viewer" ON public.invoice_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_id
              AND (
                  i.customer_id IN (SELECT public.get_user_customer_ids())
                  OR public.has_permission('reports.view')
                  OR public.has_permission('requisitions.view')
              )
        )
    );

-- 5. payments & payment_allocations
CREATE POLICY "Customer can view own payments" ON public.payments
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('reports.view')
        OR public.has_permission('payments.confirm')
    );

CREATE POLICY "Customer can submit payment record" ON public.payments
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT public.get_user_customer_ids())
        AND status = 'PENDING'
    );

CREATE POLICY "Accounts staff can confirm and manage payments" ON public.payments
    FOR UPDATE USING (public.has_permission('payments.confirm'));

CREATE POLICY "Payment allocations viewable by payment viewer" ON public.payment_allocations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.payments p
            WHERE p.id = payment_id
              AND (
                  p.customer_id IN (SELECT public.get_user_customer_ids())
                  OR public.has_permission('reports.view')
                  OR public.has_permission('payments.confirm')
              )
        )
    );

-- 6. credit_overrides & clearances
CREATE POLICY "Financial clearances viewable" ON public.requisition_financial_clearances
    FOR SELECT USING (true);

CREATE POLICY "Internal staff can view credit overrides" ON public.credit_overrides
    FOR SELECT USING (public.has_permission('requisitions.view'));
