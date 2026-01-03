import { mutation, query } from "./_generated/server";

// Migration to clear old data that doesn't match the new schema
export const clearOldData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all old data
    const cheers = await ctx.db.query("cheers").collect();
    for (const cheer of cheers) {
      await ctx.db.delete(cheer._id);
    }

    const courses = await ctx.db.query("courses").collect();
    for (const course of courses) {
      await ctx.db.delete(course._id);
    }

    const milestones = await ctx.db.query("milestones").collect();
    for (const milestone of milestones) {
      await ctx.db.delete(milestone._id);
    }

    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    const studyLogs = await ctx.db.query("studyLogs").collect();
    for (const log of studyLogs) {
      await ctx.db.delete(log._id);
    }

    return { message: "All old data cleared successfully" };
  },
});

export const checkDataStatus = query({
  args: {},
  handler: async (ctx) => {
    const cheers = await ctx.db.query("cheers").collect();
    const courses = await ctx.db.query("courses").collect();
    const milestones = await ctx.db.query("milestones").collect();
    const users = await ctx.db.query("users").collect();

    return {
      cheers: cheers.length,
      courses: courses.length,
      milestones: milestones.length,
      users: users.length,
    };
  },
});

