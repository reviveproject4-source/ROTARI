# ROTARI Remediation Roadmap

Status date: 2026-11-03  
Working branch: `security/auth-tenant-isolation-hardening`

## Operating constraints

- Do not connect to, inspect, or modify any Supabase project during this remediation phase.
- Do not execute SQL or apply migrations.
- Do not merge pull requests or modify `main`.
- Keep each remediation phase in a reviewable pull request.
- Never mark database tenant isolation as verified without testing against the actual deployed schema and RLS policies.
- Prefer fail-closed behavior over client-side authorization claims.

## Priority order

### P0 — Authentication bypasses and privileged access

Observed in repository source:
- Login shortcuts expose fixed demo credentials for owner and cashier accounts.
- The client authentication function accepts demo aliases and empty PINs.
- The Super Admin portal accepts a hard-coded PIN and trusts a sessionStorage flag.
- A stored browser user ID can restore a Super Admin identity without a verified Auth session.
- Normal login marks the local user authenticated before the asynchronous Supabase password sign-in has succeeded.
- The client can switch the current user by role.

Required remediation:
- Remove all hard-coded credentials and client-only privileged authentication.
- Require successful Supabase Auth verification before establishing an application session.
- Resolve the user's profile and tenant membership from trusted records after authentication.
- Enforce privileged role checks on server-side endpoints and database policies, not in React state.
- Remove client-side role switching as an authorization mechanism.

Acceptance criteria:
- Empty, known demo, and invalid credentials never authenticate.
- A failed or pending Auth request never creates an authenticated app state.
- Changing sessionStorage, local state, URL, or role values cannot grant access.
- Super Admin access requires a separately verified server-side authorization decision.
- Logout invalidates the Auth session and clears application state.

### P1 — Tenant isolation

Observed risks:
- Tenant identity is initialized from browser sessionStorage.
- Application data is held in browser state and persistence calls accept client-provided tenant IDs.
- RLS migrations differ in schema and identifier types.
- One migration contains permissive `OR true` policies for prospect lead access.
- Existing migrations cannot safely be assumed to match the deployed database.

Required remediation:
- Derive tenant membership from the authenticated identity and trusted membership records.
- Treat every tenant ID supplied by the browser as untrusted input.
- Enforce tenant boundaries in RLS for every tenant-owned table and every operation.
- Define and test a narrowly scoped, server-controlled platform-admin authorization path.
- Reconcile schema/migration history only after the actual database state is available.

Acceptance criteria:
- User A cannot select, insert, update, or delete User B's tenant data, including by changing request payload IDs.
- Tenant membership and role cannot be self-assigned by an authenticated client.
- Tests cover every exposed table and CRUD operation.
- RLS behavior is verified against the deployed schema, not inferred from migration files.

### P2 — Data integrity and persistence

Observed risks:
- User persistence includes `pin_code`.
- Multiple delete operations filter only by row ID.
- Browser code constructs records and sends tenant IDs directly to Supabase.

Required remediation:
- Remove PIN/password-equivalent fields from profile persistence and client-readable records.
- Use Supabase Auth credentials only; never persist plaintext PINs.
- Scope writes/deletes to verified tenant membership and enforce this again in RLS.
- Validate ownership relationships for related records (for example transaction/customer/item tenant consistency).
- Add explicit error handling and avoid optimistic success when persistence fails.

### P3 — Registration, account lifecycle, and app behavior

Required remediation:
- Replace browser-only tenant registration with a trusted server-side workflow.
- Do not auto-authenticate a locally fabricated user.
- Ensure account activation, invitation, password setup, role assignment, and tenant creation are atomic or recoverable.
- Preserve legitimate POS, owner, and cashier workflows while removing bypasses.
- Add loading, error, disabled, and recovery states to login and registration.

### P4 — Codebase quality and maintainability

Audit and remediate:
- TypeScript strictness and unsafe casts.
- Duplicate configuration and dead code.
- Repeated data-access logic and inconsistent naming.
- Error handling, loading states, and empty states.
- Client/server boundaries and unnecessary client components.
- Dependency health and reproducible lockfile installs.
- Accessibility and responsive behavior on critical flows.

### P5 — Verification and CI

Required checks:
- Install from lockfile.
- Lint, typecheck, and production build.
- Unit tests for auth/profile/tenant resolution.
- Integration tests for authorization boundaries.
- Cross-tenant negative tests for every tenant-owned table.
- Regression tests for owner, cashier, and Super Admin workflows.
- CI must fail when required security tests fail.

A passing build is not evidence of secure tenant isolation.

### P6 — Open Source release readiness

Required work:
- Owner-selected license (do not choose on behalf of repository owner).
- Remove or replace synthetic-looking personal data and demo credentials.
- Verify all examples and environment variables.
- Document supported setup, migrations, test strategy, security reporting, and limitations.
- Confirm secrets are absent from history and current files.
- Publish a release checklist and known-limitations statement.

## Current verification boundary

Supabase is intentionally unavailable for this work. Therefore:
- No live database, Auth configuration, RLS policy, migration history, or database advisor has been inspected.
- No migration has been applied.
- Tenant isolation remains **UNVERIFIED** until database-backed cross-tenant tests pass.
- Any source-level change must be described as code hardening, not proof of production security.

## Work log

| Phase | Status | Evidence |
|---|---|---|
| Initial source audit | Findings recorded | `docs/SECURITY-AUDIT-2026-11.md` |
| Remediation branch | In progress | `security/auth-tenant-isolation-hardening` |
| P0 authentication | Source audit complete; implementation gated | Auth/profile contract is not established; safe profile resolution and privileged server authorization cannot be proven without the approved Auth/profile design and later verification |
| P1 tenant isolation | Source audit complete; production verification blocked | Browser-controlled tenant state and local registries remain; deployed RLS cannot be inspected under the no-Supabase constraint |
| P2 data integrity | Source audit complete; remediation pending | PIN is included in profile upserts; delete helpers filter by row ID only; persistence outcomes are not consistently tied to UI success |
| P3–P6 | Pending | To be handled in separate reviewable increments |


## P0–P2 follow-up audit (2026-11-03)

### P0 — additional confirmed source paths

- `src/lib/tenant-context.tsx`: session restoration accepts `rotari_auth_user_id` for the seeded Super Admin identity without requiring an Auth session.
- `src/app/super-admin/page.tsx`: the page accepts `rotari_sa_auth=true` and the fixed PIN `999999`; both are browser-controlled.
- `src/components/login-modal.tsx` and `src/components/login-screen.tsx`: fixed owner/cashier/Super Admin quick-login controls are rendered.
- `src/components/saas-shell.tsx`: owner-to-cashier quick switch supplies a fixed cashier credential and navigates regardless of the authentication result.
- `src/lib/tenant-context.tsx`: the ordinary login path matches browser-held user records by fuzzy email/name/role and PIN, starts Supabase password sign-in without awaiting it, then marks the app authenticated immediately.
- `src/app/demo-request/page.tsx` and `registerDemoTenant`: public form creates a tenant/user in browser state, assigns a default PIN, and marks that fabricated user authenticated.
- `src/components/navigation.tsx`/tenant context: role selection must not be treated as an authorization operation. The current context exposes a role mutation method; all callers must be removed or converted to a genuine re-authentication flow.

**Implementation gate:** the current app has no established trusted profile/tenant membership contract. The profile resolver currently searches browser-held `users` by ID **or email**, and tenant records are also held in browser state. A safe replacement must use the authenticated Auth UID and a trusted profile/membership record, with role changes protected by server-side policy. Guessing the mapping or silently retaining local profile authority would leave a privilege-escalation path. Therefore P0 is not marked fixed by this audit.

### P1 — tenant boundary observations

- `activeTenantId` is initially restored from `sessionStorage`; client reconciliation is not an authorization boundary.
- All business collections are loaded/merged from browser `sessionStorage` and filtered in React by the active tenant.
- Supabase sync helpers accept objects containing caller-supplied `tenant_id`.
- Existing migration files are conflicting and include permissive prospect-lead policies; deployed schema and effective policies remain unknown.

**Implementation gate:** RLS cannot be safely redesigned or verified from source files alone. No migration edits or database claims are made. Tenant isolation remains **UNVERIFIED**.

### P2 — data integrity observations

- `persistUserToSupabase` writes `pin_code` to the `users` table.
- `deleteCustomerFromSupabase`, `deleteProductServiceFromSupabase`, and `deleteExpenseFromSupabase` delete by `id` only; they do not include a tenant predicate.
- Many context actions update browser state before awaiting/confirming persistence, and callers often ignore the returned `SyncResult`.
- `src/lib/supabase.ts` contains a hard-coded fallback project URL and key. This risks silently targeting an unintended project when environment variables are absent.

**Implementation gate:** P2 changes need a confirmed schema contract and an explicit policy for offline/local-only behavior. The hard-coded fallback should be removed in a separate controlled change after CI/build environment variables are reviewed. No Supabase connection was made.

### Work performed in this follow-up

- Re-read the current source files on the remediation branch and traced authentication call sites.
- No application source code was changed in this follow-up because the trusted Auth/profile contract and persistence schema are not established.
- No Supabase project was opened, no SQL was run, and no migrations were applied.
- No claim of P0/P1/P2 completion is made.

## Source remediation update (2026-11-03)

- P0 containment: browser PIN/alias login now fails closed; browser session identity restoration is removed; the Super Admin static PIN/session flag cannot authorize access; browser-only tenant signup no longer creates accounts; the fixed owner-to-cashier shortcut is removed; role mutation is removed from the tenant context. Login, self-service trial activation, and Super Admin access are intentionally unavailable until trusted server-side Auth/profile/tenant authorization is implemented.
- P1 partial: active tenant selection is no longer restored from sessionStorage. Customer, product/service, and expense deletions now filter by both record ID and active tenant ID in local state and Supabase requests. These client-supplied filters are defense in depth only; browser registries and tenant IDs remain untrusted, and effective RLS is not verified. P1 is NOT COMPLETE.
- P2 partial: user upserts no longer write PINs; browser session persistence strips PIN fields; local PIN updates are disabled; seeded demo PINs are blanked; hard-coded Supabase project fallback is removed in favor of a non-routable placeholder when environment configuration is missing. Other persistence paths still need error handling, trusted ownership checks, and transactional consistency.
- No Supabase project was opened, no SQL/migration was run or modified, and no database-backed RLS test was executed. CI verification is pending. Do not deploy this containment branch as a customer-ready release until authentication is restored securely.

- CI result for commit `94e7dd5`: `npm ci`, lint, TypeScript typecheck, and production build all passed in GitHub Actions run `41577971346`. This verifies repository build checks only; it does not verify Auth, RLS, or cross-tenant isolation.
