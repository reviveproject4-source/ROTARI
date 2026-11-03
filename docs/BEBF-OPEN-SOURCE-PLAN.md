# BEBF Open-Source Readiness Plan

**Project:** ROTARI  
**Working method:** Engineering & Business Analyst Flows (BEBF)  
**Status date:** 2026-11-04  
**Target branch:** `main` (changes remain in a reviewable pull request)

## Release objective

A developer unfamiliar with ROTARI must be able to understand its business purpose, install it from a clean clone, configure an isolated environment, run automated checks, understand the data model and business rules, and contribute safely. Public release must not expose production credentials, customer data, or privileged infrastructure.

A successful build alone is not release readiness. Business behavior, authorization, tenant isolation, data integrity, reproducible setup, and project governance must be evidenced separately.

## BEBF flow

### 1. Business analysis — establish the operating contract

Document each core business flow and its authoritative rules before changing implementation:

- Tenant onboarding and account lifecycle.
- Owner and cashier responsibilities.
- Customer registration and history.
- Product/service catalog and stock behavior.
- POS transaction, discount, payment, cancellation, and work status.
- Expense recording.
- CRM follow-up and conversion attribution.
- Platform administration boundaries.

For each flow, record: actor, trigger, preconditions, main path, alternate path, failure path, data created/updated, business invariant, and acceptance criteria.

**Gate:** no security remediation may silently remove a valid business capability. Where the current behavior is unsafe or ambiguous, document the gap and request a business decision rather than inventing a rule.

### 2. System analysis — trace requirements to implementation

Create a traceability matrix linking:
- Business rule → user story/use case.
- Use case → UI entry point and application service.
- Application service → database tables and relationships.
- Role/tenant rule → server-side authorization and RLS policy.
- Acceptance criterion → automated or documented test.

Identify client-only state that is incorrectly acting as authentication, authorization, or durable persistence.

**Gate:** each critical workflow has an identifiable source of truth and testable acceptance criteria.

### 3. Engineering — remediate in isolated, reviewable increments

Priority order:

- **P0 Authentication:** authenticate with Supabase Auth; derive the profile from verified Auth UID; never trust browser-supplied role, tenant ID, local PIN, or sessionStorage as proof of identity.
- **P0 Privileged access:** Super Admin authorization must be independently verified server-side and constrained by explicit policy. No hard-coded credentials or client flags.
- **P1 Tenant isolation:** enforce tenant ownership in database policies for every tenant-owned table and CRUD operation. Validate foreign-key ownership across related rows.
- **P1 Data integrity:** define one canonical schema; preserve already-applied migration history; use additive, forward-only migrations after database state is known.
- **P1 Persistence:** UI success must reflect confirmed persistence; handle failed writes and retries without duplicate transactions.
- **P2 Regression:** preserve Owner, Cashier, and platform-admin workflows while removing bypasses.
- **P3 Maintainability:** remove dead code and duplicated configuration only when behavior is covered by tests.

**Gate:** no migration is applied to production and no PR is merged without owner review.

### 4. Verification — prove behavior, not assumptions

Required evidence:

- Clean install with `npm ci`.
- Lint, TypeScript typecheck, and production build.
- Unit tests for business rules and identity/profile resolution.
- Role authorization tests.
- Cross-tenant negative tests for SELECT, INSERT, UPDATE, and DELETE on every tenant-owned table.
- Relationship integrity tests (for example, transaction, customer, cashier, and transaction-item tenant consistency).
- Regression tests for POS, customer history, inventory, CRM, expenses, and account lifecycle.
- Failure-path tests for network errors, expired sessions, denied access, and duplicate submission.

**Gate:** live RLS and database grants remain **UNVERIFIED** until tested against the actual deployed schema and policies. Source inspection and CI do not substitute for database-backed evidence.

### 5. Open-source governance — prepare safe public collaboration

- MIT License selected by owner; exact copyright holder notice still requires confirmation before adding root `LICENSE`.
- Keep `.env.example` limited to placeholders; never include service-role keys.
- Audit current files and full Git history for credentials, tokens, customer data, and private exports. Rotate any exposed credential; deleting a file alone does not revoke it.
- Ensure sample data is synthetic and clearly labelled.
- Document prerequisites, clean setup, environment variables, migration caveats, tests, contribution workflow, security reporting, and known limitations.
- Verify rights and licenses for logos, images, fonts, icons, and other bundled assets. MIT does not automatically grant trademark rights or rights to third-party assets.
- Establish branch protection / rulesets, required CI checks, pull-request review, and release tagging.
- Keep production deployment credentials and production data outside the public repository.

**Gate:** public visibility is not the same as a properly licensed and safe open-source release.

## Current known blockers

1. Authentication replacement is not yet complete; login has been disabled in the security hardening branch rather than replaced with a verified end-to-end flow.
2. Tenant isolation and deployed RLS are unverified because the Supabase project is paused.
3. The repository contains conflicting initial schema definitions and different identifier types/project references. Do not choose or apply one by guesswork.
4. The root MIT license file needs the copyright holder name confirmed by the owner.
5. Seeded demo fixtures and any historical secrets/personal data require a complete release audit.
6. Existing CI proves lint/typecheck/build only; it does not prove business-flow correctness or security.

## Change control

- Work only on dedicated branches and reviewable pull requests.
- Do not commit directly to `main`.
- Do not merge or deploy without owner approval.
- Do not alter UI, navigation, feature scope, terminology, or business workflows unless a verified defect requires it and the impact is documented.
- Every remediation PR must include the business reason, technical change, risks, tests, and rollback/recovery notes.

## Definition of done

ROTARI is ready for an official open-source release only when all P0/P1 security and data-integrity gates are evidenced, critical business workflows pass regression tests, clean-clone setup is reproducible, all distributed assets have compatible rights, the MIT license is complete, and the repository owner approves the release.


## P2–P4 execution update — 2026-11-04

### P2 — Regression protection

- [x] Added `docs/REGRESSION-TEST-MATRIX.md` with Owner, Cashier/POS, authentication/session, tenant-isolation, and data-integrity scenarios.
- [x] Identified business rules requiring owner confirmation before they can become test assertions.
- [ ] Dedicated automated test runner and executable unit/integration/E2E tests are still pending.
- [ ] Database-backed tenant isolation tests are blocked until an isolated Supabase test environment is available.
- [ ] Critical business workflow tests have not yet been executed; matrix status is specification-only.

### P3 — Maintainability

- [x] Added `docs/MAINTAINABILITY-AUDIT-P3.md` with evidence-based findings and safe refactor sequence.
- [x] Recorded duplicate PostCSS/Tailwind configuration, oversized modules, browser-storage data authority, persistence-layer risks, project-reference inconsistency, and demo-fixture coupling.
- [ ] No behavior-changing refactor has been made. Consolidation and component extraction must follow P2 regression coverage.
- [ ] Persistence and schema remediation remain dependent on trusted auth design and owner-confirmed database state.

### P4 — Open-source governance

- [x] README, setup/readiness guide, contribution guide, security policy, and CI workflow are present on this branch.
- [x] MIT selected by owner.
- [ ] Root `LICENSE` remains pending exact copyright-holder confirmation.
- [ ] Full Git-history secrets/data review and third-party asset-rights review remain open.
- [ ] Branch protection/ruleset and required review enforcement have not been verified.
- [ ] Official public release remains blocked by unresolved P0/P1 security and database verification gates.

**Important:** documentation completion is not equivalent to test execution, security certification, or release approval.
