# Security Policy

At **PT Minara Technologi Indonesia**, security and tenant data isolation are critical priorities for **ROTARI**.

---

## Supported Versions

Only the latest release version on the `main` branch receives security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability within ROTARI, please **do not** disclose it publicly via GitHub Issues.

Instead, please send a responsible disclosure report to:
- **Email:** `security@minara.co.id`
- **Subject:** `[SECURITY] ROTARI Vulnerability Report - <Brief Summary>`

Please include:
1. Description of the vulnerability and its potential impact.
2. Step-by-step instructions or proof-of-concept (PoC) to reproduce the issue.
3. Relevant environment details (Next.js version, browser, Supabase setup).
4. Suggested mitigation or fix (if available).

### Response SLA
- **Initial Response:** Within 48 hours of receipt.
- **Triage & Assessment:** Within 5 business days.
- **Fix & Advisory:** Coordinated release once verified.

---

## Security Architecture & Defenses

ROTARI enforces multi-layered defense mechanisms across client, application, and database:

1. **Row Level Security (RLS) & Tenant Isolation:**
   - Every database table enforces PostgreSQL Row Level Security.
   - Cross-tenant data leaks and forged tenant queries are rejected at the database engine level.
   - Public leads (`prospect_leads`) are readable only by authenticated Super Admin; public users have only validated `INSERT` access.

2. **SQL Function Hardening (`SECURITY DEFINER`):**
   - Helper functions (`public.get_auth_tenant_id()` and `public.get_auth_user_role()`) explicitly specify `SET search_path = public, pg_temp` to prevent schema search-path hijacking attacks.
   - Default public execution permissions are revoked (`REVOKE EXECUTE ... FROM PUBLIC`).

3. **Cryptographic Salted Hashing for PINs:**
   - User PINs are never stored or displayed in plaintext.
   - Salted SHA-256 cryptographic hashing (`rotari_pin_v1_minara:<pin>`) is used for verification.
   - Legacy PIN migration automatically upgrades existing plaintext data to salted hashes upon authentication.

4. **Private Storage & Signed URLs:**
   - Attachment buckets (`transaction-photos`) are strictly private (`public = false`).
   - Anonymous uploads are denied; only authenticated tenant accounts can upload.
   - Sensitive receipt and repair photos are accessed exclusively through short-lived or 7-day cryptographic Signed URLs.

5. **Server-Side Super Admin Authentication:**
   - Super Admin elevation is verified against Supabase Auth sessions and database-backed roles, eliminating client-side `sessionStorage` bypass vulnerabilities.

6. **Continuous Automated Security Testing:**
   - Automated test suites (`tests/crypto-security.test.ts`, `tests/tenant-isolation.test.ts`, `tests/rls-policies.test.ts`) run in CI to ensure no security regression occurs.
