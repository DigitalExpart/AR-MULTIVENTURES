# AR MULTIVENTURES — FINAL ACCEPTANCE CRITERIA & GOLDEN WORKFLOW SPECIFICATION

**Purpose:** Formal definition of end-to-end operational criteria required for commercial system acceptance.

---

## 1. The Core 18-Step End-to-End Golden Workflow

```
[1. CUSTOMER LOGIN]
        │
        ▼
[2. REQUISITION CREATION] (8-step wizard: Quarry, Material, Quantity, Transport, Truck Type, Dest, Date, Quote)
        │
        ▼
[3. PRICE ENGINE CALCULATION] (7-level hierarchy: Base + Haulage + Loading - Discount)
        │
        ▼
[4. SALES COMMERCIAL APPROVAL] (Requisition status updates to COMMERCIALLY_APPROVED)
        │
        ▼
[5. INVOICE GENERATION] (Proforma / Tax Invoice generated with sequential numbering)
        │
        ▼
[6. PAYMENT / CREDIT SETTLEMENT] (Paystack online card charge OR Bank transfer slip approval OR Approved credit limit)
        │
        ▼
[7. FINANCIAL CLEARANCE] (Clearance status updates to PAYMENT_CLEARED or CREDIT_APPROVED)
        │
        ▼
[8. TRIP SCHEDULING] (Delivery trip planned with target tonnage e.g. 30T)
        │
        ▼
[9. TRUCK & DRIVER ASSIGNMENT] (Truck assigned, driver linked, availability marked ASSIGNED)
        │
        ▼
[10. QUARRY GATE CHECK-IN] (Tipper checks in at extraction plant; status updates to AT_QUARRY)
        │
        ▼
[11. WEIGHBRIDGE TARE SCALE] (Empty vehicle scaled: Tare Weight recorded e.g. 15.05T)
        │
        ▼
[12. LOADING SESSION] (Aggregate loaded into tipper bed; status marked LOADING)
        │
        ▼
[13. WEIGHBRIDGE GROSS SCALE] (Loaded vehicle scaled: Gross Weight e.g. 45.10T, Net Weight 30.05T calculated)
        │
        ▼
[14. WAYBILL DISPATCH] (Dispatcher issues waybill; status updates to DISPATCHED / IN_TRANSIT)
        │
        ▼
[15. SITE ARRIVAL] (Truck reaches customer construction site; status updates to ARRIVED)
        │
        ▼
[16. DIGITAL POD CAPTURE] (Site engineer signs touchscreen pad, attaches offload photos)
        │
        ▼
[17. TRIP COMPLETION & ASSET FREED] (Trip status -> DELIVERED; Truck & Driver return to AVAILABLE)
        │
        ▼
[18. SUB-LEDGER & REPORTING RECONCILIATION] (Account statement balance updated; 14 Management Reports reflect revenue)
```

---

## 2. Quantitative Acceptance Standards

1. **Weighbridge Math Integrity:** Net Weight = Gross Weight - Tare Weight must be accurate to 2 decimal places.
2. **Sub-ledger Balance Consistency:** Customer balance must equal Total Invoices Issued - Total Verified Payments Allocated $\pm$ Debit/Credit Notes.
3. **Asset State Independence:** Completing POD must set `truck.availability_status = 'AVAILABLE'` without altering `truck.maintenance_status` (preserves `DUE_FOR_SERVICE`).
4. **Security & RLS Isolation:** Zero cross-tenant data leakage between customer accounts or driver mission views.
