"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AuthScreen({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }, []);

  return (
    <main className={cn("flex flex-1 items-center justify-center bg-white px-6 py-16 text-zinc-950", className)}>
      <section className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8">
        <p className="text-sm font-medium text-zinc-500">Siotics Portal</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-3">{children}</div>
      </section>
    </main>
  );
}
