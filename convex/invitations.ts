import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate a random invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getPending = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", args.userId))
      .collect();
    return invitations.filter((inv) => inv.status === "pending");
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("toEmail", args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_code", (q) => q.eq("inviteCode", args.code))
      .first();
  },
});

export const send = mutation({
  args: {
    fromUserId: v.id("users"),
    toEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already invited
    const existing = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("toEmail", args.toEmail))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) {
      throw new Error("Tämä sähköpostiosoite on jo kutsuttu");
    }

    // Check if user already exists with this email
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.toEmail))
      .first();

    if (existingUser) {
      // Create direct connection instead
      const existingConnection = await ctx.db
        .query("connections")
        .withIndex("by_user", (q) => q.eq("userId", args.fromUserId))
        .filter((q) => q.eq(q.field("friendId"), existingUser._id))
        .first();

      if (!existingConnection) {
        await ctx.db.insert("connections", {
          userId: args.fromUserId,
          friendId: existingUser._id,
          status: "accepted",
          createdAt: Date.now(),
        });
        await ctx.db.insert("connections", {
          userId: existingUser._id,
          friendId: args.fromUserId,
          status: "accepted",
          createdAt: Date.now(),
        });
      }
      return { alreadyUser: true, userId: existingUser._id };
    }

    const inviteCode = generateInviteCode();
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const invitationId = await ctx.db.insert("invitations", {
      fromUserId: args.fromUserId,
      toEmail: args.toEmail,
      inviteCode,
      status: "pending",
      createdAt: now,
      expiresAt,
    });

    return { invitationId, inviteCode };
  },
});

export const accept = mutation({
  args: {
    inviteCode: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!invitation) {
      throw new Error("Kutsukoodia ei löydy");
    }

    if (invitation.status !== "pending") {
      throw new Error("Kutsu on jo käytetty tai vanhentunut");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Kutsu on vanhentunut");
    }

    // Update invitation status
    await ctx.db.patch(invitation._id, { status: "accepted" });

    // Create bidirectional connection
    await ctx.db.insert("connections", {
      userId: invitation.fromUserId,
      friendId: args.userId,
      status: "accepted",
      createdAt: Date.now(),
    });

    await ctx.db.insert("connections", {
      userId: args.userId,
      friendId: invitation.fromUserId,
      status: "accepted",
      createdAt: Date.now(),
    });

    return { success: true, friendId: invitation.fromUserId };
  },
});

export const cancel = mutation({
  args: { id: v.id("invitations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
