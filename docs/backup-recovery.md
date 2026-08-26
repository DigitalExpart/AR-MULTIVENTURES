# AR Multiventures — Backup & Disaster Recovery Architecture
**Version:** 9.0  
**Date:** 2026-08-26  
**Status:** Architecture Specified — Hosted Verification Pending  

---

## 1. Objectives & SLA Targets
- **Recovery Point Objective (RPO):** $< 5 \text{ minutes}$ (Continuous WAL streaming on Pro tier).
- **Recovery Time Objective (RTO):** $< 30 \text{ minutes}$ for complete database restoration.

---

## 2. Supabase Managed Database Backup Strategy
When deployed to hosted Supabase, the following tier-based protection applies:
1. **Daily Automated Snapshots:** Full physical database dumps retained for 7 to 30 days.
2. **Point-In-Time Recovery (PITR):** Write-Ahead Logging (WAL) enabled on production instances to allow granular rollbacks to any specific second before a catastrophic event or corrupted batch operation.
3. **Migration-Based Schema Recreation:** The complete database state is fully reproducible from source-controlled migrations `001_extensions_and_enums.sql` through `026_phase8_rls.sql`.

---

## 3. Storage & Document Media Backup Strategy
The platform stores high-value operational documents across 3 private buckets:
- `payment-proofs`: Bank transfer deposit slips (NIP).
- `trip-pod-signatures`: Digital signatures from receiving site engineers.
- `trip-pod-photos`: High-resolution delivery site offload photographs.

**Storage Archival Process:**
- Storage bucket replication enabled across secondary cloud regions.
- Metadata and storage paths are transactionally committed to PostgreSQL with signed URL access controls.

---

## 4. Disaster Recovery & Reconstruction Procedure
In the event of a catastrophic regional failure:
1. **Provision New Supabase Instance:** Launch new database in target cloud region.
2. **Apply Migrations in Strict Sequence:**
   ```bash
   supabase db push # Executes migrations 001 through 026
   ```
3. **Restore Data Snapshot:** Restore latest pg_dump or PITR point.
4. **Point DNS & Update Secrets:** Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in deployment environment variables.
5. **Verify Health:** Run `supabase/tests/*_validation.sql` test suites.

*Note: Formal DR restore drills will be executed once AR Multiventures provides client Supabase production credentials.*
