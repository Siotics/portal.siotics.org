import type { ReactNode } from "react";
import { PortalShell } from "@/components/dashboard/portal-shell";
import { requirePortalUser } from "@/lib/require-portal-user";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requirePortalUser();

  return <PortalShell user={user}>{children}</PortalShell>;
}
