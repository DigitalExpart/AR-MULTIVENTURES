# AR Multiventures — Backend Security, RBAC & RLS Architecture

## 1. Authentication & Identity Management

- **Identity Provider:** Supabase Auth (`auth.users`).
- **Profile Association:** Application profile data resides in `public.profiles`, with a strict foreign key reference to `auth.users(id)`.
- **Public Registration Isolation:** Public registration through the portal automatically provisions a `CUSTOMER` role only. Internal administrative, dispatcher, and quarry officer roles must be provisioned securely via database scripts or Super Admin operations.
- **Client Security:** Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are exposed to the web client. The `SUPABASE_SERVICE_ROLE_KEY` is strictly reserved for server-side Edge Functions and never committed or included in client bundles.

---

## 2. Role-Based Access Control (RBAC) Matrix

| System Role | Code | Key Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | `SUPER_ADMIN` | Full tenant, security, audit log, and role management capabilities across the organization. |
| **Management** | `MANAGEMENT` | View operational analytics, financial statements, manage contractor accounts, and review audit logs. |
| **Sales Officer** | `SALES` | Create customer accounts, configure negotiated `customer_prices`, set up requisitions, and review order drafts. |
| **Accounts / Finance** | `ACCOUNTS` | Verify customer payments, manage credit limits, generate invoices, audit billing records. |
| **Operations Manager** | `OPERATIONS` | Approve requisitions, schedule loading bay slots, coordinate haulage carriers, track deliveries. |
| **Quarry Officer** | `QUARRY_OFFICER` | View loading bay queues, record weighbridge tickets, update quarry-material stock availability. |
| **Dispatcher** | `DISPATCHER` | Assign haulage fleet tippers, update transit checkpoints, record arrival timestamps. |
| **Customer / Contractor** | `CUSTOMER` | Submit material requisitions, track active haulage shipments, view invoices/receipts, manage delivery sites. |

---

## 3. Row-Level Security (RLS) Implementation

RLS is enabled on **100% of application tables**. Security is enforced at the database engine level, guaranteeing zero unauthorized data access even if queries are issued directly to the Supabase PostgREST API.

### Key RLS Policies

```sql
-- Customer Account Isolation Example
CREATE POLICY "Customer can view only own requisitions" ON public.requisitions
    FOR SELECT USING (
        customer_id IN (SELECT public.get_user_customer_ids())
        OR public.has_permission('requisitions.view')
    );

-- Preventing Customer Price Tampering
CREATE POLICY "Customer can insert own requisition in DRAFT or SUBMITTED state" ON public.requisitions
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT public.get_user_customer_ids())
        AND status IN ('DRAFT', 'SUBMITTED')
    );

-- Strict Pricing Table Protection
CREATE POLICY "Staff with pricing.manage can manage prices" ON public.material_prices
    FOR ALL USING (public.has_permission('pricing.manage'));
```

---

## 4. Security Definer Helper Functions

To eliminate recursive RLS lookups and provide optimal execution speed, helper functions are implemented with explicit `SECURITY DEFINER` and hardened search paths:

- `public.is_super_admin()`: Verifies if `auth.uid()` has `is_super_admin = true`.
- `public.get_auth_user_org_id()`: Returns the organization UUID of `auth.uid()`.
- `public.has_role(role_code text)`: Returns true if the user possesses the specified role.
- `public.has_permission(perm_code text)`: Returns true if any of the user's roles contains the permission.
- `public.get_user_customer_ids()`: Returns the set of customer IDs linked to `auth.uid()`.

*Security Rule:* All security definer functions specify `SET search_path = public, auth` to prevent search-path hijacking.

---

## 5. Supabase Storage Architecture

Proposed bucket isolation for future phases:

| Bucket Name | Access Level | Allowed File Types | Max Size | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `public-brand` | Public Read | JPEG, PNG, SVG, WebP | 2 MB | Logos, marketing hero imagery |
| `avatars` | Authenticated Read/Write | JPEG, PNG, WebP | 2 MB | User profile avatars |
| `customer-documents` | Private (RLS Enforced) | PDF, JPEG, PNG | 10 MB | Corporate CAC certificates, tax ID slips |
| `weighbridge-tickets` | Private (RLS Enforced) | PDF, JPEG, PNG | 5 MB | Digital weighbridge slips & scale printouts |
| `delivery-signatures` | Private (RLS Enforced) | PNG, WebP | 2 MB | Site engineer recipient digital signatures |
| `invoices-receipts` | Private (RLS Enforced) | PDF | 5 MB | Generated PDF invoices and tax receipts |

---

## 6. Realtime Security Channels

Realtime subscriptions are restricted to relevant business tables to conserve server resources and maintain tenant boundaries:
- `public:requisitions:customer_id=eq.{id}` (Live status transitions)
- `public:notifications:recipient_user_id=eq.{id}` (In-app operational alerts)
