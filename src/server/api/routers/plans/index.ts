/**
 * Plans Router
 * Aggregates all plan-related subrouters
 *
 * This router maintains backward compatibility with the original flat API structure
 * while organizing code into logical subrouter files.
 */

import { createTRPCRouter, mergeRouters } from '@/server/api/trpc';

import { activitiesRouter } from './activities';
import { bulkRouter } from './bulk';
import { plansCrudRouter } from './crud';
import { instancesRouter } from './instances';
import { statisticsRouter } from './statistics';
import { tagsRouter } from './tags';
import { plansTransactionRouter } from './transaction';

const bulkAliasRouter = createTRPCRouter({
  bulkUpdate: bulkRouter.update,
  bulkDelete: bulkRouter.delete,
  bulkAddTags: bulkRouter.addTags,
});

const statisticsAliasRouter = createTRPCRouter({
  getStats: statisticsRouter.getStats,
  getTagStats: statisticsRouter.getTagStats, // Optimized: replaces getTagPlanCounts + getTagLastUsed
  getTotalTime: statisticsRouter.getTotalTime,
  getSummary: statisticsRouter.getSummary,
  getStreak: statisticsRouter.getStreak,
  getTimeByTag: statisticsRouter.getTimeByTag,
  getDailyHours: statisticsRouter.getDailyHours,
  getHourlyDistribution: statisticsRouter.getHourlyDistribution,
  getDayOfWeekDistribution: statisticsRouter.getDayOfWeekDistribution,
  getMonthlyTrend: statisticsRouter.getMonthlyTrend,
});

const activitiesAliasRouter = createTRPCRouter({
  activities: activitiesRouter.list,
  createActivity: activitiesRouter.create,
});

const instancesAliasRouter = createTRPCRouter({
  getInstances: instancesRouter.list,
  createInstance: instancesRouter.create,
  deleteInstance: instancesRouter.delete,
});

const tagsAliasRouter = createTRPCRouter({
  addTag: tagsRouter.addTag,
  removeTag: tagsRouter.removeTag,
  setTags: tagsRouter.setTags,
});

// Merge all routers to create final plansRouter
// Note: Tag CRUD is managed via tRPC (tags router), plan-tag associations also use tRPC
export const plansRouter = mergeRouters(
  plansCrudRouter,
  bulkAliasRouter,
  statisticsAliasRouter,
  activitiesAliasRouter,
  instancesAliasRouter,
  tagsAliasRouter,
  plansTransactionRouter,
);
