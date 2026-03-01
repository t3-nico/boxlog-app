/**
 * Entry Instances Subrouter
 * Recurring entry exception management
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const instancesRouter = createTRPCRouter({
  /**
   * Get exception info for specified entry IDs
   * Bulk fetch exceptions within date range for calendar display
   */
  list: protectedProcedure
    .input(
      z.object({
        entryIds: z.array(z.string().uuid()).max(100),
        startDate: z.string().optional(), // YYYY-MM-DD
        endDate: z.string().optional(), // YYYY-MM-DD
      }),
    )
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const { entryIds, startDate, endDate } = input;

      if (entryIds.length === 0) {
        return [];
      }

      // Verify entry ownership
      const { data: userEntries, error: entriesError } = await supabase
        .from('entries')
        .select('id')
        .eq('user_id', userId)
        .in('id', entryIds);

      if (entriesError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch entries: ${entriesError.message}`,
        });
      }

      const validEntryIds = userEntries.map((e) => e.id);
      if (validEntryIds.length === 0) {
        return [];
      }

      // Get exception info from entry_instances
      let query = supabase.from('entry_instances').select('*').in('entry_id', validEntryIds);

      if (startDate) {
        query = query.gte('instance_date', startDate);
      }
      if (endDate) {
        query = query.lte('instance_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        if (error.message.includes('does not exist')) {
          return [];
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch exception info: ${error.message}`,
        });
      }

      return data ?? [];
    }),

  /**
   * Create entry instance (exception)
   * Used when modifying/cancelling/moving specific date of recurring entry
   */
  create: protectedProcedure
    .input(
      z.object({
        entryId: z.string().uuid(),
        instanceDate: z.string(), // YYYY-MM-DD
        exceptionType: z.enum(['modified', 'cancelled', 'moved']),
        title: z.string().optional(),
        description: z.string().optional(),
        instanceStart: z.string().optional(), // ISO 8601
        instanceEnd: z.string().optional(), // ISO 8601
        originalDate: z.string().optional(), // Original date when moved
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      // Verify entry ownership
      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .select('id')
        .eq('id', input.entryId)
        .eq('user_id', userId)
        .single();

      if (entryError || !entry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entry not found or access denied',
        });
      }

      // Upsert: update if exists for same date, insert if not
      const { data, error } = await supabase
        .from('entry_instances')
        .upsert(
          {
            entry_id: input.entryId,
            instance_date: input.instanceDate,
            exception_type: input.exceptionType,
            title: input.title ?? null,
            description: input.description ?? null,
            instance_start: input.instanceStart ?? null,
            instance_end: input.instanceEnd ?? null,
            original_date: input.originalDate ?? null,
          },
          {
            onConflict: 'entry_id,instance_date',
          },
        )
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create exception: ${error.message}`,
        });
      }

      return data;
    }),

  /**
   * Delete entry instance (exception)
   * Remove exception to restore original recurring pattern
   */
  delete: protectedProcedure
    .input(
      z.object({
        entryId: z.string().uuid(),
        instanceDate: z.string(), // YYYY-MM-DD
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      // Verify entry ownership
      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .select('id')
        .eq('id', input.entryId)
        .eq('user_id', userId)
        .single();

      if (entryError || !entry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entry not found or access denied',
        });
      }

      const { error } = await supabase
        .from('entry_instances')
        .delete()
        .eq('entry_id', input.entryId)
        .eq('instance_date', input.instanceDate);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete exception: ${error.message}`,
        });
      }

      return { success: true };
    }),
});
