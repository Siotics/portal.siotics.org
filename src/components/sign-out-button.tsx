"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import { SignOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function useSignOut() {
  const router = useRouter();

  return () => {
    void authClient.signOut().then(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      router.push("/sign-in");
      router.refresh();
    });
  };
}

export function SignOutButton({ className }: { className?: string }) {
  const signOut = useSignOut();

  return (
    <ButtonPrimitive
      onClick={signOut}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100 active:scale-[0.98] dark:hover:bg-zinc-800",
        className
      )}
    >
      <SignOutIcon size={16} aria-hidden="true" />
      Sign out
    </ButtonPrimitive>
  );
}

export function SignOutMenuItem() {
  const signOut = useSignOut();

  return (
    <Menu.Item
      onClick={signOut}
      className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm font-normal outline-none select-none hover:bg-zinc-100 focus:bg-zinc-100 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800"
    >
      <SignOutIcon size={16} aria-hidden="true" />
      Sign out
    </Menu.Item>
  );
}
