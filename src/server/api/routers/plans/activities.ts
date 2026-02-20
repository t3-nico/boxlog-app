/**
 * Plan Activities Subrouter
 * Plan activity history management
 */

import type { GetPlanActivitiesInput } from '@/schemas/plans/activity';
import { createPlanActivitySchema, getPlanActivitiesSchema } from '@/schemas/plans/activity';
import { protectedProcedure } from '@/server/api/trpc';

import { createActivityRouter } from '../shared/createActivityRouter';

/**
 * Plan Activities Router
 */
export const activitiesRouter = createActivityRouter<GetPlanActivitiesInput>({
  entityName: 'Plan',
  entityIdField: 'plan_id',
  entityTable: 'plans',
  activitiesTable: 'plan_activities',
  listSchema: getPlanActivitiesSchema,
  createSchema: createPlanActivitySchema,
  protectedProcedure,
});
