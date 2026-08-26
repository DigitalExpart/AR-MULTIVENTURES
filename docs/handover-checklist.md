# AR MULTIVENTURES — PROJECT HANDOVER & ASSET TRANSFER CHECKLIST

**Project:** AR Multiventures Integrated Logistics Platform  
**Target Recipient:** AR Multiventures Limited (Executive & Technical Leadership)  
**Security Standard:** Credentials and secret API keys must be transferred via secure 1Password / encrypted channel, never written directly into repository markdown.

---

## 1. Digital Assets & Ownership Transfer Register

| Asset / Component | Source / Host | Transfer Method | Status |
|---|---|---|---|
| **Source Code Repository** | GitHub (`DigitalExpart/AR-MULTIVENTURES`) | Transfer repo ownership or add client GitHub Org as Admin. | `READY` |
| **Production Web Hosting** | Vercel Pro | Transfer Vercel project to client team account. | `READY` |
| **Backend Database & Auth** | Supabase Pro | Transfer organization ownership to client billing email. | `PENDING CLIENT ACCOUNT` |
| **Mobile Build & Updates** | Expo / EAS | Transfer EAS project ownership to client Expo organization. | `READY` |
| **Payment Gateway** | Paystack (Nigeria) | Client provisions merchant account; development team links TEST/LIVE keys. | `TEST MODE READY` |
| **Domain & DNS** | DNS Registrar (e.g. Namecheap / Cloudflare) | Client creates CNAME record for `portal.armultiventures.com`. | `PENDING CLIENT DNS` |
| **Database Migrations** | 26 SQL Migrations (`supabase/migrations/`) | Version-controlled in repository; applied via `supabase db push`. | `READY` |
| **Edge Functions** | Deno TypeScript (`supabase/functions/`) | Deployed to client's Supabase project. | `READY` |
| **Storage Buckets** | Supabase Storage (`5 Buckets`) | Configured with RLS policies in migration `023`. | `READY` |
| **Documentation Suite** | Markdown (`docs/`) | Complete deployment, UAT, user guides, and training manuals. | `COMPLETE` |

---

## 2. Secure Credential Exchange Matrix

| Credential Category | Managed In | Account Owner | Secure Recipient |
|---|---|---|---|
| **Supabase Database Password** | Supabase Dashboard | Client Organization Admin | Lead Backend Engineer |
| **Supabase Service Role Key** | Supabase API Settings | Client Organization Admin | CI/CD Secret Store |
| **Paystack Live Secret Key** | Paystack Dashboard | Client Merchant Director | Supabase Edge Function Secrets |
| **Super Admin Root Account** | Supabase Auth GoTrue | AR Multiventures Managing Director | Managing Director |
| **Vercel Deployment Tokens** | Vercel Account Settings | Client DevOps Lead | GitHub Actions Secret |

---

## 3. Handover Acceptance Sign-Off

- [ ] Complete source code transferred and builds verified.
- [ ] Database schema and 26 migrations validated on client Supabase.
- [ ] Paystack test payment verified end-to-end.
- [ ] Web application deployed on custom domain with active SSL certificate.
- [ ] Mobile field-test APK installed and verified on client devices.
- [ ] Training sessions conducted for Super Admin, Sales, Accounts, Operations, and Quarry Officers.
