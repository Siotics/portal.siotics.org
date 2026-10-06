import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthMethods } from "@/components/auth-methods";
import { AuthScreen } from "@/components/auth-screen";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const user = await fetchAuthQuery(api.auth.getCurrentUser);
  if (user) {
    redirect("/");
  }

  return (
    <AuthScreen
      title="Sign in"
      description="Where anyone can build cool stuff!"
    >
      <AuthMethods />
    </AuthScreen>
  );
}
