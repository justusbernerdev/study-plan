import { mutation } from "./_generated/server";

// This mutation is for development/testing only
// In production, users are created from Clerk authentication
export const seedSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    // This is mainly for testing - actual users come from Clerk
    return { message: "Use Clerk authentication to create users" };
  },
});
