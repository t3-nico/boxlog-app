import React, { useMemo } from 'react'
import { differenceInMinutes } from 'date-fns'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'
import { Clock, Sparkles } from 'lucide-react'

interface DragPreviewProps {
  start: Date
  end: Date
  column?: number
  hourHeight: number
  className?: string
}

// 時間をフォーマット（24h/12h対応）
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

export function DragPreview({ 
  start, 
  end, 
  column = 0, 
  hourHeight,
  className 
}: DragPreviewProps) {
  const { timeFormat } = useCalendarSettingsStore()
  
  const style = useMemo(() => {
    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    const duration = endMinutes - startMinutes
    
    return {
      top: `${(startMinutes / 60) * hourHeight}px`,
      height: `${Math.max((duration / 60) * hourHeight, 40)}px`,
      minHeight: '40px'
    }
  }, [start, end, hourHeight])
  
  const duration = differenceInMinutes(end, start)
  
  return (
    <div
      className={cn(
        "absolute inset-x-2 rounded-xl z-50 pointer-events-none",
        "animate-in fade-in duration-150",
        "transform-gpu", // GPU加速
        className
      )}
      style={style}
    >
      {/* メインプレビューカード */}
      <div className={cn(
        "h-full relative overflow-hidden",
        "bg-gradient-to-br from-blue-500/90 to-indigo-600/90",
        "dark:from-blue-600/90 dark:to-indigo-700/90",
        "backdrop-blur-xl border-2 border-blue-400/60 dark:border-blue-500/60",
        "rounded-xl shadow-2xl shadow-blue-500/25 dark:shadow-blue-900/40",
        "ring-1 ring-white/20 dark:ring-white/10"
      )}>
        {/* アニメーション背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                        -skew-x-12 animate-pulse opacity-30" />
        
        {/* コンテンツ */}
        <div className="relative h-full flex flex-col items-center justify-center text-center p-3">
          {/* アイコンとタイトル */}
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-lg bg-white/20 dark:bg-white/10">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          </div>
          
          {/* 時間表示 */}
          <div className="text-white font-medium text-sm leading-tight">
            <div className="flex items-center gap-1.5">
              <span>{formatTime(start, timeFormat)}</span>
              <div className="w-3 h-px bg-white/60" />
              <span>{formatTime(end, timeFormat)}</span>
            </div>
          </div>
          
          {/* 時間長 */}
          <div className="text-white/80 text-xs mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}分
          </div>
          
          {/* ドラッグヒント */}
          {duration >= 30 && (
            <div className="text-white/60 text-xs mt-2 animate-bounce">
              離してタスクを作成
            </div>
          )}
        </div>
        
        {/* グロー効果 */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-transparent blur-sm" />
      </div>
    </div>
  )
}

// より高度なプレビュー表示（重複チェック付き）
interface AdvancedDragPreviewProps extends DragPreviewProps {
  existingTasks?: Array<{ start: Date; end: Date }>
  showConflicts?: boolean
}

export function AdvancedDragPreview({ 
  existingTasks = [],
  showConflicts = true,
  ...props 
}: AdvancedDragPreviewProps) {
  const { timeFormat } = useCalendarSettingsStore()
  
  const conflictInfo = useMemo(() => {
    if (!showConflicts || !existingTasks.length) return { hasConflict: false, conflictCount: 0 }
    
    const conflicts = existingTasks.filter(task => {
      return (
        (props.start >= task.start && props.start < task.end) ||
        (props.end > task.start && props.end <= task.end) ||
        (props.start <= task.start && props.end >= task.end)
      )
    })
    
    return {
      hasConflict: conflicts.length > 0,
      conflictCount: conflicts.length,
      conflicts
    }
  }, [existingTasks, props.start, props.end, showConflicts])
  
  const style = useMemo(() => {
    const startMinutes = props.start.getHours() * 60 + props.start.getMinutes()
    const endMinutes = props.end.getHours() * 60 + props.end.getMinutes()
    const duration = endMinutes - startMinutes
    
    return {
      top: `${(startMinutes / 60) * props.hourHeight}px`,
      height: `${Math.max((duration / 60) * props.hourHeight, 40)}px`,
      minHeight: '40px'
    }
  }, [props.start, props.end, props.hourHeight])
  
  const duration = differenceInMinutes(props.end, props.start)
  
  return (
    <div
      className={cn(
        "absolute inset-x-2 rounded-xl z-50 pointer-events-none",
        "animate-in fade-in duration-150 transform-gpu",
        props.className
      )}
      style={style}
    >
      <div className={cn(
        "h-full relative overflow-hidden rounded-xl shadow-2xl ring-1",
        conflictInfo.hasConflict ? [
          // 重複時のスタイル
          "bg-gradient-to-br from-red-500/90 to-orange-600/90",
          "dark:from-red-600/90 dark:to-orange-700/90",
          "backdrop-blur-xl border-2 border-red-400/60 dark:border-red-500/60",
          "shadow-red-500/25 dark:shadow-red-900/40",
          "ring-white/20 dark:ring-white/10"
        ] : [
          // 通常時のスタイル
          "bg-gradient-to-br from-blue-500/90 to-indigo-600/90",
          "dark:from-blue-600/90 dark:to-indigo-700/90",
          "backdrop-blur-xl border-2 border-blue-400/60 dark:border-blue-500/60",
          "shadow-blue-500/25 dark:shadow-blue-900/40",
          "ring-white/20 dark:ring-white/10"
        ]
      )}>
        {/* アニメーション背景 */}
        <div className={cn(
          "absolute inset-0 -skew-x-12 opacity-30",
          conflictInfo.hasConflict 
            ? "bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
            : "bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"
        )} />
        
        {/* コンテンツ */}
        <div className="relative h-full flex flex-col items-center justify-center text-center p-3">
          {/* ステータスアイコン */}
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-lg bg-white/20 dark:bg-white/10">
              <Clock className="w-4 h-4 text-white" />
            </div>
            {conflictInfo.hasConflict ? (
              <div className="p-1 rounded-lg bg-white/20 dark:bg-white/10">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            )}
          </div>
          
          {/* 時間表示 */}
          <div className="text-white font-medium text-sm leading-tight">
            <div className="flex items-center gap-1.5">
              <span>{formatTime(props.start, timeFormat)}</span>
              <div className="w-3 h-px bg-white/60" />
              <span>{formatTime(props.end, timeFormat)}</span>
            </div>
          </div>
          
          {/* 時間長とステータス */}
          <div className="text-white/80 text-xs mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}分
          </div>
          
          {/* 重複警告またはヒント */}
          {conflictInfo.hasConflict ? (
            <div className="text-white/90 text-xs mt-2 flex items-center gap-1 animate-pulse">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {conflictInfo.conflictCount}件の重複
            </div>
          ) : duration >= 30 ? (
            <div className="text-white/60 text-xs mt-2 animate-bounce">
              離してタスクを作成
            </div>
          ) : null}
        </div>
        
        {/* グロー効果 */}
        <div className={cn(
          "absolute inset-0 rounded-xl blur-sm",
          conflictInfo.hasConflict 
            ? "bg-gradient-to-br from-red-400/20 to-transparent"
            : "bg-gradient-to-br from-blue-400/20 to-transparent"
        )} />
      </div>
    </div>
  )
}

// モバイル用の簡易プレビュー
export function MobileDragPreview(props: DragPreviewProps) {
  return (
    <DragPreview
      {...props}
      className={cn(
        props.className,
        "text-xs", // モバイルでは文字サイズを小さく
        "min-h-[30px]" // 最小高さを少し大きく
      )}
    />
  )
}