'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CalendarTask } from './utils/time-grid-helpers'

interface DraggableTaskProps {
  task: CalendarTask
  position: {
    top: string
    height: string
    left: string
    width: string
  }
  onClick?: (task: CalendarTask) => void
  isDragging?: boolean
}

export function DraggableTask({
  task,
  position,
  onClick,
  isDragging = false
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

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000
  } : undefined

  const isBeingDragged = isDragging || dndIsDragging

  return (
    <div
      ref={setNodeRef}
      className={`
        absolute mx-1 rounded-md shadow-sm cursor-pointer
        transition-all duration-150
        ${isBeingDragged ? 'opacity-50 scale-105 shadow-lg z-50' : 'hover:shadow-md hover:scale-105'}
        ${task.color || 'bg-blue-500'} text-white
        overflow-hidden
      `}
      style={{
        top: position.top,
        height: position.height,
        left: position.left,
        width: `calc(${position.width} - 8px)`, // マージン分を引く
        ...style
      }}
      onClick={(e) => {
        if (!isBeingDragged) {
          e.stopPropagation()
          onClick?.(task)
        }
      }}
      {...attributes}
      {...listeners}
    >
      <div className="p-2 h-full flex flex-col select-none">
        <div className="font-medium text-sm truncate">
          {task.title}
        </div>
        {task.description && (
          <div className="text-xs opacity-90 mt-1 flex-1 overflow-hidden">
            {task.description}
          </div>
        )}
        <div className="text-xs opacity-75 mt-auto">
          {task.startTime.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {' - '}
          {task.endTime.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        
        {/* ドラッグハンドル視覚化 */}
        <div className="absolute top-1 right-1 opacity-50">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full mt-0.5"></div>
          <div className="w-1 h-1 bg-white rounded-full mt-0.5"></div>
        </div>
      </div>
    </div>
  )
}