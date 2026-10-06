export const USER_ROLE = {
  member: "member",
  admin: "admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const GOOGLE_PROVIDER_ID = "google";

export const ADMIN_PROVIDER_ID = "siotics";
