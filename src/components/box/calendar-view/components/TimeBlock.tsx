'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { 
  ChevronDownIcon,
  LockClosedIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  AcademicCapIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  SunIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { formatDuration } from '../utils/timeBlockHelpers'
import type { TimeBlock } from '../types/timeBlock'
import type { Task } from '../types'

interface TimeBlockProps {
  block: TimeBlock
  onUpdate: (block: TimeBlock) => void
  onDelete: (blockId: string) => void
  onDuplicate?: (block: TimeBlock) => void
  onTaskStatusChange?: (taskId: string, status: Task['status']) => void
  hourHeight?: number
}

// アイコン取得関数
function getBlockIcon(type: TimeBlock['type']) {
  const iconClass = "w-4 h-4"
  
  switch (type) {
    case 'focus':
      return <AcademicCapIcon className={iconClass} />
    case 'meeting':
      return <UsersIcon className={iconClass} />
    case 'break':
      return <SparklesIcon className={iconClass} />
    case 'routine':
      return <SunIcon className={iconClass} />
    default:
      return <ClockIcon className={iconClass} />
  }
}

// 位置計算関数
function calculateTopPosition(startTime: Date, hourHeight: number = 60): number {
  const hours = startTime.getHours()
  const minutes = startTime.getMinutes()
  return ((hours * 60 + minutes) / 60) * hourHeight
}

function calculateHeight(startTime: Date, endTime: Date, hourHeight: number = 60): number {
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
  return Math.max((duration / 60) * hourHeight, 80) // minimum 80px height
}

export function TimeBlockComponent({ 
  block, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  onTaskStatusChange,
  hourHeight = 60 
}: TimeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  
  const totalDuration = useMemo(() => {
    return block.tasks.reduce((sum, task) => sum + (task.planned_duration || 0), 0)
  }, [block.tasks])
  
  const progress = useMemo(() => {
    if (block.tasks.length === 0) return 0
    const completed = block.tasks.filter(t => t.status === 'completed').length
    return (completed / block.tasks.length) * 100
  }, [block.tasks])

  const blockStyle = useMemo(() => ({
    top: calculateTopPosition(block.startTime, hourHeight),
    height: calculateHeight(block.startTime, block.endTime, hourHeight),
    left: '4px',
    right: '4px'
  }), [block.startTime, block.endTime, hourHeight])

  const toggleTaskStatus = (taskId: string) => {
    const task = block.tasks.find(t => t.id === taskId)
    if (!task) return
    
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    onTaskStatusChange?.(taskId, newStatus)
    
    // Update block tasks
    const updatedTasks = block.tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
    )
    onUpdate({ ...block, tasks: updatedTasks })
  }

  const duplicateBlock = () => {
    if (onDuplicate) {
      const duplicated: TimeBlock = {
        ...block,
        id: `${block.id}_copy_${Date.now()}`,
        title: `${block.title} (コピー)`,
        startTime: new Date(block.endTime.getTime() + 15 * 60 * 1000), // 15分後
        endTime: new Date(block.endTime.getTime() + 15 * 60 * 1000 + (block.endTime.getTime() - block.startTime.getTime()))
      }
      onDuplicate(duplicated)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(block.tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    onUpdate({ ...block, tasks: items })
  }

  return (
    <motion.div
      className={cn(
        "absolute rounded-lg border-2 transition-all group overflow-hidden",
        "shadow-lg hover:shadow-xl",
        block.type === 'focus' && "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
        block.type === 'meeting' && "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
        block.type === 'break' && "border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
        block.type === 'routine' && "border-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
        isDraggingOver && "ring-4 ring-offset-2 ring-blue-500/30 border-blue-600",
        block.isLocked && "opacity-75 cursor-not-allowed"
      )}
      style={blockStyle}
      layout
      whileHover={{ scale: 1.01, zIndex: 20 }}
      whileTap={{ scale: 0.99 }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDraggingOver(true)
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDraggingOver(false)
      }}
    >
      {/* ヘッダー */}
      <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "p-1.5 rounded-md",
              block.type === 'focus' && "bg-purple-200 dark:bg-purple-800",
              block.type === 'meeting' && "bg-blue-200 dark:bg-blue-800",
              block.type === 'break' && "bg-green-200 dark:bg-green-800",
              block.type === 'routine' && "bg-gray-200 dark:bg-gray-800"
            )}>
              {getBlockIcon(block.type)}
            </div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {block.title}
            </h3>
            {block.isLocked && (
              <LockClosedIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {formatDuration(totalDuration)}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded transition-colors"
              disabled={block.isLocked}
            >
              <ChevronDownIcon 
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>
        
        {/* プログレスバー */}
        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              block.type === 'focus' && "bg-gradient-to-r from-purple-500 to-purple-600",
              block.type === 'meeting' && "bg-gradient-to-r from-blue-500 to-blue-600",
              block.type === 'break' && "bg-gradient-to-r from-green-500 to-green-600",
              block.type === 'routine' && "bg-gradient-to-r from-gray-500 to-gray-600"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* 統計表示 */}
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span>{block.tasks.length} タスク</span>
          {progress > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3" />
              {Math.round(progress)}% 完了
            </span>
          )}
        </div>
      </div>
      
      {/* タスクリスト */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={block.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "p-2 space-y-1.5 transition-colors",
                      snapshot.isDraggingOver && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                  >
                    {block.tasks.map((task, index) => (
                      <Draggable 
                        key={task.id} 
                        draggableId={task.id} 
                        index={index}
                        isDragDisabled={block.isLocked}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "p-2 rounded-md text-xs flex items-center gap-2",
                              "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                              "hover:shadow-sm transition-all duration-150",
                              task.status === 'completed' && "opacity-60",
                              snapshot.isDragging && "shadow-lg rotate-2 scale-105 z-50"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => toggleTaskStatus(task.id)}
                              disabled={block.isLocked}
                              className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={cn(
                              "flex-1 truncate font-medium",
                              task.status === 'completed' ? "line-through text-gray-500" : "text-gray-900 dark:text-white"
                            )}>
                              {task.title}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
                              {task.planned_duration}分
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {block.tasks.length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
                        タスクをここにドラッグしてください
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* アクションボタン */}
      {!block.isLocked && (
        <div className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col gap-1">
            <motion.button
              onClick={() => onDelete(block.id)}
              className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="ブロックを削除"
            >
              <TrashIcon className="w-3 h-3" />
            </motion.button>
            <motion.button
              onClick={duplicateBlock}
              className="p-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 shadow-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="ブロックを複製"
            >
              <DocumentDuplicateIcon className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
      )}
      
      {/* ドラッグオーバーインディケーター */}
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center backdrop-blur-sm"
          >
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              タスクをドロップ
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}