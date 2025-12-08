'use client'

import { useCallback } from 'react'

import { format } from 'date-fns'

import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import { logger } from '@/lib/logger'

import type { CalendarPlan, CalendarViewType } from '../../../types/calendar.types'

interface UseCalendarHandlersOptions {
  viewType: CalendarViewType
  currentDate: Date
}

export function useCalendarHandlers({ viewType, currentDate }: UseCalendarHandlersOptions) {
  const { openInspector } = usePlanInspectorStore()
  const { createPlan } = usePlanMutations()

  // タスククリックハンドラー
  const handleTaskClick = useCallback(() => {
    // Task click functionality removed - not used in current implementation
  }, [])

  // イベント関連のハンドラー
  const handleEventClick = useCallback(
    (plan: CalendarPlan) => {
      // プランIDでplan Inspectorを開く
      openInspector(plan.id)
      logger.log('📋 Opening plan Inspector:', { planId: plan.id, title: plan.title })
    },
    [openInspector]
  )

  const handleCreateEvent = useCallback(
    (date?: Date, time?: string) => {
      logger.log('➕ Create event requested:', {
        date: date?.toISOString(),
        dateString: date?.toDateString(),
        time,
        currentDate: currentDate.toISOString(),
        viewType,
      })

      // 時刻の解析
      let startTime: Date | undefined
      let endTime: Date | undefined

      if (date) {
        if (time) {
          if (time.includes('-')) {
            const [start, end] = time.split('-')
            const [startHour, startMin] = start?.split(':').map(Number) ?? [9, 0]
            const [endHour, endMin] = end?.split(':').map(Number) ?? [10, 0]

            startTime = new Date(date)
            startTime.setHours(startHour ?? 9, startMin ?? 0, 0, 0)

            endTime = new Date(date)
            endTime.setHours(endHour ?? 10, endMin ?? 0, 0, 0)
          } else {
            const [hour, min] = time.split(':').map(Number)
            startTime = new Date(date)
            startTime.setHours(hour ?? 9, min ?? 0, 0, 0)

            endTime = new Date(date)
            endTime.setHours((hour ?? 9) + 1, min ?? 0, 0, 0) // デフォルト1時間
          }
        } else {
          startTime = new Date(date)
          startTime.setHours(9, 0, 0, 0) // デフォルト9:00

          endTime = new Date(date)
          endTime.setHours(10, 0, 0, 0) // デフォルト10:00
        }
      }

      // プランを作成してInspectorで編集
      if (startTime && endTime && date) {
        createPlan.mutate(
          {
            title: '新規プラン',
            status: 'todo',
            due_date: format(date, 'yyyy-MM-dd'),
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
          },
          {
            onSuccess: (newPlan) => {
              openInspector(newPlan.id)
              logger.log('✅ Created plan:', {
                planId: newPlan.id,
                title: newPlan.title,
                dueDate: newPlan.due_date,
              })
            },
          }
        )
      }
    },
    [viewType, currentDate, createPlan, openInspector]
  )

  // タスク作成ハンドラー
  const handleCreateTask = useCallback(
    (_taskData: {
      title: string
      planned_start: Date
      planned_duration: number
      status: 'pending' | 'in_progress' | 'completed'
      priority: 'low' | 'medium' | 'high'
      description?: string
      tags?: string[]
    }) => {
      // noop - Plans統合後に実装予定
    },
    []
  )

  // 記録作成ハンドラー
  const handleCreateRecord = useCallback(
    (_recordData: {
      title: string
      actual_start: Date
      actual_end: Date
      actual_duration: number
      satisfaction?: number
      focus_level?: number
      energy_level?: number
      memo?: string
      interruptions?: number
    }) => {
      // Record creation tracked in Issue #89
    },
    []
  )

  // 空き時間クリック用のハンドラー
  const handleEmptyClick = useCallback(
    (date: Date, time: string) => {
      logger.log('🖱️ Empty time clicked:', { date, time })
      handleCreateEvent(date, time)
    },
    [handleCreateEvent]
  )

  // 統一された時間範囲選択ハンドラー（全ビュー共通）
  const handleDateTimeRangeSelect = useCallback(
    (selection: { date: Date; startHour: number; startMinute: number; endHour: number; endMinute: number }) => {
      // 指定された日付に時間を設定
      const startTime = new Date(
        selection.date.getFullYear(),
        selection.date.getMonth(),
        selection.date.getDate(),
        selection.startHour,
        selection.startMinute
      )
      const endTime = new Date(
        selection.date.getFullYear(),
        selection.date.getMonth(),
        selection.date.getDate(),
        selection.endHour,
        selection.endMinute
      )

      logger.log('📅 Calendar Drag Selection:', {
        date: selection.date.toDateString(),
        startTime: startTime.toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString(),
      })

      // プランを作成してからInspectorで編集
      createPlan.mutate(
        {
          title: '新規プラン',
          status: 'todo',
          due_date: format(selection.date, 'yyyy-MM-dd'),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        },
        {
          onSuccess: (newplan) => {
            // 作成されたプランをInspectorで開く
            openInspector(newplan.id)
            logger.log('✅ Created plan from drag selection:', {
              planId: newplan.id,
              title: newplan.title,
              dueDate: newplan.due_date,
            })
          },
        }
      )
    },
    [createPlan, openInspector]
  )

  return {
    handleTaskClick,
    handleEventClick,
    handleCreateEvent,
    handleCreateTask,
    handleCreateRecord,
    handleEmptyClick,
    handleDateTimeRangeSelect,
  }
}
