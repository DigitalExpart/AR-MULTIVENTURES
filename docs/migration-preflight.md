# AR MULTIVENTURES — DATABASE MIGRATION PREFLIGHT AUDIT

**Audit Date:** 2026-08-26  
**Total Migrations:** 26 SQL Files (`supabase/migrations/001_...` through `026_...`)  
**Audit Scope:** Static analysis of schema objects, dependency ordering, enum definitions, foreign keys, and RLS policies.

---

## 1. Migration Inventory & Execution Sequence

| # | Migration File | Primary Schema Scope | Dependencies |
|---|---|---|---|
| 001 | `001_initial_schema.sql` | Core extensions (UUID, pgcrypto), `organizations`, `branches`, `profiles`, `roles` | Base |
| 002 | `002_quarries_and_materials.sql` | `quarries`, `materials`, `quarry_materials` | `organizations` |
| 003 | `003_destinations_and_pricing.sql` | `destinations`, `haulage_rates`, `quarry_material_prices`, `promotions` | 001, 002 |
| 004 | `004_customer_profiles_and_addresses.sql` | `customers`, `customer_locations`, `customer_custom_prices` | 001, 003 |
| 005 | `005_requisitions.sql` | `requisitions`, `requisition_status` | 001, 002, 004 |
| 006 | `006_requisition_approvals_and_audit.sql` | `requisition_approvals`, `audit_logs` | 005 |
| 007 | `007_pricing_rpc.sql` | PostgreSQL RPC `calculate_item_pricing()` | 002, 003, 004 |
| 008 | `008_commercial_approval_rpc.sql` | PostgreSQL RPC `process_commercial_approval()` | 005, 006, 007 |
| 009 | `009_rls_and_security.sql` | Base RLS policies and `is_staff()`, `is_super_admin()` helpers | 001-008 |
| 010 | `010_financial_subledger_schema.sql` | `financial_subledger`, `customer_balances` | 004 |
| 011 | `011_invoices_and_items.sql` | `invoices`, `invoice_items` | 005, 010 |
| 012 | `012_payments_and_allocations.sql` | `payments`, `payment_allocations` | 010, 011 |
| 013 | `013_customer_credit_management.sql` | `customer_credit_limits`, `credit_requests` | 004, 010 |
| 014 | `014_financial_clearance.sql` | `financial_clearances`, clearance workflow | 005, 011, 012 |
| 015 | `015_financial_rpcs.sql` | Financial RPCs (invoice generation, payment allocation) | 010-014 |
| 016 | `016_phase5_rls_policies.sql` | Financial table RLS enforcement | 010-015 |
| 017 | `017_financial_receipts_and_notes.sql` | `receipts`, `credit_notes`, `debit_notes` | 011, 012 |
| 018 | `018_payment_processing_and_gateway.sql` | `payment_transactions`, `paystack_events`, idempotency | 012, 017 |
| 019 | `019_phase6_rls_and_storage.sql` | Payment proof storage (`payment-proofs`) & RLS | 018 |
| 020 | `020_fleet_and_drivers.sql` | `trucks`, `drivers`, `driver_assignments` | 001 |
| 021 | `021_quarry_loading_and_weighbridge.sql` | `loading_sessions`, `weighbridge_tickets` | 002, 005, 020 |
| 022 | `022_proof_of_delivery_and_tracking.sql` | `delivery_trips`, `proof_of_deliveries` | 020, 021 |
| 023 | `023_phase7_rls_and_storage.sql` | Storage buckets (`pod-signatures`, `pod-photos`, etc.) | 022 |
| 024 | `024_management_reports_and_views.sql` | Materialized views and reporting views | 001-023 |
| 025 | `025_phase8_admin_seed.sql` | Master roles and seed configurations | 001 |
| 026 | `026_phase8_rls.sql` | Final consolidated RBAC RLS policies | 001-025 |

---

## 2. Static Preflight Findings & Identified Remote Risks

### Risk 1: Storage Bucket Existence Pre-requisite
- **Finding:** Migrations `019_phase6_rls_and_storage.sql` and `023_phase7_rls_and_storage.sql` create storage RLS policies against `storage.objects` for bucket IDs: `'payment-proofs'`, `'pod-signatures'`, `'pod-photos'`, `'weighbridge-tickets'`, `'fleet-documents'`.
- **Preflight Recommendation:** In remote Supabase, ensure buckets are initialized via Supabase Studio or migration insert before applying bucket RLS.

### Risk 2: PostgreSQL Extensions
- **Finding:** `001_initial_schema.sql` calls `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` and `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`.
- **Preflight Recommendation:** Both extensions are standard and fully supported on hosted Supabase PostgreSQL 15.

### Risk 3: RLS Dependency on `profiles.id = auth.uid()`
- **Finding:** All RLS policies join against `profiles` via `auth.uid()`.
- **Preflight Recommendation:** When creating users in Supabase Auth GoTrue, the `handle_new_user()` trigger or administrative insert into `public.profiles` is required before user queries succeed.

---

## 3. Remote Validation Status

> [!NOTE]
> **Validation Status:** STATIC SCHEMA AUDIT COMPLETE. Remote execution against the client's hosted Supabase project is pending client project credentials.
