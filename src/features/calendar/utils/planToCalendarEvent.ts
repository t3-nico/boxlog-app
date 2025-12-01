import type { Plan, PlanStatus, PlanWithTags } from '@/features/plans/types/plan'
import type { CalendarEvent } from '../types/calendar.types'
import { parseDatetimeString } from './dateUtils'

// グローバル変数でユーザーのタイムゾーン設定を保持（後でContextから取得するように改善）
let userTimezone: string | undefined

export function setUserTimezone(timezone: string) {
  userTimezone = timezone
}

/**
 * PlanStatusをCalendarEventのstatusにマッピング
 */
function mapPlanStatusToCalendarStatus(planStatus: PlanStatus): CalendarEvent['status'] {
  const statusMap: Record<PlanStatus, CalendarEvent['status']> = {
    backlog: 'inbox',
    ready: 'planned',
    active: 'in_progress',
    wait: 'planned',
    done: 'completed',
    cancel: 'cancelled',
  }

  return statusMap[planStatus]
}

/**
 * PlanStatusに応じた色を返す
 */
function getColorForStatus(status: PlanStatus): string {
  const colorMap: Record<PlanStatus, string> = {
    backlog: 'hsl(var(--muted))',
    ready: 'hsl(var(--primary))',
    active: 'hsl(var(--chart-2))',
    wait: 'hsl(var(--chart-4))',
    done: 'hsl(var(--chart-3))',
    cancel: 'hsl(var(--muted))',
  }

  return colorMap[status]
}

/**
 * PlanをCalendarEventに変換
 *
 * @param plan - 変換するPlan（タグ付きも対応）
 * @returns CalendarEvent
 *
 * @example
 * ```typescript
 * const plan: PlanWithTags = {
 *   id: '123',
 *   title: 'ミーティング',
 *   start_time: '2025-11-20T10:00:00Z',
 *   end_time: '2025-11-20T11:00:00Z',
 *   status: 'ready',
 *   tags: [{ id: '1', name: '重要', color: '#ff0000' }],
 *   // ...
 * }
 *
 * const event = planToCalendarEvent(plan)
 * // event.startDate: Date(2025-11-20 10:00)
 * // event.endDate: Date(2025-11-20 11:00)
 * // event.status: 'planned'
 * // event.tags: [{ id: '1', name: '重要', color: '#ff0000' }]
 * ```
 */
export function planToCalendarEvent(plan: Plan | PlanWithTags): CalendarEvent {
  // ユーザー設定のタイムゾーンでUTC時刻を解釈
  const startDate = plan.start_time ? parseDatetimeString(plan.start_time, userTimezone) : new Date()
  const endDate = plan.end_time
    ? parseDatetimeString(plan.end_time, userTimezone)
    : new Date(startDate.getTime() + 60 * 60 * 1000) // デフォルト1時間後

  // タグ情報を変換（PlanWithTagsの場合）
  const tags = 'tags' in plan && plan.tags ? plan.tags : undefined

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description ?? undefined,
    startDate,
    endDate,
    status: mapPlanStatusToCalendarStatus(plan.status),
    color: getColorForStatus(plan.status),
    plan_number: plan.plan_number, // プラン番号を追加
    reminder_minutes: plan.reminder_minutes, // 通知設定を追加
    tags, // タグ情報を追加
    createdAt: plan.created_at ? new Date(plan.created_at) : new Date(),
    updatedAt: plan.updated_at ? new Date(plan.updated_at) : new Date(),
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)), // 分単位
    isMultiDay: false, // TODO: 複数日対応
    isRecurring: plan.recurrence_type !== null && plan.recurrence_type !== 'none',
  }
}

// 後方互換性のためのエイリアス
export const ticketToCalendarEvent = planToCalendarEvent

/**
 * Plan配列をCalendarEvent配列に変換
 *
 * @param plans - 変換するPlan配列（タグ付きも対応）
 * @returns CalendarEvent配列
 */
export function plansToCalendarEvents(plans: (Plan | PlanWithTags)[]): CalendarEvent[] {
  return plans.map(planToCalendarEvent)
}

// 後方互換性のためのエイリアス
export const ticketsToCalendarEvents = plansToCalendarEvents
