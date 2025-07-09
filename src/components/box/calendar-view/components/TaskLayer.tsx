'use client'

import React, { useMemo, useState } from 'react'
import { isSameDay } from 'date-fns'
import { CalendarTask } from './CalendarTask'
import { CalendarTask as CalendarTaskType } from '../utils/time-grid-helpers'
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
  onTaskClick?: (task: CalendarTaskType) => void
  onTaskDoubleClick?: (task: CalendarTaskType) => void
  onTaskDrag?: (task: CalendarTaskType, newDate: Date, newStartTime: Date) => void
}

export function TaskLayer({ 
  dates, 
  tasks, 
  view = 'week',
  onTaskClick,
  onTaskDoubleClick,
  onTaskDrag
}: TaskLayerProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  
  // 日付ごとにタスクをグループ化し、位置を計算
  const tasksByDate = useMemo(() => {
    return dates.reduce((acc, date) => {
      const dayTasks = tasks.filter(task => 
        isSameDay(task.startTime, date)
      )
      
      // 重複を検出して配置を計算
      acc[date.toISOString()] = calculateTaskPositions(dayTasks)
      return acc
    }, {} as Record<string, PositionedTask[]>)
  }, [dates, tasks])
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="flex h-full">
        {dates.map((date, dateIndex) => (
          <div
            key={date.toISOString()}
            className="flex-1 relative pointer-events-auto"
          >
            {tasksByDate[date.toISOString()]?.map(positionedTask => (
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
        ))}
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
  // 当日のタスクのみフィルタリング
  const dayTasks = useMemo(() => 
    tasks.filter(task => isSameDay(task.startTime, date))
  , [tasks, date])
  
  // 位置計算
  const positionedTasks = useMemo(() => 
    calculateTaskPositions(dayTasks)
  , [dayTasks])
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="h-full relative pointer-events-auto">
        {positionedTasks.map(positionedTask => (
          <CalendarTask
            key={positionedTask.task.id}
            task={positionedTask.task}
            view={view}
            style={calculateTaskStyle(positionedTask)}
            conflicts={positionedTask.column}
            totalConflicts={positionedTask.totalColumns}
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