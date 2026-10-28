# Deployment and database handoff

For credential signup links, exact environment names and the live verification sequence, start with [SETUP.md](SETUP.md).

## Primary target

Use Node 24 and pnpm 11.25.0. `pnpm build:node` generates Prisma and builds Next.js to `.next-node`; `pnpm start:node` serves it. Configure `.env.example` values securely in the hosting environment. Never commit credentials.

The dedicated Supabase project is `mend` (`qentnogldttrhmobgpzk`, eu-central-1). Initial schema and RLS policies were applied through Supabase migrations `20261017111851` and `20261017111926`. Their checked-in Prisma equivalents are `202610170001_initial` and `202610170002_owner_isolation`.

Before using Prisma migration deployment on this existing database, verify schema parity and baseline those two checked-in migration names with an authorized migration connection:

```sh
pnpm exec prisma migrate resolve --applied 202610170001_initial
pnpm exec prisma migrate resolve --applied 202610170002_owner_isolation
pnpm db:migrate:postgres
```

This baselining has not been run. Do not execute initial CREATE statements against the already-created tables. Fresh databases can apply the two migrations normally. They assume Supabase's `auth.uid()` and roles.

`DIRECT_URL` is for an authorized migration role. `DATABASE_URL` must use the limited application login (`mend_runtime` on the provisioned project), TLS and a reachable direct or compatible pooled endpoint. The runtime login has no superuser, create-role, create-database or RLS-bypass privileges. Its grants are restricted to the exact application tables: CRUD on mutable event/operational/key tables; SELECT/INSERT on append-only history/evidence/report/run/audit tables; schema usage and `auth.uid()` execution. Provision a unique password securely; do not put it in migrations. Runtime credentials are not migration credentials.

The primary application is https://mend-deeencodes.vercel.app. Vercel production deployment `dpl_zZ6DuxJ4ehQKiFrwNrfoBeZTUyot` reached READY at source commit `9f73a766e7a91eb192d1c4e487b6a1a740a8bbdd`. Authenticated deployment checks returned HTTP 200 for `/demo` and `/api/health`; health reported database/auth unconfigured and Qloo/model unavailable. The earlier connected-team HTTP 403 is historical. An anonymous check on October 28 still redirected to Vercel sign-in. The authoring environment's direct database test also failed DNS resolution. Supabase schema checks and a SQL RLS test do not prove the Prisma application transaction path. After connectivity is resolved, verify create, normalized writes, evidence/report/run persistence, stale writes, request replay and cross-owner denial with the runtime role.

Set Supabase Auth site/redirect URLs to the deployed Node origin and `/auth/callback`. Verify email confirmation, sign-in, sign-out and session renewal end to end. No account credentials are included in source.

## Compatibility target

The retained Sites compatibility runtime uses Vinext/Worker, D1 and ChatGPT identity. `pnpm build` packages that target. `drizzle/` contains its ordered migrations; the source/deployment workflow applies them through the configured D1 binding. `node tests/worker-smoke.mjs` runs the built artifact locally with Miniflare.

Compatibility storage and Supabase storage are separate. Existing D1 owners cannot be silently treated as Supabase UUIDs. An explicit, verified account-link and migration process is required to transfer data.

Qloo and model keys remain unset. The public sample is fictional and client-local; server-saved data requires authentication. Preserve access controls when publishing. The GitHub repository is public. Anonymous judge access to the Vercel application remains a separate gate from source visibility and the MIT license.


## Vercel output directory

The Node target intentionally writes to `.next-node`, separate from the Sites compatibility build. `vercel.json` must set `outputDirectory` to `.next-node`, matching `next.config.ts` `distDir`. A Next.js compile can succeed while Vercel packaging fails if its output directory remains `.next`. `pnpm check:repo` now checks this agreement. Node is pinned to `24.x`.
