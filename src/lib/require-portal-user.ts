import { redirect } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import type { PortalUser } from "@/lib/portal-user";

export async function requirePortalUser(): Promise<PortalUser> {
  const user = await fetchAuthQuery(api.auth.getCurrentUser);

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
