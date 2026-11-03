# ROTARI Security Audit — 2026-11

## Scope and Limitations

This is a repository-level static review of the public `main` branch. It is not a penetration test, a production database audit, or proof of runtime exploitability.

Not performed:
- No connection to the live Supabase project.
- No inspection of applied migration history or live database grants/policies.
- No production data access.
- No deployment, browser, or end-to-end testing.
- No dependency installation or build/test execution.

## Priority Findings

### Critical — Prospect lead RLS predicates are unconditional

In `supabase/migrations/20260924000000_rotari_multi_tenant_schema.sql`, the SELECT and UPDATE policies for `prospect_leads` contain `OR true`. If this migration is applied and the relevant database privileges are granted, these predicates do not restrict rows by role.

Required remediation:
- Replace the unconditional predicates with a least-privilege access model.
- Keep public lead submission separate from authenticated lead review/update.
- Validate submitted fields and add appropriate abuse controls.
- Verify effective grants and policies in the target database before deployment.

### Critical — Client-side identity and role state

`src/lib/tenant-context.tsx` restores a Super Admin identity from browser session storage and maintains application identity/tenant state client-side. Browser storage is user-controlled and must never be an authorization authority.

The same module resolves Supabase sessions against client-held user and tenant registries. Authorization must be based on a verified server/database identity and enforced by RLS or trusted server-side code.

### High — Demo login shortcuts and PIN handling

`src/components/login-modal.tsx` exposes one-click demo account credentials in the UI. The tenant context also contains local PIN-based login logic. This must be separated from production authentication and must not grant a privileged role without server-side verification.

### High — Conflicting migration definitions and project identifiers

The repository contains two initial schema migrations with materially different table definitions and identifier types:
- `20260924000000_rotari_multi_tenant_schema.sql`
- `20260924_initial_schema_and_rls.sql`

The migration headers and `.env.example` also reference different Supabase project identifiers. The applied migration history and intended production project must be confirmed before any schema reconciliation.

Do not assume that editing a migration file changes an already-provisioned database.

### High — Demo data and browser persistence

`src/lib/initial-data.ts` contains seeded demo users, PINs, customers, contact details, and operational records. The application context persists several registries in `sessionStorage`. Confirm all seeded records are synthetic and ensure demo data cannot be mixed with production tenant data.

### Medium — Supabase fallback configuration

`src/lib/supabase.ts` falls back to a hard-coded project URL and anon key when environment variables are absent. An anon key is intended to be public, but silently targeting a fallback project can connect a deployment to the wrong backend. Fail-fast environment validation is preferred.

## Remediation Order

1. Establish authoritative authentication and role resolution; remove browser-storage privilege restoration and production demo shortcuts.
2. Correct and test RLS, grants, tenant isolation, and security-definer functions.
3. Establish the actual Supabase project and applied migration history; create a forward-only reconciliation plan.
4. Separate synthetic demo fixtures from production data and remove client-side production data authority.
5. Validate environment configuration and secrets handling.
6. Clean duplicate configuration/assets and improve contributor documentation.
7. Run build, lint, unit/integration tests, and tenant-isolation acceptance tests.

## Release Gate

No security remediation should be deployed to production until the target Supabase project, applied migrations, grants, auth claims, and rollback plan are verified. The repository owner must approve production changes.
