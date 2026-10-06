import {
  ADMIN_PROVIDER_ID,
  GOOGLE_PROVIDER_ID,
  USER_ROLE,
  type UserRole,
} from "./roles";

const DEFAULT_ADMIN_OIDC_SCOPES = ["openid", "email", "profile"] as const;

export function adminProviderId() {
  const configured = process.env.ADMIN_OIDC_PROVIDER_ID?.trim();
  return configured || ADMIN_PROVIDER_ID;
}

export function adminDiscoveryUrl() {
  const discoveryUrl = process.env.ADMIN_OIDC_DISCOVERY_URL?.trim();
  if (discoveryUrl) {
    return discoveryUrl;
  }

  const issuer = process.env.ADMIN_OIDC_ISSUER?.trim().replace(/\/$/, "");
  if (!issuer) {
    return undefined;
  }

  return `${issuer}/.well-known/openid-configuration`;
}

export function adminIssuer() {
  const issuer = process.env.ADMIN_OIDC_ISSUER?.trim().replace(/\/$/, "");
  return issuer || undefined;
}

export function adminScopes() {
  const configured = process.env.ADMIN_OIDC_SCOPES?.trim();
  if (!configured) {
    return [...DEFAULT_ADMIN_OIDC_SCOPES];
  }

  return configured.split(/[,\s]+/).filter((scope) => scope.length > 0);
}

export function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_OIDC_CLIENT_ID?.trim() &&
      process.env.ADMIN_OIDC_CLIENT_SECRET?.trim() &&
      adminDiscoveryUrl(),
  );
}

export function assertDistinctProviderIds() {
  if (adminProviderId() === GOOGLE_PROVIDER_ID) {
    throw new Error(
      'ADMIN_OIDC_PROVIDER_ID cannot be "google". Google already uses that provider id.',
    );
  }
}

type ProviderRequest = {
  params?: Record<string, string | undefined>;
  request?: Request;
} | null;

export function providerIdFromContext(context: ProviderRequest) {
  const providerId = context?.params?.providerId ?? context?.params?.id;
  if (providerId) {
    return providerId;
  }

  const requestUrl = context?.request?.url;
  if (!requestUrl) {
    return undefined;
  }

  let pathname: string;
  try {
    pathname = new URL(requestUrl).pathname;
  } catch {
    return undefined;
  }

  const adminCallback = pathname.match(/\/oauth2\/callback\/([^/]+)/);
  if (adminCallback?.[1]) {
    return decodeURIComponent(adminCallback[1]);
  }

  const socialCallback = pathname.match(/\/callback\/([^/]+)/);
  if (socialCallback?.[1]) {
    return decodeURIComponent(socialCallback[1]);
  }

  return undefined;
}

export function roleForProvider(providerId: string | undefined): UserRole {
  if (providerId === adminProviderId()) {
    return USER_ROLE.admin;
  }

  return USER_ROLE.member;
}
