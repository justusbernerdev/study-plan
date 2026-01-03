import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Generate a unique 6-character study code
function generateStudyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const getOrCreate = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update user info if changed
      const updates: any = {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        lastActive: Date.now(),
      };
      
      // Generate study code if user doesn't have one
      if (!existing.studyCode) {
        updates.studyCode = generateStudyCode();
      }
      
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      studyCode: generateStudyCode(),
      lastActive: Date.now(),
      dailyGoalMet: false,
      currentStreak: 0,
      longestStreak: 0,
    });
    return userId;
  },
});

export const getByStudyCode = query({
  args: { studyCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_study_code", (q) => q.eq("studyCode", args.studyCode.toUpperCase()))
      .first();
  },
});

// Preview user by study code (for showing info before adding)
export const previewByStudyCode = query({
  args: { studyCode: v.string() },
  handler: async (ctx, args) => {
    if (args.studyCode.length !== 6) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_study_code", (q) => q.eq("studyCode", args.studyCode.toUpperCase()))
      .first();
    
    if (!user) return null;
    
    return {
      _id: user._id,
      name: user.name,
      imageUrl: user.imageUrl,
      currentStreak: user.currentStreak || 0,
    };
  },
});

// Update profile picture
export const updateProfilePicture = mutation({
  args: {
    id: v.id("users"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { imageUrl: args.imageUrl });
  },
});

export const updateLastActive = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastActive: Date.now() });
  },
});

export const setDailyGoalMet = mutation({
  args: {
    id: v.id("users"),
    met: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { dailyGoalMet: args.met });
  },
});

export const updateStreak = mutation({
  args: {
    id: v.id("users"),
    increment: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");

    const today = new Date().toISOString().split("T")[0];

    if (args.increment) {
      const currentStreak = user.currentStreak ?? 0;
      const longestStreak = user.longestStreak ?? 0;
      const newStreak = currentStreak + 1;
      await ctx.db.patch(args.id, {
        currentStreak: newStreak,
        longestStreak: Math.max(longestStreak, newStreak),
        lastCompletedDate: today,
        dailyGoalMet: true,
      });
    } else {
      await ctx.db.patch(args.id, { currentStreak: 0 });
    }
  },
});

// Update user profile (name, image, onboarding complete)
export const updateProfile = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      onboardingComplete: true,
    };
    
    if (args.name) {
      updates.name = args.name;
    }
    
    // If a storageId is provided, get the URL from storage
    if (args.imageStorageId) {
      const url = await ctx.storage.getUrl(args.imageStorageId);
      if (url) {
        updates.imageUrl = url;
        updates.imageStorageId = args.imageStorageId;
      }
    } else if (args.imageUrl !== undefined) {
      updates.imageUrl = args.imageUrl;
    }
    
    await ctx.db.patch(args.id, updates);
  },
});

// Update profile with uploaded image
export const updateProfileImage = mutation({
  args: {
    id: v.id("users"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Could not get URL for uploaded image");
    }
    
    await ctx.db.patch(args.id, {
      imageUrl: url,
      imageStorageId: args.storageId,
    });
    
    return url;
  },
});
