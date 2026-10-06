/**
 * Shared constants for the portal theme system.
 *
 * The theme preference is stored in both localStorage (for client reads via
 * useSyncExternalStore) and a cookie (so the server-rendered root layout can
 * apply the correct class without a client-side script).
 */

export const THEME_STORAGE_KEY = "portal-theme" as const;
export const THEME_COOKIE_NAME = "portal-theme" as const;

export type Theme = "light" | "dark";

/** Set the theme cookie (365-day, SameSite=Lax, path=/). */
export function setThemeCookie(theme: Theme): void {
  document.cookie = `${THEME_COOKIE_NAME}=${theme};path=/;max-age=31536000;SameSite=Lax`;
}

