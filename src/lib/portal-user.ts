import type { UserRole } from "../../convex/roles";
import { USER_ROLE } from "../../convex/roles";

export type PortalUser = {
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
};

export function roleLabel(role: UserRole) {
  if (role === USER_ROLE.admin) {
    return "Admin";
  }

  return "Member";
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const second = parts[1];

  if (!first) {
    return "?";
  }

  if (!second) {
    return first.slice(0, 2).toUpperCase();
  }

  return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
}
