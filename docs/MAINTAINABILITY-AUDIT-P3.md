# ROTARI Maintainability Audit — P3

**Status:** static source review; no behavior-changing refactor performed.  
**Review baseline:** `docs/rotari-open-source-readiness`  
**Purpose:** identify engineering debt and sequence safe refactoring after P2 regression coverage exists.

## Findings

| ID | Finding | Evidence observed | Risk | Recommended action |
|---|---|---|---|---|
| MAINT-01 | Duplicate PostCSS configuration | `postcss.config.js` and `postcss.config.mjs` define the same Tailwind/Autoprefixer plugins | Tooling ambiguity and configuration drift | Confirm which file Next.js resolves in the supported environment; retain one canonical config only after clean build verification |
| MAINT-02 | Duplicate Tailwind configuration | `tailwind.config.js` and `tailwind.config.ts` contain materially equivalent theme/content settings | Configuration drift | Verify resolver behavior and build output; consolidate only after visual regression checks |
| MAINT-03 | Oversized UI modules | `src/app/page.tsx` (~85 KB), customer page (~56 KB), CRM page (~50 KB), POS invoice component (~51 KB), and tenant context (~37 KB) | High change coupling and difficult regression isolation | Extract cohesive modules incrementally, preserving public props and behavior; one module per PR |
| MAINT-04 | Browser storage is a data registry | `src/lib/tenant-context.tsx` initializes tenants, users, customers, transactions, expenses, and other registries from `sessionStorage` | Browser state can be stale, edited, or lost; it is not durable source of truth | After trusted auth and backend contracts are complete, make the database authoritative and treat browser state as cache only |
| MAINT-05 | Persistence layer mixes sensitive and tenant-owned fields | `src/lib/supabase-sync.ts` contains a user upsert with `pin_code`; several delete operations filter by row ID only; prospect-lead upsert does not include `tenant_id` | Sensitive credential handling, ownership ambiguity, and potential data-integrity mismatch | Do not patch schema-dependent writes until canonical schema, auth model, and RLS are verified; remove PIN persistence as part of approved auth redesign |
| MAINT-06 | Supabase project references are inconsistent | Sync-layer comment references project `oluzsthlxjxxpukxkcry`; migration/config references must be reconciled against the actual owner-confirmed project | Wrong-backend risk and migration ambiguity | Confirm project identity and applied migration history when Supabase resumes; never select a project from source comments alone |
| MAINT-07 | Sample fixtures are coupled to app initialization | `src/lib/initial-data.ts` exports default tenant/user/business fixtures, including demo identities and contact-like data | Demo data may be mistaken for real records or leak into a public release | Replace with explicitly synthetic, isolated fixtures after the authentication and onboarding design is settled |

## Safe sequencing

1. Establish P2 regression tests for existing behavior.
2. Resolve canonical environment/configuration behavior and record build evidence.
3. Consolidate duplicate configs in a dedicated PR with clean build and visual checks.
4. Extract large components in small, behavior-preserving PRs.
5. Redesign persistence only after trusted authentication, canonical schema, and RLS contracts are confirmed.
6. Remove or isolate demo fixtures only after the replacement onboarding/demo experience is specified and tested.

## Explicit non-actions

- No duplicate configuration file has been deleted.
- No large component has been split.
- No database schema or migration has been changed.
- No Supabase connection has been opened.
- No production data or credentials have been accessed.
- No business workflow, navigation, UI, or feature has been intentionally changed.

## Acceptance criteria

- [ ] One authoritative PostCSS configuration.
- [ ] One authoritative Tailwind configuration.
- [ ] Component extraction is covered by regression tests and preserves behavior.
- [ ] Database is the authoritative source for persisted business records.
- [ ] PINs are not stored or exposed as plaintext credentials.
- [ ] Every persistence operation has explicit ownership and error semantics.
- [ ] Supabase project and migration history are confirmed by the owner.
- [ ] Demo data is synthetic and isolated from production tenant data.
