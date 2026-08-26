# AR MULTIVENTURES — PAYSTACK PAYMENT GATEWAY ACTIVATION RUNBOOK

**Target Gateway:** Paystack Payment Gateway (Nigeria)  
**Current Phase:** TEST MODE INTEGRATION & VERIFICATION  
**Security Notice:** Live activation must remain separate and must only occur after successful test mode UAT.

---

## 1. Test Mode Prerequisites

1. **Paystack Merchant Dashboard:** Access to Paystack Dashboard in **TEST MODE**.
2. **API Keys:** Retrieve:
   - Public Key (`pk_test_...`)
   - Secret Key (`sk_test_...`)
   - Webhook Secret Key

---

## 2. Configuration & Edge Function Deployment

### Step 2.1: Bind Secrets in Supabase
```bash
npx supabase secrets set \
  PAYSTACK_SECRET_KEY="sk_test_..." \
  PAYSTACK_WEBHOOK_SECRET="whsec_..."
```

### Step 2.2: Deploy Payment Edge Functions
```bash
npx supabase functions deploy initialize-payment --no-verify-jwt
npx supabase functions deploy verify-payment --no-verify-jwt
npx supabase functions deploy paystack-webhook --no-verify-jwt
```

### Step 2.3: Configure Webhook URL in Paystack Dashboard
1. Navigate to **Paystack Dashboard** $\rightarrow$ **Settings** $\rightarrow$ **API Keys & Webhooks**.
2. Set **Test Webhook URL** to:
   ```
   https://<PROJECT_REF>.supabase.co/functions/v1/paystack-webhook
   ```
3. Set event triggers for `charge.success`.

---

## 3. End-to-End Test Execution Checklist

| Step # | Verification Action | Expected Outcome | Status |
|---|---|---|---|
| **P1** | Initiate Online Payment | Returns Paystack authorization URL and reference (`AR-PAY-...`). | `PENDING TEST KEY` |
| **P2** | Complete Test Card Payment | Submit Paystack test card `4084 0840 0840 0840` with OTP `123456`. | `PENDING TEST KEY` |
| **P3** | Webhook Reception | Supabase Edge Function logs show `charge.success` with HTTP 200. | `PENDING TEST KEY` |
| **P4** | Idempotency Verification | Duplicate webhook delivery is detected via `paystack_events` table and does not double-post. | `PENDING TEST KEY` |
| **P5** | Sub-ledger Posting | Customer outstanding balance reduced by exact paid amount. | `PENDING TEST KEY` |
| **P6** | Receipt Generation | Official electronic receipt generated with sequential number `RCP-...`. | `PENDING TEST KEY` |
| **P7** | Financial Clearance | Requisition `financial_clearance_status` updates to `PAYMENT_CLEARED`. | `PENDING TEST KEY` |
