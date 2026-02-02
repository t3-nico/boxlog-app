/**
 * Record Activities Subrouter
 * Record activity history management
 */

import { TRPCError } from '@trpc/server';

import { getRecordActivitiesSchema } from '@/schemas/records/activity';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import type { RecordActivity } from './types';

export const recordActivitiesRouter = createTRPCRouter({
  /**
   * Get activity list
   */
  list: protectedProcedure.input(getRecordActivitiesSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { record_id, limit, offset, order } = input;

    // Verify record ownership
    const { data: record, error: recordError } = await supabase
      .from('records')
      .select('id')
      .eq('id', record_id)
      .eq('user_id', userId)
      .single();

    if (recordError || !record) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Record not found or access denied',
      });
    }

    // Get activities (order: desc=newest first, asc=oldest first)
    const { data: activities, error } = await supabase
      .from('record_activities')
      .select('*')
      .eq('record_id', record_id)
      .order('created_at', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch activities: ${error.message}`,
      });
    }

    return (activities ?? []) as RecordActivity[];
  }),
});
