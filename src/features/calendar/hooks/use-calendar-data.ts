'use client'

import { useCallback, useMemo, useState } from 'react'

import { addMinutes, isWithinInterval } from 'date-fns'

import { useI18n } from '@/features/i18n/lib/hooks'
import { Task } from '@/types/unified'

import type { ViewDateRange } from '../types/calendar.types'

interface CalendarTaskExtended extends Omit<Task, 'planned_start' | 'planned_duration'> {
  // カレンダー表示用の追加フィールド
  displayStart: Date
  displayEnd: Date
  planned_start: string // Task と同じ必須フィールド
  planned_end?: string
  planned_duration: number // Task と同じ必須フィールド
  column?: number // 重複時の列位置
  columnSpan?: number // 占有する列数
}

interface UseCalendarDataOptions {
  dateRange: ViewDateRange
  tasks: Task[]
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>
  onTaskCreate?: (task: Partial<Task>) => Promise<void>
  onTaskDelete?: (taskId: string) => Promise<void>
}

export function useCalendarData({
  dateRange,
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
}: UseCalendarDataOptions) {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // カレンダー表示用にタスクを変換
  const calendarTasks = useMemo(() => {
    // 期間内のタスクをフィルタリング
    const filtered = tasks.filter((task) => {
      if (!task.planned_start) return false
      return isWithinInterval(new Date(task.planned_start), {
        start: dateRange.start,
        end: dateRange.end,
      })
    })

    // カレンダー表示用に変換
    const converted: CalendarTaskExtended[] = filtered.map((task) => {
      const startDate = task.planned_start ? new Date(task.planned_start) : new Date()
      const duration = task.planned_duration || 60 // タスクのplanned_durationを使用、デフォルト1時間

      return {
        ...task,
        displayStart: startDate,
        displayEnd: addMinutes(startDate, duration),
        planned_start: startDate.toISOString(),
        planned_end: addMinutes(startDate, duration).toISOString(),
        planned_duration: duration,
      }
    })

    // 重複を検出して列を割り当て
    return assignTaskColumns(converted)
  }, [tasks, dateRange])

  // タスクの時間変更
  const moveTask = useCallback(
    async (taskId: string, newStart: Date) => {
      if (!onTaskUpdate) return

      setIsLoading(true)
      setError(null)

      try {
        await onTaskUpdate(taskId, {
          planned_start: newStart.toISOString(),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to move task')
        console.error('Failed to move task:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [onTaskUpdate]
  )

  // タスクの期間変更
  const resizeTask = useCallback(
    async (taskId: string, newDuration: number) => {
      if (!onTaskUpdate) return

      setIsLoading(true)
      setError(null)

      try {
        // 現在の実装では期間変更はサポートされていないため、
        // 将来的に拡張可能なプレースホルダー
        console.log('Resize task:', taskId, 'to', newDuration, 'minutes')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to resize task')
        console.error('Failed to resize task:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [onTaskUpdate]
  )

  // 新規タスク作成
  const addTask = useCallback(
    async (date: Date, time: string) => {
      if (!onTaskCreate) return

      const [hours, minutes] = time.split(':').map(Number)
      const startDate = new Date(date)
      startDate.setHours(hours!, minutes!, 0, 0)

      setIsLoading(true)
      setError(null)

      try {
        const newTask: Partial<Task> = {
          title: t('calendar.event.newTask'),
          planned_start: startDate.toISOString(),
          planned_duration: 60, // デフォルト60分
          status: 'backlog',
          priority: 'medium',
          user_id: 'default-user', // Auth integration tracked in Issue #87
        }

        await onTaskCreate(newTask)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create task')
        console.error('Failed to create task:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [onTaskCreate, t]
  )

  // タスクの削除
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!onTaskDelete) return

      setIsLoading(true)
      setError(null)

      try {
        await onTaskDelete(taskId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete task')
        console.error('Failed to delete task:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [onTaskDelete]
  )

  // タスクの更新
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      if (!onTaskUpdate) return

      setIsLoading(true)
      setError(null)

      try {
        await onTaskUpdate(taskId, updates)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update task')
        console.error('Failed to update task:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [onTaskUpdate]
  )

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    tasks: calendarTasks,
    isLoading,
    error,
    moveTask,
    resizeTask,
    addTask,
    deleteTask,
    updateTask,
    clearError,
  }
}

// 重複するタスクに列を割り当てる
function assignTaskColumns(tasks: CalendarTaskExtended[]): CalendarTaskExtended[] {
  // 時間でソート
  const sorted = [...tasks].sort((a, b) => a.displayStart.getTime() - b.displayStart.getTime())

  const columns: CalendarTaskExtended[][] = []

  sorted.forEach((task) => {
    // 既存の列で配置可能な場所を探す
    let placed = false

    for (let col = 0; col < columns.length; col++) {
      const column = columns[col]
      if (!column) continue

      const canPlace = column.every((existing) => {
        // 重複チェック
        return task.displayStart >= existing.displayEnd || task.displayEnd <= existing.displayStart
      })

      if (canPlace) {
        column.push(task)
        task.column = col
        placed = true
        break
      }
    }

    // 新しい列が必要
    if (!placed) {
      columns.push([task])
      task.column = columns.length - 1
    }
  })

  // 列数を設定
  const totalColumns = columns.length
  sorted.forEach((task) => {
    task.columnSpan = totalColumns
  })

  return sorted
}

// 時間の衝突検出
export function detectTimeConflicts(
  tasks: CalendarTaskExtended[],
  targetTask: CalendarTaskExtended
): CalendarTaskExtended[] {
  return tasks.filter((task) => {
    if (task.id === targetTask.id) return false

    return !(targetTask.displayEnd <= task.displayStart || targetTask.displayStart >= task.displayEnd)
  })
}

// タスクの期間制約
export function constrainTaskDuration(duration: number, min: number = 15, max: number = 480): number {
  return Math.max(min, Math.min(max, duration))
}
