# Contributing to ROTARI

Thank you for your interest in contributing to **ROTARI**! We welcome community contributions to help small businesses and entrepreneurs automate POS operations and build lasting customer relationships.

---

## Code of Conduct

By participating in this project, you agree to abide by our standards:
- Treat all team members and community contributors with respect and kindness.
- Welcome newcomers and provide constructive feedback.
- Focus on what is best for the community, small business users, and software quality.

---

## Development Workflow

### 1. Fork & Clone
1. Fork the repository on GitHub: `https://github.com/reviveproject4-source/ROTARI`
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/ROTARI.git
   cd ROTARI
   ```

### 2. Install Dependencies
Make sure you have Node.js 18+ installed:
```bash
npm install
```

### 3. Setup Environment
Copy the environment template and configure your Supabase instance:
```bash
cp .env.example .env.local
```

### 4. Create a Feature Branch
Always create a branch from `main`:
```bash
git checkout -b feat/your-feature-name
# or for bug fixes:
git checkout -b fix/your-bug-fix
```

### 5. Commit Guidelines
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` A new feature for users
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Formatting, missing semicolons, etc. (no functional code change)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency updates

Example:
```bash
git commit -m "feat(pos): add automated barcode scanner lookup"
```

### 6. Verification Before Submitting
Before pushing, ensure your changes pass TypeScript checks and linting:
```bash
npm run lint
npx tsc --noEmit
npm run build
```

### 7. Open a Pull Request
1. Push your branch to GitHub:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request targeting the `main` branch.
3. Fill out the PR template with clear context, before/after descriptions, and testing steps.

---

## Database Migrations
If your contribution modifies the database schema:
1. Ensure all primary and foreign keys maintain tenant isolation (`tenant_id`).
2. Add an idempotent incremental SQL file in `supabase/migrations/` using the 14-digit timestamp convention: `YYYYMMDDHHMMSS_<description>.sql`.
3. Update `supabase/schema.sql` to keep the consolidated schema in sync.
4. Update `src/types/index.ts` and `src/lib/supabase-sync.ts` accordingly.

---

## Questions and Support
Feel free to open an issue or reach out to the maintainers at **PT Minara Technologi Indonesia** via GitHub Issues.
