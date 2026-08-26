# AR MULTIVENTURES — MOBILE DEVICE TEST PLAN & RELEASE QA RUNBOOK

**Target Application:** `apps/mobile` (AR Multiventures Mobile)  
**Package Name:** `com.armultiventures.app`  
**Version:** `0.9.0` (Client Field-Test Preview)  
**Supported Platforms:** Android (minSDK 24+), iOS (14.0+)  
**Supported Viewports:** 360dp, 390dp, 430dp, 768dp (Tablet)

---

## 1. Test Environment & Pre-requisites

| Setting | Mock Development Mode | Remote Supabase Mode |
|---|---|---|
| **Environment Flag** | `EXPO_PUBLIC_DATA_PROVIDER=mock` | `EXPO_PUBLIC_DATA_PROVIDER=supabase` |
| **Backend Endpoint** | Local simulated in-memory repository | Hosted Supabase URL (`EXPO_PUBLIC_SUPABASE_URL`) |
| **Auth Provider** | Local JWT & Seed Profiles | Supabase Auth GoTrue (JWT + RLS) |
| **Pricing Engine** | TypeScript Client Quote Simulation | PostgreSQL Server RPC (`calculate_item_pricing`) |
| **Storage Engine** | Local Storage URI / Mock Bucket | Supabase Storage (`pod_signatures`, `pod_photos`) |
| **Visual Indicator** | `DEV MOCK DATA` Amber Banner | None (Production Clean) |

---

## 2. Android APK Sideload & Physical Device Installation

1. **Build Generation:**
   ```bash
   eas build --platform android --profile preview
   ```
2. **Device Sideload:**
   - Transfer generated `.apk` file to physical Android test device via USB, Google Drive, or Expo download QR link.
   - Enable **"Install Unknown Apps"** for the file manager / browser.
   - Install `AR Multiventures (v0.9.0)`.
3. **Launch Verification:**
   - Confirm splash screen displays AR Multiventures brand green background (`#0B6B3A`) and white logo without distortion.
   - Confirm status bar and navigation bars respect device safe area insets.

---

## 3. Customer Experience UAT Test Suites

### Test Suite C1: Authentication & Account Isolation
- **C1.1 (Login with Valid Credentials):** Input `procurement@buildcorp.ng` + password. Verify dashboard renders with company name `BuildCorp Nigeria Limited` and account `CUS-2026-0089`.
- **C1.2 (Keyboard Avoidance):** Tap email and password fields. Confirm virtual software keyboard does not obstruct inputs or the "Sign In" button on 360dp screens.
- **C1.3 (Logout & Cache Erasure):** Tap Profile $\rightarrow$ "Sign Out". Re-login as a different customer account. Verify that zero orders, invoices, or delivery notifications from BuildCorp are visible.

### Test Suite C2: 8-Step Requisition Wizard
- **C2.1 (Step 1 — Quarry Selection):** Select extraction plant (e.g. `Abeokuta North Quarry`). Confirm location and daily tonnage capacity display.
- **C2.2 (Step 2 — Aggregate Selection):** Select aggregate material (e.g. `Granite 3/4"` or `Stone Base`).
- **C2.3 (Step 3 — Quantity & Presets):** Tap quick preset `90T`. Confirm auto-calculation displays `≈ 3 Heavy Tipper Trips (30 Tonnes / Truck)`.
- **C2.4 (Step 4 — Transportation Option):** Select between `AR Multiventures Delivery`, `Quarry Self-Pickup`, or `Haulage Only`.
- **C2.5 (Step 5 — Truck Preference):** Select vehicle configuration (e.g. `Heavy Tipper 30T` or `Articulated 45T`).
- **C2.6 (Step 6 — Destination Handling):** Select from pre-approved saved destinations or tap `Request New Delivery Site / Address` and enter custom address.
- **C2.7 (Step 7 — Schedule & Instructions):** Specify delivery date and site receiving instructions.
- **C2.8 (Step 8 — Price Quote Review):** Verify pit-head base, haulage fee, loading fee, and total commercial price. Tap "Submit Requisition Now".
- **C2.9 (Outcome Confirmation):** Verify authoritative `REQ-` reference number displays with buttons to view order or return to home.

### Test Suite C3: Deliveries & Operational Tracking
- **C3.1 (Fulfillment Progress):** Verify order fulfillment progress bar shows correct percentages (e.g. `60T Delivered of 150T`).
- **C3.2 (Trip Waypoint Tracking):** View active trip details. Verify weighbridge gross, tare, and net weights match waybill.
- **C3.3 (POD Inspection):** View delivered trip. Confirm digital signature and offload photos render clearly.

### Test Suite C4: Commercial Settlements & Invoices
- **C4.1 (Invoice List):** Verify unpaid invoices display total amount and outstanding balance.
- **C4.2 (Large Currency Display):** Verify currency formatting displays cleanly without clipping across values: `₦0.00`, `₦396,000.00`, `₦25,000,000.00`, `₦125,000,000.00`.
- **C4.3 (Bank Wire Instructions):** Confirm corporate bank transfer notice guides user to official accounts without exposing invented data.
- **C4.4 (Deposit Slip Submission):** Submit NIP session ID and attach bank slip proof. Verify invoice status reflects submitted verification.

---

## 4. Driver Companion Experience UAT Test Suites

### Test Suite D1: Shift Dashboard & Active Mission
- **D1.1 (Shift Status):** Confirm active duty status banner (`🟢 ON ACTIVE DUTY`), driver name, and assigned truck registration (`LSR-492-YY`).
- **D1.2 (Active Mission Hero):** Confirm source quarry, delivery site, planned weight, and large **"CONTINUE TRIP ACTIONS →"** button.
- **D1.3 (Privacy & Commercial Isolation):** Audit all driver screens to ensure zero customer credit limits, sub-ledger balances, invoice unit prices, or other drivers' trips are displayed.

### Test Suite D2: Glove-Friendly Lifecycle Progression
- **D2.1 (Step 1 — Quarry Arrival):** Tap `1. CHECK IN AT QUARRY GATE`. Verify state transitions to `AT_QUARRY`.
- **D2.2 (Step 2 — Loading & Weighbridge):** Verify weighbridge scale ticket information (gross, tare, net weight). Tap `2. SCALED & DEPART QUARRY`. State transitions to `DISPATCHED`.
- **D2.3 (Step 3 — Site Arrival):** Tap `3. ARRIVED AT DELIVERY SITE`. State transitions to `ARRIVED`.
- **D2.4 (Telephony Trigger):** Tap `📞 Call Site`. Verify native dialer opens with validated phone number without app crash.

### Test Suite D3: Touchscreen Digital POD & Offload Photos
- **D3.1 (Engineer Details):** Input receiving engineer name, designation, phone, and delivered tonnes.
- **D3.2 (Signature Pad):** Draw signature with stylus or finger. Confirm stroke points record and clear button resets pad.
- **D3.3 (Photo Attachments):** Attach offload site photos. Confirm thumbnails render.
- **D3.4 (Online Submission):** Tap "Submit Digital POD" while online. Confirm trip transitions to `DELIVERED` and truck returns to `AVAILABLE`.

---

## 5. Offline Outbox & Network Resilience Test Suites

### Test Suite O1: Offline POD Staging
- **O1.1 (Airplane Mode Simulation):** Enable Airplane Mode on test device.
- **O1.2 (Offline POD Capture):** Complete POD form and tap "Stage Offline POD".
- **O1.3 (Pending Sync State):** Confirm UI displays:
  - `POD Staged Locally (Offline)`
  - `State: Pending Sync (Trip completion confirmed upon server sync)`
  - Banner: `⚠️ OFFLINE MODE — Actions staged locally`
- **O1.4 (App Restart Persistence):** Force close the app and relaunch. Confirm the staged mutation remains in the persistent outbox with `PENDING` status.

### Test Suite O2: Network Reconnection & Auto-Sync
- **O2.1 (Disable Airplane Mode):** Reconnect device to Wi-Fi / 4G.
- **O2.2 (Sync Trigger):** Tap "Sync Now" or let background network listener trigger `syncPendingMutations()`.
- **O2.3 (Server Confirmation):** Verify mutation state updates to `SYNCED`, pending count drops to 0, and server authoritatively marks trip `DELIVERED`.

---

## 6. Accessibility & Viewport Responsive Matrix

| Viewport | Device Example | Critical Verification Checks | Status |
|---|---|---|---|
| **360 x 640** | Budget Android (Redmi / Galaxy A0x) | No text clipping on 8-step wizard, Naira displays wrap safely, buttons $\ge 48\text{px}$. | `PASS` |
| **390 x 844** | Standard Phone (iPhone 14 / Pixel 7) | Bottom tab bar layout clean, floating order button elevated, modals fully visible. | `PASS` |
| **430 x 932** | Large Phone (iPhone 15 Pro Max / Galaxy S24 Ultra) | High-DPI icons sharp, signature canvas smooth, forms centered. | `PASS` |
| **768 x 1024** | Tablet (iPad / Galaxy Tab) | Split cards balanced, telephony fallback alert displays gracefully when no SIM. | `PASS` |

---

## 7. Defect Severity & Pass/Fail Criteria

- **Blocker (P0):** App crash on launch, data corruption, sensitive financial data leaked to driver view, silent mock fallback in production.
- **Critical (P1):** Signature export fails, offline outbox loses staged mutation on restart, price quote calculation fails without fallback.
- **Major (P2):** Button touch target $< 48\text{px}$, text clipping on large Naira amounts, keyboard covers submit button.
- **Minor (P3):** Styling misalignment, minor spacing variance.

**Release Criterion:** Zero P0 and P1 defects permitted for preview APK generation.
