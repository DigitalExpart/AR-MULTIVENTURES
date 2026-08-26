# AR Multiventures — Mobile Offline & Synchronization Strategy
**Version:** 9.0 (Architecture Specification)  
**Date:** 2026-08-26  
**Target:** React Native Mobile Client Architecture  

---

## 1. Overview & Network Reality
Heavy aggregate supply operations frequently occur in low-connectivity environments (quarry pits, remote highway corridors, and newly developing construction sites). The mobile architecture must guarantee continuous operation without risking double-posting or financial corruption.

---

## 2. Operation Classification

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE OPERATIONS MATRIX                    │
├───────────────────┬──────────────────────┬──────────────────────┤
│  READ CACHEABLE   │   ONLINE REQUIRED    │  QUEUEABLE WITH CARE │
├───────────────────┼──────────────────────┼──────────────────────┤
│ • Assigned Trips  │ • Paystack Payment   │ • POD Signature Sync │
│ • Quarry Catalog  │ • Bank Transfer Sub. │ • POD Photo Upload   │
│ • Material Specs  │ • Live Price Quotes  │ • Quarry Gate Checkin│
│ • Destination Map │ • Credit Evaluation  │ • Driver Status Step │
│ • Past Invoices   │ • Management Override│                      │
└───────────────────┴──────────────────────┴──────────────────────┘
```

### 2.1 READ CACHEABLE (Stale-While-Revalidate)
- **Data:** Assigned driver trips, quarry loading queues, product catalog, customer delivery addresses.
- **Storage:** Local encrypted key-value store (e.g., `MMKV` or `AsyncStorage`) with a $24\text{-hour}$ TTL.
- **Behavior:** Renders immediately from disk cache upon app launch; synchronizes in the background when connectivity resumes.

### 2.2 ONLINE REQUIRED (Strict Network Guard)
- **Data:** Paystack card charges, direct bank transfer submission, financial credit approval, and new commercial requisition submissions.
- **Behavior:** These operations require authoritative transactional locking on PostgreSQL. If offline, the mobile app presents an explicit **"Network Connection Required for Financial Transactions"** modal and disables the submission CTA.

### 2.3 QUEUEABLE WITH CARE (Idempotent Local Queue)
- **Data:** Digital Proof of Delivery (POD) signatures, offload photos, driver waypoint events (`ARRIVED_SITE`, `CHECKIN_QUARRY`).
- **Storage:** Local SQLite mutation outbox table (`offline_mutation_queue`).
- **Replay Rules:**
  1. Each mutation receives a client-generated UUID `idempotency_key`.
  2. Background worker (`Redux-Persist` / `WorkManager`) drains the outbox sequentially with exponential backoff ($2\text{s}, 4\text{s}, 8\text{s}, \dots, 60\text{s}$).
  3. Image and signature blobs are uploaded to Supabase Storage first; once storage URLs are confirmed, the RPC `record_trip_pod` is triggered.
  4. If the server has already processed the trip (`status == 'DELIVERED'`), duplicate replays are safely ignored (idempotency).
