'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { differenceInMinutes } from 'date-fns'
import { cn } from '@/lib/utils'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { 
  ClockIcon,
  StarIcon,
  BoltIcon,
  CheckIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import { 
  StarIcon as StarIconSolid,
  BoltIcon as BoltIconSolid
} from '@heroicons/react/24/solid'

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

interface RefinedCalendarTaskProps {
  task: CalendarTask
  view: 'day' | 'week' | 'month'
  style?: React.CSSProperties
  isDragging?: boolean
  isSelected?: boolean
  onClick?: (task: CalendarTask) => void
  onDoubleClick?: (task: CalendarTask) => void
  onStatusChange?: (taskId: string, status: CalendarTask['status']) => void
  className?: string
}

// 時間をフォーマット
function formatTime(date: Date, timeFormat: '24h' | '12h'): string {
  if (timeFormat === '12h') {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } else {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
}

// 現在進行中かどうかチェック
function isTaskInProgress(task: CalendarTask): boolean {
  const now = new Date()
  return task.status === 'in_progress' || 
    (task.status === 'scheduled' && now >= task.startTime && now <= task.endTime)
}

// 優先度設定
function getPriorityConfig(priority: 'low' | 'medium' | 'high') {
  switch (priority) {
    case 'high':
      return {
        icon: BoltIconSolid,
        iconOutline: BoltIcon,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        label: '緊急'
      }
    case 'medium':
      return {
        icon: StarIconSolid,
        iconOutline: StarIcon,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        label: '標準'
      }
    case 'low':
      return {
        icon: StarIcon,
        iconOutline: StarIcon,
        color: 'text-gray-400',
        bg: 'bg-gray-500/10',
        label: '低'
      }
  }
}

export function RefinedCalendarTask({
  task,
  view,
  style,
  isDragging = false,
  isSelected = false,
  onClick,
  onDoubleClick,
  onStatusChange,
  className
}: RefinedCalendarTaskProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const { timeFormat } = useCalendarSettingsStore()
  const taskRef = useRef<HTMLDivElement>(null)
  
  const duration = differenceInMinutes(task.endTime, task.startTime)
  const isInProgress = isTaskInProgress(task)
  const priorityConfig = getPriorityConfig(task.priority)
  
  // 自動で詳細表示する条件
  useEffect(() => {
    setShowDetails(duration >= 60 || isHovered)
  }, [duration, isHovered])
  
  // ステータスに応じたスタイル
  const getStatusStyles = () => {
    if (task.isPlan) {
      switch (task.status) {
        case 'scheduled':
          return 'cal-task-scheduled'
        case 'in_progress':
          return 'cal-task-in-progress'
        case 'completed':
          return 'cal-task-completed'
        default:
          return 'cal-task-scheduled'
      }
    } else if (task.isRecord) {
      return 'cal-task-completed'
    } else {
      return 'cal-task-scheduled'
    }
  }
  
  // クリックハンドラー
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(task)
  }
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick?.(task)
  }
  
  // ステータス変更ハンドラー
  const handleStatusClick = (e: React.MouseEvent, status: CalendarTask['status']) => {
    e.stopPropagation()
    onStatusChange?.(task.id, status)
  }
  
  return (
    <motion.div
      ref={taskRef}
      className={cn(
        "cal-task-card cal-focus-visible",
        getStatusStyles(),
        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-blue-600",
        isDragging && "opacity-50 scale-105",
        className
      )}
      
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ 
        opacity: 1, 
        scale: isDragging ? 1.05 : (isPressed ? 0.98 : 1),
        y: 0,
        boxShadow: isHovered 
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
      }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8
      }}
      
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.1 }
      }}
      whileTap={{ scale: 0.98 }}
      
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      
      style={style}
    >
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 pointer-events-none" />
      
      {/* 進行中のパルスエフェクト */}
      <AnimatePresence>
        {isInProgress && (
          <motion.div
            className="absolute inset-0 rounded-md"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.4)",
                "0 0 0 8px rgba(59, 130, 246, 0)",
              ]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </AnimatePresence>
      
      {/* メインコンテンツ */}
      <div className="relative z-10 h-full px-3 py-2">
        <div className="flex items-start gap-2 h-full">
          {/* 優先度インジケーター */}
          <div className={cn(
            "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
            priorityConfig.bg
          )}>
            <priorityConfig.icon className={cn("w-3 h-3", priorityConfig.color)} />
          </div>
          
          {/* タスク情報 */}
          <div className="flex-1 min-w-0">
            {/* タイトル */}
            <div className="font-medium text-sm truncate mb-1">
              {task.title}
            </div>
            
            {/* 詳細情報（条件付き表示） */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  {/* 時間 */}
                  <div className="flex items-center gap-1 text-xs opacity-90">
                    <ClockIcon className="w-3 h-3" />
                    <span>
                      {formatTime(task.startTime, timeFormat)} - {formatTime(task.endTime, timeFormat)}
                    </span>
                    <span className="text-xs opacity-75">
                      ({duration}分)
                    </span>
                  </div>
                  
                  {/* 記録の詳細情報 */}
                  {task.isRecord && (task.satisfaction || task.focusLevel || task.energyLevel) && (
                    <div className="flex items-center gap-2 text-xs">
                      {task.satisfaction && (
                        <div className="flex items-center gap-1">
                          <span>😊</span>
                          <span>{task.satisfaction}/5</span>
                        </div>
                      )}
                      {task.focusLevel && (
                        <div className="flex items-center gap-1">
                          <span>🎯</span>
                          <span>{task.focusLevel}/5</span>
                        </div>
                      )}
                      {task.energyLevel && (
                        <div className="flex items-center gap-1">
                          <span>⚡</span>
                          <span>{task.energyLevel}/5</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* ステータスインジケーター */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            {/* ステータスアイコン */}
            <AnimatePresence mode="wait">
              {task.status === 'completed' && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <CheckIcon className="w-4 h-4 text-white" />
                </motion.div>
              )}
              
              {task.status === 'in_progress' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                >
                  <PlayIcon className="w-4 h-4 text-white" />
                </motion.div>
              )}
              
              {task.status === 'scheduled' && isInProgress && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              )}
            </AnimatePresence>
            
            {/* ホバー時のクイックアクション */}
            <AnimatePresence>
              {isHovered && onStatusChange && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                  className="flex flex-col gap-1"
                >
                  {task.status !== 'completed' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleStatusClick(e, 'completed')}
                      className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <CheckIcon className="w-3 h-3" />
                    </motion.button>
                  )}
                  
                  {task.status === 'scheduled' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleStatusClick(e, 'in_progress')}
                      className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <PlayIcon className="w-3 h-3" />
                    </motion.button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleStatusClick(e, 'scheduled')}
                      className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <PauseIcon className="w-3 h-3" />
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* 左端のカラーバー（アニメーション付き） */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1 bg-current"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      />
      
      {/* 選択時の枠線 */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 border-2 border-white rounded-md pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// コンパクト版（短時間タスク用）
export function CompactCalendarTask({ task, ...props }: RefinedCalendarTaskProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { timeFormat } = useCalendarSettingsStore()
  const priorityConfig = getPriorityConfig(task.priority)
  
  return (
    <motion.div
      className={cn(
        "cal-task-card h-6 px-2 py-1",
        task.isPlan ? "cal-task-scheduled" : "cal-task-completed",
        props.className
      )}
      
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => props.onClick?.(task)}
      
      style={props.style}
    >
      <div className="flex items-center gap-2 h-full">
        <priorityConfig.icon className={cn("w-3 h-3 flex-shrink-0", priorityConfig.color)} />
        <span className="text-xs font-medium truncate flex-1">
          {task.title}
        </span>
        <span className="text-xs opacity-75 flex-shrink-0">
          {formatTime(task.startTime, timeFormat)}
        </span>
      </div>
    </motion.div>
  )
}