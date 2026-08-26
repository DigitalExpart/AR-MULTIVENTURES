# AR Multiventures — Production Client Configuration Register
**Version:** 9.0  
**Date:** 2026-08-26  
**Purpose:** Comprehensive checklist of authoritative business constants, credentials, and master data required from AR Multiventures before production cutover.

---

## 1. Cloud Infrastructure & Hosting
- [ ] **Supabase Production Project:** Project Reference ID, Hosted Database Connection String, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **Custom Domain & DNS:** Target production domains (e.g., `app.armultiventures.com`, `admin.armultiventures.com`) with Cloudflare/DNS access.
- [ ] **SSL / TLS Certificates:** Automated managed certificates or custom certificate bundles.

---

## 2. Payment Gateway & Corporate Banking
- [ ] **Paystack Production Gateway:**
  - `PAYSTACK_LIVE_PUBLIC_KEY`
  - `PAYSTACK_LIVE_SECRET_KEY`
  - Webhook URL endpoint registration on Paystack dashboard (`https://api.armultiventures.com/v1/webhooks/paystack`)
  - Webhook Secret Key for HMAC signature verification
- [ ] **Official Corporate Bank Accounts (for Direct NIP Bank Transfers):**
  - Account 1: Bank Name, Account Number, Account Name, Branch Code
  - Account 2: Secondary / Collections Bank Account details

---

## 3. Commercial Pricing & Logistics Matrix
- [ ] **Authoritative Quarry Master Data:** Official names, addresses, state/LGA, GPS coordinates, hopper capacities.
- [ ] **Material Master Data:** Official aggregate sizes (3/4", 1/2", stone base, dust, hardcore) and unit measure standards.
- [ ] **Quarry Pit-Head Material Prices:** Base rates (NGN/Tonne) per aggregate per quarry.
- [ ] **Haulage Corridor Tariff Schedule:** Fixed corridor prices (Quarry $\rightarrow$ Destination) for 30-Tonne heavy tippers.
- [ ] **Pit-Head Loading Surcharge:** Rate per tonne for front-end loader hoppers.
- [ ] **Taxation Directives (VAT & WHT):** Official VAT percentage, Withholding Tax deduction policies, and tax invoice wording.

---

## 4. Fleet & Certified Drivers Master Register
- [ ] **Heavy Tipper Registry:** Truck registration numbers, VIN/Chassis numbers, engine numbers, capacity, insurance expiry dates, roadworthiness certs.
- [ ] **Certified Driver Master:** Full legal names, active phone numbers, national driver's license numbers, categories, expiry dates, LASDRI certifications.

---

## 5. Communications & Notification Gateways
- [ ] **Transactional Email (SMTP / Resend / SendGrid):** API keys and verified corporate sending domain (`notifications@armultiventures.com`).
- [ ] **SMS Gateway (Termii / Twilio):** Approved Alphanumeric Sender ID (e.g. `ARMULTIVENT`) and production API key.
- [ ] **WhatsApp Business API:** Meta Business Manager verification and WhatsApp Business phone number.

---

## 6. Corporate Branding & Legal Documents
- [ ] **High-Resolution Vector Logos:** SVG and transparent PNGs for invoices, receipts, and mobile splash screens.
- [ ] **Official Terms of Supply & Commercial Policies:** Standard legal terms and conditions to embed in PDF invoices and delivery notes.
