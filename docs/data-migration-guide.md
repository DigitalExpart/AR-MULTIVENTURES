# AR MULTIVENTURES — MASTER DATA IMPORT & MIGRATION GUIDE

**Document:** Data Import Runbook & CSV Ingestion Specifications  
**Directory:** `docs/import-templates/`

---

## 1. Import Dependency Sequence

Master data must be ingested in strict relational order to prevent foreign key reference failures:

```
1. Organization (AR Multiventures Limited)
   └── 2. Branches (Lagos HQ, Abeokuta Branch, Sagamu Depot)
       ├── 3. Quarries (Abeokuta North, Sagamu Industrial)
       ├── 4. Materials (Granite 3/4", 1/2", 1", Stone Base, Dust, Boulders)
       │   └── 5. Quarry Materials (Available materials per extraction plant)
       ├── 6. Destinations (Approved construction sites & delivery coordinates)
       ├── 7. Truck Types (20T, 30T, 45T capacity definitions)
       ├── 8. Pricing Engine:
       │   ├── 8a. Material Pit-Head Base Prices (`quarry_material_prices`)
       │   ├── 8b. Corridor Haulage Rates (`haulage_rates`)
       │   └── 8c. Promotional & Volume Discounts (`promotions`)
       ├── 9. Customers (Corporate contracting entities)
       │   └── 10. Customer Locations & Delivery Sites (`customer_locations`)
       ├── 11. Trucks (Fleet tippers & articulated trucks)
       └── 12. Drivers (Certified heavy vehicle drivers & truck assignments)
```

---

## 2. Ingestion Methods

### Method A: Direct SQL Migration Script (Recommended for Staging)
Place master inserts in a seed script (e.g. `supabase/seed.sql`) and apply via:
```bash
npx supabase db reset --linked
```

### Method B: CSV Import via Supabase Studio
1. Navigate to **Supabase Studio** $\rightarrow$ **Table Editor**.
2. Select target table in sequence.
3. Click **Insert** $\rightarrow$ **Import data from CSV**.
4. Select corresponding template from `docs/import-templates/`.

---

## 3. Data Integrity & Validation Checks

After ingestion, execute the following SQL sanity queries:
```sql
-- Check total active quarries and materials
SELECT COUNT(*) FROM quarries WHERE is_active = true;
SELECT COUNT(*) FROM materials WHERE is_active = true;

-- Check active corridor haulage rates
SELECT q.name AS quarry, d.name AS destination, h.rate_per_tonne, h.distance_km
FROM haulage_rates h
JOIN quarries q ON q.id = h.quarry_id
JOIN destinations d ON d.id = h.destination_id
WHERE h.is_active = true;

-- Check fleet operational status
SELECT truck_type, maintenance_status, availability_status, COUNT(*)
FROM trucks
GROUP BY truck_type, maintenance_status, availability_status;
```
