# Vercel Deployment Checklist for Next.js App

This is a complete step-by-step guide to structure and configure your Next.js project for seamless deployment to [https://vercel.com](https://vercel.com).

## 1. Directory & File Structure
- [ ] Must include:
  - `package.json`
  - `.gitignore`
  - `.env.local`
  - `next.config.js`
  - `/public`
  - One of:
    - `/app` (App Router)
    - `/pages` (Pages Router)
- [ ] Verify `/node_modules` and `.next/` are excluded from Git

Notes for this repo:
- Monorepo detected with `pnpm-workspace.yaml`. App located at `apps/web` (package `@bookaimark/web`).
- Root has `package.json` and `next.config.js`; app has its own `package.json` and `next.config.js`.

## 2. `package.json` Configuration
- [ ] Required scripts in the app package (`apps/web/package.json`):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```
- [ ] Ensure production deps include: `next`, `react`, `react-dom` (present).
- [ ] At root, ensure Node engine:
```json
{
  "engines": { "node": ">=18" }
}
```
Confirmed present.

## 3. `next.config.js` Setup
- [ ] Prefer a single authoritative config in the app (`apps/web/next.config.js`) tailored for Vercel. Recommended baseline:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {},
};
module.exports = nextConfig;
```
- Current state:
  - Root `next.config.js` includes Sentry bundler plugin. Vercel builds `apps/web` by default when linking that directory as the project root. Prefer moving Sentry setup to the app or ensure your Vercel project root is the monorepo root only if you use monorepo config.
  - `apps/web/next.config.js` sets many `env` defaults with placeholder secrets. For Vercel, remove secrets from `next.config.js` and supply via Vercel Project Environment Variables.
- [ ] Action: Remove hardcoded secrets from `apps/web/next.config.js` `env` block; rely on runtime `process.env.*` and Vercel envs.

## 4. `vercel.json` File
- [ ] In monorepos, set the project root to `apps/web` in Vercel dashboard (Project Settings → General → Root Directory: `apps/web`).
- [ ] Minimal `vercel.json` (optional) at repo root is OK:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next"
}
```
- Recommendation: If the Vercel project root is `apps/web`, you can omit `vercel.json` or create one inside `apps/web` with:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next"
}
```

## 5. Environment Variables
- [ ] Detect all `process.env.*` usages and define them in Vercel → Settings → Environment Variables. Common for this repo:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Server-only)
  - `OPENAI_API_KEY` (Server-only)
  - `BYPASS_AUTHENTICATION` (set to `false` in production)
  - `ENABLE_FILE_STORAGE_FALLBACK` (consider `false` in production)
  - `REDIS_DISABLE` (consider `true` if Redis not configured)
  - `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (if Sentry is used)
  - Stripe variables (if used): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Any `APP_URL` or base URL vars used in link generation
- [ ] Create `.env.local` locally for development only, mirroring the above keys without committing.
- [ ] Run:
```
vercel env add
```
for each production/staging variable.

## 6. Git & Vercel CLI Setup
- [ ] Initialize Git if needed:
```
git init
```
- [ ] `.gitignore` must include:
```
.node_modules
.next
.env*
.vercel
```
- [ ] Install and authenticate Vercel CLI:
```
npm i -g vercel
vercel login
```
- [ ] Link project and pull envs:
```
vercel link
vercel pull --environment=production
```
When prompted for root directory, choose `apps/web`.

## 7. Local Build Simulation
- [ ] From repo root after linking:
```
vercel build
```
- Fix any errors related to:
  - Missing ENV vars (secrets should not be hardcoded)
  - Invalid Next config (remove `output: 'standalone'` when deploying on Vercel; Vercel handles output)
  - Sentry plugin issues (ensure tokens are set only in Vercel and plugin is configured in the app’s root)
- [ ] Confirm `.next/` generated under `apps/web`.

## 8. Deploy to Vercel
- [ ] From the repo root:
```
vercel --prod
```
- Note the production URL.

## 9. Post-deployment Review
- [ ] Confirm pages render.
- [ ] API routes respond without 500s.
- [ ] Dynamic routes ok.
- [ ] Env vars resolve at runtime (OpenAI, Supabase, Stripe, Sentry).
- [ ] Enable Vercel Analytics or Observability as needed.

## 10. Optional Optimizations
- [ ] Consider Edge Runtime for specific routes only if compatible with dependencies.
- [ ] Use ISR/SSG for content pages where applicable.
- [ ] Add integrations: GitHub, Sentry, Supabase, Stripe.

✅ Once all steps are completed, your app is fully ready for production on Vercel with no runtime surprises.

---

## Repo-specific Remediations
- Remove hardcoded placeholder secrets from `apps/web/next.config.js` `env` block. Use Vercel envs instead.
- Ensure Vercel Project Root Directory is `apps/web` (monorepo).
- Root `next.config.js` references Sentry bundler plugin. If building only `apps/web`, shift Sentry setup inside `apps/web` or disable the root plugin.
- Set `BYPASS_AUTHENTICATION` to `false` for production.
- If Redis is not configured, keep `REDIS_DISABLE=true` to avoid runtime failures.
- Stripe webhooks: configure `STRIPE_WEBHOOK_SECRET` and set the route to run on Node.js runtime (not Edge) if needed.
- Supabase: set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
