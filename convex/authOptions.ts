import { convex } from "@convex-dev/better-auth/plugins";
import { createAuthMiddleware } from "better-auth/api";
import type { BetterAuthOptions } from "better-auth/minimal";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import {
  assertDistinctProviderIds,
  adminDiscoveryUrl,
  adminIssuer,
  adminProviderId,
  adminScopes,
  isAdminConfigured,
  isGoogleConfigured,
  providerIdFromContext,
  roleForProvider,
} from "./authEnv";
import authConfig from "./auth.config";
import { USER_ROLE } from "./roles";

const ADMIN_SIGN_IN_PATH = "/sign-in/oauth2";

function providerIdFromBody(body: unknown) {
  if (!body || typeof body !== "object" || !("providerId" in body)) {
    return undefined;
  }

  const providerId = body.providerId;
  return typeof providerId === "string" ? providerId : undefined;
}

// Auth runs in Convex, so these values come from the deployment environment.
// Keep the same keys in `.env.local` and sync them with `pnpm exec convex env set`.
export function createAuthOptions() {
  assertDistinctProviderIds();

  const siteUrl = process.env.SITE_URL;
  const adminProviders = isAdminConfigured()
    ? [
        {
          providerId: adminProviderId(),
          clientId: process.env.ADMIN_OIDC_CLIENT_ID!.trim(),
          clientSecret: process.env.ADMIN_OIDC_CLIENT_SECRET!.trim(),
          discoveryUrl: adminDiscoveryUrl(),
          issuer: adminIssuer(),
          scopes: adminScopes(),
          pkce: true,
        },
      ]
    : [];

  return {
    appName: "Portal",
    baseURL: siteUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: siteUrl ? [siteUrl] : [],
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (!ctx.path.endsWith(ADMIN_SIGN_IN_PATH)) {
          return;
        }

        const providerId = providerIdFromBody(ctx.body);
        if (providerId !== adminProviderId()) {
          return;
        }
      }),
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          input: false,
          defaultValue: USER_ROLE.member,
        },
      },
    },
    socialProviders: isGoogleConfigured()
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
          },
        }
      : undefined,
    // `input: false` strips provider-mapped fields, so role is assigned here
    // from the callback that actually created the user.
    databaseHooks: {
      user: {
        create: {
          before: async (_user, context) => {
            return {
              data: {
                role: roleForProvider(providerIdFromContext(context)),
              },
            };
          },
        },
      },
    },
    plugins: [
      genericOAuth({
        config: adminProviders,
      }),
      convex({
        authConfig,
        jwt: {
          definePayload: ({ user }) => ({
            name: user.name,
            email: user.email,
            role:
              user.role === USER_ROLE.admin ? USER_ROLE.admin : USER_ROLE.member,
          }),
        },
      }),
    ],
  } satisfies BetterAuthOptions;
}
