'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { differenceInMinutes } from 'date-fns'
import { cn } from '@/lib/utils'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { 
  Clock,
  Plus,
  Sparkles
} from 'lucide-react'

interface SmoothDragPreviewProps {
  start: Date
  end: Date
  side?: 'left' | 'right'
  hourHeight: number
  hasConflicts?: boolean
  conflictTasks?: any[]
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

export function SmoothDragPreview({
  start,
  end,
  side = 'left',
  hourHeight,
  hasConflicts = false,
  conflictTasks = [],
  className
}: SmoothDragPreviewProps) {
  const { timeFormat } = useCalendarSettingsStore()
  const duration = differenceInMinutes(end, start)
  
  // 位置計算
  const style = useMemo(() => {
    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const height = Math.max((duration / 60) * hourHeight, 40)
    
    return {
      top: `${(startMinutes / 60) * hourHeight}px`,
      height: `${height}px`,
      left: side === 'left' ? '4px' : '52%',
      right: side === 'left' ? '52%' : '4px',
    }
  }, [start, duration, hourHeight, side])
  
  // サイドに応じた色
  const colorConfig = side === 'left' 
    ? {
        border: 'border-blue-400',
        bg: 'bg-blue-500/20',
        glow: 'rgba(59, 130, 246, 0.5)',
        gradient: 'from-blue-400/20 to-blue-600/20'
      }
    : {
        border: 'border-green-400', 
        bg: 'bg-green-500/20',
        glow: 'rgba(16, 185, 129, 0.5)',
        gradient: 'from-green-400/20 to-green-600/20'
      }
  
  return (
    <motion.div
      className={cn(
        "absolute pointer-events-none z-50 rounded-lg overflow-hidden",
        "border-2 border-dashed backdrop-blur-sm",
        colorConfig.border,
        colorConfig.bg,
        hasConflicts && "border-red-400 bg-red-500/20",
        className
      )}
      
      initial={{ 
        opacity: 0, 
        scale: 0.9,
        rotateX: -10
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotateX: 0
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.9,
        rotateX: 10
      }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8
      }}
      
      style={style}
    >
      {/* パルスエフェクト */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: hasConflicts ? [
            "0 0 0 0 rgba(239, 68, 68, 0.5)",
            "0 0 0 12px rgba(239, 68, 68, 0)",
          ] : [
            `0 0 0 0 ${colorConfig.glow}`,
            `0 0 0 8px ${colorConfig.glow.replace('0.5', '0')}`,
          ]
        }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
      
      {/* グラデーション背景 */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        hasConflicts ? "from-red-400/20 to-red-600/20" : colorConfig.gradient
      )} />
      
      {/* ドット模様 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '8px 8px'
        }}
      />
      
      {/* メインコンテンツ */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
        {/* 作成アイコン */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 4, ease: "linear" },
            scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
          className="mb-2"
        >
          {hasConflicts ? (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          ) : (
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              side === 'left' ? "bg-blue-500" : "bg-green-500"
            )}>
              <Plus className="w-4 h-4 text-white" />
            </div>
          )}
        </motion.div>
        
        {/* 時間表示 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
            "px-2 py-1 rounded-md shadow-sm text-center",
            "border border-white/20"
          )}
        >
          <div className="flex items-center gap-1 text-xs font-medium">
            <Clock className="w-3 h-3" />
            <span>
              {formatTime(start, timeFormat)} - {formatTime(end, timeFormat)}
            </span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {duration}分の{side === 'left' ? '予定' : '記録'}
          </div>
        </motion.div>
        
        {/* コンフリクト警告 */}
        <AnimatePresence>
          {hasConflicts && conflictTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-2 bg-red-500/90 text-white px-2 py-1 rounded text-xs text-center"
            >
              {conflictTasks.length}件の重複
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* キラキラエフェクト */}
        <motion.div
          className="absolute top-1 right-1"
          animate={{ 
            rotate: [0, 180, 360],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-3 h-3 text-current opacity-60" />
        </motion.div>
      </div>
      
      {/* 上下の境界線強調 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-current opacity-50" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-current opacity-50" />
      
      {/* サイドインジケーター */}
      <motion.div
        className={cn(
          "absolute top-0 bottom-0 w-1",
          side === 'left' ? "left-0 bg-blue-500" : "right-0 bg-green-500"
        )}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      />
    </motion.div>
  )
}

// コンパクト版（狭いスペース用）
export function CompactDragPreview({
  start,
  end,
  side = 'left',
  hourHeight,
  className
}: Omit<SmoothDragPreviewProps, 'hasConflicts' | 'conflictTasks'>) {
  const { timeFormat } = useCalendarSettingsStore()
  const duration = differenceInMinutes(end, start)
  
  const style = useMemo(() => {
    const startMinutes = start.getHours() * 60 + start.getMinutes()
    return {
      top: `${(startMinutes / 60) * hourHeight}px`,
      height: `${Math.max((duration / 60) * hourHeight, 24)}px`,
      left: side === 'left' ? '2px' : '52%',
      right: side === 'left' ? '52%' : '2px',
    }
  }, [start, duration, hourHeight, side])
  
  return (
    <motion.div
      className={cn(
        "absolute pointer-events-none z-50 rounded border-2 border-dashed",
        side === 'left' 
          ? "border-blue-400 bg-blue-500/15" 
          : "border-green-400 bg-green-500/15",
        className
      )}
      
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      
      style={style}
    >
      <div className="h-full flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 px-1 py-0.5 rounded text-xs font-medium">
          {duration}分
        </div>
      </div>
    </motion.div>
  )
}

// マルチサイドプレビュー（分割モード用）
export function SplitDragPreview({
  start,
  end,
  hourHeight,
  activeColumn,
  className
}: {
  start: Date
  end: Date
  hourHeight: number
  activeColumn: 'left' | 'right'
  className?: string
}) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* 左側プレビュー */}
      <SmoothDragPreview
        start={start}
        end={end}
        side="left"
        hourHeight={hourHeight}
        className={cn(
          "transition-opacity duration-200",
          activeColumn === 'left' ? "opacity-100" : "opacity-30"
        )}
      />
      
      {/* 右側プレビュー */}
      <SmoothDragPreview
        start={start}
        end={end}
        side="right"
        hourHeight={hourHeight}
        className={cn(
          "transition-opacity duration-200",
          activeColumn === 'right' ? "opacity-100" : "opacity-30"
        )}
      />
    </div>
  )
}