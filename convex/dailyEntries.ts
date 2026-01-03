import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get entries for a specific course and date range
export const getByCourseAndDateRange = query({
  args: {
    courseId: v.id("courses"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("dailyEntries")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Filter by date range
    return entries.filter(
      (e) => e.date >= args.startDate && e.date <= args.endDate
    );
  },
});

// Get entries for a specific category
export const getByCategory = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyEntries")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
  },
});

// Get entries for a specific date and course
export const getByDateAndCourse = query({
  args: {
    courseId: v.id("courses"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("dailyEntries")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    return entries.filter((e) => e.date === args.date);
  },
});

// Get all entries for a user
export const getByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyEntries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Create or update an entry for a specific category and date
export const upsert = mutation({
  args: {
    categoryId: v.id("categories"),
    courseId: v.id("courses"),
    userId: v.id("users"),
    date: v.string(),
    completed: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if entry already exists
    const existingEntries = await ctx.db
      .query("dailyEntries")
      .withIndex("by_category_and_date", (q) =>
        q.eq("categoryId", args.categoryId).eq("date", args.date)
      )
      .collect();

    const existing = existingEntries[0];
    const now = Date.now();

    if (existing) {
      // Update existing entry
      const oldCompleted = existing.completed;
      await ctx.db.patch(existing._id, {
        completed: args.completed,
        updatedAt: now,
      });

      // Update category total completed
      const category = await ctx.db.get(args.categoryId);
      if (category) {
        const diff = args.completed - oldCompleted;
        await ctx.db.patch(args.categoryId, {
          completed: Math.max(0, category.completed + diff),
        });
      }

      return existing._id;
    } else {
      // Create new entry
      const entryId = await ctx.db.insert("dailyEntries", {
        categoryId: args.categoryId,
        courseId: args.courseId,
        userId: args.userId,
        date: args.date,
        completed: args.completed,
        createdAt: now,
        updatedAt: now,
      });

      // Update category total completed
      const category = await ctx.db.get(args.categoryId);
      if (category) {
        await ctx.db.patch(args.categoryId, {
          completed: category.completed + args.completed,
        });
      }

      return entryId;
    }
  },
});

// Save multiple entries for a date at once
export const saveDay = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.id("users"),
    date: v.string(),
    entries: v.array(
      v.object({
        categoryId: v.id("categories"),
        completed: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const entry of args.entries) {
      // Check if entry already exists
      const existingEntries = await ctx.db
        .query("dailyEntries")
        .withIndex("by_category_and_date", (q) =>
          q.eq("categoryId", entry.categoryId).eq("date", args.date)
        )
        .collect();

      const existing = existingEntries[0];

      if (existing) {
        // Update existing entry
        const oldCompleted = existing.completed;
        await ctx.db.patch(existing._id, {
          completed: entry.completed,
          updatedAt: now,
        });

        // Update category total
        const category = await ctx.db.get(entry.categoryId);
        if (category) {
          const diff = entry.completed - oldCompleted;
          await ctx.db.patch(entry.categoryId, {
            completed: Math.max(0, category.completed + diff),
          });
        }
      } else if (entry.completed > 0) {
        // Create new entry only if there's something completed
        await ctx.db.insert("dailyEntries", {
          categoryId: entry.categoryId,
          courseId: args.courseId,
          userId: args.userId,
          date: args.date,
          completed: entry.completed,
          createdAt: now,
          updatedAt: now,
        });

        // Update category total
        const category = await ctx.db.get(entry.categoryId);
        if (category) {
          await ctx.db.patch(entry.categoryId, {
            completed: category.completed + entry.completed,
          });
        }
      }
    }

    return { success: true };
  },
});

// Delete entry
export const remove = mutation({
  args: {
    id: v.id("dailyEntries"),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.id);
    if (!entry) return;

    // Update category total
    const category = await ctx.db.get(entry.categoryId);
    if (category) {
      await ctx.db.patch(entry.categoryId, {
        completed: Math.max(0, category.completed - entry.completed),
      });
    }

    await ctx.db.delete(args.id);
  },
});

