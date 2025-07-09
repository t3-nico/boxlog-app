'use client'

import React, { useRef, useMemo } from 'react'
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core'
import { CurrentTimeLine } from './CurrentTimeLine'
import { DraggableTask } from './DraggableTask'
import { 
  CalendarTask,
  generateTimeLabels,
  getTimeSlotBgClass,
  getGridLineClass,
  formatTimeForDisplay,
  calculateTaskPosition,
  timeToMinutes,
  getTimeFromPosition,
  snapToGrid
} from './utils/time-grid-helpers'

interface TimeGridProps {
  date: Date
  tasks?: CalendarTask[]
  gridInterval?: 15 | 30 | 60 // 分単位
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrop?: (task: CalendarTask, newStartTime: Date) => void
  showCurrentTime?: boolean
  className?: string
}

export function TimeGrid({
  date,
  tasks = [],
  gridInterval = 15,
  onTaskClick,
  onEmptyClick,
  onTaskDrop,
  showCurrentTime = true,
  className = ''
}: TimeGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 時間ラベルを生成（メモ化）
  const timeLabels = useMemo(() => {
    return generateTimeLabels(gridInterval)
  }, [gridInterval])

  // 当日のタスクのみフィルタリング
  const dayTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startTime)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }, [tasks, date])

  // 空のセルクリック処理
  const handleEmptyClick = (time: string) => {
    if (onEmptyClick) {
      const clickDate = new Date(date)
      const [hours, minutes] = time.split(':').map(Number)
      clickDate.setHours(hours, minutes, 0, 0)
      onEmptyClick(clickDate, time)
    }
  }

  // 今日かどうかを判定
  const isToday = useMemo(() => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }, [date])

  // ドラッグ&ドロップのドロップゾーン
  const { setNodeRef: setDropZoneRef } = useDroppable({
    id: `time-grid-${date.toISOString()}`,
    data: {
      type: 'time-grid',
      date: date
    }
  })

  // ドラッグ終了処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event
    
    if (!over || !onTaskDrop) return
    
    const draggedTask = active.data.current?.task as CalendarTask
    if (!draggedTask) return

    if (containerRef.current) {
      // マウス位置から新しい時刻を計算
      const containerRect = containerRef.current.getBoundingClientRect()
      const relativeY = event.activatorEvent ? 
        (event.activatorEvent as MouseEvent).clientY - containerRect.top + containerRef.current.scrollTop :
        delta.y

      const newStartTime = getTimeFromPosition(relativeY, containerRect, gridInterval)
      
      // グリッドにスナップ
      const snappedStartTime = snapToGrid(newStartTime, gridInterval)
      
      // 新しい日付に設定
      const adjustedStartTime = new Date(date)
      adjustedStartTime.setHours(
        snappedStartTime.getHours(),
        snappedStartTime.getMinutes(),
        0,
        0
      )

      onTaskDrop(draggedTask, adjustedStartTime)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={`h-full flex ${className}`}>
      {/* 時間ラベル列 */}
      <div className="w-16 flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-20">
          {/* ヘッダースペース */}
          <div className="h-0"></div>
        </div>
        
        {/* 時間ラベル */}
        <div className="relative">
          {timeLabels.map((time, index) => {
            const minutes = timeToMinutes(time) % 60
            const hour = Math.floor(timeToMinutes(time) / 60)
            
            return (
              <div
                key={time}
                className={`
                  relative h-4 text-xs text-gray-600 dark:text-gray-400
                  ${minutes === 0 ? 'font-medium' : 'font-normal'}
                `}
                style={{ 
                  height: `${100 / timeLabels.length}%`,
                  minHeight: '16px'
                }}
              >
                {minutes === 0 && (
                  <div className="absolute -top-2 right-2 text-right">
                    {formatTimeForDisplay(time)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* メイングリッド */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={(node) => {
            if (containerRef && typeof containerRef !== 'function') {
              (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            }
            setDropZoneRef(node)
          }}
          className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        >
          {/* グリッド背景 */}
          <div className="relative min-h-full">
            {timeLabels.map((time, index) => {
              const minutes = timeToMinutes(time) % 60
              const hour = Math.floor(timeToMinutes(time) / 60)
              const bgClass = getTimeSlotBgClass(hour)
              const gridLineClass = getGridLineClass(minutes, gridInterval)
              
              return (
                <div
                  key={time}
                  className={`
                    relative cursor-pointer transition-colors duration-150
                    hover:bg-blue-50 dark:hover:bg-blue-900/20
                    ${bgClass}
                    ${gridLineClass}
                  `}
                  style={{ 
                    height: `${100 / timeLabels.length}%`,
                    minHeight: '16px'
                  }}
                  onClick={() => handleEmptyClick(time)}
                >
                  {/* グリッド線の視覚的強調（正時のみ） */}
                  {minutes === 0 && (
                    <div className="absolute inset-x-0 top-0 h-px bg-gray-300 dark:bg-gray-600"></div>
                  )}
                </div>
              )
            })}

            {/* タスク表示レイヤー */}
            <div className="absolute inset-0 pointer-events-none">
              {dayTasks.map((task) => {
                const position = calculateTaskPosition(task, date, gridInterval)
                
                return (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    position={position}
                    onClick={onTaskClick}
                  />
                )
              })}
            </div>

            {/* 現在時刻ライン */}
            {showCurrentTime && isToday && (
              <CurrentTimeLine 
                containerRef={containerRef}
                gridInterval={gridInterval}
                isVisible={true}
              />
            )}
          </div>
        </div>
      </div>
      </div>
    </DndContext>
  )
}