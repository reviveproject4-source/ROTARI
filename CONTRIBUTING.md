# Contributing to ROTARI

Thank you for your interest in ROTARI.

## Contribution Workflow

1. Fork the repository.
2. Create a focused branch for your change.
3. Keep changes small and explain the business or technical problem being solved.
4. Add or update tests where applicable.
5. Open a pull request against `main`.

The repository owner reviews and decides whether a contribution is accepted. A pull request is a proposal; it does not authorize deployment or production database changes.

## Pull Request Checklist

- [ ] Explain the problem and expected behavior.
- [ ] Describe any business-rule or data-model changes.
- [ ] Include test evidence or explain what could not be tested.
- [ ] Do not include credentials, customer data, or production records.
- [ ] Do not include destructive database changes without a migration and rollback plan.
- [ ] Confirm that tenant isolation and role authorization remain intact.

## Security-Sensitive Changes

Authentication, authorization, tenant isolation, RLS policies, database migrations, and secrets/configuration changes require explicit review. Never test these changes against production data without authorization.
