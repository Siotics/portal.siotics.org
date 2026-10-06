import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { betterAuth } from "better-auth/minimal";
import { v } from "convex/values";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { createAuthOptions } from "./authOptions";
import authSchema from "./betterAuth/schema";
import { USER_ROLE } from "./roles";

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
    verbose: false,
  },
);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    ...createAuthOptions(),
    database: authComponent.adapter(ctx),
  });
};

const currentUserValidator = v.union(
  v.null(),
  v.object({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal(USER_ROLE.member), v.literal(USER_ROLE.admin)),
    image: v.union(v.null(), v.string()),
  }),
);

export const getCurrentUser = query({
  args: {},
  returns: currentUserValidator,
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }

    return {
      name: user.name,
      email: user.email,
      role: user.role === USER_ROLE.admin ? USER_ROLE.admin : USER_ROLE.member,
      image: user.image ?? null,
    };
  },
});
