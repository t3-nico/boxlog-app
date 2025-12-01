import { addMinutes, differenceInMinutes, isSameDay } from 'date-fns'
import { create } from 'zustand'

import type { RecordAdjustments, RecordStats, Task, TaskRecord } from '@/features/calendar/types/calendar.types'

// ヘルパー関数: 計画時間の計算
const calculatePlannedTimes = (task: Task) => {
  const plannedStart = new Date(task.planned_start!)
  const plannedEnd = task.planned_end
    ? new Date(task.planned_end)
    : addMinutes(plannedStart, task.planned_duration || 60)
  return { plannedStart, plannedEnd }
}

// ヘルパー関数: レベル値の検証
const validateLevel = (level: number | undefined): 1 | 2 | 3 | 4 | 5 | undefined => {
  return level && level >= 1 && level <= 5 ? (level as 1 | 2 | 3 | 4 | 5) : undefined
}

// ヘルパー関数: タスクレコードの構築
const buildTaskRecord = (
  task: Task,
  adjustments: RecordAdjustments | undefined,
  plannedStart: Date,
  plannedEnd: Date
): Partial<TaskRecord> => {
  const validated = {
    task_id: task.id,
    title: task.title,
    actual_start: (adjustments?.actualStart || plannedStart).toISOString(),
    actual_end: (adjustments?.actualEnd || plannedEnd).toISOString(),
    actual_duration:
      adjustments?.actualEnd && adjustments?.actualStart
        ? differenceInMinutes(adjustments.actualEnd, adjustments.actualStart)
        : task.planned_duration || 60,
    ...(task.tags && { tags: task.tags }),
    ...(task.memo && { memo: task.memo }),
    ...(adjustments?.interruptions !== undefined && { interruptions: adjustments.interruptions }),
  }

  const satisfaction = validateLevel(adjustments?.satisfaction)
  const focusLevel = validateLevel(adjustments?.focusLevel)
  const energyLevel = validateLevel(adjustments?.energyLevel)

  return {
    ...validated,
    ...(satisfaction !== undefined && { satisfaction }),
    ...(focusLevel !== undefined && { focus_level: focusLevel }),
    ...(energyLevel !== undefined && { energy_level: energyLevel }),
  }
}

interface RecordsStore {
  records: TaskRecord[]
  isLoading: boolean

  // CRUD操作
  fetchRecords: (dateRange: { start: Date; end: Date }) => Promise<void>
  createRecord: (record: Partial<TaskRecord>) => Promise<TaskRecord>
  updateRecord: (id: string, updates: Partial<TaskRecord>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>

  // 予定から記録を作成
  createRecordFromTask: (task: Task, adjustments?: RecordAdjustments) => Promise<TaskRecord>

  // 分析用
  getRecordsByDate: (date: Date) => TaskRecord[]
  getRecordStats: (dateRange: { start: Date; end: Date }) => RecordStats

  // ローカル状態管理（Supabase実装前の仮実装）
  addLocalRecord: (record: TaskRecord) => void
  updateLocalRecord: (id: string, updates: Partial<TaskRecord>) => void
  removeLocalRecord: (id: string) => void
}

export const useRecordsStore = create<RecordsStore>((set, get) => ({
  records: [],
  isLoading: false,

  fetchRecords: async (dateRange) => {
    set({ isLoading: true })
    try {
      // const { data } = await supabase
      //   .from('task_records')
      //   .select('*')
      //   .gte('actual_start', dateRange.start.toISOString())
      //   .lte('actual_start', dateRange.end.toISOString())

      // 仮実装：ローカルストレージから読み込み
      const stored = localStorage.getItem('boxlog-records')
      if (stored) {
        const allRecords = JSON.parse(stored) as TaskRecord[]
        const filteredRecords = allRecords.filter((record) => {
          const recordDate = new Date(record.actual_start)
          return recordDate >= dateRange.start && recordDate <= dateRange.end
        })
        set({ records: filteredRecords })
      }
    } catch (error) {
      console.error('Failed to fetch records:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  createRecord: async (record) => {
    const newRecord: TaskRecord = {
      id: crypto.randomUUID(),
      user_id: 'current-user', // Auth integration tracked in Issue #87
      title: record.title || '',
      actual_start: record.actual_start || new Date().toISOString(),
      actual_end: record.actual_end || new Date().toISOString(),
      actual_duration: record.actual_duration || 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record,
    }

    // const { data } = await supabase
    //   .from('task_records')
    //   .insert(newRecord)
    //   .select()
    //   .single()

    // 仮実装：ローカルストレージに保存
    get().addLocalRecord(newRecord)

    return newRecord
  },

  updateRecord: async (id, updates) => {
    // await supabase
    //   .from('task_records')
    //   .update({ ...updates, updated_at: new Date().toISOString() })
    //   .eq('id', id)

    // 仮実装：ローカル更新
    get().updateLocalRecord(id, updates)
  },

  deleteRecord: async (id) => {
    // await supabase
    //   .from('task_records')
    //   .delete()
    //   .eq('id', id)

    // 仮実装：ローカル削除
    get().removeLocalRecord(id)
  },

  createRecordFromTask: async (task, adjustments) => {
    const { plannedStart, plannedEnd } = calculatePlannedTimes(task)
    const record = buildTaskRecord(task, adjustments, plannedStart, plannedEnd)
    const created = await get().createRecord(record)
    return created
  },

  getRecordsByDate: (date) => {
    return get().records.filter((record) => isSameDay(new Date(record.actual_start), date))
  },

  getRecordStats: (dateRange) => {
    const { records } = get()
    const rangeRecords = records.filter((record) => {
      const recordDate = new Date(record.actual_start)
      return recordDate >= dateRange.start && recordDate <= dateRange.end
    })

    const actualMinutes = rangeRecords.reduce((sum, record) => sum + record.actual_duration, 0)

    const satisfactionRecords = rangeRecords.filter((r) => r.satisfaction)
    const avgSatisfaction =
      satisfactionRecords.length > 0
        ? satisfactionRecords.reduce((sum, r) => sum + (r.satisfaction || 0), 0) / satisfactionRecords.length
        : 0

    return {
      plannedHours: 0, // Calculation tracked in Issue #87
      actualHours: actualMinutes / 60,
      completionRate: 0, // Calculation tracked in Issue #87
      avgSatisfaction,
      unplannedTasks: rangeRecords.filter((r) => !r.task_id).length,
    }
  },

  // ローカル状態管理用のヘルパー
  addLocalRecord: (record) => {
    set((state) => ({
      records: [...state.records, record],
    }))

    // ローカルストレージに保存
    const allRecords = [...get().records]
    localStorage.setItem('boxlog-records', JSON.stringify(allRecords))
  },

  updateLocalRecord: (id, updates) => {
    set((state) => ({
      records: state.records.map((record) =>
        record.id === id ? { ...record, ...updates, updated_at: new Date().toISOString() } : record
      ),
    }))

    // ローカルストレージに保存
    localStorage.setItem('boxlog-records', JSON.stringify(get().records))
  },

  removeLocalRecord: (id) => {
    set((state) => ({
      records: state.records.filter((record) => record.id !== id),
    }))

    // ローカルストレージに保存
    localStorage.setItem('boxlog-records', JSON.stringify(get().records))
  },
}))
