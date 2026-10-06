import type { Metadata } from "next";
import { SessionFacts } from "@/components/dashboard/session-facts";
import { requirePortalUser } from "@/lib/require-portal-user";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Home",
};

export default async function HomePage() {
  const user = await requirePortalUser();

  return (
    <div className={cn("flex flex-1 flex-col gap-8 p-4 md:p-6")}>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="mt-2 max-w-[65ch] text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Signed in as {user.name}.
        </p>
      </header>
      <SessionFacts user={user} />
    </div>
  );
}
