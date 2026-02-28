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
    attending: v.union(v.boolean(), v.null()),
    plusOne: v.boolean(),
    plusOneName: v.optional(v.string()),
    plusOneMealChoice: v.optional(v.string()),
    mealChoice: v.optional(v.string()),
    accommodation: v.boolean(),
    numberOfKids: v.optional(v.number()),
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
      numberOfKids: args.numberOfKids ?? 0,
      submitted: args.attending !== null,
      isPredefined: args.isPredefined ?? false,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("rsvps", {
        ...data,
        askForPlusOne: true,
        askForKids: false,
        maxNumberOfKids: 0,
        askForAccommodation: true,
      });
    }
  },
});

export const createInvite = mutation({
  args: {
    name: v.string(),
    guests: v.array(v.string()),
    askForPlusOne: v.boolean(),
    askForKids: v.boolean(),
    maxNumberOfKids: v.number(),
    askForAccommodation: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.guests.length === 0) {
      throw new Error("At least one guest is required");
    }

    // Check if invite already exists
    const existing = await ctx.db
      .query("rsvps")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (existing) {
      throw new Error(`An invite for "${args.name}" already exists`);
    }

    const guests = args.guests.map((name) => ({ name, mealChoice: "" }));

    return await ctx.db.insert("rsvps", {
      name: args.name,
      guests,
      attending: null,
      plusOne: false,
      plusOneName: "",
      plusOneMealChoice: "",
      mealChoice: "",
      accommodation: false,
      submitted: false,
      isPredefined: true,
      askForPlusOne: args.askForPlusOne,
      askForKids: args.askForKids,
      maxNumberOfKids: args.maxNumberOfKids,
      numberOfKids: 0,
      askForAccommodation: args.askForAccommodation,
    });
  },
});

export const updateInvite = mutation({
  args: {
    name: v.string(),
    askForPlusOne: v.boolean(),
    askForKids: v.boolean(),
    maxNumberOfKids: v.number(),
    askForAccommodation: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rsvps")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (!existing) {
      throw new Error(`Invite "${args.name}" not found`);
    }
    await ctx.db.patch(existing._id, {
      askForPlusOne: args.askForPlusOne,
      askForKids: args.askForKids,
      maxNumberOfKids: args.maxNumberOfKids,
      askForAccommodation: args.askForAccommodation,
    });
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
