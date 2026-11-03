# ROTARI Regression Test Matrix

**Status:** test specification prepared; execution pending.  
**Branch baseline:** `docs/rotari-open-source-readiness`  
**Purpose:** protect ROTARI's business workflows while authentication and tenant isolation are hardened.

This document is a test plan, not evidence that the application currently passes these tests. The current repository does not yet provide a dedicated automated unit/integration/E2E test runner. Supabase-backed cases require an isolated test project and synthetic data.

## Test data and execution rules

- Use two synthetic tenants: Tenant A and Tenant B.
- Tenant A has one Owner and two Cashiers; Tenant B has a separate Owner and Cashier.
- Use synthetic customers, products/services, expenses, transactions, and CRM records.
- Never use production customer records, production credentials, or the paused production Supabase project.
- A test passes only when the expected result is observed and recorded. A blocked or unexecuted test is not a pass.
- For authorization tests, verify both the allowed path and the denied path. Hiding a menu or button is not an authorization control.

## P2-A — Authentication and session lifecycle

| ID | Actor / scenario | Expected result | Current execution |
|---|---|---|---|
| AUTH-01 | Unauthenticated visitor opens a protected route | Access is denied or redirected to the approved login flow | Pending trusted Auth flow |
| AUTH-02 | Valid user signs in | Server-verified identity resolves to exactly one active profile and tenant | Blocked |
| AUTH-03 | Invalid credentials | No session or privileged state is created | Blocked |
| AUTH-04 | User signs out | Session is invalidated; protected data is no longer accessible | Blocked |
| AUTH-05 | Expired/revoked session | Protected requests fail closed; no stale browser identity is restored | Blocked |
| AUTH-06 | Browser storage is edited to claim Owner/Super Admin | No privilege is gained | Pending server authorization |
| AUTH-07 | Unknown or inactive profile signs in | Access is denied without creating a tenant association | Blocked |

## P2-B — Owner workflow regression

| ID | Scenario | Expected result | Current execution |
|---|---|---|---|
| OWN-01 | Owner views business dashboard | Totals reconcile to the underlying tenant transactions and expenses | Not run |
| OWN-02 | Owner creates/edits a customer | Customer is persisted once and appears in customer history | Not run |
| OWN-03 | Owner creates/edits a product or service | Catalog values persist and are reflected in POS selection | Not run |
| OWN-04 | Owner records an operational expense | Expense is persisted once and included in the correct expense totals | Not run |
| OWN-05 | Owner manages Cashier account | Only authorized employee fields can be changed; no plaintext PIN is exposed | Blocked by auth design |
| OWN-06 | Owner reviews CRM follow-up | Customer, follow-up status, and conversion attribution remain consistent | Not run |
| OWN-07 | Owner changes tenant settings | Only the active, authorized tenant's settings change | Pending RLS |

## P2-C — Cashier / POS workflow regression

| ID | Scenario | Expected result | Current execution |
|---|---|---|---|
| POS-01 | Cashier opens POS | Cashier can access permitted POS functions only | Blocked by auth design |
| POS-02 | Cashier creates a transaction with multiple items | Header, items, quantity, prices, and totals are consistent | Not run |
| POS-03 | Cashier applies an allowed discount | Discount follows the approved business rule and is reflected in invoice totals | Business rule confirmation required |
| POS-04 | Cashier records partial/full payment | Paid amount, outstanding balance, and payment status reconcile | Not run |
| POS-05 | Cashier changes work status | Only valid status transitions are accepted | Business transition map required |
| POS-06 | Cashier submits the same transaction twice | Duplicate submission does not create duplicate invoices or charges | Not run |
| POS-07 | Network/database write fails | UI does not show false success; retry does not duplicate the transaction | Not run |
| POS-08 | Cashier attempts Owner-only operation | Server rejects the operation, even if the request is manually crafted | Pending server authorization |

## P2-D — Tenant isolation and data integrity

These are database-backed security tests. They must run only against an isolated Supabase test project with synthetic data.

| ID | Attempt | Expected result | Current execution |
|---|---|---|---|
| TEN-01 | Tenant A reads Tenant B customer rows | No Tenant B rows are returned | Blocked: Supabase paused |
| TEN-02 | Tenant A inserts a row with Tenant B tenant_id | Insert is rejected | Blocked |
| TEN-03 | Tenant A updates a Tenant B row by guessed ID | No row is changed | Blocked |
| TEN-04 | Tenant A deletes a Tenant B row by guessed ID | No row is deleted | Blocked |
| TEN-05 | Tenant A references Tenant B customer/product/cashier in a transaction | Relationship is rejected | Blocked |
| TEN-06 | Cashier accesses Owner-only data or actions | Request is denied at the trusted authorization layer | Blocked |
| TEN-07 | Non-platform user invokes Super Admin operation | Request is denied server-side | Blocked |

Run TEN-01 through TEN-04 for every tenant-owned table, not just customers. Record table name, SQL/API operation, actor identity, expected policy, observed result, and evidence.

## P2-E — Release regression gates

- [ ] Clean install: `npm ci`
- [ ] Lint: `npm run lint`
- [ ] Typecheck: `npm run typecheck`
- [ ] Production build: `npm run build`
- [ ] Automated tests are added and run by CI.
- [ ] Owner, Cashier, and Super Admin role boundaries are tested.
- [ ] POS, customer history, catalog, expenses, and CRM workflows are tested.
- [ ] Duplicate-submit and failed-write behavior is tested.
- [ ] Tenant-isolation negative tests pass against an isolated database.
- [ ] Test evidence and unresolved failures are attached to the PR.

## Business decisions still needed

The following rules must be confirmed from the product owner or authoritative existing behavior before tests can assert them:

1. Which discount types/limits require Owner approval?
2. Which work-status transitions are valid, and can any transition be reversed?
3. What is the approved cancellation/refund behavior after payment?
4. Which CRM actions can Cashier perform versus Owner?
5. Which platform-admin operations are intended, and what tenant data may the platform admin see?

Do not invent these rules in test code. Record the decision, then convert it into acceptance criteria.
