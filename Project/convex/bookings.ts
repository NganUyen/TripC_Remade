import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's bookings
export const getUserBookings = query({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("confirmed"),
        v.literal("pending"),
        v.literal("cancelled"),
        v.literal("completed"),
      ),
    ),
  },
  handler: async (ctx: any, args: any) => {
    if (args.status !== undefined) {
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_user_and_status", (q: any) =>
          q.eq("userId", args.userId).eq("status", args.status!),
        )
        .collect();
      return bookings.sort((a: any, b: any) => b.createdAt - a.createdAt);
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();
    return bookings.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

// Create a new booking
export const createBooking = mutation({
  args: {
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
    price: v.number(),
    imageUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx: any, args: any) => {
    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      status: "confirmed",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return bookingId;
  },
});

// Update booking status
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Delete booking
export const deleteBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.delete(args.bookingId);
  },
});
