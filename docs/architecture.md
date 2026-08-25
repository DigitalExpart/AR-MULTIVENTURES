# AR Multiventures — Enterprise Platform Architecture

## 1. Monorepo Overview

This repository is organized as an enterprise-grade monorepo supporting web, mobile, and PostgreSQL/Supabase backend services:

```
ar-multiventures/
├── apps/
│   ├── web/                        # React 19 + TypeScript + Vite + Tailwind CSS Application
│   └── mobile/                     # Reserved for React Native / Expo Mobile Application
│
├── packages/
│   ├── types/                      # Shared TypeScript domain models & Database schema types
│   ├── validation/                 # Shared Zod validation schemas
│   ├── business-logic/             # Shared formatters (₦ Naira, dates), 13 status configs
│   ├── config/                     # Brand metadata, public/sidebar navigation, 9 wizard steps
│   └── api/                        # Repository abstractions, Supabase client & Mock database
│
├── supabase/
│   ├── migrations/                 # PostgreSQL migrations (001 - 012)
│   ├── functions/                  # Supabase Edge Functions (e.g. pricing calculations)
│   ├── seed/                       # Safe development seed data
│   └── policies/                   # Row-Level Security definitions
│
└── docs/
    ├── architecture.md             # System architecture record
    ├── database.md                 # Relational schema & normalization specification
    └── security.md                 # RBAC, RLS policies, and secret management
```

---

## 2. Data Access Layer & Supabase Integration

The UI consumes repository interfaces (`IRequisitionRepository`, `IOrderRepository`, `ICustomerRepository`, `IAuthRepository`, `IResourceRepository`) via `@ar-multiventures/api`.

### Active Provider Selection
The active repository provider is determined by `VITE_DATA_PROVIDER`:
- `VITE_DATA_PROVIDER=supabase`: Direct queries through Supabase JavaScript Client with typed Database row definitions.
- `VITE_DATA_PROVIDER=mock`: Centralized in-memory development database for rapid local frontend testing without network dependencies.

```typescript
// Example usage in UI component or hook:
import { requisitionApi, authApi, customerApi } from '@ar-multiventures/api';

// Works seamlessly in both Mock and Supabase production environments
const requisitions = await requisitionApi.list();
```

---

## 3. PostgreSQL Migration Suite (Phase 2)

| File | Subsystem | Description |
| :--- | :--- | :--- |
| `001_extensions_and_enums.sql` | Core Extensions & Enums | `pgcrypto`, `uuid-ossp`, `order_status` (13 states), `app_role`, `customer_type`, `transportation_option` |
| `002_organizations_profiles.sql` | Multi-Tenant & Auth Identity | `organizations`, `branches`, `profiles` linked to `auth.users(id)` |
| `003_rbac.sql` | Database-backed RBAC | `roles`, `permissions`, `role_permissions`, `user_roles` with stable keys |
| `004_quarries_materials.sql` | Extraction & Materials | `quarries`, `quarry_operating_hours`, `materials`, `quarry_materials` |
| `005_customers.sql` | Customer Accounts | `customers`, `customer_users`, `customer_contacts`, `customer_addresses` |
| `006_destinations.sql` | Delivery Geography | `destinations`, `destination_requests` |
| `007_truck_types_and_pricing.sql` | Pricing Matrix | `truck_types`, `material_prices`, `haulage_rates`, `loading_charges`, `customer_prices`, `discount_rules`, `fuel_adjustments` |
| `008_requisitions.sql` | Order Lifecycle | `requisitions` (with frozen price snapshots), `requisition_items`, `requisition_status_history` |
| `009_audit_notifications.sql` | Audit & Alerts | `audit_logs` (immutable), `notifications` |
| `010_functions_sequences.sql` | Automation & Triggers | Concurrency-safe number generators (`generate_customer_account_number`, `generate_requisition_number`), `set_updated_at`, `handle_new_user` auth hook |
| `011_rls_policies.sql` | Security & RLS | Granular policies with security definers preventing customer tampering and data cross-talk |
| `012_seed_dev.sql` | Development Baseline | Safe initial seed data for AR Multiventures, Abeokuta, Ishiagu, Ibadan, Sagamu quarries, aggregates, truck types, and pricing tariffs |
| `013_pricing_engine_and_rpc.sql` | Pricing Engine & Submission RPC | Server-side deterministic pricing calculator (`calculate_requisition_price`), atomic `submit_requisition`, and `transition_requisition_status` |
| `014_financial_ledger_invoicing.sql` | Financial Sub-Ledger & Invoicing | `customer_accounts`, `account_transactions` (immutable), `invoices`, `invoice_items`, `payments`, `payment_allocations`, `customer_credit_profiles` |
| `015_financial_rpcs_and_clearance.sql` | Financial RPCs & Credit Clearance | Stored procedures for `issue_invoice_for_requisition`, `confirm_payment`, `evaluate_credit_for_requisition`, `get_customer_statement` |
| `016_financial_rls.sql` | Financial RLS Hardening | Strict multi-tenant security policies and total direct client write lockout on `account_transactions` |

---

## 4. Commercial Pricing Precedence Hierarchy

The server-side pricing engine resolves material rates according to strict business precedence:
1. **Valid Customer Negotiated Rate** (`customer_prices` where customer = auth customer, quarry, material, active, within effective date window).
2. **Valid Campaign Promotional Price** (`promotional_prices` where quarry/material match, active, within date window).
3. **Standard Quarry Material Price** (`material_prices` where quarry, material match, active, within date window).
4. **No Price Found** → Returns `requiresReview: true` (Pricing failure / Requires manual operational review).

**Haulage Precedence:**
1. Exact Tariff (`haulage_rates` matching quarry + destination + truck type).
2. General Destination Rate (`haulage_rates` matching quarry + destination).
3. Missing Tariff → Returns `requiresReview: true` (`NO_APPROVED_HAULAGE_TARIFF`). Never invents a rate.

**Loading, Fuel Adjustments & Volume Tier Discounts:**
- **Loading:** Automated weighbridge scale and loading bay fees from `loading_charges`.
- **Fuel Adjustment:** Management-configured percentage surcharge from `fuel_adjustments`.
- **Volume Discounts:** Bulk tier discounts from `discount_rules` (e.g. >=60T, >=100T). Cannot make total negative.

---

## 5. Financial Sub-Ledger & Receivables Convention

The financial sub-ledger (`account_transactions`) is the single authoritative source of financial truth. Balances are derived directly from transactions:

$$\text{Outstanding Receivable} = \sum \text{Debits} - \sum \text{Credits}$$

- **Debits (Customer owes ARM):** Tax Invoices, Debit Notes, Opening Balance Dr.
- **Credits (Customer paid / credit available):** Confirmed Payments, Credit Notes, Opening Balance Cr.
- **Sign Meaning:**
  - Positive balance: Customer owes AR Multiventures.
  - Negative balance: Customer has credit available / overpayment.
- **Document Separation:**
  - `PROFORMA INVOICE`: Non-posting commercial quotation document.
  - `TAX INVOICE`: Authoritative financial posting debiting the customer sub-ledger.
- **Financial Clearance Workflow:**
  - Commercial Approval $\neq$ Loading Authorization.
  - An approved order enters loading only when `financial_clearance_status` is `PAYMENT_CLEARED` (prepaid) or `CREDIT_APPROVED` (credit customer within approved limits).

