# ROTARI P0–P1 Remediation Status

Date: 2026-11-04

## Scope and safety boundary

This branch is based on `security/auth-tenant-isolation-hardening`. It does not connect to Supabase, execute SQL, alter migrations, read production data, change Vercel environment variables, or deploy.

## P0 — authentication and route containment

Parent branch changes:
- Local PIN / alias authentication is rejected.
- Browser-restored identity and tenant authorization are not trusted.
- Static Super Admin authorization and browser-only role switching are disabled.
- Login remains unavailable until a server-verified Auth UID → profile → tenant membership flow exists.
- PIN values are omitted from user persistence and browser storage.

This branch adds `middleware.ts` as a server/edge-side temporary deny boundary for application routes. Only `/demo-request` remains public; static Next.js assets are excluded. Denied routes return HTTP 503 with no-store and noindex headers.

This intentionally trades availability for containment. It does not implement authentication.

P0 verification still required:
- Run lint, strict TypeScript check, production build, and route tests against this exact commit.
- Verify the matcher against every public route and API route.
- Inspect the deployed Vercel project before any production action.

## P1 — database tenant isolation

Parent branch includes defense-in-depth tenant filters on customer, product/service, and expense deletes, and no longer restores active tenant authorization from browser storage. Client-supplied tenant filters are not security boundaries without RLS.

Still blocked pending live database evidence:
- Read-only inventory of live tables, RLS enabled/forced state, and policy definitions.
- Reconcile both competing initial schema migrations against live schema and migration history.
- Inspect grants, SECURITY DEFINER functions and search_path, foreign keys, and tenant ownership constraints.
- Test cross-tenant SELECT / INSERT / UPDATE / DELETE with synthetic tenants in isolated non-production.
- Review every table and write path.

No SQL policy or migration was modified because the live ROTARI database has not been verified. Do not apply either competing initial migration until schema reconciliation is complete.

## Release gate

This is a review branch, not production deployment approval. Do not merge or deploy until the owner reviews the temporary 503 impact and P0/P1 verification evidence is attached.
