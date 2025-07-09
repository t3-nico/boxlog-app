'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CalendarTask as CalendarTaskType } from './utils/time-grid-helpers'
import { CalendarTask } from './components/CalendarTask'
import { TaskDragAnimation } from './components/ViewTransition'

interface DraggableTaskProps {
  task: CalendarTaskType
  position: {
    top: string
    height: string
    left: string
    width: string
  }
  view?: 'day' | 'week' | 'month'
  conflicts?: number
  totalConflicts?: number
  onClick?: (task: CalendarTaskType) => void
  onDoubleClick?: (task: CalendarTaskType) => void
}

export function DraggableTask({
  task,
  position,
  view = 'week',
  conflicts = 0,
  totalConflicts = 1,
  onClick,
  onDoubleClick
}: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dndIsDragging
  } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000
  } : undefined

  const combinedStyle = {
    ...position,
    ...dragStyle
  }

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...attributes}
      {...listeners}
    >
      <TaskDragAnimation isDragging={dndIsDragging}>
        <CalendarTask
          task={task}
          view={view}
          isDragging={dndIsDragging}
          conflicts={conflicts}
          totalConflicts={totalConflicts}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
      </TaskDragAnimation>
    </div>
  )
}

// ドラッグ不可のタスク表示用
interface StaticTaskProps {
  task: CalendarTaskType
  position: {
    top: string
    height: string
    left: string
    width: string
  }
  view?: 'day' | 'week' | 'month'
  conflicts?: number
  totalConflicts?: number
  onClick?: (task: CalendarTaskType) => void
  onDoubleClick?: (task: CalendarTaskType) => void
}

export function StaticTask({
  task,
  position,
  view = 'week',
  conflicts = 0,
  totalConflicts = 1,
  onClick,
  onDoubleClick
}: StaticTaskProps) {
  return (
    <div style={position}>
      <CalendarTask
        task={task}
        view={view}
        conflicts={conflicts}
        totalConflicts={totalConflicts}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />
    </div>
  )
}

// リサイズ可能なタスク（デイビュー用）
interface ResizableTaskProps extends DraggableTaskProps {
  onResize?: (taskId: string, newDuration: number) => void
}

export function ResizableTask({
  task,
  position,
  view = 'day',
  onResize,
  ...props
}: ResizableTaskProps) {
  const [isResizing, setIsResizing] = React.useState(false)
  const [startY, setStartY] = React.useState(0)
  const [originalHeight, setOriginalHeight] = React.useState(0)

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setStartY(e.clientY)
    setOriginalHeight(parseInt(position.height.replace('px', '')))
  }

  const handleResizeMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing) return
    
    const deltaY = e.clientY - startY
    const newHeight = Math.max(20, originalHeight + deltaY) // 最小高さ20px
    const newDuration = (newHeight / 48) * 60 // 1時間48pxと仮定
    
    onResize?.(task.id, newDuration)
  }, [isResizing, startY, originalHeight, task.id, onResize])

  const handleResizeEnd = React.useCallback(() => {
    setIsResizing(false)
  }, [])

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  return (
    <div style={position} className="relative">
      <DraggableTask
        {...props}
        task={task}
        position={{
          top: '0%',
          height: '100%',
          left: '0%',
          width: '100%'
        }}
        view={view}
      />
      
      {/* リサイズハンドル */}
      {view === 'day' && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-white/20 opacity-0 hover:opacity-100 transition-opacity z-10"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  )
}