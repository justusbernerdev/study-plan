import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("studyLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 30);
    return logs;
  },
});

export const getByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studyLogs")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .take(30);
  },
});

export const getTodayLog = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const logs = await ctx.db
      .query("studyLogs")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    return logs.find((log) => log.date === today);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    vocabularyCompleted: v.number(),
    exercisesCompleted: v.number(),
    grammarCompleted: v.number(),
    mood: v.number(),
    difficulty: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const now = Date.now();

    // Check if log exists for today
    const existingLogs = await ctx.db
      .query("studyLogs")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const existingLog = existingLogs.find((log) => log.date === today);

    if (existingLog) {
      await ctx.db.patch(existingLog._id, {
        vocabularyCompleted: args.vocabularyCompleted,
        exercisesCompleted: args.exercisesCompleted,
        grammarCompleted: args.grammarCompleted,
        mood: args.mood,
        difficulty: args.difficulty,
        note: args.note,
        completedAt: now,
      });
      return existingLog._id;
    }

    return await ctx.db.insert("studyLogs", {
      userId: args.userId,
      courseId: args.courseId,
      date: today,
      vocabularyCompleted: args.vocabularyCompleted,
      exercisesCompleted: args.exercisesCompleted,
      grammarCompleted: args.grammarCompleted,
      mood: args.mood,
      difficulty: args.difficulty,
      note: args.note,
      completedAt: now,
    });
  },
});

export const getStreakData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("studyLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(60);

    const dates = Array.from(new Set(logs.map((log) => log.date))).sort().reverse();

    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split("T")[0];

      if (dates.includes(expectedDateStr)) {
        currentStreak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    return {
      currentStreak,
      totalDays: dates.length,
      recentDates: dates.slice(0, 7),
    };
  },
});

