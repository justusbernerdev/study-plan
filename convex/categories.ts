import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    return categories.sort((a, b) => a.order - b.order);
  },
});

export const create = mutation({
  args: {
    courseId: v.id("courses"),
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    // Get current max order
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    
    const maxOrder = existing.length > 0 
      ? Math.max(...existing.map(c => c.order)) 
      : -1;

    return await ctx.db.insert("categories", {
      courseId: args.courseId,
      name: args.name,
      icon: args.icon,
      color: args.color,
      total: args.total,
      completed: 0,
      todayCompleted: 0,
      order: maxOrder + 1,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    total: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const updateProgress = mutation({
  args: {
    id: v.id("categories"),
    increment: v.number(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Kategoriaa ei löydy");

    const newCompleted = Math.max(0, Math.min(category.total, category.completed + args.increment));
    const newTodayCompleted = Math.max(0, category.todayCompleted + args.increment);

    await ctx.db.patch(args.id, {
      completed: newCompleted,
      todayCompleted: newTodayCompleted,
    });

    // Update course lastUpdated
    await ctx.db.patch(category.courseId, {
      lastUpdated: Date.now(),
    });
  },
});

export const resetDaily = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    for (const cat of categories) {
      await ctx.db.patch(cat._id, { todayCompleted: 0 });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    categoryIds: v.array(v.id("categories")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.categoryIds.length; i++) {
      await ctx.db.patch(args.categoryIds[i], { order: i });
    }
  },
});

