# AR MULTIVENTURES — KNOWN LIMITATIONS & ARCHITECTURAL DISCLOSURES

**Document:** Transparent Engineering & Operational Disclosure Register  
**Audit Date:** 2026-08-26

---

## 1. Environment & Infrastructure Dependent Items

| Limitation | Scope | Description & Remediation |
|---|---|---|
| **Remote Database Execution** | Supabase | SQL migrations 001-026 and RPCs have undergone thorough static schema analysis and TypeScript client type generation. Execution against the live hosted Supabase PostgreSQL instance is pending client project credentials. |
| **Paystack Gateway Live Mode** | Payments | Paystack Edge Functions and webhook handlers are fully coded with idempotency checks. End-to-end charge testing requires client Paystack TEST API keys prior to LIVE merchant activation. |
| **Physical Weighbridge RS232 Serial** | Quarry Ops | The current release provides an electronic weighbridge gross/tare/net scale ticket system with tolerance calculation. Automated serial RS232 hardware bridge integration is a future phase enhancement. |
| **Active GPS Hardware Telemetry** | Fleet Tracking | Delivery tracking utilizes driver-reported waypoint progression (`AT_QUARRY` $\rightarrow$ `DISPATCHED` $\rightarrow$ `ARRIVED`). Real-time live satellite GPS map tracking requires external vehicle OBD/GPS tracker hardware integration. |
| **SMS & WhatsApp Gateway** | Alerts | In-app and web notifications are fully active. External SMS / WhatsApp messaging requires third-party API keys (e.g. Termii / Twilio). |
| **Physical Mobile Device Testing** | Mobile App | Mobile codebase compiles with 0 TypeScript errors, passed all 13 unit tests, and is active on Expo Metro dev server. Physical camera and touch digitizer validation is pending client device sideload test. |
