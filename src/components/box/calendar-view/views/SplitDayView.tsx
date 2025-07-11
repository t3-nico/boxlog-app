'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import { isSameDay, isToday, differenceInMinutes, addMinutes } from 'date-fns'
import { CalendarTask } from '../components/CalendarTask'
import { TimeAxisLabels } from '../components/TimeAxisLabels'
import { CurrentTimeLine } from '../CurrentTimeLine'
import { SplitGridBackground } from '../components/SplitGridBackground'
import { SplitQuickCreator } from '../components/SplitQuickCreator'
import { SplitDayHeader } from '../components/SplitDayHeader'
import { DragPreview } from '../components/DragPreview'
import { useSplitDragToCreate } from '../hooks/useSplitDragToCreate'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { HOUR_HEIGHT } from '../constants/grid-constants'
import type { Task, TaskRecord } from '../types'

interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

interface CreateRecordInput {
  title: string
  actual_start: Date
  actual_end: Date
  actual_duration: number
  satisfaction?: number
  focus_level?: number
  energy_level?: number
  memo?: string
  interruptions?: number
}

interface SplitDayViewProps {
  date: Date
  tasks: Task[]
  records: TaskRecord[]
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
  onTaskClick?: (task: Task) => void
  onRecordClick?: (record: TaskRecord) => void
}

export function SplitDayView({
  date,
  tasks,
  records,
  onCreateTask,
  onCreateRecord,
  onTaskClick,
  onRecordClick
}: SplitDayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  const [activeCreation, setActiveCreation] = useState<{
    type: 'task' | 'record'
    start: Date
    end: Date
    side: 'left' | 'right'
  } | null>(null)

  // デバッグログ
  console.log('SplitDayView - planRecordMode:', planRecordMode)

  // その日のタスクと記録をフィルタリング
  const dayTasks = useMemo(() => 
    tasks.filter(task => 
      task.planned_start && isSameDay(new Date(task.planned_start), date)
    ), [tasks, date]
  )

  const dayRecords = useMemo(() => 
    records.filter(record => 
      isSameDay(new Date(record.actual_start), date)
    ), [records, date]
  )

  // ドラッグで作成（左右判定付き）
  const { dragState, handleMouseDown, dragPreview } = useSplitDragToCreate({
    containerRef,
    gridInterval: 15,
    onCreateItem: (item) => {
      setActiveCreation({
        type: item.side === 'left' ? 'task' : 'record',
        start: item.start,
        end: item.end,
        side: item.side
      })
    }
  })

  // タスクの位置計算
  const calculateTaskStyle = (task: Task): React.CSSProperties => {
    if (!task.planned_start) return {}
    
    const startTime = new Date(task.planned_start)
    const endTime = task.planned_end 
      ? new Date(task.planned_end) 
      : addMinutes(startTime, task.planned_duration || 60)
    
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes()
    const duration = differenceInMinutes(endTime, startTime)
    
    return {
      position: 'absolute',
      top: `${(startMinutes / 60) * HOUR_HEIGHT}px`,
      height: `${Math.max((duration / 60) * HOUR_HEIGHT, 20)}px`,
      left: '4px',
      right: '4px',
      zIndex: 10
    }
  }

  // 記録の位置計算
  const calculateRecordStyle = (record: TaskRecord): React.CSSProperties => {
    const startTime = new Date(record.actual_start)
    const endTime = new Date(record.actual_end)
    
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes()
    const duration = differenceInMinutes(endTime, startTime)
    
    return {
      position: 'absolute',
      top: `${(startMinutes / 60) * HOUR_HEIGHT}px`,
      height: `${Math.max((duration / 60) * HOUR_HEIGHT, 20)}px`,
      left: '4px',
      right: '4px',
      zIndex: 10
    }
  }

  // タスクを CalendarTask 形式に変換
  const calendarTasks = useMemo(() => {
    return dayTasks.map(task => ({
      id: task.id,
      title: task.title,
      startTime: new Date(task.planned_start!),
      endTime: task.planned_end 
        ? new Date(task.planned_end) 
        : addMinutes(new Date(task.planned_start!), task.planned_duration || 60),
      color: '#3b82f6',
      description: task.description || '',
      status: task.status || 'scheduled',
      priority: task.priority || 'medium',
      isPlan: true
    }))
  }, [dayTasks])

  // 記録を CalendarTask 形式に変換
  const calendarRecords = useMemo(() => {
    return dayRecords.map(record => ({
      id: record.id,
      title: record.title,
      startTime: new Date(record.actual_start),
      endTime: new Date(record.actual_end),
      color: '#10b981',
      description: record.memo || '',
      status: 'completed' as const,
      priority: 'medium' as const,
      isRecord: true,
      satisfaction: record.satisfaction,
      focusLevel: record.focus_level,
      energyLevel: record.energy_level
    }))
  }, [dayRecords])

  const handleSaveTask = (data: CreateTaskInput) => {
    onCreateTask?.(data)
    setActiveCreation(null)
  }

  const handleSaveRecord = (data: CreateRecordInput) => {
    onCreateRecord?.(data)
    setActiveCreation(null)
  }

  const handleCancel = () => {
    setActiveCreation(null)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      
      {/* Split Day view indicator - temporary for debugging */}
      <div className="bg-purple-500 text-white text-sm px-3 py-1 text-center">
        分割日ビュー (計画vs実績)
      </div>
      
      {/* ヘッダー */}
      <SplitDayHeader 
        date={date} 
        tasks={dayTasks} 
        records={dayRecords} 
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 時間軸ラベル */}
        <TimeAxisLabels 
          startHour={0} 
          endHour={24} 
          interval={15}
          className="z-10"
        />

        {/* 分割グリッド */}
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          onMouseDown={handleMouseDown}
          style={{ height: '100%' }}
        >
          <div className="relative" style={{ height: 24 * HOUR_HEIGHT }}>
            {/* 背景グリッド */}
            <SplitGridBackground />

            {/* モード別レンダリング */}
            {planRecordMode === 'both' ? (
              <>
                {/* 分割表示モード */}
                {/* 中央の区切り線 */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600 z-20">
                  {/* ラベル */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-8 text-sm font-medium">
                    <span className="text-blue-600 dark:text-blue-400">← 予定</span>
                    <span className="text-green-600 dark:text-green-400">記録 →</span>
                  </div>
                </div>

                {/* 左側：予定 */}
                <div className="absolute left-0 top-0 bottom-0 w-1/2 pr-1 bg-blue-50/10 dark:bg-blue-900/10">
                  {calendarTasks.map(task => (
                    <CalendarTask
                      key={task.id}
                      task={task}
                      view="day"
                      style={calculateTaskStyle(dayTasks.find(t => t.id === task.id)!)}
                      onClick={() => {
                        const originalTask = dayTasks.find(t => t.id === task.id)
                        if (originalTask) onTaskClick?.(originalTask)
                      }}
                    />
                  ))}

                  {/* ドラッグプレビュー（予定側） */}
                  {dragPreview && dragPreview.side === 'left' && (
                    <DragPreview
                      start={dragPreview.start}
                      end={dragPreview.end}
                      hourHeight={HOUR_HEIGHT}
                      className="bg-blue-100 border-blue-400 border-2 border-dashed"
                    />
                  )}
                </div>

                {/* 右側：記録 */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1/2 pl-1 bg-green-50/10 dark:bg-green-900/10">
                  {calendarRecords.map(record => (
                    <CalendarTask
                      key={record.id}
                      task={record}
                      view="day"
                      style={calculateRecordStyle(dayRecords.find(r => r.id === record.id)!)}
                      onClick={() => {
                        const originalRecord = dayRecords.find(r => r.id === record.id)
                        if (originalRecord) onRecordClick?.(originalRecord)
                      }}
                    />
                  ))}

                  {/* ドラッグプレビュー（記録側） */}
                  {dragPreview && dragPreview.side === 'right' && (
                    <DragPreview
                      start={dragPreview.start}
                      end={dragPreview.end}
                      hourHeight={HOUR_HEIGHT}
                      className="bg-green-100 border-green-400 border-2 border-dashed"
                    />
                  )}
                </div>
              </>
            ) : planRecordMode === 'plan' ? (
              <>
                {/* 予定のみ表示モード */}
                <div className="absolute top-2 left-2 text-sm font-medium text-blue-600 dark:text-blue-400 z-30">
                  予定のみ表示
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-full bg-blue-50/10 dark:bg-blue-900/10">
                  {calendarTasks.map(task => (
                    <CalendarTask
                      key={task.id}
                      task={task}
                      view="day"
                      style={calculateTaskStyle(dayTasks.find(t => t.id === task.id)!)}
                      onClick={() => {
                        const originalTask = dayTasks.find(t => t.id === task.id)
                        if (originalTask) onTaskClick?.(originalTask)
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* 記録のみ表示モード */}
                <div className="absolute top-2 right-2 text-sm font-medium text-green-600 dark:text-green-400 z-30">
                  記録のみ表示
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-full bg-green-50/10 dark:bg-green-900/10">
                  {calendarRecords.map(record => (
                    <CalendarTask
                      key={record.id}
                      task={record}
                      view="day"
                      style={calculateRecordStyle(dayRecords.find(r => r.id === record.id)!)}
                      onClick={() => {
                        const originalRecord = dayRecords.find(r => r.id === record.id)
                        if (originalRecord) onRecordClick?.(originalRecord)
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* 現在時刻ライン */}
            {isToday(date) && (
              <CurrentTimeLine
                containerRef={containerRef}
                gridInterval={15}
                isVisible={true}
              />
            )}

            {/* インライン作成フォーム */}
            {activeCreation && (
              <SplitQuickCreator
                type={activeCreation.type}
                side={activeCreation.side}
                initialStart={activeCreation.start}
                initialEnd={activeCreation.end}
                onSave={(data) => {
                  if (activeCreation.type === 'task') {
                    handleSaveTask(data as CreateTaskInput)
                  } else {
                    handleSaveRecord(data as CreateRecordInput)
                  }
                }}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}