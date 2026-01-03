import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByRecipient = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cheers")
      .withIndex("by_recipient", (q) => q.eq("toUserId", args.userId))
      .order("desc")
      .take(20);
  },
});

export const getUnread = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cheers = await ctx.db
      .query("cheers")
      .withIndex("by_recipient", (q) => q.eq("toUserId", args.userId))
      .collect();
    return cheers.filter((c) => !c.read);
  },
});

export const send = mutation({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cheers", {
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
      message: args.message,
      timestamp: Date.now(),
      read: false,
    });
  },
});

export const markAsRead = mutation({
  args: { id: v.id("cheers") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cheers = await ctx.db
      .query("cheers")
      .withIndex("by_recipient", (q) => q.eq("toUserId", args.userId))
      .collect();

    for (const cheer of cheers) {
      if (!cheer.read) {
        await ctx.db.patch(cheer._id, { read: true });
      }
    }
  },
});
