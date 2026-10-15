# Deployment

## Dockerfile

[`Dockerfile`](../Dockerfile) is a three-stage image for the Next.js app. `next.config.ts` sets `output: "standalone"`, which the runner stage expects.

### Stage 1 — `dependencies`

- Base: `node:${NODE_VERSION}` with default `ARG NODE_VERSION=26.3.0-slim`.
- Copies `package.json` and lockfiles (`pnpm-lock.yaml`, plus optional npm/yarn lockfiles and `pnpm-workspace.yaml` / `.npmrc`).
- Installs Corepack globally, then installs with a frozen lockfile. With this repo’s `pnpm-lock.yaml`, that path is `corepack enable pnpm && pnpm install --frozen-lockfile`.
- Uses BuildKit caches for npm / yarn / pnpm stores.

### Stage 2 — `builder`

- Same Node base; Corepack installed again.
- Copies `node_modules` from `dependencies`, then the full source tree.
- Sets `NODE_ENV=production`.
- Runs `pnpm build` when `pnpm-lock.yaml` is present (`next build`).
- Telemetry disable is commented out (`NEXT_TELEMETRY_DISABLED`).

### Stage 3 — `runner`

- Same Node base; Corepack installed (unused by the final `CMD`).
- Sets `NODE_ENV=production`, `PORT=3000`, `HOSTNAME=0.0.0.0`.
- Copies `public`, `.next/standalone` → `/app`, and `.next/static` → `/app/.next/static`, owned by `node`.
- Creates `.next` for prerender cache permissions, then runs as `USER node`.
- Exposes `3000` and starts with `CMD ["node", "server.js"]`.

Optional commented line can copy `.next/cache` from the builder so build-time fetch cache is available at startup.

### Build and run (host)

```bash
docker build -t portal-siotics .
docker run --rm -p 3000:3000 portal-siotics
```

Pass Next.js public env at **image build** time if the client bundle must embed production Convex URLs (see gaps below). Runtime secrets for Better Auth belong on the **Convex** deployment, not only in the container.

## docker-compose

[`docker-compose.yaml`](../docker-compose.yaml) is **empty**. There is no Compose service definition, network, volume, or env wiring in-tree yet.

## Environment at runtime

### Next.js container / process

Required for a working client and auth proxy (see `.env.example`, `src/app/ConvexClientProvider.tsx`, `src/lib/auth-server.ts`):

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `NEXT_PUBLIC_SITE_URL` (must match `SITE_URL`; no trailing slash)

The Dockerfile itself only sets `NODE_ENV`, `PORT`, and `HOSTNAME`. It does not declare `ARG`/`ENV` for Convex or auth keys.

### Convex deployment (auth backend)

Auth options are created in Convex (`convex/authOptions.ts` / `convex/authEnv.ts`). Set these on the Convex deployment (for example `pnpm exec convex env set --from-file …` against the production deployment):

| Variable | Role |
| --- | --- |
| `SITE_URL` | Better Auth `baseURL` and trusted origin |
| `BETTER_AUTH_SECRET` | Better Auth secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google provider |
| `ADMIN_OIDC_CLIENT_ID` / `ADMIN_OIDC_CLIENT_SECRET` | Admin OIDC (with discovery) |
| `ADMIN_OIDC_DISCOVERY_URL` and/or `ADMIN_OIDC_ISSUER` | Discovery document or issuer |
| `ADMIN_OIDC_SCOPES` | Optional scopes |
| `ADMIN_OIDC_PROVIDER_ID` | Optional provider id (not `google`) |

OAuth redirect URIs must use the production `SITE_URL` (Google callback and admin OIDC callback paths documented in `.env.example`).

## Production readiness gaps

Evidence from the current tree:

1. **Empty Compose file** — no multi-service or env-file orchestration for Docker Compose.
2. **No build-arg / runtime wiring for `NEXT_PUBLIC_*`** in the Dockerfile — standalone builds bake public env at build time; without build args or a documented inject step, a generic image may point at the wrong Convex URL.
3. **Auth secrets are Convex-side** — deploying only the Next image is incomplete; Convex env and function deploy are separate steps and are not automated in this repo’s Docker artifacts.
4. **No healthcheck, reverse-proxy, TLS, or resource limits** in Docker/Compose.
5. **No CI/CD deploy pipeline** checked in alongside these artifacts.
6. **Node base pin** — `NODE_VERSION=26.3.0-slim` is hardcoded; the Dockerfile comments ask maintainers to track current LTS over time.
7. **Telemetry** remains enabled unless operators uncomment `NEXT_TELEMETRY_DISABLED`.

Minimum production path today: deploy Convex functions and env to a production deployment, build/run the Next standalone image (or host `pnpm build` + `pnpm start`) with matching public URLs, and register OAuth redirect URIs for that `SITE_URL`.
