# ROTARI — Modular Developer & Architecture Guide

Welcome to the **ROTARI** developer guide. This document explains the modular architecture of the codebase and guides developers on how to adopt, extend, or run specific business modules independently.

---

## 1. Modular Architecture Overview

ROTARI is structured around decoupled, cohesive domain modules:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer (Next.js)                │
│   ┌───────────────┐ ┌───────────────┐ ┌──────────────────────┐  │
│   │   POS Engine  │ │  CRM Retention│ │ Financial Accounting │  │
│   │   (/pos)      │ │  (/crm)       │ │ (/expenses)          │  │
│   └───────┬───────┘ └───────┬───────┘ └──────────┬───────────┘  │
├───────────┼─────────────────┼────────────────────┼──────────────┤
│           ▼                 ▼                    ▼              │
│                  Tenant Context & Security Core                 │
│         (src/lib/tenant-context.tsx, src/lib/crypto.ts)         │
├─────────────────────────────────────────────────────────────────┤
│                               ▼                                 │
│                  Hybrid Sync Layer (Supabase)                   │
│                    (src/lib/supabase-sync.ts)                   │
├─────────────────────────────────────────────────────────────────┤
│                               ▼                                 │
│           PostgreSQL Engine with Hardened RLS & Storage         │
│                        (supabase/schema.sql)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Using Modules Independently

### A. Point of Sale & Invoicing (`/pos`)
* **Core Files:**
  * UI Builder: [`src/app/pos/page.tsx`](../src/app/pos/page.tsx)
  * WhatsApp Slip Generator: [`src/lib/whatsapp.ts`](../src/lib/whatsapp.ts)
  * Domain Types: [`src/types/index.ts`](../src/types/index.ts) (`Transaction`, `CartItem`)
* **How to use as a standalone POS:**
  * The POS module manages cart state, partial Down Payments (DP), and custom discounts.
  * Disabling cloud sync: If running as a pure offline counter POS, mock `persistTransactionToSupabase` in `supabase-sync.ts` or set dummy environment variables. Transactions will persist in browser session memory.

### B. Customer Retention & Churn CRM (`/crm` & `/cashier/crm`)
* **Core Files:**
  * Retention Dashboard: [`src/app/crm/page.tsx`](../src/app/crm/page.tsx)
  * Cashier Action List: [`src/app/cashier/crm/page.tsx`](../src/app/cashier/crm/page.tsx)
  * Churn Algorithm: [`getCustomerChurnStatus`](../src/lib/tenant-context.tsx)
* **Algorithm Definition:**
  ```typescript
  export function getCustomerChurnStatus(
    lastOrderAt: string,
    rules?: { dormant_days: number; lost_days: number }
  ): 'active' | 'at_risk_45' | 'lost_90' {
    const dormantDays = rules?.dormant_days ?? 30;
    const lostDays = rules?.lost_days ?? 60;
    const diffDays = Math.floor((Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= lostDays) return 'lost_90';
    if (diffDays >= dormantDays) return 'at_risk_45';
    return 'active';
  }
  ```
* **Stand-Alone Adoption:**
  * Import `getCustomerChurnStatus` into any external customer dataset to classify users into actionable WhatsApp outreach buckets.

### C. Cryptographic Authentication & PIN Security (`src/lib/crypto.ts`)
* **Core Functions:**
  * `hashPin(pin: string): Promise<string>`: Creates salted SHA-256 hashes (`rotari_pin_v1_minara:<pin>`).
  * `verifyPin(pin: string, hash?: string): Promise<boolean>`: Asynchronously verifies arbitrary input PINs.
  * `verifyPinSync(pin: string, hash?: string): boolean`: Synchronously verifies known seeds and evaluates legacy plaintext migration.
* **Stand-Alone Adoption:**
  ```typescript
  import { hashPin, verifyPin } from "@/lib/crypto";

  const hashed = await hashPin("123456");
  const isValid = await verifyPin(inputPin, hashed);
  ```

### D. Offline-First Dual-Layer Synchronization (`src/lib/supabase-sync.ts`)
* Provides resilient optimistic updates:
  1. Instant state update in React Context and SessionStorage.
  2. Asynchronous background sync to Supabase Postgres.
  3. Automatic generation of 7-day secure Signed URLs for private transaction attachments.

---

## 3. Development & CI Workflow

### Required Tools
- Node.js `20.x` or `22.x` (v24 supported)
- npm `10.x` or higher

### Running Automated Checks Locally
Before submitting a pull request, run the unified quality gate:

```bash
# 1. Verify clean dependency installation
npm ci

# 2. Static type checking (TypeScript strict mode)
npm run typecheck

# 3. Code formatting & linting (Next.js ESLint)
npm run lint

# 4. Automated unit, crypto, and isolation tests
npm test

# 5. Production Next.js build verification
npm run build

# Or run all 5 steps in one command:
npm run ci
```

---

## 4. Multi-Tenant Database Testing Guide

To test PostgreSQL RLS policies in a clean Supabase test project:
1. Run [`supabase/schema.sql`](../supabase/schema.sql) in SQL Editor.
2. Execute the automated test suite (`npm test`).
3. Verify that `tests/tenant-isolation.test.ts` passes with 0 cross-tenant leaks.
