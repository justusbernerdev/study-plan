import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("milestones").collect();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("milestones")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("milestones") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    deadline: v.number(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("milestones", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      deadline: args.deadline,
      color: args.color,
      isCompleted: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("milestones"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    deadline: v.optional(v.number()),
    color: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
