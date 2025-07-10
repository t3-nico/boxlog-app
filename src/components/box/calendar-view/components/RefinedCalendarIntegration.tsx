'use client'

import React, { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { RefinedCalendarTask } from './RefinedCalendarTask'
import { SmoothDragPreview } from './SmoothDragPreview'
import { RefinedTimeGrid } from './RefinedTimeGrid'
import { TaskCreatedAnimation, FloatingTooltip } from './MicroInteractions'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useTaskStore } from '@/stores/useTaskStore'
import { useDragToCreate } from '../hooks/useDragToCreate'
import { QuickTaskCreator } from './QuickTaskCreator'
import { TaskReviewModal } from './TaskReviewModal'
import { cn } from '@/lib/utils'

interface CalendarTask {
  id: string
  title: string
  startTime: Date
  endTime: Date
  status: 'scheduled' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  color?: string
  description?: string
  isPlan?: boolean
  isRecord?: boolean
  satisfaction?: number
  focusLevel?: number
  energyLevel?: number
}

interface RefinedCalendarIntegrationProps {
  dates: Date[]
  tasks?: CalendarTask[]
  view?: 'day' | 'week' | 'month'
  splitMode?: boolean
  className?: string
  onTaskClick?: (task: CalendarTask) => void
  onTaskCreate?: (taskData: any) => void
  onTaskUpdate?: (id: string, updates: any) => void
  onTaskDelete?: (id: string) => void
}

export function RefinedCalendarIntegration({
  dates,
  tasks = [],
  view = 'week',
  splitMode = false,
  className,
  onTaskClick,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete
}: RefinedCalendarIntegrationProps) {
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [showTaskCreated, setShowTaskCreated] = useState(false)
  const [creatingTask, setCreatingTask] = useState<{
    start: Date
    end: Date
    column: number
  } | null>(null)
  
  const { timeFormat } = useCalendarSettingsStore()
  const { createTask, updateTask, deleteTask } = useTaskStore()
  
  // ドラッグ＆ドロップでタスク作成
  const { dragState, handleMouseDown, handleTouchStart, dragPreview } = useDragToCreate({
    gridInterval: 15,
    containerRef: React.useRef<HTMLDivElement>(null),
    hourHeight: 60,
    disabled: false,
    onCreateTask: (task) => {
      setCreatingTask({
        start: task.start,
        end: task.end,
        column: task.column || 0
      })
    }
  })
  
  // タスククリックハンドラー
  const handleTaskClick = useCallback((task: CalendarTask) => {
    setSelectedTask(task)
    setIsReviewModalOpen(true)
    onTaskClick?.(task)
  }, [onTaskClick])
  
  // タスク作成ハンドラー
  const handleTaskCreate = useCallback(async (taskData: any) => {
    try {
      const newTask = createTask(taskData)
      onTaskCreate?.(newTask)
      setCreatingTask(null)
      setShowTaskCreated(true)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }, [createTask, onTaskCreate])
  
  // タスク更新ハンドラー
  const handleTaskUpdate = useCallback((task: CalendarTask) => {
    try {
      // CalendarTaskをTaskStore形式に変換
      const storeTask = {
        id: task.id,
        title: task.title,
        planned_start: task.startTime,
        planned_duration: Math.round((task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60)),
        status: task.status === 'scheduled' ? 'pending' as const : task.status,
        priority: task.priority,
        description: task.description,
        created_at: new Date(),
        updated_at: new Date()
      }
      updateTask(task.id, storeTask)
      onTaskUpdate?.(task.id, task)
      setIsReviewModalOpen(false)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }, [updateTask, onTaskUpdate])
  
  // タスク削除ハンドラー
  const handleTaskDelete = useCallback((taskId: string) => {
    try {
      deleteTask(taskId)
      onTaskDelete?.(taskId)
      setIsReviewModalOpen(false)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }, [deleteTask, onTaskDelete])
  
  // ステータス変更ハンドラー
  const handleStatusChange = useCallback((taskId: string, status: CalendarTask['status']) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      handleTaskUpdate({ ...task, status })
    }
  }, [tasks, handleTaskUpdate])
  
  // 時間スロットクリックハンドラー
  const handleTimeSlotClick = useCallback((date: Date, time: string, x: number, y: number) => {
    const [hours, minutes] = time.split(':').map(Number)
    const startTime = new Date(date)
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1時間後
    
    setCreatingTask({
      start: startTime,
      end: endTime,
      column: 0
    })
  }, [])
  
  // タスクをカレンダー位置に配置する計算
  const getTaskStyle = useCallback((task: CalendarTask) => {
    const startMinutes = task.startTime.getHours() * 60 + task.startTime.getMinutes()
    const endMinutes = task.endTime.getHours() * 60 + task.endTime.getMinutes()
    const duration = endMinutes - startMinutes
    
    return {
      position: 'absolute' as const,
      top: `${(startMinutes / 60) * 60}px`,
      height: `${Math.max((duration / 60) * 60, 24)}px`,
      left: splitMode ? '2px' : '4px',
      right: splitMode ? '2px' : '4px',
      zIndex: 10
    }
  }, [splitMode])
  
  return (
    <div className={cn("h-full relative", className)}>
      {/* メインタイムグリッド */}
      {splitMode ? (
        <RefinedTimeGrid
          dates={dates}
          showCurrentTime={true}
          showBusinessHours={true}
          onTimeSlotClick={handleTimeSlotClick}
        >
          {/* 分割モードでのタスク表示 */}
          <div className="absolute inset-0 flex">
            {/* 左側：予定 */}
            <div className="w-1/2 pr-0.5 relative">
              {tasks
                .filter(task => task.isPlan)
                .map(task => (
                  <FloatingTooltip
                    key={task.id}
                    content={
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs opacity-75">
                          {task.startTime.toLocaleTimeString()} - {task.endTime.toLocaleTimeString()}
                        </div>
                      </div>
                    }
                  >
                    <RefinedCalendarTask
                      task={task}
                      view={view}
                      style={getTaskStyle(task)}
                      onClick={handleTaskClick}
                      onStatusChange={handleStatusChange}
                    />
                  </FloatingTooltip>
                ))}
            </div>
            
            {/* 右側：記録 */}
            <div className="w-1/2 pl-0.5 relative">
              {tasks
                .filter(task => task.isRecord)
                .map(task => (
                  <FloatingTooltip
                    key={task.id}
                    content={
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs opacity-75">
                          満足度: {task.satisfaction}/5
                        </div>
                      </div>
                    }
                  >
                    <RefinedCalendarTask
                      task={task}
                      view={view}
                      style={getTaskStyle(task)}
                      onClick={handleTaskClick}
                    />
                  </FloatingTooltip>
                ))}
            </div>
          </div>
        </RefinedTimeGrid>
      ) : (
        <RefinedTimeGrid
          dates={dates}
          showCurrentTime={true}
          showBusinessHours={true}
          onTimeSlotClick={handleTimeSlotClick}
        >
          {/* 通常モードでのタスク表示 */}
          <div className="absolute inset-0 flex">
            {dates.map((date, dateIndex) => (
              <div key={date.toISOString()} className="flex-1 relative">
                {tasks
                  .filter(task => 
                    task.startTime.toDateString() === date.toDateString()
                  )
                  .map(task => (
                    <FloatingTooltip
                      key={task.id}
                      content={
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs opacity-75">
                            {task.startTime.toLocaleTimeString()} - {task.endTime.toLocaleTimeString()}
                          </div>
                          {task.description && (
                            <div className="text-xs mt-1">{task.description}</div>
                          )}
                        </div>
                      }
                    >
                      <RefinedCalendarTask
                        task={task}
                        view={view}
                        style={getTaskStyle(task)}
                        onClick={handleTaskClick}
                        onStatusChange={handleStatusChange}
                      />
                    </FloatingTooltip>
                  ))}
              </div>
            ))}
          </div>
        </RefinedTimeGrid>
      )}
      
      {/* ドラッグプレビュー */}
      <AnimatePresence>
        {dragPreview && (
          <SmoothDragPreview
            start={dragPreview.start}
            end={dragPreview.end}
            side={splitMode ? (dragPreview.column === 0 ? 'left' : 'right') : 'left'}
            hourHeight={60}
            hasConflicts={false}
          />
        )}
      </AnimatePresence>
      
      {/* インライン作成フォーム */}
      <AnimatePresence>
        {creatingTask && (
          <div className="absolute inset-0 flex pointer-events-none">
            {dates.map((date, dateIndex) => (
              <div key={date.toISOString()} className="flex-1 relative">
                {creatingTask.column === dateIndex && (
                  <QuickTaskCreator
                    initialStart={creatingTask.start}
                    initialEnd={creatingTask.end}
                    hourHeight={60}
                    onSave={handleTaskCreate}
                    onCancel={() => setCreatingTask(null)}
                    className="pointer-events-auto"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* タスクレビューモーダル */}
      <AnimatePresence>
        {selectedTask && (
          <TaskReviewModal
            task={{
              id: selectedTask.id,
              title: selectedTask.title,
              planned_start: selectedTask.startTime,
              planned_duration: Math.round((selectedTask.endTime.getTime() - selectedTask.startTime.getTime()) / (1000 * 60)),
              status: selectedTask.status === 'scheduled' ? 'pending' : selectedTask.status,
              priority: selectedTask.priority,
              description: selectedTask.description
            }}
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onSave={(task) => {
              const calendarTask: CalendarTask = {
                ...selectedTask,
                title: task.title,
                status: task.status === 'pending' ? 'scheduled' : task.status,
                priority: task.priority,
                description: task.description
              }
              handleTaskUpdate(calendarTask)
            }}
            onDelete={handleTaskDelete}
            onStatusChange={(taskId, status) => {
              handleStatusChange(taskId, status === 'pending' ? 'scheduled' : status)
            }}
          />
        )}
      </AnimatePresence>
      
      {/* タスク作成成功通知 */}
      <TaskCreatedAnimation
        isVisible={showTaskCreated}
        onComplete={() => setShowTaskCreated(false)}
      />
    </div>
  )
}

// ショートカットキー対応版
export function KeyboardEnabledCalendarIntegration(props: RefinedCalendarIntegrationProps) {
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N: 新しいタスク作成
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        // 現在時刻に新しいタスクを作成
        const now = new Date()
        const start = new Date(now.getTime())
        start.setMinutes(Math.floor(start.getMinutes() / 15) * 15) // 15分単位に丸める
        const end = new Date(start.getTime() + 60 * 60 * 1000)
        
        // TODO: 作成フォームを表示
      }
      
      // Esc: モーダルを閉じる
      if (e.key === 'Escape') {
        // TODO: 開いているモーダルを閉じる
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
  
  return <RefinedCalendarIntegration {...props} />
}