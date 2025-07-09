'use client'

import React, { useRef, useMemo, useEffect, useState } from 'react'
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core'
import { isToday, isSameDay } from 'date-fns'
import { CurrentTimeLine } from './CurrentTimeLine'
import { DraggableTask } from './DraggableTask'
import { AllDaySection } from './components/AllDaySection'
import { DateHeader } from './components/DateHeader'
import { TimeAxisLabels } from './components/TimeAxisLabels'
import { GridBackground } from './components/GridBackground'
import { TaskLayer, SingleDayTaskLayer } from './components/TaskLayer'
import { CalendarTask } from './utils/time-grid-helpers'
import { useScrollSync, useScrollToTime, useVisibleTimeRange } from './hooks/useScrollSync'
import { filterTasksForDate } from './utils/view-helpers'
import { HOUR_HEIGHT } from './constants/grid-constants'

interface TimeGridProps {
  dates: Date[] // 表示する日付の配列（1日〜7日）
  tasks?: CalendarTask[]
  gridInterval?: 15 | 30 | 60
  scrollToTime?: string // 初期スクロール位置（例: "09:00"）
  businessHours?: { start: number; end: number }
  showAllDay?: boolean
  showCurrentTime?: boolean
  showWeekends?: boolean
  showDateHeader?: boolean // 日付ヘッダーの表示/非表示
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrop?: (task: CalendarTask, newDate: Date, newStartTime: Date) => void
  onDateClick?: (date: Date) => void
  className?: string
}

export function TimeGrid({
  dates,
  tasks = [],
  gridInterval = 15,
  scrollToTime,
  businessHours,
  showAllDay = true,
  showCurrentTime = true,
  showWeekends = true,
  showDateHeader = true,
  onTaskClick,
  onEmptyClick,
  onTaskDrop,
  onDateClick,
  className = ''
}: TimeGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // スクロール同期
  const { scrollLeft, handleScroll } = useScrollSync()
  
  // 時間位置への自動スクロール
  const { scrollToTime: scrollToTimeFunc } = useScrollToTime(
    scrollContainerRef,
    scrollToTime
  )
  
  // 可視時間範囲の計算（パフォーマンス最適化）
  const visibleTimeRange = useVisibleTimeRange(scrollContainerRef, 0, 24)
  
  // 全日タスクと時間指定タスクを分離
  const { allDayTasks, timedTasks } = useMemo(() => {
    const allDay: CalendarTask[] = []
    const timed: CalendarTask[] = []
    
    tasks.forEach(task => {
      const duration = task.endTime.getTime() - task.startTime.getTime()
      const durationHours = duration / (1000 * 60 * 60)
      
      if (durationHours >= 24) {
        allDay.push(task)
      } else {
        timed.push(task)
      }
    })
    
    return { allDayTasks: allDay, timedTasks: timed }
  }, [tasks])
  
  // 各日のタスクを取得
  const getTasksForDate = (date: Date, taskList: CalendarTask[]) => {
    return filterTasksForDate(taskList, date)
  }
  
  // 空のセルクリック処理
  const handleEmptyClick = (date: Date, time: string) => {
    if (onEmptyClick) {
      const [hours, minutes] = time.split(':').map(Number)
      const clickDate = new Date(date)
      clickDate.setHours(hours, minutes, 0, 0)
      onEmptyClick(clickDate, time)
    }
  }
  
  // タスクドロップ処理
  const handleTaskDrop = (task: CalendarTask, targetDate: Date, newStartTime: Date) => {
    if (onTaskDrop) {
      onTaskDrop(task, targetDate, newStartTime)
    }
  }
  
  // 総高さ計算
  const totalHeight = 24 * HOUR_HEIGHT
  
  // 初期化処理
  useEffect(() => {
    if (!isInitialized && scrollContainerRef.current) {
      if (scrollToTime) {
        scrollToTimeFunc(scrollToTime)
      }
      setIsInitialized(true)
    }
  }, [isInitialized, scrollToTime, scrollToTimeFunc])
  
  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-900 ${className}`}>
      {/* 全日イベントエリア */}
      {showAllDay && allDayTasks.length > 0 && (
        <AllDaySection
          dates={dates}
          tasks={allDayTasks}
          scrollLeft={scrollLeft}
          onTaskClick={onTaskClick}
          onEmptyClick={onDateClick}
        />
      )}
      
      {/* 時間指定エリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* スティッキーヘッダー（日付） */}
        {showDateHeader && (
          <div className="sticky top-0 z-20">
            <DateHeader
              dates={dates}
              scrollLeft={scrollLeft}
              onDateClick={onDateClick}
            />
          </div>
        )}
        
        {/* スクロール可能な時間グリッド */}
        <div className="flex-1 flex overflow-hidden">
          {/* 時間軸ラベル（固定） */}
          <TimeAxisLabels
            startHour={0}
            endHour={24}
            interval={gridInterval}
            showBusinessHours={!!businessHours}
            className="z-10"
          />
          
          {/* スクロール可能なグリッドエリア */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
            onScroll={handleScroll}
            style={{ height: '100%' }}
          >
            <div className="relative" style={{ height: totalHeight }}>
              {/* グリッド背景 */}
              <GridBackground
                dates={dates}
                startHour={0}
                endHour={24}
                gridInterval={gridInterval}
                showBusinessHours={!!businessHours}
                showWeekends={showWeekends}
              />
              
              {/* タスク表示レイヤー */}
              <TaskLayer
                dates={dates}
                tasks={timedTasks}
                view={dates.length === 1 ? 'day' : 'week'}
                onTaskClick={onTaskClick}
                onTaskDoubleClick={onTaskClick} // 同じハンドラーを使用
                onTaskDrag={onTaskDrop}
              />
              
              {/* 各日のドロップゾーン */}
              <div className="absolute inset-0 flex">
                {dates.map((date, dateIndex) => (
                  <DayColumn
                    key={date.toISOString()}
                    date={date}
                    tasks={getTasksForDate(date, timedTasks)}
                    gridInterval={gridInterval}
                    visibleTimeRange={visibleTimeRange}
                    onTaskClick={onTaskClick}
                    onEmptyClick={handleEmptyClick}
                    onTaskDrop={handleTaskDrop}
                    totalHeight={totalHeight}
                  />
                ))}
              </div>
              
              {/* 現在時刻ライン */}
              {showCurrentTime && dates.some(date => isToday(date)) && (
                <CurrentTimeLine
                  containerRef={scrollContainerRef}
                  gridInterval={gridInterval}
                  isVisible={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 個別の日カラムコンポーネント
interface DayColumnProps {
  date: Date
  tasks: CalendarTask[]
  gridInterval: 15 | 30 | 60
  visibleTimeRange: { start: number; end: number }
  totalHeight: number
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrop?: (task: CalendarTask, targetDate: Date, newStartTime: Date) => void
}

function DayColumn({
  date,
  tasks,
  gridInterval,
  visibleTimeRange,
  totalHeight,
  onTaskClick,
  onEmptyClick,
  onTaskDrop
}: DayColumnProps) {
  const { setNodeRef: setDropZoneRef } = useDroppable({
    id: `day-column-${date.toISOString()}`,
    data: {
      type: 'day-column',
      date: date
    }
  })
  
  // 時間スロットのクリック処理
  const handleTimeSlotClick = (event: React.MouseEvent) => {
    if (!onEmptyClick) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    const hour = Math.floor((y / totalHeight) * 24)
    const minute = Math.floor(((y % (totalHeight / 24)) / (totalHeight / 24)) * 60)
    
    // グリッド間隔にスナップ
    const snappedMinute = Math.round(minute / gridInterval) * gridInterval
    const timeString = `${hour.toString().padStart(2, '0')}:${snappedMinute.toString().padStart(2, '0')}`
    
    onEmptyClick(date, timeString)
  }
  
  return (
    <div
      ref={setDropZoneRef}
      className="flex-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative cursor-pointer"
      onClick={handleTimeSlotClick}
    >
      {/* このコンポーネントはドロップゾーンのみとして機能 */}
    </div>
  )
}


// ドラッグコンテキスト付きのラッパー
interface TimeGridWithDragProps extends TimeGridProps {
  onDragStart?: (task: CalendarTask) => void
  onDragEnd?: (event: DragEndEvent) => void
}

export function TimeGridWithDrag({
  onDragStart,
  onDragEnd,
  ...props
}: TimeGridWithDragProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    if (onDragEnd) {
      onDragEnd(event)
    }
    
    // デフォルトのドロップ処理
    const { active, over } = event
    if (!over || !props.onTaskDrop) return
    
    const draggedTask = active.data.current?.task as CalendarTask
    if (!draggedTask) return
    
    const overData = over.data.current
    if (overData?.type === 'day-column') {
      const targetDate = overData.date as Date
      // 新しい時間を計算する必要がある
      const newStartTime = new Date(targetDate)
      newStartTime.setHours(draggedTask.startTime.getHours(), draggedTask.startTime.getMinutes())
      
      props.onTaskDrop(draggedTask, targetDate, newStartTime)
    }
  }
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <TimeGrid {...props} />
    </DndContext>
  )
}

// 単一日表示用のシンプル版
export function SingleDayTimeGrid({
  date,
  ...props
}: Omit<TimeGridProps, 'dates'> & { date: Date }) {
  return <TimeGrid {...props} dates={[date]} />
}

// 週表示用
export function WeekTimeGrid({
  weekStart,
  ...props
}: Omit<TimeGridProps, 'dates'> & { weekStart: Date }) {
  const dates = useMemo(() => {
    const week = []
    const startDate = new Date(weekStart)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      week.push(date)
    }
    
    return week
  }, [weekStart])
  
  return <TimeGrid {...props} dates={dates} />
}