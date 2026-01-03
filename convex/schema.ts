import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced from Clerk
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    clerkId: v.optional(v.string()),
    studyCode: v.optional(v.string()), // Unique code for friend connections
    emoji: v.optional(v.string()), // Legacy field
    lastActive: v.number(),
    dailyGoalMet: v.boolean(),
    currentStreak: v.optional(v.number()),
    longestStreak: v.optional(v.number()),
    lastCompletedDate: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()), // Has user completed onboarding?
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_study_code", ["studyCode"]),

  // Connections - friend relationships between users
  connections: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    status: v.string(), // "pending", "accepted"
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"]),

  // Invitations - email invites to join
  invitations: defineTable({
    fromUserId: v.id("users"),
    toEmail: v.string(),
    inviteCode: v.string(),
    status: v.string(), // "pending", "accepted", "expired"
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_from_user", ["fromUserId"])
    .index("by_email", ["toEmail"])
    .index("by_code", ["inviteCode"]),

  // Milestones - high-level deadlines
  milestones: defineTable({
    title: v.string(),
    description: v.string(),
    deadline: v.number(),
    userId: v.id("users"),
    isCompleted: v.boolean(),
    color: v.optional(v.string()),
    emoji: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Courses - specific study units
  courses: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    milestoneId: v.optional(v.id("milestones")),
    startDate: v.optional(v.number()), // When to start studying this course
    endDate: v.optional(v.number()), // Deadline for this course
    lastUpdated: v.number(),
    lastDailyReset: v.optional(v.string()), // YYYY-MM-DD of last daily reset
    checkedItems: v.optional(v.array(v.string())),
    color: v.string(),
    icon: v.string(),
    // Legacy fields (optional for backwards compatibility)
    deadline: v.optional(v.number()),
    totalVocabulary: v.optional(v.number()),
    completedVocabulary: v.optional(v.number()),
    totalExercises: v.optional(v.number()),
    completedExercises: v.optional(v.number()),
    totalGrammar: v.optional(v.number()),
    completedGrammar: v.optional(v.number()),
    todayVocabulary: v.optional(v.number()),
    todayExercises: v.optional(v.number()),
    todayGrammar: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_milestone", ["milestoneId"]),

  // Categories - custom task categories per course
  categories: defineTable({
    courseId: v.id("courses"),
    name: v.string(), // e.g., "Sanasto", "Tehtävät", "Kielioppi"
    icon: v.string(), // Lucide icon name
    color: v.string(),
    total: v.number(), // Total items to complete
    completed: v.number(), // Items completed so far
    todayCompleted: v.number(), // Items completed today
    order: v.number(), // Display order
  }).index("by_course", ["courseId"]),

  // Study logs - daily feedback
  studyLogs: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    date: v.string(),
    vocabularyCompleted: v.number(),
    exercisesCompleted: v.number(),
    grammarCompleted: v.number(),
    mood: v.number(),
    difficulty: v.number(),
    note: v.optional(v.string()),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_date", ["date"]),

  // Daily entries - track completed items per category per day
  dailyEntries: defineTable({
    categoryId: v.id("categories"),
    courseId: v.id("courses"),
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    completed: v.number(), // How many items completed on this day
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_course", ["courseId"])
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_category_and_date", ["categoryId", "date"]),

  // Cheers - social encouragement
  cheers: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    message: v.string(),
    emoji: v.optional(v.string()),
    timestamp: v.number(),
    read: v.boolean(),
  }).index("by_recipient", ["toUserId"]),
});
