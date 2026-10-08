import { Metadata } from "next";
import { requirePortalUser } from "@/lib/require-portal-user";
import { cn } from "cn";
export const metadata: Metadata = {
  title: "Account",
};

export default async function OnboardingPage(){
  const user = await requirePortalUser();

  return (
    <main className={cn("flex flex-1 items-center justify-center bg-white px-6 py-16 text-zinc-950")}>
      <section className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8">
        <h1>Welcome {user.name}</h1>
      </section>
    </main>
  );
}
