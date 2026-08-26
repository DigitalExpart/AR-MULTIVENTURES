# AR Multiventures — User Acceptance Testing (UAT) Master Plan
**Version:** 9.0  
**Date:** 2026-08-26  

---

## 1. Customer User Scenarios

### UAT-CUST-01: Commercial Requisition Intake & Live Price Quotation
- **Precondition:** Customer registered and logged into Customer Portal (`/app`).
- **Steps:**
  1. Navigate to `/app/requisitions/new`.
  2. Select Quarry (e.g. Abeokuta North Quarry).
  3. Select Aggregate (Granite 3/4", 30 Tonnes).
  4. Select Destination (Lekki Site).
  5. Observe live sticky Price Summary breakdown.
  6. Click Submit Requisition.
- **Expected Result:** Requisition created with reference `REQ-2026-XXXXXX` in `SUBMITTED` status; notification generated.

### UAT-CUST-02: Paystack Gateway Payment & Electronic Receipt
- **Precondition:** Requisition approved by commercial officer with invoice issued.
- **Steps:**
  1. Navigate to `/app/payments`.
  2. Click "Pay Online" on pending invoice.
  3. Complete Paystack card transaction.
- **Expected Result:** Invoice status transitions to `PAID`; electronic receipt `RCT-2026-XXXXXX` generated; financial clearance updated to `CLEARED_CASH`.

---

## 2. Sales Officer Scenarios

### UAT-SALES-01: Commercial Quote Approval
- **Precondition:** Customer submitted requisition.
- **Steps:**
  1. Login as Sales Officer and navigate to `/admin/requisitions`.
  2. Open pending requisition.
  3. Review aggregate unit price, haulage freight, and loading fee.
  4. Click "Approve Commercial Terms".
- **Expected Result:** Requisition transitions to `APPROVED`; customer receives in-app approval notification.

---

## 3. Finance Officer Scenarios

### UAT-FIN-01: Direct Bank Transfer Reconciliation
- **Precondition:** Customer uploaded NIP bank transfer slip for invoice.
- **Steps:**
  1. Navigate to `/admin/finance/payments`.
  2. Filter by "Pending Review".
  3. Inspect deposit slip image and NIP bank reference.
  4. Click "Confirm Receipt & Allocate".
- **Expected Result:** Payment confirmed; invoice marked `PAID`; sub-ledger credited; financial clearance set to `CLEARED_CASH`.

---

## 4. Operations & Dispatcher Scenarios

### UAT-OPS-01: Multi-Trip Assignment & Mission Scheduling
- **Precondition:** Requisition financially cleared (150 Tonnes = 5 Trips of 30T).
- **Steps:**
  1. Navigate to `/admin/operations/dispatch`.
  2. Select order `REQ-2026-000041`.
  3. Schedule 5 trip slots and assign available trucks (`KJA-104-XA`) and drivers (`Ibrahim Musa`).
- **Expected Result:** 5 trips created in `SCHEDULED` status; truck availability set to `ASSIGNED`; driver notified on mobile app.

---

## 5. Quarry Officer Scenarios

### UAT-QRY-01: Weighbridge Gross-Tare Capture & Dispatch
- **Precondition:** Truck arrived at quarry loading bay.
- **Steps:**
  1. Open `/operations/quarry` on rugged tablet.
  2. Check in truck `KJA-104-XA`.
  3. Record Tare Weight ($15.20\text{T}$) and Gross Weight ($45.40\text{T}$).
  4. Verify Net Weight ($30.20\text{T}$) and variance ($+0.20\text{T}$).
  5. Click "Print Weighbridge Ticket & Dispatch".
- **Expected Result:** Scale record saved; trip status set to `DISPATCHED`; truck availability set to `IN_TRANSIT`.

---

## 6. Heavy Tipper Driver Scenarios

### UAT-DRV-01: Delivery Site Offload & Digital POD Signature
- **Precondition:** Driver arrived at customer site with aggregate tipper.
- **Steps:**
  1. Open `/driver` on mobile smartphone.
  2. Tap "Arrived Site".
  3. Offload granite aggregate.
  4. Hand phone to receiving site engineer (Engr. Babatunde Alabi) for touchscreen signature.
  5. Capture offload photo.
  6. Tap "Submit Proof of Delivery".
- **Expected Result:** POD stored in private storage; trip marked `DELIVERED`; truck and driver automatically returned to `AVAILABLE` status; customer order fulfillment updated.
