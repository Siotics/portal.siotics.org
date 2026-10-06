"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        void authClient.signOut().then(() => {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
          router.push("/sign-in");
          router.refresh();
        });
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100 active:scale-[0.98] dark:hover:bg-zinc-800",
        className
      )}
    >
      <SignOutIcon size={16} aria-hidden="true" />
      Sign out
    </button>
  );
}
