# AR Multiventures — Enterprise Status Taxonomy & Transition Model
**Version:** 9.0  
**Date:** 2026-08-26  

This document defines the authoritative, deterministic status models across all commercial, financial, operational, and fleet entities.

---

## 1. Requisition / Order Lifecycle Status (`order_status`)

| Status | Meaning | Allowed Transitions | Actor / Authorized Role |
|---|---|---|---|
| `DRAFT` | Requisition created by customer/sales, not yet submitted. | `SUBMITTED`, `CANCELLED` | Customer, Sales Officer |
| `SUBMITTED` | Submitted for commercial review and pricing confirmation. | `APPROVED`, `REJECTED`, `CANCELLED` | Customer, Sales Officer |
| `PENDING_APPROVAL` | High-value order requiring secondary executive signoff. | `APPROVED`, `REJECTED` | Executive Admin, Commercial Manager |
| `APPROVED` | Commercial terms verified; awaiting payment / credit clearance. | `FINANCIALLY_CLEARED`, `CANCELLED` | Commercial Manager, Sales Officer |
| `REJECTED` | Commercial terms rejected by approving officer with recorded reason. | *Terminal state* | Commercial Approver |
| `FINANCIALLY_CLEARED` | 100% upfront cash received or trade credit facility validated. | `SCHEDULED`, `DISPATCHED`, `CANCELLED` | Finance Officer, Automatic RPC |
| `SCHEDULED` | Delivery trips planned and scheduled into quarry queues. | `DISPATCHED`, `CANCELLED` | Operations Dispatcher |
| `DISPATCHED` | Heavy tippers loaded and en route to customer destination site. | `IN_TRANSIT`, `DELIVERED` | Quarry Loading Officer |
| `IN_TRANSIT` | One or more active delivery trips moving on highway corridor. | `DELIVERED` | Automatic / Driver Dispatch |
| `DELIVERED` | All planned trips completed and verified with signed POD slips. | `COMPLETED` | Driver POD Submission RPC |
| `COMPLETED` | Requisition fulfilled, sub-ledger reconciled, closed. | *Terminal state* | System Automated RPC |
| `CANCELLED` | Voided prior to loading with recorded cancellation reason. | *Terminal state* | Customer (Draft only), Admin |

---

## 2. Financial Clearance Status (`financial_clearance_status`)

| Status | Meaning | Allowed Transitions | Actor / Rule |
|---|---|---|---|
| `BLOCKED` | Customer account frozen due to overdue debt or credit violation. | `CLEARED_MANAGEMENT_OVERRIDE`, `PENDING_PAYMENT` | System Credit Engine |
| `PENDING_PAYMENT` | Upfront cash customer awaiting gateway payment or bank transfer. | `PAYMENT_UNDER_REVIEW`, `CLEARED_CASH` | Sub-ledger Monitor |
| `PAYMENT_UNDER_REVIEW` | Direct bank transfer slip uploaded; awaiting finance officer verification. | `CLEARED_CASH`, `PENDING_PAYMENT` | Customer Upload / Finance |
| `CLEARED_CASH` | 100% invoice balance confirmed and allocated via Paystack or NIP transfer. | `DISPATCHED` | Automated Payment Webhook / Finance |
| `CLEARED_CREDIT` | Customer has active credit facility with sufficient available limit. | `DISPATCHED` | Automated Credit Evaluation RPC |
| `CLEARED_MANAGEMENT_OVERRIDE` | Executive override granted for critical project with formal justification. | `DISPATCHED` | Managing Director / CFO |

---

## 3. Invoice Status (`invoice_status`)

| Status | Meaning | Allowed Transitions | Actor / Permission |
|---|---|---|---|
| `DRAFT` | Proforma quotation generated during requisition drafting. | `ISSUED`, `CANCELLED` | Billing System |
| `ISSUED` | Official commercial tax invoice issued and posted to customer sub-ledger. | `PARTIALLY_PAID`, `PAID`, `CANCELLED` | Finance Officer |
| `PARTIALLY_PAID` | Partial payment receipt allocated; remaining balance unpaid. | `PAID`, `OVERDUE` | Payment Allocation Engine |
| `PAID` | Invoice balance settled in full (`amount_paid >= total_amount`). | *Terminal state* | Payment Allocation Engine |
| `OVERDUE` | Invoice past due date with remaining outstanding balance. | `PAID`, `CANCELLED` | Automated Nightly Cron |
| `CANCELLED` | Voided invoice credited via Credit Note. | *Terminal state* | Finance Officer (`invoices.manage`) |

---

## 4. Payment Transaction Status (`payment_status`)

| Status | Meaning | Allowed Transitions | Actor / Verification |
|---|---|---|---|
| `INITIATED` | Online payment intent initialized on Paystack; awaiting customer card. | `CONFIRMED`, `FAILED`, `ABANDONED` | Paystack Gateway API |
| `PENDING` | Direct bank transfer submitted; awaiting corporate bank statement match. | `CONFIRMED`, `REJECTED` | Customer Proof Upload |
| `CONFIRMED` | Settled cash received in corporate bank account; electronic receipt issued. | *Terminal state* | Paystack Webhook / Finance Officer |
| `REJECTED` | Invalid bank transfer slip or unverified NIP session ID. | *Terminal state* | Finance Officer |
| `FAILED` | Gateway transaction failed (declined, insufficient funds, network). | *Terminal state* | Paystack Webhook |

---

## 5. Truck Availability Status (`truck_availability_status`)

*Note: Truck Availability is strictly independent from Maintenance Status.*

| Status | Meaning | Allowed Transitions | Actor / System Trigger |
|---|---|---|---|
| `AVAILABLE` | Truck is ready and waiting in depot for mission assignment. | `ASSIGNED`, `UNAVAILABLE`, `INACTIVE` | Dispatcher, Trip POD Completion |
| `ASSIGNED` | Assigned to a specific delivery trip; driver notified. | `AT_QUARRY`, `AVAILABLE`, `UNAVAILABLE` | Dispatcher (`scheduleRequisitionTrips`) |
| `AT_QUARRY` | Truck has checked into quarry gate security. | `LOADING`, `AVAILABLE` | Quarry Security Gate |
| `LOADING` | Truck is under the aggregate loading hopper bay. | `IN_TRANSIT`, `AT_QUARRY` | Loading Bay Operator |
| `IN_TRANSIT` | Scaled, weighbridge ticket issued, and departed quarry on highway. | `DELIVERING`, `AVAILABLE` | Quarry Scale Officer |
| `DELIVERING` | Arrived at customer destination construction site; offloading. | `AVAILABLE` | Driver Mobile Portal |
| `UNAVAILABLE` | Temporarily unavailable (driver absent, logistics stand-down). | `AVAILABLE`, `INACTIVE` | Fleet Manager |
| `INACTIVE` | Permanently decommissioned or contractor lease terminated. | `AVAILABLE` | Fleet Director |

---

## 6. Truck Maintenance Status (`truck_maintenance_status`)

| Status | Meaning | Effect on Dispatch |
|---|---|---|
| `OPERATIONAL` | Vehicle in full mechanical health with valid safety certs. | Allowed for all trips |
| `DUE_FOR_SERVICE` | Routine periodic mileage / date reached; inspection pending. | Allowed for local trips; warning flagged |
| `UNDER_MAINTENANCE` | Vehicle currently in workshop receiving repairs or parts. | **Blocked** from trip assignment |
| `GROUNDED` | Severe mechanical defect or failed roadworthiness test. | **Blocked** from trip assignment |
| `DECOMMISSIONED` | Retired from active fleet operations. | **Blocked** permanently |

---

## 7. Driver Availability Status (`driver_availability_status`)

| Status | Meaning | Allowed Transitions | Actor / Condition |
|---|---|---|---|
| `AVAILABLE` | Driver on duty and eligible for trip dispatch. | `ASSIGNED_TO_TRIP`, `ON_LEAVE`, `SUSPENDED` | Fleet Manager, POD Completion |
| `ASSIGNED_TO_TRIP`| Actively executing an assigned delivery trip. | `AVAILABLE`, `ON_LEAVE` | Dispatcher Assignment |
| `ON_LEAVE` | Authorized annual, sick, or personal leave. | `AVAILABLE` | Fleet Manager |
| `SUSPENDED` | Safety or disciplinary hold; **cannot** receive trips. | `AVAILABLE`, `TERMINATED` | Fleet Director |
| `TERMINATED` | Employment concluded; access revoked. | *Terminal state* | HR / Admin |

---

## 8. Delivery Trip Lifecycle (`trip_status`)

$$\text{PLANNED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{AT\_QUARRY} \longrightarrow \text{LOADING} \longrightarrow \text{DISPATCHED} \longrightarrow \text{IN\_TRANSIT} \longrightarrow \text{DELIVERED}$$

| Status | Meaning | Trigger |
|---|---|---|
| `PLANNED` | Trip slot created for multi-trip order fulfillment. | Order Approval / Scheduling |
| `ASSIGNED` | Truck and driver assigned to the trip slot. | Dispatcher Assigns Truck/Driver |
| `AT_QUARRY` | Driver checked in at quarry check-in queue. | Quarry Officer Gate Scan |
| `LOADING` | Material being loaded at hopper bay. | Loading Officer Hopper Activation |
| `LOADED` | Gross weight verified on weighbridge scale. | Scale Ticket Generation |
| `DISPATCHED` | Gate pass printed; truck departs quarry. | Quarry Dispatch Officer |
| `IN_TRANSIT` | En route on corridor to customer site. | Driver Transit Confirmation |
| `ARRIVED` | Truck arrived at customer construction site. | Driver Site Arrival Tap |
| `DELIVERED` | Aggregate offloaded and POD signed by receiving engineer. | Digital POD Submission |
| `EXCEPTION` | Delivery issue (breakdown, customer site access blocked). | Driver Incident Log |
| `CANCELLED` | Trip slot cancelled prior to quarry departure. | Dispatcher Cancellation |
