# AR Multiventures — Database Architecture Specification

## 1. Overview & Principles

The AR Multiventures PostgreSQL database serves as the single source of truth for all enterprise operations, customer requisitions, pricing calculations, and haulage logistics.

### Core Design Rules
- **UUID Primary Keys:** All tables use `gen_random_uuid()` as primary keys.
- **Timestamps:** Business events use `TIMESTAMPTZ` (UTC ISO-8601).
- **Financial Precision:** Currency values use `NUMERIC(18, 2)` (no floating-point rounding errors).
- **Tonnage Precision:** Quantities use `NUMERIC(12, 2)`.
- **Concurrency-Safe References:** Customer account numbers (`CUS-000001`) and Requisition numbers (`REQ-YYYY-000001`) use PostgreSQL sequences (`nextval()`) rather than `COUNT(*) + 1`.
- **Commercial Price Snapshots:** Submitted requisitions preserve immutable pricing snapshots (`material_amount_snapshot`, `haulage_amount_snapshot`, `loading_amount_snapshot`, `discount_amount_snapshot`, `total_amount_snapshot`) so historical orders are never mutated when price catalogs change.
- **Soft Deactivation:** Master records (quarries, materials, destinations, pricing rules) use `is_active` flags rather than hard deletion.

---

## 2. Entity Relationship Diagram (ERD)

```
[ organizations ] ──1:N── [ branches ]
       │
       ├──1:N── [ profiles ] (linked to auth.users)
       │              │
       │              ├──1:N── [ user_roles ] ──N:1── [ roles ] ──1:N── [ role_permissions ] ──N:1── [ permissions ]
       │              └──1:N── [ customer_users ] ──N:1── [ customers ]
       │                                                         │
       ├──1:N── [ quarries ] ──1:N── [ quarry_materials ] ──N:1── [ materials ]
       │              │
       │              ├──1:N── [ quarry_operating_hours ]
       │              └──1:N── [ quarry_restrictions ]
       │
       ├──1:N── [ destinations ] ◄──1:N── [ destination_requests ] ──N:1── [ customers ]
       │
       ├──1:N── [ truck_types ]
       │
       ├──1:N── [ material_prices ] (quarry + material + date range)
       ├──1:N── [ haulage_rates ] (quarry + destination + truck_type + date range)
       ├──1:N── [ loading_charges ] (quarry + material + date range)
       ├──1:N── [ customer_prices ] (customer + quarry + material override)
       ├──1:N── [ discount_rules ] (volume tiers / promotions)
       ├──1:N── [ fuel_adjustments ] (macro fuel surcharge)
       │
       └──1:N── [ requisitions ] ──1:N── [ requisition_items ] ──N:1── [ materials ]
                      │
                      ├──1:N── [ requisition_status_history ]
                      └──N:1── [ customer_addresses ] ──N:1── [ customers ]
```

---

## 3. Table Responsibilities

| Table Name | Purpose | Key Constraints |
| :--- | :--- | :--- |
| `organizations` | Tenant / multi-company root entity | `code UNIQUE`, `slug UNIQUE` |
| `branches` | Regional operational branches | `UNIQUE(organization_id, code)` |
| `profiles` | User profile data linked to `auth.users.id` | `PRIMARY KEY REFERENCES auth.users(id)` |
| `roles` | RBAC roles master (`SUPER_ADMIN`, `CUSTOMER`, etc.) | `UNIQUE(code, organization_id)` |
| `permissions` | Granular permission keys (`requisitions.create`, etc.) | `code UNIQUE` |
| `role_permissions` | Junction table for role capability assignments | `UNIQUE(role_id, permission_id)` |
| `user_roles` | User role assignments within an organization | `UNIQUE(user_id, role_id, organization_id)` |
| `customers` | B2B contractor / client business accounts | `account_number UNIQUE`, `credit_limit` |
| `customer_users` | Junction linking user profiles to customer accounts | `UNIQUE(customer_id, user_id)` |
| `customer_contacts` | Key procurement and site personnel | Emergency flag, phone, email |
| `customer_addresses` | Delivery locations and site coordinates | `customer_id FK`, default address flag |
| `quarries` | Certified quarry extraction hubs | Daily loading capacity, coordinates |
| `quarry_operating_hours` | Weekly opening and closing hours by day | `UNIQUE(quarry_id, day_of_week)` |
| `quarry_restrictions` | Axle weight and haulage road limits | `max_truck_weight_tonnes` |
| `materials` | Granite aggregates master catalog | `code UNIQUE`, category check, unit |
| `quarry_materials` | Quarry-specific material stock & availability | `UNIQUE(quarry_id, material_id)` |
| `destinations` | Standardized delivery zones and cities | `UNIQUE(organization_id, code)` |
| `destination_requests` | Customer requests for unregistered sites | Status (`PENDING`, `APPROVED`, `REJECTED`) |
| `truck_types` | Vehicle classification for haulage rating | Capacity in tonnes (e.g. 20T, 30T, 45T) |
| `material_prices` | Base quarry aggregate sourcing rates | Effective date range (`from` - `to`) |
| `haulage_rates` | Heavy fleet haulage tariffs | By quarry + destination + truck type |
| `loading_charges` | Weighbridge and loading bay charges | Per tonne and per trip rates |
| `customer_prices` | Negotiated client-specific rate overrides | Special unit price with date range |
| `promotional_prices` | Temporary promotional aggregate discounts | Date-bounded campaign pricing |
| `discount_rules` | Volume-based and promotional discounts | Min/max tonnage thresholds |
| `fuel_adjustments` | Macro fuel price fluctuation surcharge | Surcharge percentage with date range |
| `requisitions` | Sourcing order headers with price snapshots | Concurrency-safe number, 13-state status |
| `requisition_items` | Multi-item material line records | Unit price snapshot, line total, loaded qty |
| `requisition_status_history` | Complete operational status audit trail | Previous status, new status, actor, timestamp |
| `customer_accounts` | Customer financial sub-ledger account entity | Currency, status, customer link |
| `account_transactions` | Immutable financial sub-ledger (Debits & Credits) | Strict non-negative checks, direct write locked |
| `customer_credit_profiles` | Approved corporate credit facilities | Credit limit, payment period, credit status |
| `invoices` | Official proformas and tax invoices | Invoice number sequence, due date, amount paid |
| `invoice_items` | Frozen invoice line items | Quantity, unit rate, line total |
| `payments` | Customer payment records & bank deposits | Status (`PENDING` -> `CONFIRMED`), bank reference |
| `payment_allocations` | Payment-to-invoice allocation matrix | Allocated amount <= invoice outstanding |
| `credit_overrides` | Management credit facility overrides | Reason, authorized actor, expiration |
| `requisition_financial_clearances` | Operational financial clearance state | `PENDING`, `PAYMENT_CLEARED`, `CREDIT_APPROVED`, `MANAGEMENT_OVERRIDE` |
| `audit_logs` | Immutable security and business audit trail | Actor, action, entity, JSONB old/new values |
| `notifications` | In-app, SMS, email notification queue | Recipient, customer, read status, channel |

---

## 4. Status Machine & Transition Rules

The requisition lifecycle enforces 13 controlled states:
```
[ DRAFT ] ────────► [ SUBMITTED ] ────────► [ APPROVED ]
                            │                      │
                            ▼                      ▼
                     [ REJECTED ]          [ PAYMENT_PENDING ]
                                                   │
                                                   ▼
                                         [ PAYMENT_CONFIRMED ]
                                                   │
                                                   ▼
                                         [ LOADING_SCHEDULED ]
                                                   │
                                                   ▼
                                              [ LOADING ]
                                                   │
                                                   ▼
                                            [ DISPATCHED ]
                                                   │
                                                   ▼
                                             [ DELIVERED ]
                                                   │
                                                   ▼
                                             [ COMPLETED ]

* Note: [ ON_HOLD ] or [ CANCELLED ] can be applied from authorized states by operations.
```
