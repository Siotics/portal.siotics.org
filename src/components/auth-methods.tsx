"use client";

import { useState } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { ADMIN_PROVIDER_ID } from "../../convex/roles";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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
      <ButtonPrimitive
        onClick={continueWithGoogle}
        disabled={pending !== null}
        className={cn(
          "flex h-11 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        )}
      >
        {pending === "google" ? "Redirecting…" : "Continue with Google"}
      </ButtonPrimitive>
      <ButtonPrimitive
        onClick={continueWithSiotics}
        disabled={pending !== null}
        className={cn(
          "flex h-11 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50 disabled:opacity-60"
        )}
      >
        {pending === "siotics" ? "Redirecting…" : "Continue with Siotics IdP"}
      </ButtonPrimitive>
      {error ? (
        <p className={cn("text-sm text-red-600")} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
