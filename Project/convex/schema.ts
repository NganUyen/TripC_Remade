import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  bookings: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("hotel"),
      v.literal("flight"),
      v.literal("restaurant"),
      v.literal("activity"),
      v.literal("event"),
      v.literal("wellness"),
      v.literal("beauty"),
      v.literal("transport"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    status: v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  wishlist: defineTable({
    userId: v.id("users"),
    itemType: v.string(),
    itemId: v.string(),
    title: v.string(),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_item", ["userId", "itemId"]),

  reviews: defineTable({
    userId: v.id("users"),
    itemType: v.string(),
    itemId: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_item", ["itemType", "itemId"])
    .index("by_user", ["userId"]),
});
