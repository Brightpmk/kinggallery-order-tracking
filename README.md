# Delivery Tracking

Next.js, TypeScript, and Google Sheets order tracking application for a small
jersey business.

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

The committed test suite covers Google Form normalization, multi-jersey parsing,
public response safety, and customer/jersey search behavior.

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

- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_FORM_RESPONSES_RANGE`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SHEETS_CACHE_TTL_SECONDS`

The app can build without Google credentials, but production order lookup needs
the server-only Google Sheets variables above. Never create `NEXT_PUBLIC_*`
Google credential variables.

`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` may be configured with literal newlines in
`.env.local` or escaped `\n` sequences in Vercel. The server normalizes both
forms before authenticating.

## Google Sheets Setup

1. Create or choose a Google Cloud project.
2. Enable the Google Sheets API for that project.
3. Create a service account and generate a JSON key.
4. Copy the service account `client_email` into
   `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
5. Copy the private key into `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
6. Share the private Google Form response Sheet with the service account email
   as a viewer.
7. Set `GOOGLE_SHEETS_SPREADSHEET_ID` to the Sheet ID from the URL.
8. Keep `GOOGLE_SHEETS_FORM_RESPONSES_RANGE` pointed at the form response tab,
   for example `"'การตอบแบบฟอร์ม 1'!A:U"`.
9. Add the same variables to Vercel Preview and Production environments.

The current Sheet does not provide reliable shipping provider, tracking number,
or detailed order status columns. The customer UI therefore shows only the real
order receipt timestamp plus normalized pickup/shipping method and leaves
tracking fields unavailable until those columns exist.

## Branch Protection

Recommended `main` branch protection:

- Require pull requests before merge.
- Require the `Verify` GitHub Actions status check to pass.
- Restrict force pushes to prevent accidental history rewrites.
