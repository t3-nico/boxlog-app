'use client'

import React, { useMemo, useState } from 'react'
import { isSameDay } from 'date-fns'
import { CalendarTask } from './CalendarTask'
import { SplitTaskCard } from './SplitTaskCard'
import { CalendarTask as CalendarTaskType } from '../utils/time-grid-helpers'
import { pairPlanAndRecordTasks, calculateTaskPairLayout, TaskPair } from '../utils/task-pairing-helpers'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { HOUR_HEIGHT } from '../constants/grid-constants'

interface PositionedTask {
  task: CalendarTaskType
  column: number
  totalColumns: number
  startMinutes: number
  durationMinutes: number
}

interface TaskLayerProps {
  dates: Date[]
  tasks: CalendarTaskType[]
  view?: 'day' | 'week' | 'month'
  splitMode?: boolean // 各日付内で左右分割表示
  onTaskClick?: (task: CalendarTaskType) => void
  onTaskDoubleClick?: (task: CalendarTaskType) => void
  onTaskDrag?: (task: CalendarTaskType, newDate: Date, newStartTime: Date) => void
}

export function TaskLayer({ 
  dates, 
  tasks, 
  view = 'week',
  splitMode = false,
  onTaskClick,
  onTaskDoubleClick,
  onTaskDrag
}: TaskLayerProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  
  // 計画と実績のタスクを分離
  const planTasks = useMemo(() => tasks.filter(task => task.isPlan), [tasks])
  const recordTasks = useMemo(() => tasks.filter(task => task.isRecord), [tasks])
  const regularTasks = useMemo(() => tasks.filter(task => !task.isPlan && !task.isRecord), [tasks])

  // 分割表示用のポジション計算関数
  const calculateTaskPositionsForSplit = (tasks: CalendarTaskType[], side: 'left' | 'right'): PositionedTask[] => {
    return tasks.map((task, index) => {
      const start = task.startTime
      const startMinutes = start.getHours() * 60 + start.getMinutes()
      const durationMinutes = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60)
      
      return {
        task,
        column: 0, // 分割表示では各サイドで1列のみ
        totalColumns: 1,
        startMinutes,
        durationMinutes
      }
    })
  }

  // 分割表示モードの場合は、ペアリング処理を行う
  const tasksByDate = useMemo(() => {
    return dates.reduce((acc, date) => {
      if (splitMode && (planTasks.length > 0 || recordTasks.length > 0)) {
        // 各日付内で左右分割表示
        const dayPlanTasks = planTasks.filter(task => isSameDay(task.startTime, date))
        const dayRecordTasks = recordTasks.filter(task => isSameDay(task.startTime, date))
        
        acc[date.toISOString()] = {
          type: 'split',
          planTasks: calculateTaskPositionsForSplit(dayPlanTasks, 'left'),
          recordTasks: calculateTaskPositionsForSplit(dayRecordTasks, 'right')
        }
      } else {
        // 通常の表示モード
        const dayTasks = tasks.filter(task => isSameDay(task.startTime, date))
        acc[date.toISOString()] = {
          type: 'regular',
          positioned: calculateTaskPositions(dayTasks)
        }
      }
      return acc
    }, {} as Record<string, {
      type: 'split' | 'regular'
      planTasks?: PositionedTask[]
      recordTasks?: PositionedTask[]
      positioned?: PositionedTask[]
    }>)
  }, [dates, tasks, planTasks, recordTasks, splitMode])
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="flex h-full">
        {dates.map((date, dateIndex) => {
          const dateData = tasksByDate[date.toISOString()]
          
          return (
            <div
              key={date.toISOString()}
              className="flex-1 relative pointer-events-auto"
            >
              {dateData?.type === 'split' && (
                <>
                  {/* 左側：計画タスク */}
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 pr-1">
                    {dateData.planTasks?.map(positionedTask => (
                      <CalendarTask
                        key={positionedTask.task.id}
                        task={positionedTask.task}
                        view={view}
                        style={calculateTaskStyleForSplit(positionedTask, 'left')}
                        conflicts={positionedTask.column}
                        totalConflicts={positionedTask.totalColumns}
                        isHovered={hoveredTaskId === positionedTask.task.id}
                        onClick={onTaskClick}
                        onDoubleClick={onTaskDoubleClick}
                      />
                    ))}
                  </div>
                  
                  {/* 右側：記録タスク */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-1/2 pl-1">
                    {dateData.recordTasks?.map(positionedTask => (
                      <CalendarTask
                        key={positionedTask.task.id}
                        task={positionedTask.task}
                        view={view}
                        style={calculateTaskStyleForSplit(positionedTask, 'right')}
                        conflicts={positionedTask.column}
                        totalConflicts={positionedTask.totalColumns}
                        isHovered={hoveredTaskId === positionedTask.task.id}
                        onClick={onTaskClick}
                        onDoubleClick={onTaskDoubleClick}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {dateData?.type === 'regular' && dateData.positioned?.map(positionedTask => (
                <CalendarTask
                  key={positionedTask.task.id}
                  task={positionedTask.task}
                  view={view}
                  style={calculateTaskStyle(positionedTask)}
                  conflicts={positionedTask.column}
                  totalConflicts={positionedTask.totalColumns}
                  isHovered={hoveredTaskId === positionedTask.task.id}
                  onClick={onTaskClick}
                  onDoubleClick={onTaskDoubleClick}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Google Calendar風のタスク位置計算アルゴリズム
function calculateTaskPositions(tasks: CalendarTaskType[]): PositionedTask[] {
  if (tasks.length === 0) return []
  
  // タスクを開始時刻でソート
  const sorted = [...tasks].sort((a, b) => 
    a.startTime.getTime() - b.startTime.getTime()
  )
  
  const positioned: PositionedTask[] = []
  const columns: PositionedTask[][] = []
  
  sorted.forEach(task => {
    const startMinutes = task.startTime.getHours() * 60 + task.startTime.getMinutes()
    const endMinutes = task.endTime.getHours() * 60 + task.endTime.getMinutes()
    const durationMinutes = endMinutes - startMinutes
    
    let placed = false
    
    // 既存の列で配置可能な場所を探す
    for (let col = 0; col < columns.length; col++) {
      const canPlace = columns[col].every(existing => {
        // 時間の重複をチェック
        const taskStart = task.startTime.getTime()
        const taskEnd = task.endTime.getTime()
        const existingStart = existing.task.startTime.getTime()
        const existingEnd = existing.task.endTime.getTime()
        
        // 重複しない条件：タスクの終了時刻 <= 既存の開始時刻 または タスクの開始時刻 >= 既存の終了時刻
        return taskEnd <= existingStart || taskStart >= existingEnd
      })
      
      if (canPlace) {
        const positionedTask: PositionedTask = {
          task,
          column: col,
          totalColumns: Math.max(columns.length, 1),
          startMinutes,
          durationMinutes
        }
        columns[col].push(positionedTask)
        positioned.push(positionedTask)
        placed = true
        break
      }
    }
    
    // 新しい列が必要
    if (!placed) {
      const positionedTask: PositionedTask = {
        task,
        column: columns.length,
        totalColumns: columns.length + 1,
        startMinutes,
        durationMinutes
      }
      columns.push([positionedTask])
      positioned.push(positionedTask)
    }
  })
  
  // 全てのタスクの総列数を更新
  const totalColumns = columns.length
  positioned.forEach(p => {
    p.totalColumns = totalColumns
  })
  
  return positioned
}

// タスクのスタイル計算
function calculateTaskStyle(positionedTask: PositionedTask): React.CSSProperties {
  const { startMinutes, durationMinutes } = positionedTask
  
  // 位置とサイズの計算
  const top = (startMinutes / 60) * HOUR_HEIGHT
  const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 20) // 最小高さ20px
  
  return {
    top: `${top}px`,
    height: `${height}px`,
    minHeight: '20px',
    zIndex: positionedTask.totalColumns > 1 ? 10 + positionedTask.column : 1
  }
}

// 分割タスクのスタイル計算
function calculateSplitTaskStyle(pair: TaskPair & { left: number; width: number; conflicts: number; totalConflicts: number }): React.CSSProperties {
  const startMinutes = pair.startTime.getHours() * 60 + pair.startTime.getMinutes()
  const endMinutes = pair.endTime.getHours() * 60 + pair.endTime.getMinutes()
  const durationMinutes = endMinutes - startMinutes
  
  const top = (startMinutes / 60) * HOUR_HEIGHT
  const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 20) // 最小高さ20px
  
  return {
    top: `${top}px`,
    height: `${height}px`,
    left: `${pair.left}%`,
    width: `${Math.max(pair.width, 10)}%`, // 最小幅を確保
    minHeight: '20px',
    zIndex: pair.totalConflicts > 1 ? 10 + pair.conflicts : 1
  }
}

// 単一日用のシンプル版
interface SingleDayTaskLayerProps {
  date: Date
  tasks: CalendarTaskType[]
  view?: 'day' | 'week' | 'month'
  onTaskClick?: (task: CalendarTaskType) => void
  onTaskDoubleClick?: (task: CalendarTaskType) => void
  onTaskDrag?: (task: CalendarTaskType, newDate: Date, newStartTime: Date) => void
}

export function SingleDayTaskLayer({
  date,
  tasks,
  view = 'day',
  onTaskClick,
  onTaskDoubleClick,
  onTaskDrag
}: SingleDayTaskLayerProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  
  // 計画と実績のタスクを分離
  const planTasks = useMemo(() => tasks.filter(task => task.isPlan), [tasks])
  const recordTasks = useMemo(() => tasks.filter(task => task.isRecord), [tasks])
  
  // 当日のタスクのみフィルタリング
  const dayTasks = useMemo(() => 
    tasks.filter(task => isSameDay(task.startTime, date))
  , [tasks, date])
  
  // 分割表示 vs 通常表示
  const taskData = useMemo(() => {
    if (planRecordMode === 'both' && (planTasks.length > 0 || recordTasks.length > 0)) {
      // 計画と実績をペアリングしてSplitTaskCardで表示
      const pairs = pairPlanAndRecordTasks(planTasks, recordTasks, date)
      const layoutPairs = calculateTaskPairLayout(pairs)
      
      return {
        type: 'split' as const,
        pairs: layoutPairs
      }
    } else {
      // 通常の表示モード
      return {
        type: 'regular' as const,
        positioned: calculateTaskPositions(dayTasks)
      }
    }
  }, [dayTasks, planTasks, recordTasks, date, planRecordMode])
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="h-full relative pointer-events-auto">
        {taskData.type === 'split' && taskData.pairs?.map(pair => (
          <SplitTaskCard
            key={pair.id}
            planTask={pair.planTask}
            recordTask={pair.recordTask}
            view={view}
            style={calculateSplitTaskStyle(pair)}
            isHovered={hoveredTaskId === pair.id}
            onClick={(task, type) => {
              onTaskClick?.(task)
              setHoveredTaskId(task.id)
            }}
            onDoubleClick={(task, type) => {
              onTaskDoubleClick?.(task)
            }}
          />
        ))}
        
        {taskData.type === 'regular' && taskData.positioned?.map(positionedTask => (
          <CalendarTask
            key={positionedTask.task.id}
            task={positionedTask.task}
            view={view}
            style={calculateTaskStyle(positionedTask)}
            conflicts={positionedTask.column}
            totalConflicts={positionedTask.totalColumns}
            isHovered={hoveredTaskId === positionedTask.task.id}
            onClick={onTaskClick}
            onDoubleClick={onTaskDoubleClick}
          />
        ))}
      </div>
    </div>
  )
}

// 週間ビュー専用のタスクレイヤー（最適化）
interface WeekTaskLayerProps extends TaskLayerProps {
  showWeekends?: boolean
}

export function WeekTaskLayer({
  dates,
  tasks,
  showWeekends = true,
  ...props
}: WeekTaskLayerProps) {
  const filteredDates = useMemo(() => {
    return showWeekends ? dates : dates.filter(date => {
      const day = date.getDay()
      return day !== 0 && day !== 6 // 日曜日(0)と土曜日(6)を除外
    })
  }, [dates, showWeekends])
  
  return (
    <TaskLayer
      {...props}
      dates={filteredDates}
      tasks={tasks}
      view="week"
    />
  )
}

// 月間ビュー用のコンパクトタスクレイヤー
interface MonthTaskLayerProps {
  dates: Date[]
  tasks: CalendarTaskType[]
  maxTasksPerDay?: number
  onTaskClick?: (task: CalendarTaskType) => void
  onShowMore?: (date: Date, tasks: CalendarTaskType[]) => void
}

export function MonthTaskLayer({
  dates,
  tasks,
  maxTasksPerDay = 3,
  onTaskClick,
  onShowMore
}: MonthTaskLayerProps) {
  const tasksByDate = useMemo(() => {
    return dates.reduce((acc, date) => {
      const dayTasks = tasks.filter(task => 
        isSameDay(task.startTime, date)
      ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      
      acc[date.toISOString()] = dayTasks
      return acc
    }, {} as Record<string, CalendarTaskType[]>)
  }, [dates, tasks])
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dates.map((date, index) => {
        const dayTasks = tasksByDate[date.toISOString()] || []
        const visibleTasks = dayTasks.slice(0, maxTasksPerDay)
        const hiddenCount = Math.max(0, dayTasks.length - maxTasksPerDay)
        
        return (
          <div
            key={date.toISOString()}
            className="absolute pointer-events-auto p-1"
            style={{
              left: `${(index % 7) * (100 / 7)}%`,
              top: `${Math.floor(index / 7) * 25}%`, // 4週間表示の場合
              width: `${100 / 7}%`,
              height: '25%'
            }}
          >
            <div className="space-y-0.5 overflow-hidden">
              {visibleTasks.map(task => (
                <div
                  key={task.id}
                  className="text-xs px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 truncate cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  onClick={() => onTaskClick?.(task)}
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
              
              {hiddenCount > 0 && (
                <button
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
                  onClick={() => onShowMore?.(date, dayTasks)}
                >
                  +{hiddenCount}件
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// タスクの重複グループを視覚化するためのデバッグ用コンポーネント
interface TaskGroupVisualizerProps {
  tasks: CalendarTaskType[]
  date: Date
}

export function TaskGroupVisualizer({ tasks, date }: TaskGroupVisualizerProps) {
  const dayTasks = tasks.filter(task => isSameDay(task.startTime, date))
  const positionedTasks = calculateTaskPositions(dayTasks)
  
  const groups = positionedTasks.reduce((acc, task) => {
    const key = `${task.totalColumns}-${task.column}`
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {} as Record<string, PositionedTask[]>)
  
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      {Object.entries(groups).map(([key, groupTasks]) => (
        <div key={key} className="absolute inset-0">
          {groupTasks.map(task => (
            <div
              key={task.task.id}
              className="absolute border-2 border-red-500"
              style={calculateTaskStyle(task)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// 分割表示用のタスクスタイル計算
function calculateTaskStyleForSplit(positionedTask: PositionedTask, side: 'left' | 'right') {
  const { startMinutes, durationMinutes } = positionedTask
  const height = (durationMinutes / 60) * HOUR_HEIGHT
  const top = (startMinutes / 60) * HOUR_HEIGHT
  
  return {
    position: 'absolute' as const,
    top: `${top}px`,
    left: '0%',
    right: '0%',
    height: `${Math.max(height, 20)}px`, // 最小高さ20px
    zIndex: 10
  }
}