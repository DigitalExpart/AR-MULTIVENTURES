# AR MULTIVENTURES — END-TO-END DEPLOYMENT GUIDE

**Target System:** AR Multiventures Integrated Logistics Platform  
**Target Environment:** Staging / Production  
**Authoritative Repositories:** Web (`apps/web`), Mobile (`apps/mobile`), Database (`supabase/migrations`), Functions (`supabase/functions`).

---

## 1. Deployment Architecture Overview

```
                          [ DNS: portal.armultiventures.com ]
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │         VERCEL EDGE NETWORK           │
                     │       (apps/web — React / SPA)        │
                     └───────────────────┬───────────────────┘
                                         │ HTTPS / REST / Realtime
                                         ▼
                     ┌───────────────────────────────────────┐
                     │        HOSTED SUPABASE PROJECT        │
                     │  ├── PostgreSQL 15 + RLS + PostgREST  │
                     │  ├── Supabase Auth (GoTrue JWT)       │
                     │  ├── Supabase Storage (5 Buckets)     │
                     │  └── Edge Functions (Deno Runtime)    │
                     └───────────────────▲───────────────────┘
                                         │ HTTPS / REST / Storage
                     ┌───────────────────┴───────────────────┐
                     │      EXPO APPLICATION (ANDROID)       │
                     │     (apps/mobile — React Native)      │
                     └───────────────────────────────────────┘
```

---

## 2. Pre-requisites & Required Accounts

1. **GitHub Repository:** `DigitalExpart/AR-MULTIVENTURES` (Main branch).
2. **Supabase Account & Organization:** Provisioned by client with Pro plan (for PITR backups and custom domains).
3. **Vercel Account:** Pro plan for hosting web application.
4. **Expo / EAS Account:** Configured for Android APK / AAB builds.
5. **Paystack Account:** Registered Nigerian corporate merchant account (TEST Mode first).

---

## 3. Step-by-Step Supabase Database & Backend Deployment

### Step 3.1: Link Project via Supabase CLI
```bash
# Login to Supabase CLI
npx supabase login

# Link to client's hosted Supabase project
npx supabase link --project-ref <CLIENT_PROJECT_ID>
```

### Step 3.2: Apply Migrations in Sequence
Apply all 26 ordered SQL migrations from `supabase/migrations/`:
```bash
npx supabase db push
```

### Step 3.3: Verify Schema Objects & Helper Functions
Ensure the following helper functions exist in `public`:
- `is_super_admin(uuid)`
- `is_staff(uuid)`
- `has_role(uuid, text)`
- `calculate_item_pricing(...)`
- `process_commercial_approval(...)`
- `allocate_payment(...)`
- `record_weighbridge_gross(...)`
- `record_weighbridge_tare(...)`
- `complete_delivery_pod(...)`

### Step 3.4: Provision Storage Buckets
Verify that the 5 required buckets are created with private RLS access:
1. `pod-signatures` (Private, size limit 2MB, MIME: `image/svg+xml`, `image/png`)
2. `pod-photos` (Private, size limit 10MB, MIME: `image/jpeg`, `image/png`)
3. `weighbridge-tickets` (Private, size limit 5MB, MIME: `application/pdf`, `image/jpeg`)
4. `payment-proofs` (Private, size limit 5MB, MIME: `image/jpeg`, `application/pdf`)
5. `fleet-documents` (Private, size limit 10MB, MIME: `application/pdf`, `image/jpeg`)

### Step 3.5: Deploy Edge Functions & Set Secrets
Deploy the payment gateway functions:
```bash
# Set Edge Function Secrets
npx supabase secrets set PAYSTACK_SECRET_KEY="sk_test_..." PAYSTACK_WEBHOOK_SECRET="whsec_..."

# Deploy functions
npx supabase functions deploy initialize-payment --no-verify-jwt
npx supabase functions deploy verify-payment --no-verify-jwt
npx supabase functions deploy paystack-webhook --no-verify-jwt
```

---

## 4. Web Application Deployment (Vercel)

### Step 4.1: Project Import
1. In the Vercel Dashboard, import the Git repository: `DigitalExpart/AR-MULTIVENTURES`.
2. **Framework Preset:** Vite
3. **Root Directory:** `apps/web`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`

### Step 4.2: Production Environment Variables
Set the following environment variables in Vercel project settings:
```
VITE_DATA_PROVIDER=supabase
VITE_SUPABASE_URL=https://<CLIENT_PROJECT_ID>.supabase.co
VITE_SUPABASE_ANON_KEY=<CLIENT_PUBLIC_ANON_KEY>
VITE_PAYSTACK_PUBLIC_KEY=pk_test_<CLIENT_PAYSTACK_PUBLIC_KEY>
```

### Step 4.3: Custom Domain & SSL
1. Add custom domain: `portal.armultiventures.com`.
2. Configure DNS CNAME record: `portal.armultiventures.com` $\rightarrow$ `cname.vercel-dns.com`.
3. Vercel will automatically provision a Let's Encrypt SSL/TLS certificate.

---

## 5. Mobile Application Deployment (EAS / Expo)

### Step 5.1: Configure EAS Build
```bash
cd apps/mobile
npx eas login
npx eas project:init
```

### Step 5.2: Set EAS Secret Variables
```bash
npx eas secret:create --scope project --name EXPO_PUBLIC_DATA_PROVIDER --value supabase
npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://<CLIENT_PROJECT_ID>.supabase.co
npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <CLIENT_PUBLIC_ANON_KEY>
```

### Step 5.3: Build Android Field-Test APK
```bash
npx eas build --platform android --profile preview-supabase
```
Distribute generated `.apk` file directly to test devices.

---

## 6. Rollback & Disaster Recovery Procedures

- **Web Frontend Rollback:** In Vercel dashboard, navigate to Deployments $\rightarrow$ Select prior successful deployment $\rightarrow$ Click **"Instant Rollback"**.
- **Database Backup Restoration:** Supabase Pro provides Daily Automated Backups + 7-Day Point-in-Time Recovery (PITR). Restore directly from Supabase Dashboard $\rightarrow$ Database $\rightarrow$ Backups.
