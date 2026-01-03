import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const friends = await Promise.all(
      connections.map(async (conn) => {
        const friend = await ctx.db.get(conn.friendId);
        return friend;
      })
    );

    return friends.filter((f) => f !== null);
  },
});

export const connectByStudyCode = mutation({
  args: {
    userId: v.id("users"),
    studyCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by study code
    const friend = await ctx.db
      .query("users")
      .withIndex("by_study_code", (q) => q.eq("studyCode", args.studyCode.toUpperCase()))
      .first();

    if (!friend) {
      throw new Error("Opiskelukoodia ei löydy. Tarkista koodi ja yritä uudelleen.");
    }

    if (friend._id === args.userId) {
      throw new Error("Et voi lisätä itseäsi kaveriksi.");
    }

    // Check if already connected
    const existingConnection = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("friendId"), friend._id))
      .first();

    if (existingConnection) {
      throw new Error("Olette jo kavereita!");
    }

    // Create bidirectional connection
    await ctx.db.insert("connections", {
      userId: args.userId,
      friendId: friend._id,
      status: "accepted",
      createdAt: Date.now(),
    });

    await ctx.db.insert("connections", {
      userId: friend._id,
      friendId: args.userId,
      status: "accepted",
      createdAt: Date.now(),
    });

    return { success: true, friendName: friend.name };
  },
});

export const remove = mutation({
  args: {
    userId: v.id("users"),
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Remove both directions
    const conn1 = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("friendId"), args.friendId))
      .first();

    const conn2 = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", args.friendId))
      .filter((q) => q.eq(q.field("friendId"), args.userId))
      .first();

    if (conn1) await ctx.db.delete(conn1._id);
    if (conn2) await ctx.db.delete(conn2._id);
  },
});
