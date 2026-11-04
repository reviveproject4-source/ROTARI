# Changelog

All notable changes to **ROTARI (Radar Toko)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-04

### Added
- **Multi-Tenant POS & Invoicing Engine**:
  - Combined retail product sales and repair services billing with technician completion time estimation.
  - Down Payment (DP) and partial payment support with automatic remaining balance calculation.
  - Interactive validation guards preventing DP amounts from exceeding total bills.
  - Photo attachment support connecting camera or phone gallery directly to Supabase Storage (`transaction-photos`).
  - Cashier special discount request workflow requiring owner/manager authorization.
- **Customer Relationship Management (CRM) & Retention Engine**:
  - Multi-tier customer inactivity detection (>30, >45, >60, and >90 days).
  - Bulk customer selection and reminder dispatching via WhatsApp click-to-chat.
  - Centralized WhatsApp message templates in tenant settings (Dormant, Lost, Promo, Digital Invoice, and Ready for Pickup).
- **Financial & Operational Accounting**:
  - Payment method tracking separating physical cash drawer transactions from bank transfers.
  - Operational expense classification for fixed and variable costs with gross margin reporting.
- **Inventory & Dead Stock Detection**:
  - Stock alerts based on configurable minimum quantities.
  - Automatic dead-stock tagging for slow-moving merchandise.
- **Database & Storage Architecture**:
  - Standardized Supabase baseline and incremental migrations (`supabase/migrations/`).
  - Unified, idempotent DDL setup script (`supabase/schema.sql`).
  - PostgreSQL Row Level Security (RLS) guaranteeing strict multi-tenant isolation.
  - Scoped storage bucket access policies for transaction photo uploads.
- **Open Source Governance**:
  - MIT License under **PT Minara Technologi Indonesia**.
  - `CONTRIBUTING.md`, `SECURITY.md`, and GitHub Issue/PR templates.
  - Dependency license audit documentation (`docs/LICENSES.md`).

---

[1.0.0]: https://github.com/reviveproject4-source/ROTARI/releases/tag/v1.0.0
