import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { getToken } from "@/lib/auth-server";
import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Siotics Portal",
    template: "%s - Siotics Portal",
  },
  description: "Sign in with Google or Siotics IdP",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [token, cookieStore] = await Promise.all([getToken(), cookies()]);
  const theme: Theme = cookieStore.get(THEME_COOKIE_NAME)?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "h-full antialiased",
        theme === "dark" && "dark",
      )}
      style={{ colorScheme: theme }}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider initialToken={token}>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
