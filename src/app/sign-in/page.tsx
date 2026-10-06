import { redirect } from "next/navigation";
import { AuthMethods } from "@/components/auth-methods";
import { AuthScreen } from "@/components/auth-screen";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";

export default async function SignInPage() {
  const user = await fetchAuthQuery(api.auth.getCurrentUser);
  if (user) {
    redirect("/");
  }

  return (
    <AuthScreen
      title="Sign in"
      description="Sign in to the portal."
    >
      <AuthMethods />
    </AuthScreen>
  );
}
