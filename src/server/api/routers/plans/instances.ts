/**
 * Plan Instances Subrouter
 * Recurring plan exception management
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const instancesRouter = createTRPCRouter({
  /**
   * Get exception info for specified plan IDs
   * Bulk fetch exceptions within date range for calendar display
   */
  list: protectedProcedure
    .input(
      z.object({
        planIds: z.array(z.string().uuid()),
        startDate: z.string().optional(), // YYYY-MM-DD
        endDate: z.string().optional(), // YYYY-MM-DD
      }),
    )
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const { planIds, startDate, endDate } = input;

      if (planIds.length === 0) {
        return [];
      }

      // Verify plan ownership (user's plans only)
      const { data: userPlans, error: plansError } = await supabase
        .from('plans')
        .select('id')
        .eq('user_id', userId)
        .in('id', planIds);

      if (plansError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch plans: ${plansError.message}`,
        });
      }

      const validPlanIds = userPlans.map((p) => p.id);
      if (validPlanIds.length === 0) {
        return [];
      }

      // Get exception info from plan_instances
      let query = supabase
        .from('plan_instances')
        .select('*')
        .in('plan_id', validPlanIds)
        .eq('is_exception', true);

      // Date range filter
      if (startDate) {
        query = query.gte('instance_date', startDate);
      }
      if (endDate) {
        query = query.lte('instance_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        // Return empty array if table doesn't exist (for migration compatibility)
        if (error.message.includes('does not exist')) {
          console.warn(
            '[plans.instances.list] plan_instances table does not exist. Please run migration.',
          );
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
   * Create plan instance (exception)
   * Used when modifying/cancelling/moving specific date of recurring plan
   */
  create: protectedProcedure
    .input(
      z.object({
        planId: z.string().uuid(),
        instanceDate: z.string(), // YYYY-MM-DD
        exceptionType: z.enum(['modified', 'cancelled', 'moved']),
        overrides: z.record(z.unknown()).optional(),
        originalDate: z.string().optional(), // Original date when moved
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      // Verify plan ownership
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('id', input.planId)
        .eq('user_id', userId)
        .single();

      if (planError || !plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan not found or access denied',
        });
      }

      // Upsert: update if exists for same date, insert if not
      const { data, error } = await supabase
        .from('plan_instances')
        .upsert(
          {
            plan_id: input.planId,
            instance_date: input.instanceDate,
            is_exception: true,
            exception_type: input.exceptionType,
            overrides: input.overrides ? JSON.parse(JSON.stringify(input.overrides)) : null,
            original_date: input.originalDate ?? null,
          },
          {
            onConflict: 'plan_id,instance_date',
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
   * Delete plan instance (exception)
   * Remove exception to restore original recurring pattern
   */
  delete: protectedProcedure
    .input(
      z.object({
        planId: z.string().uuid(),
        instanceDate: z.string(), // YYYY-MM-DD
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;

      // Verify plan ownership
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('id', input.planId)
        .eq('user_id', userId)
        .single();

      if (planError || !plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan not found or access denied',
        });
      }

      const { error } = await supabase
        .from('plan_instances')
        .delete()
        .eq('plan_id', input.planId)
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
