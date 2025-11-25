// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
import { describe, expect, it } from 'vitest'

import {
  assignTaskColumns,
  calculateTaskPosition,
  calculateTimeFromPosition,
  constrainTaskDuration,
  detectTimeConflicts,
  formatTimeForDisplay,
  generateTimeLabels,
  getCurrentTimePosition,
  getGridLineClass,
  getTimeSlotBgClass,
  isDraggable,
  isDroppable,
  minutesToTime,
  snapToGrid,
  timeToMinutes,
  type CalendarTask,
} from './time-grid-helpers'

describe('time-grid-helpers', () => {
  describe('timeToMinutes', () => {
    it('時刻文字列を分に変換する', () => {
      expect(timeToMinutes('09:30')).toBe(570)
      expect(timeToMinutes('00:00')).toBe(0)
      expect(timeToMinutes('23:59')).toBe(1439)
    })
  })

  describe('minutesToTime', () => {
    it('分を時刻文字列に変換する', () => {
      expect(minutesToTime(570)).toBe('09:30')
      expect(minutesToTime(0)).toBe('00:00')
      expect(minutesToTime(1439)).toBe('23:59')
    })
  })

  describe('generateTimeLabels', () => {
    it('30分間隔のラベルを生成する', () => {
      const labels = generateTimeLabels(30)
      expect(labels).toHaveLength(48) // 24時間 × 2（30分間隔）
      expect(labels[0]).toBe('00:00')
      expect(labels[1]).toBe('00:30')
      expect(labels[2]).toBe('01:00')
    })

    it('15分間隔のラベルを生成する', () => {
      const labels = generateTimeLabels(15)
      expect(labels).toHaveLength(96) // 24時間 × 4（15分間隔）
      expect(labels[0]).toBe('00:00')
      expect(labels[1]).toBe('00:15')
      expect(labels[2]).toBe('00:30')
    })
  })

  describe('snapToGrid', () => {
    it('15分単位にスナップする', () => {
      const date = new Date('2024-06-15T10:07:00')
      const snapped = snapToGrid(date, 15)

      expect(snapped.getHours()).toBe(10)
      expect(snapped.getMinutes()).toBe(0) // 7分 → 0分
    })

    it('30分単位にスナップする', () => {
      const date = new Date('2024-06-15T10:37:00')
      const snapped = snapToGrid(date, 30)

      expect(snapped.getHours()).toBe(10)
      expect(snapped.getMinutes()).toBe(30) // 37分 → 30分
    })
  })

  describe('getCurrentTimePosition', () => {
    it('現在時刻の位置をパーセンテージで返す', () => {
      const position = getCurrentTimePosition()
      expect(position).toBeGreaterThanOrEqual(0)
      expect(position).toBeLessThanOrEqual(100)
    })
  })

  describe('getTimeSlotBgClass', () => {
    it('深夜（0-6時）のクラスを返す', () => {
      expect(getTimeSlotBgClass(0)).toBe('bg-gray-50 dark:bg-gray-900')
      expect(getTimeSlotBgClass(5)).toBe('bg-gray-50 dark:bg-gray-900')
    })

    it('早朝（6-9時）のクラスを返す', () => {
      expect(getTimeSlotBgClass(6)).toBe('bg-gray-50 dark:bg-gray-800')
      expect(getTimeSlotBgClass(8)).toBe('bg-gray-50 dark:bg-gray-800')
    })

    it('営業時間（9-18時）のクラスを返す', () => {
      expect(getTimeSlotBgClass(9)).toBe('bg-white dark:bg-gray-700')
      expect(getTimeSlotBgClass(17)).toBe('bg-white dark:bg-gray-700')
    })

    it('夜間（18-24時）のクラスを返す', () => {
      expect(getTimeSlotBgClass(18)).toBe('bg-gray-50 dark:bg-gray-800')
      expect(getTimeSlotBgClass(23)).toBe('bg-gray-50 dark:bg-gray-800')
    })
  })

  describe('getGridLineClass', () => {
    it('正時の場合は実線を返す', () => {
      expect(getGridLineClass(0, 15)).toBe('border-t border-border')
    })

    it('間隔線の場合は破線を返す', () => {
      expect(getGridLineClass(15, 15)).toBe('border-t border-dashed border-border/50')
    })
  })

  describe('formatTimeForDisplay', () => {
    it('正時の場合は整形する', () => {
      expect(formatTimeForDisplay('09:00')).toBe('9:00')
    })

    it('分がある場合はそのまま返す', () => {
      expect(formatTimeForDisplay('09:30')).toBe('09:30')
    })
  })

  describe('calculateTimeFromPosition', () => {
    it('Y座標から時刻を計算する', () => {
      const time = calculateTimeFromPosition(100, 1440, 15)

      expect(time.getHours()).toBe(1)
      expect(time.getMinutes()).toBe(45) // 100分 = 1時間40分 → 15分単位にスナップ → 1時間45分
    })

    it('グリッド間隔にスナップする', () => {
      const time = calculateTimeFromPosition(100, 1440, 30)

      expect(time.getMinutes() % 30).toBe(0)
    })
  })

  describe('constrainTaskDuration', () => {
    it('最小時間を適用する', () => {
      const start = new Date('2024-06-15T10:00:00')
      const end = new Date('2024-06-15T10:05:00') // 5分

      const result = constrainTaskDuration(start, end, 15)

      const duration = (result.endTime.getTime() - result.startTime.getTime()) / 60000
      expect(duration).toBe(15)
    })

    it('最大時間を適用する', () => {
      const start = new Date('2024-06-15T10:00:00')
      const end = new Date('2024-06-15T20:00:00') // 10時間 = 600分

      const result = constrainTaskDuration(start, end, 15, 480) // 最大8時間

      const duration = (result.endTime.getTime() - result.startTime.getTime()) / 60000
      expect(duration).toBe(480)
    })
  })

  describe('detectTimeConflicts', () => {
    it('重複するタスクを検出する', () => {
      const newTask: CalendarTask = {
        id: 'task-new',
        title: '新タスク',
        startTime: new Date('2024-06-15T10:00:00'),
        endTime: new Date('2024-06-15T11:00:00'),
      }

      const existingTasks: CalendarTask[] = [
        {
          id: 'task-1',
          title: 'タスク1',
          startTime: new Date('2024-06-15T09:30:00'),
          endTime: new Date('2024-06-15T10:30:00'), // 重複
        },
        {
          id: 'task-2',
          title: 'タスク2',
          startTime: new Date('2024-06-15T11:00:00'),
          endTime: new Date('2024-06-15T12:00:00'), // 重複なし
        },
      ]

      const conflicts = detectTimeConflicts(newTask, existingTasks)

      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].id).toBe('task-1')
    })
  })

  describe('assignTaskColumns', () => {
    it('重複タスクにカラムを割り当てる', () => {
      const tasks: CalendarTask[] = [
        {
          id: 'task-1',
          title: 'タスク1',
          startTime: new Date('2024-06-15T10:00:00'),
          endTime: new Date('2024-06-15T11:00:00'),
        },
        {
          id: 'task-2',
          title: 'タスク2',
          startTime: new Date('2024-06-15T10:30:00'),
          endTime: new Date('2024-06-15T11:30:00'),
        },
      ]

      const result = assignTaskColumns(tasks)

      expect(result).toHaveLength(2)
      expect(result[0].column).toBe(0)
      expect(result[1].column).toBe(1)
    })
  })

  describe('isDraggable', () => {
    it('完了済みタスクはドラッグ不可', () => {
      const task: CalendarTask = {
        id: 'task-1',
        title: 'タスク',
        startTime: new Date('2024-06-15T10:00:00'),
        endTime: new Date('2024-06-15T11:00:00'),
        status: 'completed',
      }

      expect(isDraggable(task)).toBe(false)
    })

    it('未完了タスクはドラッグ可能', () => {
      const task: CalendarTask = {
        id: 'task-1',
        title: 'タスク',
        startTime: new Date('2099-06-15T10:00:00'),
        endTime: new Date('2099-06-15T11:00:00'),
        status: 'pending',
      }

      expect(isDraggable(task)).toBe(true)
    })
  })

  describe('isDroppable', () => {
    it('重複がない場合はドロップ可能', () => {
      const targetTime = new Date('2099-06-15T14:00:00')

      const task: CalendarTask = {
        id: 'task-1',
        title: 'タスク',
        startTime: new Date('2099-06-15T10:00:00'),
        endTime: new Date('2099-06-15T11:00:00'),
      }

      const existingTasks: CalendarTask[] = []

      expect(isDroppable(targetTime, task, existingTasks)).toBe(true)
    })

    it('重複がある場合はドロップ不可', () => {
      const targetTime = new Date('2099-06-15T10:00:00')

      const task: CalendarTask = {
        id: 'task-1',
        title: 'タスク',
        startTime: new Date('2099-06-15T10:00:00'),
        endTime: new Date('2099-06-15T11:00:00'),
      }

      const existingTasks: CalendarTask[] = [
        {
          id: 'task-2',
          title: 'タスク2',
          startTime: new Date('2099-06-15T10:00:00'),
          endTime: new Date('2099-06-15T11:00:00'),
        },
      ]

      expect(isDroppable(targetTime, task, existingTasks)).toBe(false)
    })
  })

  describe('calculateTaskPosition', () => {
    it('タスクの位置を計算する', () => {
      const task: CalendarTask = {
        id: 'task-1',
        title: 'タスク',
        startTime: new Date('2024-06-15T10:00:00'),
        endTime: new Date('2024-06-15T11:00:00'),
      }

      const dayStart = new Date('2024-06-15T00:00:00')

      const position = calculateTaskPosition(task, dayStart, 15)

      expect(position.top).toBeDefined()
      expect(position.height).toBeDefined()
      expect(position.left).toBe('0%')
      expect(position.width).toBe('100%')
    })

    it.skip('重複タスクの幅を計算する', () => {
      const task: CalendarTask = {
        id: 'task-1',
        title: 'タスク',
        startTime: new Date('2024-06-15T10:00:00'),
        endTime: new Date('2024-06-15T11:00:00'),
      }

      const dayStart = new Date('2024-06-15T00:00:00')

      const position = calculateTaskPosition(task, dayStart, 15, 0, 2)

      expect(position.left).toBe('0%')
      expect(position.width).toBe('50%')
    })
  })
})
