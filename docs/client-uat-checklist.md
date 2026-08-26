# AR MULTIVENTURES — CLIENT USER ACCEPTANCE TESTING (UAT) CHECKLIST

**Document Version:** 1.0  
**Target Platform:** Web Portal (`apps/web`) & Mobile Companion (`apps/mobile`)  
**Audience:** AR Multiventures Business Stakeholders, Commercial Team, and Testing Officers.

---

## 1. Role: CUSTOMER Testing Scenarios

| Test ID | Scenario Description | Expected Outcome | Pass / Fail |
|---|---|---|---|
| **UAT-CUS-01** | Account Registration & Login | Customer registers and logs into web and mobile app. | [ ] |
| **UAT-CUS-02** | 8-Step Requisition Placement | Selects quarry, aggregate, quantity (e.g. 90T), truck preference, destination, delivery date. Views live price breakdown. | [ ] |
| **UAT-CUS-03** | View Commercial Proforma Invoice | Views generated invoice with breakdown of pit-head, haulage, and loading fee. | [ ] |
| **UAT-CUS-04** | Make Online Payment (Paystack) | Initiates test card payment. Instant confirmation received. | [ ] |
| **UAT-CUS-05** | Submit Bank Transfer Deposit Slip | Enters NIP session ID and attaches receipt image. | [ ] |
| **UAT-CUS-06** | Operational Delivery Tracking | Tracks trip dispatch, weighbridge scale ticket net weight, and driver contact. | [ ] |
| **UAT-CUS-07** | View Digital Proof of Delivery (POD) | Views signed digital POD with site receiving engineer signature and offload photos. | [ ] |
| **UAT-CUS-08** | Customer Account Sub-Ledger Statement | Views running balance, credit utilization, and historical statements. | [ ] |

---

## 2. Role: SALES & COMMERCIAL Testing Scenarios

| Test ID | Scenario Description | Expected Outcome | Pass / Fail |
|---|---|---|---|
| **UAT-SLS-01** | Requisition Commercial Review | Sales reviews customer order and applies special pricing discount if needed. | [ ] |
| **UAT-SLS-02** | Commercial Approval Workflow | Requisition moves from `SUBMITTED` to `COMMERCIALLY_APPROVED`. Proforma generated. | [ ] |
| **UAT-SLS-03** | Customer Price Agreement Management | Sets negotiated per-tonne rate for a specific corporate customer. | [ ] |

---

## 3. Role: ACCOUNTS & FINANCE Testing Scenarios

| Test ID | Scenario Description | Expected Outcome | Pass / Fail |
|---|---|---|---|
| **UAT-ACC-01** | Tax Invoice Generation | System generates official VAT tax invoice from approved requisition. | [ ] |
| **UAT-ACC-02** | Bank Transfer Reconciliation | Accounts verifies uploaded deposit slip and marks payment `CONFIRMED`. | [ ] |
| **UAT-ACC-03** | Payment Allocation | Payment allocated to unpaid invoice, sub-ledger credited, official receipt issued. | [ ] |
| **UAT-ACC-04** | Financial Clearance Grant | Order receives `PAYMENT_CLEARED` or `CREDIT_APPROVED` flag, unlocking dispatch. | [ ] |
| **UAT-ACC-05** | Receivables Aging Report | Invoices grouped accurately into Current, 1-30, 31-60, 61-90, 90+ days aging buckets. | [ ] |

---

## 4. Role: OPERATIONS & FLEET Testing Scenarios

| Test ID | Scenario Description | Expected Outcome | Pass / Fail |
|---|---|---|---|
| **UAT-OPS-01** | Fleet Roster & Vehicle Management | Operations manages truck details, roadworthiness documents, and maintenance status. | [ ] |
| **UAT-OPS-02** | Driver Assignment | Links certified driver to heavy tipper and assigns to scheduled delivery trip. | [ ] |
| **UAT-OPS-03** | Truck Maintenance Logging | Grounds truck for scheduled maintenance. Availability updates to `UNAVAILABLE`. | [ ] |

---

## 5. Role: QUARRY OFFICER Testing Scenarios

| Test ID | Scenario Description | Expected Outcome | Pass / Fail |
|---|---|---|---|
| **UAT-QRY-01** | Truck Gate Check-In | Tipper arrives at quarry dock; officer checks in truck registration. | [ ] |
| **UAT-QRY-02** | Tare Weight Recording | Truck scales empty on weighbridge. Tare weight recorded (e.g. 15.05T). | [ ] |
| **UAT-QRY-03** | Loading & Gross Scale | Loader fills tipper with granite aggregate. Gross weight recorded (e.g. 45.10T). | [ ] |
| **UAT-QRY-04** | Electronic Scale Ticket Generation | System calculates Net Weight (30.05T), verifies variance, and generates scale ticket. | [ ] |

---

## 6. Role: DISPATCHER Testing Scenarios

| Test ID | Scenario Description | Expected Outcome | Pass / Fail |
|---|---|---|---|
| **UAT-DSP-01** | Dispatch Waybill Clearance | Dispatcher reviews weighbridge scale ticket and confirms trip dispatch with waybill. | [ ] |
| **UAT-DSP-02** | Delivery Route Monitoring | Monitors active transit waypoints from quarry to customer site. | [ ] |

---

## 7. Role: DRIVER Mobile Companion Testing Scenarios

| Test ID | Scenario Description | Expected Outcome | Pass / Fail |
|---|---|---|---|
| **UAT-DRV-01** | Shift Home & Mission Overview | Driver views assigned heavy tipper registration and active trip hero card. | [ ] |
| **UAT-DRV-02** | Glove-Friendly Waypoint Progression | Taps large action buttons: *Quarry Check-in* $\rightarrow$ *Depart Quarry* $\rightarrow$ *Arrived Site*. | [ ] |
| **UAT-DRV-03** | Touchscreen POD Signature Capture | Site engineer draws signature on mobile pad. Stroke points record vector SVG. | [ ] |
| **UAT-DRV-04** | Offload Photo Capture | Attaches delivery site offload photos and submits POD. | [ ] |
| **UAT-DRV-05** | Offline Staging & Network Recovery | Completes POD in Airplane mode. Staged as `Pending Sync`. Auto-syncs when online. | [ ] |

---

## 8. Role: MANAGEMENT Executive Testing Scenarios

| Test ID | Scenario Description | Expected Outcome | Pass / Fail |
|---|---|---|---|
| **UAT-MGT-01** | Executive KPI Dashboard | Views real-time revenue, gross margin, fleet utilization rate, and tonnage delivered. | [ ] |
| **UAT-MGT-02** | 14 Management Reports & Export | Views and exports reports to CSV/Excel (Sales, Haulage, Fleet, Aging, Quarry). | [ ] |
| **UAT-MGT-03** | Audit Trail Explorer | Filters immutable system event logs by user, entity type, and timestamp. | [ ] |
