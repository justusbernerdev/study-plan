/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as categories from "../categories.js";
import type * as cheers from "../cheers.js";
import type * as connections from "../connections.js";
import type * as courses from "../courses.js";
import type * as dailyEntries from "../dailyEntries.js";
import type * as invitations from "../invitations.js";
import type * as migrations from "../migrations.js";
import type * as milestones from "../milestones.js";
import type * as seed from "../seed.js";
import type * as storage from "../storage.js";
import type * as studyLogs from "../studyLogs.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  categories: typeof categories;
  cheers: typeof cheers;
  connections: typeof connections;
  courses: typeof courses;
  dailyEntries: typeof dailyEntries;
  invitations: typeof invitations;
  migrations: typeof migrations;
  milestones: typeof milestones;
  seed: typeof seed;
  storage: typeof storage;
  studyLogs: typeof studyLogs;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
