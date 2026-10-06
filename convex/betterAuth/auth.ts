import { betterAuth } from "better-auth/minimal";
import { createAuthOptions } from "../authOptions";

// Static instance for Better Auth schema generation and client type inference.
export const auth = betterAuth(createAuthOptions());
