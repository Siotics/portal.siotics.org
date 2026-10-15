# Local development

## Prerequisites

- **Node.js** — a current LTS release that can run Next.js 16 and the Convex CLI.
- **pnpm 10.18.3** — pinned in `package.json` via `"packageManager": "pnpm@10.18.3"`. Install or enable Corepack so that version is used; do not use npm or yarn for this repo (`AGENTS.md`).

## Install

```bash
pnpm install
```

The lockfile is `pnpm-lock.yaml` (lockfileVersion 9). `pnpm-workspace.yaml` only configures which packages may run lifecycle scripts (`esbuild` allowed; `sharp` and `unrs-resolver` ignored).

## Environment

Copy `.env.example` to `.env.local` and fill in values. `.gitignore` ignores `.env*` and keeps `.env.example` committed.

Auth runs inside Convex. After editing secrets in `.env.local`, sync them to the Convex deployment:

```bash
pnpm exec convex env set --from-file .env.local
```

`CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` are normally written by `pnpm exec convex dev`.

### Variables (from `.env.example` and `convex/authEnv.ts` / `authOptions.ts`)

| Variable | Where it is used | Notes |
| --- | --- | --- |
| `CONVEX_DEPLOYMENT` | Convex CLI | Set by `convex dev` |
| `NEXT_PUBLIC_CONVEX_URL` | Next client / auth server | Convex cloud URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Auth server | Same deployment; host ends in `.convex.site` |
| `NEXT_PUBLIC_SITE_URL` | Next public origin | Must match `SITE_URL`; no trailing slash |
| `SITE_URL` | Convex Better Auth | App origin; trusted origin / base URL |
| `BETTER_AUTH_SECRET` | Convex Better Auth | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Convex | Optional; enables Google social login |
| `ADMIN_OIDC_CLIENT_ID` / `ADMIN_OIDC_CLIENT_SECRET` | Convex | Required with discovery for admin OIDC |
| `ADMIN_OIDC_DISCOVERY_URL` or `ADMIN_OIDC_ISSUER` | Convex (`authEnv`) | Discovery document URL, or issuer (discovery is derived) |
| `ADMIN_OIDC_SCOPES` | Convex | Optional; default `openid,email,profile` |
| `ADMIN_OIDC_PROVIDER_ID` | Convex | Optional; default `siotics`; must not be `google` |

## Run Next.js

```bash
pnpm dev      # next dev — http://localhost:3000
pnpm build    # next build (standalone output)
pnpm start    # next start
pnpm lint     # eslint
```

Tooling notes:

- `next.config.ts` enables `reactCompiler: true` and `output: "standalone"`.
- TypeScript path alias `@/*` → `./src/*` (`tsconfig.json`).
- ESLint uses `eslint-config-next` core-web-vitals + TypeScript (`eslint.config.mjs`).
- Tailwind CSS v4 via `@tailwindcss/postcss` (`postcss.config.mjs`).

## Run Convex

There is no dedicated npm script for Convex. Use the CLI through pnpm:

```bash
pnpm exec convex dev          # watch + push functions; writes deployment URL env
pnpm exec convex dashboard    # open dashboard
pnpm exec convex env set --from-file .env.local
```

Before changing Convex APIs or patterns, read `convex/_generated/ai/guidelines.md` (`AGENTS.md`).

Typical local loop: one terminal with `pnpm exec convex dev`, another with `pnpm dev`.

## Project conventions

From `AGENTS.md`:

- Use **pnpm only** (no npm/yarn).
- Prefer **YAGNI**, **SRP**, **SOLID**, and **DRY**; keep designs small and testable.
- Naming: intention-revealing nouns for types, verbs for functions; no type encodings or magic numbers.
- This Next.js major differs from older docs — check `node_modules/next/dist/docs/` before relying on remembered APIs.

Agent skill pins for Convex and related workflows live in `skills-lock.json` (optional for humans; used by agent tooling).

## Documentation

Project docs live under [`docs/`](./README.md): architecture, auth, frontend, backend, development (this file), and deployment.
