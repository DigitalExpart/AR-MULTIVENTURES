# AR MULTIVENTURES — THIRD-PARTY SERVICES & INFRASTRUCTURE REGISTER

**Document:** Third-Party Vendor Architecture & Cost Responsibility Register  
**Version:** 1.0

---

## 1. Active Infrastructure Services

| Service Name | Purpose | Account Owner | Plan / Cost Responsibility | Status |
|---|---|---|---|---|
| **GitHub** | Source code version control, PR reviews, CI/CD actions. | AR Multiventures Org | Free / Team Plan (Client) | `ACTIVE` |
| **Supabase** | PostgreSQL 15, Auth, Storage, PostgREST API, Edge Functions. | AR Multiventures Org | Pro Plan ($25/mo — Client) | `PENDING CLIENT CREATION` |
| **Vercel** | Edge network web hosting, SSL, automated branch previews. | AR Multiventures Org | Pro Plan ($20/seat/mo — Client) | `READY` |
| **Expo / EAS** | React Native build pipeline, OTA updates, Android APK generator. | AR Multiventures Org | Free / Production Plan (Client) | `READY` |
| **Paystack** | Payment processing (Cards, NIP Bank Transfer, USSD). | AR Multiventures Merchant | 1.5% + ₦100 per transaction capped at ₦2,000 (Client) | `TEST MODE READY` |
| **Custom DNS** | Corporate domain hosting (`portal.armultiventures.com`). | AR Multiventures IT | Domain Registrar fee (Client) | `PENDING CLIENT DNS` |

---

## 2. Future / Optional Phase Extensions

| Service Category | Vendor Candidate | Purpose | Integration Status |
|---|---|---|---|
| **SMS Notifications** | Termii / Twilio | Instant dispatch SMS to site engineers. | `OPTIONAL / FUTURE EXTENSION` |
| **WhatsApp Business** | Infobip / Meta Cloud API | Waybill PDF dispatch and instant delivery alerts. | `OPTIONAL / FUTURE EXTENSION` |
| **IoT Fleet GPS** | Tramigo / Teltonika | Real-time truck telemetry, speed, and geofencing. | `OPTIONAL / FUTURE EXTENSION` |
| **Serial Weighbridge** | Avery Weigh-Tronix / Cardinal | Direct RS232 digital scale indicator integration. | `OPTIONAL / FUTURE EXTENSION` |
