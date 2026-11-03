# Open-Source Readiness

**Status: preparation in progress — not production-security certified.**

This document distinguishes what contributors can verify from what still requires the project owner and an active Supabase environment.

## Repository setup

### Requirements

- Node.js 20.x
- npm (use the lockfile with `npm ci`)
- A Supabase project for runtime data features

### Local installation

1. Fork or clone this repository.
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Set the Supabase URL and anon key for a project you control:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

Do not use production credentials in local development. Never put a Supabase service-role key or other privileged secret in a `NEXT_PUBLIC_*` variable or client-side code.

## Validation commands

Run these before submitting a pull request:

```bash
npm run lint
npm run typecheck
npm run build
```

The GitHub Actions workflow runs the same checks for pull requests and pushes to `main`. Passing these checks verifies static quality gates; it does not prove authentication, authorization, tenant isolation, or database security.

## Supabase and migrations

The repository currently contains more than one initial schema definition. Their intended relationship and the migration history of the actual project have not yet been established.

- Do not apply either initial migration to an existing database until the target project and applied migration history have been verified.
- Do not reset, drop, truncate, or otherwise modify production data as part of a contribution.
- Treat migration changes as security-sensitive. Include a forward migration, verification queries, and a recovery plan.
- The Supabase project used by ROTARI is currently paused and has not been available for live verification during this preparation.
- A contributor must use their own isolated Supabase project and synthetic data for local testing.

## Security status — read before deployment

A repository-level static review has recorded unresolved high-risk findings, including client-side demo/privileged identity flows and permissive prospect-lead RLS predicates in one migration. The actual applied database policies and grants have not been verified.

**Do not treat this repository as production-ready for multi-tenant or sensitive business data until these findings are remediated and verified.** Do not deploy the current authentication/RLS implementation for real customer data based solely on a successful build.

See [SECURITY.md](../SECURITY.md) and [the security audit](./SECURITY-AUDIT-2026-11.md).

## Demo data

The application contains seeded sample records and demo login paths. Contributors must verify that any sample data they use is synthetic. Do not commit real customer names, phone numbers, addresses, invoices, credentials, or production exports.

## Contribution workflow

1. Fork the repository.
2. Create a focused feature or fix branch.
3. Explain the business problem, expected behavior, and affected roles/tenants.
4. Add tests and evidence for the change.
5. Run the validation commands.
6. Open a pull request against `main`.

The repository owner reviews and decides whether a contribution is accepted. A pull request is a proposal, not permission to deploy or change production data.

## License and reuse

**No open-source license has been selected yet.** Until the repository owner adds a license file, do not assume that public visibility grants permission to reuse, modify, redistribute, or commercially exploit the code.

The owner must choose and add an appropriate license before describing ROTARI as licensed open-source software. This document does not select a license on the owner's behalf.

## Release checklist

- [ ] License selected and added by the owner.
- [ ] README accurately describes current capabilities and limitations.
- [ ] Local setup succeeds from a clean clone.
- [ ] CI lint, typecheck, and build pass.
- [ ] Authentication is server-verified; no browser state grants privileged access.
- [ ] RLS, grants, helper functions, and cross-tenant isolation are verified in the actual Supabase project.
- [ ] Conflicting migration history is reconciled without rewriting applied migrations.
- [ ] Demo fixtures are isolated from production data.
- [ ] Automated tests cover critical business rules and role boundaries.
- [ ] Deployment and rollback procedures are documented.
- [ ] Owner approves the release.
