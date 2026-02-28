import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rsvps: defineTable({
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
    plusOneName: v.string(),
    plusOneMealChoice: v.string(),
    mealChoice: v.string(),
    accommodation: v.boolean(),
    submitted: v.boolean(),
    askForPlusOne: v.boolean(),
    askForKids: v.boolean(),
    maxNumberOfKids: v.number(),
    numberOfKids: v.number(),
    askForAccommodation: v.boolean(),
  }).index("by_name", ["name"]),
  adminSessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
});
