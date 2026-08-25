# Delivery Tracking

Next.js, TypeScript, and Supabase order tracking application for a small jersey
business.

## Development

Use Node.js `24.x`, matching `.nvmrc`, `package.json` engines, GitHub Actions,
and the intended Vercel runtime.

```bash
npm ci
npm run dev
```

## CI/CD

GitHub Actions runs continuous integration on:

- Pull requests targeting `main`
- Pushes to `main`

The CI workflow uses `npm ci` and runs:

- `npm run lint`
- `npm run typecheck`
- `npm test`, only if a real `test` script exists
- `npm run build`

There is currently no committed automated test suite, so CI skips the test step
until a real test script is added.

## Vercel Deployment

Use Vercel's native GitHub integration rather than a custom deployment workflow:

1. Feature branch or pull request opens.
2. GitHub Actions CI runs.
3. Vercel creates a Preview Deployment for review.
4. After review and CI pass, merge to `main`.
5. Vercel deploys Production from `main`.

Configure the Vercel project with Framework Preset `Next.js`, Install Command
`npm ci`, and Build Command `npm run build`.

## Environment Variables

Use placeholders only in `.env.example`. Do not commit real secrets.

Local development, Vercel Preview, and Vercel Production should each configure
their own values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The current app can build without Supabase environment variables. At runtime,
server-side lookups use Supabase only when the public Supabase values and
server-only service-role key are configured. Never expose the service-role key in
client code or public environment variables.

## Database Migrations

Supabase migrations are version-controlled under `supabase/migrations`.
Production database migrations are not run automatically by CI. Review and apply
database changes manually or through a separate, explicitly approved migration
process.

## Branch Protection

Recommended `main` branch protection:

- Require pull requests before merge.
- Require the `Verify` GitHub Actions status check to pass.
- Restrict force pushes to prevent accidental history rewrites.
