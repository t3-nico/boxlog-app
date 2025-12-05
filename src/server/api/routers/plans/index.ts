/**
 * tRPC Router: Plans
 * プラン・セッション・タグ管理API
 *
 * 分割されたプロシージャを統合
 */

import { createTRPCRouter } from '@/server/api/trpc'

import { activitiesProcedure, createActivityProcedure } from './activities'
import { bulkDeleteProcedure, bulkUpdateProcedure } from './bulk'
import { createProcedure, deleteProcedure, getByIdProcedure, listProcedure, updateProcedure } from './crud'
import { createInstanceProcedure, deleteInstanceProcedure, getInstancesProcedure } from './instances'
import { addTagProcedure, getTagPlanCountsProcedure, getTagsProcedure, removeTagProcedure } from './plan-tags'
import { getDailyHoursProcedure, getStatsProcedure, getTimeByTagProcedure } from './statistics'
import { tagsRouter } from './tags'

export const plansRouter = createTRPCRouter({
  // Tags CRUD (nested router)
  tags: tagsRouter,

  // Plans CRUD
  list: listProcedure,
  getById: getByIdProcedure,
  create: createProcedure,
  update: updateProcedure,
  delete: deleteProcedure,

  // Plan Tags Management
  addTag: addTagProcedure,
  removeTag: removeTagProcedure,
  getTags: getTagsProcedure,
  getTagPlanCounts: getTagPlanCountsProcedure,

  // Bulk Operations
  bulkUpdate: bulkUpdateProcedure,
  bulkDelete: bulkDeleteProcedure,

  // Statistics
  getStats: getStatsProcedure,
  getDailyHours: getDailyHoursProcedure,
  getTimeByTag: getTimeByTagProcedure,

  // Activities
  activities: activitiesProcedure,
  createActivity: createActivityProcedure,

  // Instances (exceptions for recurring plans)
  getInstances: getInstancesProcedure,
  createInstance: createInstanceProcedure,
  deleteInstance: deleteInstanceProcedure,
})
