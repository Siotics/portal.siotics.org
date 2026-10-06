"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        void authClient.signOut().then(() => {
          router.refresh();
        });
      }}
      className="mt-8 flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-medium dark:border-white/15"
    >
      Sign out
    </button>
  );
}
