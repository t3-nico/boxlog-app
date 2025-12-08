/**
 * Plans Router
 * Aggregates all plan-related subrouters
 *
 * This router maintains backward compatibility with the original flat API structure
 * while organizing code into logical subrouter files.
 */

import { createTRPCRouter, mergeRouters } from '@/server/api/trpc'

import { activitiesRouter } from './activities'
import { bulkRouter } from './bulk'
import { plansCrudRouter } from './crud'
import { instancesRouter } from './instances'
import { planTagsRouter } from './plan-tags'
import { statisticsRouter } from './statistics'
import { tagsRouter } from './tags'

// Re-export subrouters with renamed procedures to maintain original API
const planTagsAliasRouter = createTRPCRouter({
  addTag: planTagsRouter.add,
  removeTag: planTagsRouter.remove,
  getTags: planTagsRouter.get,
})

const bulkAliasRouter = createTRPCRouter({
  bulkUpdate: bulkRouter.update,
  bulkDelete: bulkRouter.delete,
  bulkAddTags: bulkRouter.addTags,
})

const statisticsAliasRouter = createTRPCRouter({
  getStats: statisticsRouter.getStats,
  getTagPlanCounts: statisticsRouter.getTagPlanCounts,
  getTagLastUsed: statisticsRouter.getTagLastUsed,
  getTotalTime: statisticsRouter.getTotalTime,
  getSummary: statisticsRouter.getSummary,
  getStreak: statisticsRouter.getStreak,
  getTimeByTag: statisticsRouter.getTimeByTag,
  getDailyHours: statisticsRouter.getDailyHours,
  getHourlyDistribution: statisticsRouter.getHourlyDistribution,
  getDayOfWeekDistribution: statisticsRouter.getDayOfWeekDistribution,
  getMonthlyTrend: statisticsRouter.getMonthlyTrend,
})

const activitiesAliasRouter = createTRPCRouter({
  activities: activitiesRouter.list,
  createActivity: activitiesRouter.create,
})

const instancesAliasRouter = createTRPCRouter({
  getInstances: instancesRouter.list,
  createInstance: instancesRouter.create,
  deleteInstance: instancesRouter.delete,
})

// Base router with nested tags
const baseRouter = createTRPCRouter({
  tags: tagsRouter,
})

// Merge all routers to create final plansRouter
export const plansRouter = mergeRouters(
  baseRouter,
  plansCrudRouter,
  planTagsAliasRouter,
  bulkAliasRouter,
  statisticsAliasRouter,
  activitiesAliasRouter,
  instancesAliasRouter
)
