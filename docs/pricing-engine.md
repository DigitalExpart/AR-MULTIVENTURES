# AR Multiventures — Commercial Pricing Engine Architecture
**Version:** 9.0  
**Date:** 2026-08-26  
**Reference Migration:** `013_pricing_engine_and_rpc.sql`  

---

## 1. Executive Summary & Hierarchy
The AR Multiventures Commercial Pricing Engine calculates deterministic supply quotations and invoices based on a strict **7-level precedence hierarchy**. 

$$\text{Final Line Total} = (\text{Effective Base Unit Price} - \text{Discount}) \times \text{Quantity} + \text{Haulage Total} + \text{Loading Total} + \text{Fuel Surcharge}$$

---

## 2. 7-Level Price Resolution Precedence

```
[Level 1] Active Promotion Campaign Rate (Quarry + Material + Date Window)
   ↓ (if not active / not matching)
[Level 2] Customer-Specific Contract Rate (Customer + Quarry + Material)
   ↓ (if not contracted)
[Level 3] Standard Quarry Pit-Head Price (Quarry + Material)
   ↓
[Level 4] Volume Bulk Discount Deductions (Quantity >= Threshold)
   ↓
[Level 5] Haulage Corridor Tariff Calculation (Quarry → Destination + Vehicle Type)
   ↓
[Level 6] Pit-Head Mechanical Loading Surcharge (Per Tonne)
   ↓
[Level 7] Fuel Surcharge & Dynamic Market Index
```

### Precedence Rules Explained:
1. **Promotional Pricing (`promotional_prices`)**: Checked first. If an active campaign exists for the selected Quarry and Material whose `start_date <= CURRENT_DATE <= end_date` and `is_active = TRUE`, the promo rate takes absolute precedence.
2. **Customer Contract Pricing (`customer_prices`)**: If no promo is active, the system checks whether a custom negotiated agreement exists for this corporate customer on the specific aggregate.
3. **Standard Quarry Price (`material_prices`)**: If neither promo nor customer contract applies, the standard active pit-head price for that quarry is utilized.
4. **Volume Discount (`customer_discounts` / `volume_tiers`)**: Applied as a percentage deduction against the resolved material rate if ordered tonnage exceeds configured tier minimums (e.g. $\ge 500\text{T} \rightarrow 3\%$, $\ge 1,000\text{T} \rightarrow 5\%$).
5. **Haulage Freight Tariff (`haulage_rates`)**: Evaluated for the route corridor (Quarry ID $\rightarrow$ Destination ID) and vehicle type (e.g. 30-Tonne Heavy Tipper). If a fixed corridor rate is configured, it takes precedence over distance-band estimation.
6. **Loading Fee (`loading_rates`)**: Applied per tonne for quarry mechanical front-end loader service.
7. **Fuel Adjustment (`fuel_surcharges`)**: Applied as a percentage modifier to the haulage component when diesel baseline indices fluctuate.

---

## 3. Haulage-Only Logistics Mode
For clients requesting transportation of their own pre-purchased aggregates:
- `transportation_option = 'HAULAGE_ONLY'`
- Material Amount is set to `₦0.00`.
- Commercial Invoice bills only **Haulage Freight** and **Loading Fees**.
- Database constraints in `008_requisitions.sql` and `013_pricing_engine_and_rpc.sql` allow `material_amount_snapshot = 0.00` when `transportation_option = 'HAULAGE_ONLY'`.

---

## 4. Taxation & Accounting Policy (VAT & WHT)
- **Status:** `CLIENT BUSINESS RULE REQUIRED`.
- Tax calculation fields exist in the data model and schema, but tax rates (e.g., 7.5% VAT, 5% WHT) and tax-inclusive vs. tax-exclusive commercial treatment remain **fully configurable** in system settings.
- The engine does **not** hard-code tax assumptions until AR Multiventures provides official written corporate tax directives.
