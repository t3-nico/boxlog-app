/**
 * Record Activities Subrouter
 * Record activity history management
 */

import type { GetRecordActivitiesInput } from '@/schemas/records/activity';
import { getRecordActivitiesSchema } from '@/schemas/records/activity';
import { protectedProcedure } from '@/server/api/trpc';

import { createActivityRouter } from '../shared/createActivityRouter';

/**
 * Record Activities Router
 */
export const recordActivitiesRouter = createActivityRouter<GetRecordActivitiesInput>({
  entityName: 'Record',
  entityIdField: 'record_id',
  entityTable: 'records',
  activitiesTable: 'record_activities',
  listSchema: getRecordActivitiesSchema,
  protectedProcedure,
});
