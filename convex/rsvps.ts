import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const rsvp = await ctx.db
      .query("rsvps")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    return rsvp;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rsvps").collect();
  },
});

export const submit = mutation({
  args: {
    name: v.string(),
    guests: v.optional(
      v.array(
        v.object({
          name: v.string(),
          mealChoice: v.string(),
        })
      )
    ),
    attending: v.boolean(),
    plusOne: v.boolean(),
    plusOneName: v.optional(v.string()),
    plusOneMealChoice: v.optional(v.string()),
    mealChoice: v.optional(v.string()),
    accommodation: v.boolean(),
    isPredefined: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if RSVP already exists for this name
    const existing = await ctx.db
      .query("rsvps")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    const data = {
      name: args.name,
      guests: args.guests,
      attending: args.attending,
      plusOne: args.plusOne,
      plusOneName: args.plusOneName ?? "",
      plusOneMealChoice: args.plusOneMealChoice ?? "",
      mealChoice: args.mealChoice ?? "",
      accommodation: args.accommodation,
      submitted: true,
      isPredefined: args.isPredefined ?? false,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("rsvps", data);
    }
  },
});

export const remove = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const rsvp = await ctx.db
      .query("rsvps")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (rsvp) {
      await ctx.db.delete(rsvp._id);
    }
  },
});
