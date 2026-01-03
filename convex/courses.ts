import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByMilestone = query({
  args: { milestoneId: v.id("milestones") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", args.milestoneId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getWithCategories = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) return null;

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_course", (q) => q.eq("courseId", args.id))
      .collect();

    return {
      ...course,
      categories: categories.sort((a, b) => a.order - b.order),
    };
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    milestoneId: v.optional(v.id("milestones")),
    color: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      milestoneId: args.milestoneId,
      lastUpdated: Date.now(),
      checkedItems: [],
      color: args.color,
      icon: args.icon,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    await ctx.db.patch(id, { ...filteredUpdates, lastUpdated: Date.now() });
  },
});

export const toggleCheckItem = mutation({
  args: {
    id: v.id("courses"),
    itemId: v.string(),
    checked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) throw new Error("Kurssia ei löydy");

    const today = new Date().toISOString().split("T")[0];
    const lastUpdatedDate = new Date(course.lastUpdated).toISOString().split("T")[0];
    const isNewDay = lastUpdatedDate !== today;

    let checkedItems = isNewDay ? [] : [...(course.checkedItems || [])];

    if (args.checked) {
      if (!checkedItems.includes(args.itemId)) {
        checkedItems.push(args.itemId);
      }
    } else {
      checkedItems = checkedItems.filter((item) => item !== args.itemId);
    }

    await ctx.db.patch(args.id, {
      checkedItems,
      lastUpdated: Date.now(),
    });
  },
});

export const completeDay = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) throw new Error("Kurssia ei löydy");

    // Get all categories for this course
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_course", (q) => q.eq("courseId", args.id))
      .collect();

    // Add today's completed to total completed for each category
    for (const cat of categories) {
      await ctx.db.patch(cat._id, {
        completed: Math.min(cat.total, cat.completed + cat.todayCompleted),
        todayCompleted: 0,
      });
    }

    // Clear checked items
    await ctx.db.patch(args.id, {
      checkedItems: [],
      lastUpdated: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    // Delete all categories for this course
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_course", (q) => q.eq("courseId", args.id))
      .collect();

    for (const cat of categories) {
      await ctx.db.delete(cat._id);
    }

    await ctx.db.delete(args.id);
  },
});
