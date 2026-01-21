import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's wishlist
export const getUserWishlist = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return items.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Add item to wishlist
export const addToWishlist = mutation({
  args: {
    userId: v.id("users"),
    itemType: v.string(),
    itemId: v.string(),
    title: v.string(),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if already in wishlist
    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_item", (q) =>
        q.eq("userId", args.userId).eq("itemId", args.itemId),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    const wishlistId = await ctx.db.insert("wishlist", {
      ...args,
      createdAt: Date.now(),
    });

    return wishlistId;
  },
});

// Remove item from wishlist
export const removeFromWishlist = mutation({
  args: { wishlistId: v.id("wishlist") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.wishlistId);
  },
});

// Check if item is in wishlist
export const isInWishlist = query({
  args: {
    userId: v.id("users"),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_item", (q) =>
        q.eq("userId", args.userId).eq("itemId", args.itemId),
      )
      .unique();

    return !!item;
  },
});
