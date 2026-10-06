"use client";

import { useState } from "react";
import { ADMIN_PROVIDER_ID } from "../../convex/roles";
import { authClient } from "@/lib/auth-client";

function authErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Sign-in failed. Try again.";
}

export function AuthMethods() {
  const [pending, setPending] = useState<"google" | "siotics" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function continueWithGoogle() {
    setError(null);
    setPending("google");
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    if (result.error) {
      setError(authErrorMessage(result.error));
      setPending(null);
    }
  }

  async function continueWithSiotics() {
    setError(null);
    setPending("siotics");
  
    const result = await authClient.signIn.oauth2({
      providerId: ADMIN_PROVIDER_ID,
      callbackURL: "/",
    });
    if (result.error) {
      console.debug("[siotics-sso] sign-in failed", {
        providerId: ADMIN_PROVIDER_ID,
        message: authErrorMessage(result.error),
      });
      setError(authErrorMessage(result.error));
      setPending(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={pending !== null}
        className="flex h-11 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {pending === "google" ? "Redirecting…" : "Continue with Google"}
      </button>
      <button
        type="button"
        onClick={continueWithSiotics}
        disabled={pending !== null}
        className="flex h-11 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium disabled:opacity-60 dark:border-white/15"
      >
        {pending === "siotics" ? "Redirecting…" : "Continue with Siotics IdP"}
      </button>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
