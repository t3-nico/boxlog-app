/**
 * Entry Activities Subrouter
 * Entry activity history management
 */

import type { GetEntryActivitiesInput } from '@/schemas/entries/activity';
import { createEntryActivitySchema, getEntryActivitiesSchema } from '@/schemas/entries/activity';
import { protectedProcedure } from '@/server/api/trpc';

import { createActivityRouter } from '../shared/createActivityRouter';

/**
 * Entry Activities Router
 */
export const activitiesRouter = createActivityRouter<GetEntryActivitiesInput>({
  entityName: 'Entry',
  entityIdField: 'entry_id',
  entityTable: 'entries',
  activitiesTable: 'entry_activities',
  listSchema: getEntryActivitiesSchema,
  createSchema: createEntryActivitySchema,
  protectedProcedure,
});
