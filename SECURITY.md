# Security Policy

## Supported Versions

Security fixes are currently prepared against the default branch, `main`.

## Reporting a Vulnerability

Please do not publish exploit details, credentials, personal data, or production database records in a public issue.

Report suspected vulnerabilities privately to the repository owner through GitHub's private vulnerability reporting feature, if enabled. If that feature is unavailable, contact the repository owner through a private channel before disclosing details publicly.

Include:
- A concise description of the affected component.
- The impact and conditions required to reproduce the issue.
- Minimal reproduction steps using synthetic data.
- Any suggested mitigation.

Do not access, modify, download, or disclose another tenant's data while validating a report.

## Security Scope

The repository is public, but public visibility does not imply that the live application or its database is safe for unrestricted testing. Do not run destructive tests against production services.

Security fixes should be proposed through a branch and pull request. Production database changes require a separate reviewed migration and explicit owner approval.
