# ROTARI Quality Gates

This document defines the evidence required before assigning a repository quality score. A target score is not a verified result.

## Scoring rubric (10 points)

| Area | Weight | Evidence required |
|---|---:|---|
| Authentication and authorization | 2.0 | Server-verified identity, role checks, no browser-storage privilege, negative tests |
| Tenant isolation and database security | 2.0 | Reviewed grants/RLS, hardened helper functions, cross-tenant integration tests |
| Data integrity and migrations | 1.5 | One authoritative schema history, forward-only migrations, rollback/recovery plan |
| Application correctness | 1.5 | Lint, typecheck, build, unit/integration/E2E tests |
| Configuration and secrets | 1.0 | Fail-fast env validation, no privileged secrets in client bundle, environment parity |
| Dependency and CI hygiene | 0.75 | Reproducible lockfile install, CI checks, dependency update process |
| Documentation and governance | 0.75 | Setup, architecture, contribution, security, license decision, release process |
| Maintainability | 0.5 | Clear module boundaries, no duplicate configs, consistent conventions |

## Score assignment rules

- A category receives full points only when the required evidence exists and is current.
- A code change or documentation statement alone does not prove runtime security.
- Production database claims require evidence from the actual configured Supabase project.
- A failing or unexecuted check receives no verified pass credit.
- Open questions and untested assumptions must be recorded as blockers, not scored as complete.

## Current known blockers

1. Client-side demo authentication and privileged role shortcuts exist in the application context.
2. Prospect lead RLS policies in one migration include unconditional `OR true` predicates.
3. Two initial migration files define incompatible table structures and ID types.
4. The actual Supabase project and applied migration history have not been independently confirmed.
5. No automated lint/typecheck/build workflow had been present in the repository at the time of this review.
6. No formal license has been selected. Public repository visibility does not itself grant reuse rights.

## Release threshold

The 9.6/10 target may be claimed only after the high-risk blockers are fixed, all automated checks pass, tenant-isolation negative tests pass, and the production Supabase configuration and migration state are verified. Until then, report the score as pending evidence.
