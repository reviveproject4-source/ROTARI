# ROTARI (Radar Toko)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![CI Quality Gate](https://github.com/reviveproject4-source/ROTARI/actions/workflows/ci.yml/badge.svg)](https://github.com/reviveproject4-source/ROTARI/actions)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-emerald)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

> **Open-Source Multi-Tenant Business Management, POS & Customer CRM Retention Platform for Small Businesses & Service Centers.**

Developed and maintained by **PT Minara Technologi Indonesia**.

---

## Table of Contents

1. [Overview & Philosophy](#overview--philosophy)
2. [Core Business Flow](#core-business-flow)
3. [Key Modules & Capabilities](#key-modules--capabilities)
4. [Tech Stack](#tech-stack)
5. [Prerequisites](#prerequisites)
6. [Installation & Quickstart](#installation--quickstart)
7. [Environment Variables](#environment-variables)
8. [Database Setup & Migration Guide](#database-setup--migration-guide)
9. [Storage Bucket Setup & Security](#storage-bucket-setup--security)
10. [Roles & Security Architecture](#roles--security-architecture)
11. [Modular Developer Guide](#modular-developer-guide)
12. [Project Structure](#project-structure)
13. [Open Source Governance & License](#open-source-governance--license)

---

## Overview & Philosophy

Small businesses and retail service shops often manage customer data, POS transactions, inventory, cashflow, and customer follow-ups using fragmented tools. 

**ROTARI** connects daily transaction operations directly into actionable CRM insights:

```
Business Activity → Transaction → Information → Action → Decision
```

> **A transaction is never just a receipt — it creates data that decides the next customer interaction.**

---

## Core Business Flow

```
Customer Visit
     ↓
POS Invoice (Retail Products / Repair Services)
     ↓
Payment & Down Payment (DP / Cash vs Bank Transfer)
     ↓
Work Tracking & Completion Estimate (with Camera/Gallery Photo)
     ↓
Automated Official WhatsApp Digital Invoice
     ↓
Customer Churn Detection (Active / 45-day At Risk / 90-day Lost)
     ↓
Cashier CRM Retention & Bulk WhatsApp Follow-up
     ↓
Customer Loyalty & Repeat Business
```

---

## Key Modules & Capabilities

### 1. Point of Sale & Invoicing (`/pos`)
- **Retail & Service Support:** Sell catalog products or bill repair services with technician duration estimation.
- **Down Payment (DP) & Partial Payments:** Split invoices into DP and remaining balance with validation guards.
- **Special Discount Workflow:** Cashiers can request special discounts requiring owner/manager review.
- **Photo Attachments:** Directly snap or upload photos of customer items/receipts to Supabase Cloud Storage.
- **Thermal Receipt & Digital WA:** Print 58mm/68mm/80mm thermal receipts or send formatted WhatsApp invoices with 1 click.

### 2. Multi-Tenant CRM & Customer Retention (`/crm` & `/cashier/crm`)
- **Automated Retention Alerts:** Identifies customers inactive for >30, >45, >60, or >90 days.
- **Bulk Reminder Engine:** One-click bulk selection to trigger personalized WhatsApp retention messages.
- **Dynamic Templates:** Customizable message templates for dormant customers, win-backs, promo broadcasts, and invoice receipts.

### 3. Financial & Operational Accounting (`/expenses`)
- **Cash vs Bank Transfer Segregation:** Track operational costs by payment method (cash drawers vs bank accounts).
- **Fixed vs Variable Categorization:** Clean breakdown for gross margin and net profit calculation.

### 4. Inventory & Dead Stock Detection (`/inventory`)
- Track stock counts, cost price (HPP), selling price, and minimum stock alerts.
- Automatic dead-stock indicators for stagnant merchandise.

### 5. Multi-Tenant Architecture & Super Admin (`/super-admin`)
- Complete data isolation per business tenant enforced via **PostgreSQL Row Level Security (RLS)**.
- Super admin portal with server-side authentication to provision and manage trial and subscribed tenants.

---

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict typing)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Storage:** Supabase Storage (`transaction-photos` private bucket with Signed URLs)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with `next-themes` (Dark / Light mode)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Prerequisites

- **Node.js:** v20.x or higher (v24 supported)
- **npm** v10+
- A free [Supabase](https://supabase.com/) account and project

---

## Installation & Quickstart

### 1. Clone the Repository
```bash
git clone https://github.com/reviveproject4-source/ROTARI.git
cd ROTARI
```

### 2. Install Dependencies (Clean Reproduction)
```bash
npm ci
```

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials in `.env.local` (see [Environment Variables](#environment-variables)).

### 4. Setup Database
Execute the database setup script in your Supabase SQL Editor (see [Database Setup & Migration Guide](#database-setup--migration-guide)).

### 5. Run Automated Tests
```bash
npm test
```

### 6. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Configure `.env.local` with your Supabase credentials:

```ini
# Supabase Project API URL (Dashboard -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Public Anon Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

---

## Database Setup & Migration Guide

### Option A: One-Click Setup via Supabase SQL Editor (Recommended)
1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab from the left sidebar.
3. Click **New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
4. All 9 tables, functions, RLS policies, and private storage buckets will be initialized.

### Option B: Supabase CLI Migrations
If you use the Supabase CLI:
```bash
# Link project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```
Migrations are organized sequentially in [`supabase/migrations/`](supabase/migrations/):
- `20260924000000_initial_schema_and_rls.sql`: Baseline schema & RLS policies
- `20261104000000_p0_p1_schema_enhancements.sql`: P0-P1 incremental columns
- `20261104010000_security_hardening.sql`: Security hardening (RLS, private storage, search_path protection, pin_hash)

Both paths produce identical database structures and policies.

---

## Storage Bucket Setup & Security

ROTARI stores transaction photos and receipt attachments in Supabase Storage. The DDL script automatically configures:
- **Bucket ID:** `transaction-photos`
- **Visibility:** **Private** (`public: false` — preventing unauthorized scraping of customer invoices or repair photos)
- **Max File Size:** 10MB
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **Access Control:** Restricted strictly to authenticated users belonging to the tenant. The app automatically signs 7-day secure URLs for viewing receipts.

---

## Roles & Security Architecture

| Role | Default Access | Description |
| :--- | :--- | :--- |
| **Owner** | Full Tenant Control | Access to Dashboard, Financial Reports, Expenses, Inventory, Staff & Settings |
| **Cashier** | POS & Operational CRM | POS Invoice creation, Customer Management, CRM Reminders, and Daily Settings |
| **Super Admin** | Platform Governance | Multi-tenant onboarding, tenant subscription status, and platform audit |

### Security Measures:
1. **Cryptographic Salted Hashing:** User PINs are hashed using salted SHA-256 (`src/lib/crypto.ts`). No plaintext PINs are stored or displayed.
2. **Server-Side Authentication:** Super Admin access requires authentic Supabase Auth or database-verified credentials. Client-side `sessionStorage` bypasses are eliminated.
3. **PostgreSQL RLS with Function Hardening:** All tables enforce tenant isolation. `SECURITY DEFINER` functions specify `SET search_path = public, pg_temp` to prevent schema hijacking.

---

## Modular Developer Guide

Developers can adopt or run specific modules independently (e.g. running only POS, only CRM Retention, or integrating custom sync layers). Refer to the **[Modular Developer Guide](docs/DEVELOPMENT.md)** for detailed integration patterns.

---

## Project Structure

```
ROTARI/
├── .github/                      # GitHub workflows, issue & PR templates
│   ├── workflows/ci.yml          # Automated CI pipeline
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── docs/                         # Additional documentation
│   ├── DEVELOPMENT.md            # Modular developer guide
│   └── LICENSES.md               # Third-party license audit
├── public/                       # Static assets & brand logos
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── cashier/              # Cashier-specific views (CRM, Settings, Customers)
│   │   ├── crm/                  # Owner CRM & retention analytics
│   │   ├── employees/            # Staff & cashier management
│   │   ├── expenses/             # Cash & transfer expense tracker
│   │   ├── inventory/            # Inventory & stock alert manager
│   │   ├── pos/                  # Point of sale & invoice builder
│   │   ├── settings/             # Tenant settings & WhatsApp templates
│   │   └── super-admin/          # Platform super admin portal
│   ├── components/               # Reusable React components & modals
│   ├── lib/                      # Core business logic & persistence
│   │   ├── crypto.ts             # Salted SHA-256 PIN hashing engine
│   │   ├── initial-data.ts       # Seed data & default demo roles
│   │   ├── supabase.ts           # Supabase client singleton
│   │   ├── supabase-sync.ts      # Cloud database & storage sync layer
│   │   ├── tenant-context.tsx    # Multi-tenant state & offline cache
│   │   └── whatsapp.ts           # WhatsApp click-to-chat generator
│   └── types/                    # TypeScript interfaces & domain models
├── supabase/
│   ├── migrations/               # Supabase CLI versioned migrations
│   └── schema.sql                # Unified full database schema
├── tests/                        # Automated test suites
│   ├── crypto-security.test.ts   # PIN hashing & verification tests
│   ├── rls-policies.test.ts      # Schema & RLS policy audit tests
│   └── tenant-isolation.test.ts  # Cross-tenant boundary & anti-spoofing tests
├── CONTRIBUTING.md               # Contribution guidelines
├── LICENSE                       # MIT License
├── package.json
└── SECURITY.md                   # Security & vulnerability reporting policy
```

---

## Open Source Governance & License

ROTARI is open-source software licensed under the **[MIT License](LICENSE)**.

Copyright &copy; 2026 **PT Minara Technologi Indonesia**.
