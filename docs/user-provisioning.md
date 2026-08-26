# AR MULTIVENTURES — USER PROVISIONING & RBAC ONBOARDING GUIDE

**Security Policy:** Public user signup is restricted exclusively to the `CUSTOMER` role. All internal operational and administrative accounts must be provisioned by a `SUPER_ADMIN`.

---

## 1. System Roles Matrix

| Role | Portal Access | Core Responsibilities |
|---|---|---|
| `SUPER_ADMIN` | Web Admin | Full system configuration, user provisioning, role assignments, audit log review. |
| `MANAGEMENT` | Web Admin | Executive dashboards, 14 reports, pricing overrides, credit approvals. |
| `SALES` | Web Admin | Customer onboarding, requisition commercial approval, price quote negotiation. |
| `ACCOUNTS` | Web Admin | Invoice generation, bank transfer reconciliation, receipts, financial clearance. |
| `OPERATIONS` | Web Admin | Fleet maintenance, driver roster, trip scheduling, logistics monitoring. |
| `QUARRY_OFFICER` | Web Admin | Quarry gate check-in, loading session management, weighbridge gross/tare capture. |
| `DISPATCHER` | Web Admin | Truck-driver-trip assignments, waybill dispatch, operational tracking. |
| `CUSTOMER` | Web & Mobile | Place requisitions, Paystack checkout, bank proof upload, track deliveries, view PODs. |
| `DRIVER` | Mobile Companion | Glove-friendly mission progression, quarry arrival, site arrival, touchscreen digital POD. |

---

## 2. Internal User Provisioning Runbook

### Step 2.1: Create Supabase Auth User
In Supabase Studio $\rightarrow$ **Authentication** $\rightarrow$ **Users** $\rightarrow$ Click **"Add User"** (or use Admin API):
```sql
-- Creates user identity in auth.users
-- Handled via Supabase Studio or Edge Function
```

### Step 2.2: Assign Role in `user_roles`
```sql
-- Example: Assigning SALES role to internal staff
INSERT INTO public.user_roles (user_id, role_id)
SELECT 'UUID_OF_AUTH_USER', id
FROM public.roles
WHERE name = 'SALES';

-- Example: Linking staff to Profile
UPDATE public.profiles
SET first_name = 'Segun',
    last_name = 'Ogunleye',
    organization_id = 'ORG_UUID_HERE'
WHERE id = 'UUID_OF_AUTH_USER';
```

---

## 3. Customer Self-Registration & Verification

1. Customer registers via Web portal (`/register`) or Mobile app.
2. System automatically creates profile with `role = 'CUSTOMER'` and links to a new or pending `customers` entity.
3. Credit facility remains `NO_CREDIT` with `0` limit until approved by Management.
