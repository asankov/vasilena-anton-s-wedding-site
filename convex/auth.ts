import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error("Admin password not configured");
    }

    if (args.password !== adminPassword) {
      throw new Error("Invalid password");
    }

    // Generate a random token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Expires in 24 hours
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await ctx.db.insert("adminSessions", { token, expiresAt });

    return { token, expiresAt };
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) return false;
    if (session.expiresAt < Date.now()) return false;

    return true;
  },
});
