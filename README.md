# AR MULTIVENTURES
**Integrated Granite Supply, Customer Requisition & Truck Haulage Management System**

> *Global Perspective. Endless Possibilities.*

---

## 🏗️ Overview

AR Multiventures is an enterprise-grade logistics, quarry supply, and haulage management platform engineered for construction contractors, infrastructure developers, and quarry operations across Nigeria.

This platform bridges quarry extraction hubs (Abeokuta, Ishiagu, Ibadan, Sagamu) with multi-tonnage customer requisitions, automated weighbridge ticket tracking, and dedicated heavy tipper haulage fleet dispatch.

---

## 🏛️ Monorepo Architecture

```
ar-multiventures/
├── apps/
│   ├── web/                        # React 19 + TypeScript + Vite + Tailwind CSS Customer Portal
│   └── mobile/                     # Reserved for React Native / Expo Mobile Application
│
├── packages/
│   ├── types/                      # Shared TypeScript domain models (User, Quarry, Requisition, etc.)
│   ├── validation/                 # Shared Zod validation schemas
│   ├── business-logic/             # Shared formatters (₦ Naira, dates), status configs, utilities
│   ├── config/                     # Brand tokens, navigation links, 9-stage requisition steps
│   └── api/                        # Repository abstractions & mock database (Ready for Supabase)
│
├── supabase/                       # Migrations, Edge Functions, Seed data, RLS policies
├── docs/                           # Technical documentation and architecture records
├── package.json                    # Monorepo root workspace configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Installation
```bash
# Install all dependencies across monorepo packages and apps
npm install
```

### Development Server
```bash
# Start the web customer portal
npm run dev
# The application will launch at http://localhost:5173
```

### Type Checking & Building
```bash
# Verify TypeScript strict mode compilation
npm run typecheck

# Build web application bundle
npm run build
```

---

## 🔑 Key Features in This Phase

1. **Public Website & Landing Experience:**
   - Editorial industrial hero with Nigerian quarry coordinates and live shipment tracking mockup.
   - 10-stage interactive requisition sequence (horizontal timeline on desktop, vertical on mobile).
   - Technical granite aggregate material catalog (3/4", 1/2", 10mm, 20mm, 30mm, Stone Dust, Quarry Dust, Sharp Sand).
   - 4-point haulage route sequence (Quarry Origin -> Fleet -> Checkpoint Transit -> Offload).
   - Customer platform showcase window and direct CTA.

2. **Authentication Flow:**
   - Client Sign In (`/login`), Contractor Registration (`/register`), and Password Recovery (`/forgot-password`).
   - Clean `useAuth()` context backed by repository interfaces.

3. **Enterprise Customer Dashboard (`/app`):**
   - Live financial & operational KPIs (Account Balance ₦2,450,000, 4 Orders, 2 in Transit, ₦780,000 Pending).
   - Live haulage tracker component with driver contacts and checkpoint updates.
   - 13-state accessible `OrderStatusBadge` and `OrderStatusTimeline` (color + text + icon + dot).
   - Responsive table-to-card rendering for mobile devices.

4. **Multi-Step Requisition Wizard (`/app/requisitions/new`):**
   - 9-step progressive disclosure flow with top step progress indicator and live sticky Order Summary panel.
   - Preset load quantities (10T, 30T, 45T, 60T, 90T, 150T, 300T).
   - ₦0.00 pricing review placeholders with operational review notice.

---

## 🎨 Brand Design Tokens

- **Primary Green:** `#0B6B3A` (Trust, quarry extraction, logistics growth)
- **Secondary Gray:** `#6D6E71` (Industrial aggregate, structural slate)
- **Accent Yellow:** `#FFC107` (Operational highlights, active states, key CTAs)
- **Neutral / Surfaces:** `#0f1117` (Dark mode / hero), `#F8F8F8` (App background), `#FFFFFF` (Cards)
- **Currency:** Nigerian Naira (`₦`) with tabular-nums alignment.
