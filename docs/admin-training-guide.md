# AR MULTIVENTURES — ADMINISTRATOR & STAFF TRAINING GUIDE

**Document:** Administrator System Operation Manual  
**Target Roles:** Super Admin, Management, Sales, Accounts, Operations, Dispatchers.

---

## 1. System Navigation Overview

The AR Multiventures Web Admin portal provides centralized operational modules organized by functional domain:

- **Executive Center:** KPI Dashboards, Revenue Metrics, Fleet Utilization, Tonnage Volume.
- **Commercial Management:** Customers, Master Quarries, Aggregates, Delivery Destinations, Pricing Center (Base Prices, Haulage Rates, Promotions, Customer Custom Rates), Requisition Review & Approvals.
- **Financial Sub-Ledger:** Invoices (Proforma & Tax Invoices), Payments Reconciliation, Bank Transfer Proof Verification, Receipts, Credit Limits, Financial Clearance.
- **Logistics & Fleet Operations:** Truck Fleet Roster, Driver Assignments, Quarry Queue & Weighbridge Operations, Dispatch Board, Delivery Tracking, POD Verification.
- **Management Intelligence:** 14 Standardized Reports with CSV/Excel export, Date Range filtering, and Receivables Aging Analysis.
- **System Administration:** User Provisioning, Role Assignments, System Audit Trail Explorer, Settings.

---

## 2. Standard Operating Procedures (SOP)

### SOP 1: Requisition Commercial Approval
1. Open **Requisitions** from the sidebar.
2. Filter for status `SUBMITTED`.
3. Open requisition detail and review the material, quantity, delivery location, and live calculated pricing breakdown.
4. If special commercial terms apply, adjust unit discount before approving.
5. Click **"Approve Requisition"**. Status moves to `COMMERCIALLY_APPROVED` and a proforma invoice is generated.

### SOP 2: Payment Verification & Financial Clearance
1. Open **Finance** $\rightarrow$ **Payments**.
2. Select pending bank transfer submissions (`PENDING_VERIFICATION`).
3. Inspect uploaded bank deposit slip and verify the transaction session ID against corporate bank statements.
4. Click **"Verify & Confirm Payment"**.
5. The system automatically allocates funds to unpaid invoices, issues an electronic receipt, credits the customer sub-ledger, and grants **Financial Clearance** (`PAYMENT_CLEARED`).

### SOP 3: Weighbridge Scale Recording
1. Open **Operations** $\rightarrow$ **Weighbridge**.
2. When an assigned truck arrives, record the **Tare Weight** on the scale.
3. Once loading finishes, record the **Gross Weight**.
4. The system calculates **Net Weight** and tolerance variance. Click **"Issue Scale Ticket"**.

### SOP 4: Dispatch & Waybill Issuance
1. Open **Operations** $\rightarrow$ **Dispatch Board**.
2. Select loaded trip with validated weighbridge scale ticket.
3. Click **"Dispatch Trip"**. Status updates to `DISPATCHED` / `IN_TRANSIT` and waybill is generated.
