import Link from "next/link";
import { api } from "../../convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { SignOutButton } from "@/components/sign-out-button";

export async function SessionPanel() {
  const user = await fetchAuthQuery(api.auth.getCurrentUser);

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <section className="w-full max-w-md">
          <p className="text-sm font-medium text-zinc-500">Portal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Sign in to continue
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Google accounts join as members. Siotics IdP accounts join as
            admins.
          </p>
          <div className="mt-8">
            <Link
              href="/sign-in"
              className="flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-500">Signed in</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{user.name}</h1>
        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="text-zinc-500">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Role</dt>
            <dd className="capitalize">{user.role}</dd>
          </div>
        </dl>
        <SignOutButton />
      </section>
    </main>
  );
}
