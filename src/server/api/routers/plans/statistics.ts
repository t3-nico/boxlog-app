/**
 * Statistics Subrouter
 * Plan and tag statistics
 */

import { TRPCError } from '@trpc/server'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

import { z } from 'zod'

export const statisticsRouter = createTRPCRouter({
  /**
   * Get summary statistics (completed tasks, monthly hours, total hours)
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay())
    thisWeekStart.setHours(0, 0, 0, 0)

    // Get all plans with time data
    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time, end_time, status, updated_at')
      .eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      })
    }

    let totalHours = 0
    let thisMonthHours = 0
    let lastMonthHours = 0
    let completedTasks = 0
    let thisWeekCompleted = 0

    for (const plan of plans) {
      // Count completed tasks
      if (plan.status === 'done') {
        completedTasks++
        if (plan.updated_at) {
          const updatedAt = new Date(plan.updated_at)
          if (updatedAt >= thisWeekStart) {
            thisWeekCompleted++
          }
        }
      }

      // Calculate hours
      if (plan.start_time && plan.end_time) {
        const start = new Date(plan.start_time)
        const end = new Date(plan.end_time)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

        if (hours > 0) {
          totalHours += hours

          // This month
          if (start >= thisMonthStart) {
            thisMonthHours += hours
          }

          // Last month
          if (start >= lastMonthStart && start <= lastMonthEnd) {
            lastMonthHours += hours
          }
        }
      }
    }

    // Calculate month comparison percentage
    const monthComparison =
      lastMonthHours > 0 ? Math.round(((thisMonthHours - lastMonthHours) / lastMonthHours) * 100) : 0

    return {
      totalHours,
      thisMonthHours,
      lastMonthHours,
      monthComparison,
      completedTasks,
      thisWeekCompleted,
    }
  }),

  /**
   * Get streak data (consecutive days with activity)
   */
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // Get all plans with start_time in the last year
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .gte('start_time', oneYearAgo.toISOString())

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      })
    }

    // Get unique dates with activity
    const activeDates = new Set<string>()
    for (const plan of plans) {
      if (plan.start_time) {
        const datePart = new Date(plan.start_time).toISOString().split('T')[0]
        if (datePart) {
          activeDates.add(datePart)
        }
      }
    }

    const sortedDates = Array.from(activeDates).sort()
    const todayPart = new Date().toISOString().split('T')[0]
    const today = todayPart ?? ''
    const hasActivityToday = activeDates.has(today)

    // Calculate current streak
    let currentStreak = 0
    let checkDate = new Date()

    // If no activity today, start from yesterday
    if (!hasActivityToday) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (true) {
      const checkDateStr = checkDate.toISOString().split('T')[0]
      if (checkDateStr && activeDates.has(checkDateStr)) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    let prevDate: Date | null = null

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr)
      if (prevDate) {
        const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      } else {
        tempStreak = 1
      }
      prevDate = currentDate
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      currentStreak,
      longestStreak,
      hasActivityToday,
      totalActiveDays: activeDates.size,
    }
  }),

  /**
   * Get time spent per tag
   */
  getTimeByTag: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // Get all plans with time and their tags
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('id, start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)

    if (plansError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${plansError.message}`,
      })
    }

    if (plans.length === 0) {
      return []
    }

    // Get plan-tag relationships
    const planIds = plans.map((p) => p.id)
    const { data: planTags, error: tagsError } = await supabase
      .from('plan_tags')
      .select('plan_id, tag_id')
      .in('plan_id', planIds)

    if (tagsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plan tags: ${tagsError.message}`,
      })
    }

    // Get tag details
    const tagIds = [...new Set(planTags.map((pt) => pt.tag_id))]
    if (tagIds.length === 0) {
      return []
    }

    const { data: tags, error: tagDetailsError } = await supabase
      .from('tags')
      .select('id, name, color')
      .in('id', tagIds)

    if (tagDetailsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch tags: ${tagDetailsError.message}`,
      })
    }

    // Calculate hours per tag
    const tagHours: Record<string, number> = {}
    for (const plan of plans) {
      if (plan.start_time && plan.end_time) {
        const hours = (new Date(plan.end_time).getTime() - new Date(plan.start_time).getTime()) / (1000 * 60 * 60)
        if (hours > 0) {
          const tagIdsForPlan = planTags.filter((pt) => pt.plan_id === plan.id).map((pt) => pt.tag_id)
          for (const tagId of tagIdsForPlan) {
            tagHours[tagId] = (tagHours[tagId] || 0) + hours
          }
        }
      }
    }

    // Build result
    const result = tags
      .map((tag) => ({
        tagId: tag.id,
        name: tag.name,
        color: tag.color || '#6366f1',
        hours: tagHours[tag.id] || 0,
      }))
      .filter((t) => t.hours > 0)
      .sort((a, b) => b.hours - a.hours)

    return result
  }),

  /**
   * Get daily hours for heatmap (yearly view)
   */
  getDailyHours: protectedProcedure.input(z.object({ year: z.number() })).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const { year } = input

    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      })
    }

    // Aggregate hours by date
    const dailyHours: Record<string, number> = {}
    for (const plan of plans) {
      if (plan.start_time && plan.end_time) {
        const datePart = new Date(plan.start_time).toISOString().split('T')[0]
        if (datePart) {
          const hours = (new Date(plan.end_time).getTime() - new Date(plan.start_time).getTime()) / (1000 * 60 * 60)
          if (hours > 0) {
            dailyHours[datePart] = (dailyHours[datePart] || 0) + hours
          }
        }
      }
    }

    return Object.entries(dailyHours).map(([date, hours]) => ({ date, hours }))
  }),

  /**
   * Get hourly distribution (which hours of the day have most activity)
   */
  getHourlyDistribution: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      })
    }

    // Initialize hourly buckets
    const hourlyHours: number[] = new Array(24).fill(0)

    for (const plan of plans) {
      if (plan.start_time && plan.end_time) {
        const start = new Date(plan.start_time)
        const end = new Date(plan.end_time)

        // Simple approach: assign to start hour
        const hour = start.getHours()
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        if (hours > 0) {
          const currentHours = hourlyHours[hour]
          if (currentHours !== undefined) {
            hourlyHours[hour] = currentHours + hours
          }
        }
      }
    }

    // Convert to time slots (grouped by 2 hours)
    const timeSlots = []
    for (let i = 0; i < 24; i += 2) {
      const hourA = hourlyHours[i] ?? 0
      const hourB = hourlyHours[i + 1] ?? 0
      timeSlots.push({
        timeSlot: `${i.toString().padStart(2, '0')}:00`,
        hours: hourA + hourB,
      })
    }

    return timeSlots
  }),

  /**
   * Get day of week distribution
   */
  getDayOfWeekDistribution: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      })
    }

    const dayNames = ['日', '月', '火', '水', '木', '金', '土']
    const dayHours: number[] = new Array(7).fill(0)

    for (const plan of plans) {
      if (plan.start_time && plan.end_time) {
        const start = new Date(plan.start_time)
        const end = new Date(plan.end_time)
        const dayOfWeek = start.getDay()
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        if (hours > 0) {
          const currentHours = dayHours[dayOfWeek]
          if (currentHours !== undefined) {
            dayHours[dayOfWeek] = currentHours + hours
          }
        }
      }
    }

    // Return in Monday-first order (月火水木金土日)
    const mondayFirst = [1, 2, 3, 4, 5, 6, 0]
    return mondayFirst.map((dayIndex) => ({
      day: dayNames[dayIndex] ?? '',
      hours: dayHours[dayIndex] ?? 0,
    }))
  }),

  /**
   * Get monthly trend (last 12 months)
   */
  getMonthlyTrend: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // Get last 12 months
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .gte('start_time', startDate.toISOString())

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      })
    }

    // Initialize monthly buckets
    const monthlyHours: Record<string, number> = {}
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      monthlyHours[key] = 0
    }

    for (const plan of plans) {
      if (plan.start_time && plan.end_time) {
        const start = new Date(plan.start_time)
        const key = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`
        const hours = (new Date(plan.end_time).getTime() - start.getTime()) / (1000 * 60 * 60)
        if (hours > 0 && monthlyHours[key] !== undefined) {
          monthlyHours[key] += hours
        }
      }
    }

    return Object.entries(monthlyHours)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, hours]) => {
        const monthPart = month.split('-')[1]
        return {
          month,
          label: `${monthPart ? parseInt(monthPart) : 0}月`,
          hours,
        }
      })
  }),

  /**
   * Get total time from all plans
   */
  getTotalTime: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    // Get all plans with start_time and end_time
    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch plans: ${error.message}`,
      })
    }

    // Calculate total hours
    let totalMinutes = 0
    let planCount = 0

    for (const plan of plans) {
      if (plan.start_time && plan.end_time) {
        const start = new Date(plan.start_time)
        const end = new Date(plan.end_time)
        const diffMs = end.getTime() - start.getTime()
        if (diffMs > 0) {
          totalMinutes += diffMs / (1000 * 60)
          planCount++
        }
      }
    }

    const totalHours = totalMinutes / 60
    const avgHoursPerPlan = planCount > 0 ? totalHours / planCount : 0

    return {
      totalHours,
      planCount,
      avgHoursPerPlan,
    }
  }),

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
