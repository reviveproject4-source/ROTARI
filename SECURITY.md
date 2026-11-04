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

## Security Architecture & Best Practices

ROTARI enforces several layers of defense:
1. **Row Level Security (RLS):** All database tables have PostgreSQL RLS enabled to guarantee cross-tenant data isolation.
2. **Environment Variables:** Service role keys and secrets must never be committed to git or exposed in client bundles (`NEXT_PUBLIC_`).
3. **Storage Access Control:** Bucket storage policies restrict mutations to authorized accounts while serving read assets safely.
4. **Input Sanitization:** Disallow SQL/script injections on all form fields and WhatsApp template variables.
