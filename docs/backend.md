# Convex backend

This document describes the Convex backend under [`convex/`](../convex/). It reflects what is defined in the repository today.

## 1. App configuration

[`convex/convex.config.ts`](../convex/convex.config.ts) defines the Convex app with `defineApp()` and mounts one local component:

```ts
import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";

const app = defineApp();
app.use(betterAuth);

export default app;
```

The Better Auth component is declared in [`convex/betterAuth/convex.config.ts`](../convex/betterAuth/convex.config.ts) as `defineComponent("betterAuth")`. After mount, the generated `components` object exposes it as `components.betterAuth` (see [`convex/_generated/api.d.ts`](../convex/_generated/api.d.ts)).

No other Convex components are installed in the app config.

## 2. Schema status

### App schema

[`convex/schema.ts`](../convex/schema.ts) is empty:

```ts
export default defineSchema({});
```

The portal app does not define its own tables yet. Domain data lives in the Better Auth component schema (or will be added to the app schema later).

### Better Auth component schema

[`convex/betterAuth/schema.ts`](../convex/betterAuth/schema.ts) re-exports the generated table definitions from [`convex/betterAuth/generatedSchema.ts`](../convex/betterAuth/generatedSchema.ts). Those tables are:

| Table | Purpose |
| --- | --- |
| `user` | Auth user profile (`name`, `email`, `emailVerified`, `image`, timestamps, optional `userId`, optional `role`) |
| `session` | Sessions keyed by `token` and `userId` |
| `account` | Linked OAuth/credential accounts (`providerId`, tokens, scopes) |
| `verification` | Verification tokens |
| `jwks` | JWT signing keys for the Convex Better Auth plugin |

Indexes are defined on email/name, session token, account provider pairs, and related lookup fields. Regenerate with `npx auth generate --output convex/betterAuth/generatedSchema.ts` when auth options change.

App code wires the local schema into the auth client in [`convex/auth.ts`](../convex/auth.ts) via `createClient(..., { local: { schema: authSchema } })`.

## 3. Public vs internal function surface

### Public (callable from clients)

| Reference | Kind | File | Role |
| --- | --- | --- | --- |
| `api.auth.getCurrentUser` | `query` | [`convex/auth.ts`](../convex/auth.ts) | Returns the signed-in user’s `name`, `email`, `role` (`member` \| `admin`), and `image`, or `null` |

That is the only app-level public Convex function registered today.

### Internal

No app-level `internalQuery`, `internalMutation`, or `internalAction` is defined under `convex/*.ts`.

### Component / auth plumbing (not app API)

These are wiring, not portal domain endpoints:

- [`convex/auth.ts`](../convex/auth.ts) — `authComponent`, `createAuth`
- [`convex/authOptions.ts`](../convex/authOptions.ts) — Better Auth options factory
- [`convex/authEnv.ts`](../convex/authEnv.ts) — provider/env helpers
- [`convex/auth.config.ts`](../convex/auth.config.ts) — JWT provider config for Convex
- [`convex/betterAuth/adapter.ts`](../convex/betterAuth/adapter.ts) — component CRUD API from `createApi` (`create`, `findOne`, `findMany`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`)
- [`convex/betterAuth/auth.ts`](../convex/betterAuth/auth.ts) — static Better Auth instance for schema generation / client types

## 4. HTTP router

[`convex/http.ts`](../convex/http.ts) creates an `httpRouter` and registers Better Auth HTTP routes:

```ts
const http = httpRouter();
authComponent.registerRoutes(http, createAuth);
export default http;
```

There are no custom app HTTP routes beyond those registered by the auth component. Auth traffic is handled through this Convex HTTP surface (with the Next.js auth proxy under `src/app/api/auth/[...all]/`).

## 5. Roles and domain concepts

Defined in [`convex/roles.ts`](../convex/roles.ts):

| Constant | Value | Meaning |
| --- | --- | --- |
| `USER_ROLE.member` | `"member"` | Default portal role |
| `USER_ROLE.admin` | `"admin"` | Elevated role |
| `GOOGLE_PROVIDER_ID` | `"google"` | Google social provider id |
| `ADMIN_PROVIDER_ID` | `"siotics"` | Default admin OIDC provider id (overridable via `ADMIN_OIDC_PROVIDER_ID`) |

Role assignment lives in [`convex/authOptions.ts`](../convex/authOptions.ts) and [`convex/authEnv.ts`](../convex/authEnv.ts):

- Users get an optional `role` additional field (default `member`, not client-writable).
- On user create, `roleForProvider` sets `admin` when the provider is the admin OIDC provider; otherwise `member`.
- JWT payload includes `name`, `email`, and normalized `role`.
- Google is optional (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).
- Admin OIDC is optional (`ADMIN_OIDC_CLIENT_ID`, `ADMIN_OIDC_CLIENT_SECRET`, discovery URL or issuer).
- Provider ids must stay distinct (`assertDistinctProviderIds`).

Frontend copy on the account page matches this: Google → member, Siotics IdP → admin.

## 6. How the frontend calls Convex

Generated clients live in [`convex/_generated/`](../convex/_generated/). Import the typed `api` (and `internal` when needed) from `convex/_generated/api`.

**Server Components / server helpers** use Better Auth Next.js helpers from [`src/lib/auth-server.ts`](../src/lib/auth-server.ts):

- `fetchAuthQuery(api.auth.getCurrentUser)` — used by [`src/lib/require-portal-user.ts`](../src/lib/require-portal-user.ts), sign-in, and portal pages
- Also available: `fetchAuthMutation`, `fetchAuthAction`, `preloadAuthQuery`, `isAuthenticated`, `getToken`

**Client components** use `ConvexReactClient` wrapped by `ConvexBetterAuthProvider` in [`src/app/ConvexClientProvider.tsx`](../src/app/ConvexClientProvider.tsx). Once more public queries/mutations exist, call them with `useQuery(api....)` / `useMutation(api....)` from `convex/react`.

File-based routing maps `convex/auth.ts` → `api.auth.*`. New modules follow the same pattern (`convex/account.ts` → `api.account.*`).

JWT auth for Convex is configured in [`convex/auth.config.ts`](../convex/auth.config.ts) via `getAuthConfigProvider()` from `@convex-dev/better-auth`.

## 7. Guidelines summary

From [`convex/_generated/ai/guidelines.md`](../convex/_generated/ai/guidelines.md) (practical subset for this codebase):

- Always add argument validators (`v`) on every Convex function; prefer `returns` validators too.
- Use `query` / `mutation` / `action` only for public API; use `internal*` for anything called only by other Convex code or HTTP actions.
- Prefer `ctx.auth.getUserIdentity()` (and Better Auth helpers like `safeGetAuthUser`) for identity — do not trust client-supplied user ids for authorization.
- Prefer `identity.tokenIdentifier` as the stable auth key when linking app data.
- Define app tables in `convex/schema.ts`; keep indexes named after their fields (`by_field1_and_field2`).
- Bound reads with `.take()` or pagination; avoid unbounded `.collect()` as tables grow.
- Do not read `Date.now()` inside queries for freshness; pass time from the client or schedule mutations.
- Mount components in `convex.config.ts`; wrap component calls behind app functions that enforce authz.
- Put Node-only actions in separate `"use node";` files — never mix with queries/mutations in the same file.
- Test with `convex-test` + vitest when adding function coverage.

## 8. Recommended next backend modules

These are **recommendations only** — they are not implemented. They follow the current portal UI shape (`(portal)/`, `account/`, `onboarding/`, member/admin roles) and the empty app schema.

1. **`convex/account.ts` (or `users.ts`)** — Public queries for account profile display beyond `getCurrentUser` (e.g. linked providers from Better Auth), and mutations for safe profile updates that stay within auth component boundaries.
2. **App-owned profile / membership tables in `convex/schema.ts`** — Portal-specific fields that do not belong on the Better Auth `user` document (onboarding completion, preferences, org membership), keyed by auth identity (`tokenIdentifier` or Better Auth user id).
3. **`convex/onboarding.ts`** — Query/mutation pair to read and mark onboarding complete so `/onboarding` can gate progress server-side.
4. **Admin-only modules** — Internal or public functions gated on `role === admin` for member listing or moderation, once admin UX exists.
5. **Authorization helpers** — Shared `requireUser` / `requireAdmin` helpers used by new queries and mutations so role checks stay DRY with [`convex/roles.ts`](../convex/roles.ts).

Keep new public surface thin; put privileged writes behind `internal*` and call them from authenticated public mutations or HTTP actions after authorization checks.
