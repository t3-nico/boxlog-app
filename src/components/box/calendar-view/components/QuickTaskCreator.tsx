import React, { useState, useRef, useEffect, useMemo } from 'react'
import { differenceInMinutes } from 'date-fns'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'
import { 
  ClockIcon, 
  StarIcon, 
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { 
  StarIcon as StarIconSolid,
  BoltIcon
} from '@heroicons/react/24/solid'
import type { Task } from '../types'

interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

interface QuickTaskCreatorProps {
  initialStart: Date
  initialEnd: Date
  column?: number
  hourHeight?: number
  onSave: (task: CreateTaskInput) => void
  onCancel: () => void
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

export function QuickTaskCreator({ 
  initialStart, 
  initialEnd, 
  column = 0,
  hourHeight = 60,
  onSave, 
  onCancel,
  className
}: QuickTaskCreatorProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { timeFormat } = useCalendarSettingsStore()
  
  useEffect(() => {
    // フォーカスとアニメーション
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (title.trim() && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await onSave({
          title: title.trim(),
          planned_start: initialStart,
          planned_duration: differenceInMinutes(initialEnd, initialStart),
          status: 'pending',
          priority,
          description: description.trim() || undefined
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as any)
    } else if (e.key === 'Tab' && e.shiftKey && !showAdvanced) {
      e.preventDefault()
      setShowAdvanced(true)
    }
  }
  
  const style = useMemo(() => {
    const startMinutes = initialStart.getHours() * 60 + initialStart.getMinutes()
    const duration = differenceInMinutes(initialEnd, initialStart)
    
    return {
      top: `${(startMinutes / 60) * hourHeight}px`,
      height: `${Math.max((duration / 60) * hourHeight, 140)}px`,
      minHeight: '140px'
    }
  }, [initialStart, initialEnd, hourHeight])
  
  const duration = differenceInMinutes(initialEnd, initialStart)
  
  // 優先度のアイコンと色を取得
  const getPriorityConfig = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return {
          icon: BoltIcon,
          color: 'text-red-500 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-950/30',
          border: 'border-red-200 dark:border-red-800',
          label: '緊急'
        }
      case 'medium':
        return {
          icon: StarIconSolid,
          color: 'text-amber-500 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-200 dark:border-amber-800',
          label: '標準'
        }
      case 'low':
        return {
          icon: StarIcon,
          color: 'text-gray-500 dark:text-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-950/30',
          border: 'border-gray-200 dark:border-gray-800',
          label: '低'
        }
    }
  }
  
  const currentPriorityConfig = getPriorityConfig(priority)
  
  return (
    <div
      className={cn(
        "absolute inset-x-2 z-50 animate-in slide-in-from-top-4 fade-in duration-200",
        className
      )}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          "h-full overflow-hidden transition-all duration-300",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
          "border border-gray-200/50 dark:border-gray-700/50",
          "rounded-xl shadow-2xl shadow-gray-900/10 dark:shadow-black/20",
          "ring-1 ring-gray-900/5 dark:ring-white/10"
        )}
      >
        <div className="h-full flex flex-col">
          {/* モダンヘッダー */}
          <div className={cn(
            "px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50",
            "bg-gradient-to-r from-blue-50/50 to-indigo-50/50",
            "dark:from-blue-950/30 dark:to-indigo-950/30"
          )}>
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatTime(initialStart, timeFormat)} - {formatTime(initialEnd, timeFormat)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {duration}分の新しいタスク
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          </div>
          
          {/* メインコンテンツ */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* タイトル入力 - モダンデザイン */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="何に取り組みますか？"
                  className={cn(
                    "w-full px-4 py-3 text-base font-medium",
                    "bg-gray-50/50 dark:bg-gray-800/50 border-0",
                    "rounded-xl placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    "text-gray-900 dark:text-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
                    "focus:bg-white dark:focus:bg-gray-800",
                    "transition-all duration-200"
                  )}
                />
                {title && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
            </div>
            
            {/* 優先度選択 - ピル型ボタン */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <StarIcon className="w-4 h-4" />
                優先度
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => {
                  const config = getPriorityConfig(p)
                  const Icon = config.icon
                  const isSelected = priority === p
                  
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl",
                        "border transition-all duration-200",
                        "text-sm font-medium",
                        isSelected ? [
                          config.bg,
                          config.border,
                          config.color,
                          "shadow-sm ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900",
                          priority === 'high' ? 'ring-red-500/20' :
                          priority === 'medium' ? 'ring-amber-500/20' : 'ring-gray-500/20'
                        ] : [
                          "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                          "text-gray-600 dark:text-gray-400",
                          "hover:bg-gray-100 dark:hover:bg-gray-700"
                        ]
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* 高度な設定トグル */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400",
                  "hover:text-gray-900 dark:hover:text-white transition-colors"
                )}
              >
                <DocumentTextIcon className="w-4 h-4" />
                詳細設定
                <div className={cn(
                  "transform transition-transform duration-200",
                  showAdvanced ? "rotate-90" : "rotate-0"
                )}>
                  →
                </div>
              </button>
            </div>
            
            {/* 説明入力（アニメーション付き） */}
            {(showAdvanced || duration > 60) && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-200 space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  メモ・詳細
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="詳細情報、ゴール、メモなど..."
                  rows={3}
                  className={cn(
                    "w-full px-4 py-3 text-sm",
                    "bg-gray-50/50 dark:bg-gray-800/50 border-0",
                    "rounded-xl placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    "text-gray-900 dark:text-white resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
                    "focus:bg-white dark:focus:bg-gray-800",
                    "transition-all duration-200"
                  )}
                />
              </div>
            )}
          </div>
          
          {/* モダンフッター */}
          <div className={cn(
            "px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50",
            "bg-gray-50/30 dark:bg-gray-800/30 backdrop-blur-sm"
          )}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd>
                <span>で保存</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800",
                    "border border-gray-300 dark:border-gray-600 rounded-lg",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    "focus:outline-none focus:ring-2 focus:ring-gray-500/20",
                    "transition-all duration-200 hover:scale-105 active:scale-95"
                  )}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className={cn(
                    "px-6 py-2 text-sm font-medium text-white rounded-lg",
                    "bg-gradient-to-r from-blue-600 to-indigo-600",
                    "hover:from-blue-700 hover:to-indigo-700",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200 hover:scale-105 active:scale-95",
                    "shadow-lg shadow-blue-500/25",
                    isSubmitting ? "animate-pulse" : ""
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      作成中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4" />
                      作成
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// コンパクト版（狭いスペース用）
interface CompactQuickTaskCreatorProps extends QuickTaskCreatorProps {
  compact?: boolean
}

export function CompactQuickTaskCreator({ 
  compact = false,
  ...props 
}: CompactQuickTaskCreatorProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { timeFormat } = useCalendarSettingsStore()
  
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (title.trim()) {
      props.onSave({
        title: title.trim(),
        planned_start: props.initialStart,
        planned_duration: differenceInMinutes(props.initialEnd, props.initialStart),
        status: 'pending',
        priority: 'medium'
      })
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onCancel()
    }
  }
  
  const style = useMemo(() => {
    const startMinutes = props.initialStart.getHours() * 60 + props.initialStart.getMinutes()
    const duration = differenceInMinutes(props.initialEnd, props.initialStart)
    
    return {
      top: `${(startMinutes / 60) * (props.hourHeight || 60)}px`,
      height: `${Math.max((duration / 60) * (props.hourHeight || 60), 60)}px`,
      minHeight: '60px'
    }
  }, [props.initialStart, props.initialEnd, props.hourHeight])
  
  return (
    <div
      className={cn(
        "absolute inset-x-2 z-50",
        props.className
      )}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <form
        onSubmit={handleSubmit}
        className="h-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 p-2"
      >
        <div className="h-full flex flex-col justify-center space-y-2">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {formatTime(props.initialStart, timeFormat)} - {formatTime(props.initialEnd, timeFormat)}
          </div>
          
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスク名..."
              className={cn(
                "flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600",
                "rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                "focus:outline-none focus:ring-1 focus:ring-blue-500"
              )}
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className={cn(
                "px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded",
                "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              作成
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}