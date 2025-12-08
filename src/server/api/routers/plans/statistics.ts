/**
 * Statistics Subrouter
 * Plan and tag statistics
 */

import { TRPCError } from '@trpc/server'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const statisticsRouter = createTRPCRouter({
  /**
   * Get plan statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // Get all plans (optimized: select only needed fields)
    const { data: plans, error } = await supabase.from('plans').select('id, status').eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch statistics: ${error.message}`,
      })
    }

    // Count by status
    const byStatus = plans.reduce(
      (acc, plan) => {
        acc[plan.status] = (acc[plan.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: plans.length,
      byStatus,
    }
  }),

  /**
   * Get plan count per tag
   */
  getTagPlanCounts: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // Get user's plan IDs
    const { data: userPlans, error: plansError } = await supabase.from('plans').select('id').eq('user_id', userId)

    if (plansError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${plansError.message}`,
      })
    }

    const planIds = userPlans.map((t) => t.id)

    if (planIds.length === 0) {
      return {}
    }

    // Get counts from plan_tags
    const { data: tagCounts, error: countsError } = await supabase
      .from('plan_tags')
      .select('tag_id')
      .in('plan_id', planIds)

    if (countsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch tag counts: ${countsError.message}`,
      })
    }

    // Count per tag ID
    const counts: Record<string, number> = {}
    tagCounts.forEach((item) => {
      counts[item.tag_id] = (counts[item.tag_id] || 0) + 1
    })

    return counts
  }),

  /**
   * Get last used date per tag
   */
  getTagLastUsed: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // Get user's plan IDs
    const { data: userPlans, error: plansError } = await supabase.from('plans').select('id').eq('user_id', userId)

    if (plansError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${plansError.message}`,
      })
    }

    const planIds = userPlans.map((t) => t.id)

    if (planIds.length === 0) {
      return {}
    }

    // Get last used dates from plan_tags
    const { data: tagUsages, error: usagesError } = await supabase
      .from('plan_tags')
      .select('tag_id, created_at')
      .in('plan_id', planIds)
      .order('created_at', { ascending: false })

    if (usagesError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch tag usage dates: ${usagesError.message}`,
      })
    }

    // Record newest date per tag ID (first found is newest)
    const lastUsed: Record<string, string> = {}
    tagUsages.forEach((item) => {
      if (!lastUsed[item.tag_id] && item.created_at) {
        lastUsed[item.tag_id] = item.created_at
      }
    })

    return lastUsed
  }),
})
