'use client'

import React, { useState, useEffect, useRef } from 'react'
import { format, differenceInMinutes } from 'date-fns'
import { 
  X, 
  Check, 
  ClipboardList,
  Clock,
  Star,
  Eye,
  Zap
} from 'lucide-react'
import { HOUR_HEIGHT } from '../constants/grid-constants'

interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

interface CreateRecordInput {
  title: string
  actual_start: Date
  actual_end: Date
  actual_duration: number
  satisfaction?: number
  focus_level?: number
  energy_level?: number
  memo?: string
  interruptions?: number
}

interface SplitQuickCreatorProps {
  type: 'task' | 'record'
  side: 'left' | 'right'
  initialStart: Date
  initialEnd: Date
  onSave: (data: CreateTaskInput | CreateRecordInput) => void
  onCancel: () => void
}

export function SplitQuickCreator({
  type,
  side,
  initialStart,
  initialEnd,
  onSave,
  onCancel
}: SplitQuickCreatorProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [description, setDescription] = useState('')
  const [satisfaction, setSatisfaction] = useState<number>(3)
  const [focusLevel, setFocusLevel] = useState<number>(3)
  const [energyLevel, setEnergyLevel] = useState<number>(3)
  const [memo, setMemo] = useState('')
  const [interruptions, setInterruptions] = useState<number>(0)
  
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    // フォーカスを当てる
    titleInputRef.current?.focus()
  }, [])
  
  const duration = differenceInMinutes(initialEnd, initialStart)
  const startMinutes = initialStart.getHours() * 60 + initialStart.getMinutes()
  const top = (startMinutes / 60) * HOUR_HEIGHT
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 80) // 最小高さ80px
  
  const handleSave = () => {
    if (!title.trim()) return
    
    if (type === 'task') {
      const taskData: CreateTaskInput = {
        title: title.trim(),
        planned_start: initialStart,
        planned_duration: duration,
        status: 'pending',
        priority,
        description: description.trim() || undefined,
        tags: []
      }
      onSave(taskData)
    } else {
      const recordData: CreateRecordInput = {
        title: title.trim(),
        actual_start: initialStart,
        actual_end: initialEnd,
        actual_duration: duration,
        satisfaction,
        focus_level: focusLevel,
        energy_level: energyLevel,
        memo: memo.trim() || undefined,
        interruptions
      }
      onSave(recordData)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }
  
  // 左右の位置計算
  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    height: `${height}px`,
    left: side === 'left' ? '4px' : '50%',
    right: side === 'right' ? '4px' : '50%',
    zIndex: 50,
    minHeight: '80px'
  }
  
  const isTask = type === 'task'
  const themeColors = isTask 
    ? {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-300 dark:border-blue-600',
        icon: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
      }
    : {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-300 dark:border-green-600', 
        icon: 'text-green-600 dark:text-green-400',
        button: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
      }
  
  return (
    <div 
      className={`
        ${themeColors.bg} ${themeColors.border} 
        border-2 rounded-lg shadow-lg backdrop-blur-sm
        flex flex-col p-3 gap-2
      `}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {isTask ? (
            <ClipboardList className={`w-4 h-4 ${themeColors.icon}`} />
          ) : (
            <Check className={`w-4 h-4 ${themeColors.icon}`} />
          )}
          <span className={`text-sm font-medium ${themeColors.icon}`}>
            {isTask ? '予定作成' : '記録作成'}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>
            {format(initialStart, 'HH:mm')} - {format(initialEnd, 'HH:mm')}
          </span>
          <span>({duration}分)</span>
        </div>
      </div>
      
      {/* タイトル入力 */}
      <input
        ref={titleInputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={isTask ? '予定のタイトル...' : '記録のタイトル...'}
        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      />
      
      {/* タスク用フィールド */}
      {isTask && (
        <div className="space-y-2">
          {/* 優先度 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-gray-400 min-w-[40px]">
              優先度:
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          
          {/* 説明 */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="説明（任意）..."
            rows={2}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>
      )}
      
      {/* 記録用フィールド */}
      {!isTask && (
        <div className="space-y-2">
          {/* 評価指標 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* 満足度 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">満足度</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSatisfaction(num)}
                    className={`w-5 h-5 rounded-full border text-xs ${
                      satisfaction >= num 
                        ? 'bg-yellow-400 border-yellow-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 集中度 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">集中度</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFocusLevel(num)}
                    className={`w-5 h-5 rounded-full border text-xs ${
                      focusLevel >= num 
                        ? 'bg-blue-400 border-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* エネルギー・中断回数 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* エネルギー */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-400">エネルギー</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setEnergyLevel(num)}
                    className={`w-5 h-5 rounded-full border text-xs ${
                      energyLevel >= num 
                        ? 'bg-orange-400 border-orange-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 中断回数 */}
            <div className="space-y-1">
              <label className="text-gray-600 dark:text-gray-400">中断回数</label>
              <input
                type="number"
                min="0"
                value={interruptions}
                onChange={(e) => setInterruptions(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
          
          {/* メモ */}
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモ（任意）..."
            rows={2}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
          />
        </div>
      )}
      
      {/* ボタン */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className={`
            flex-1 px-3 py-1 text-sm font-medium text-white rounded
            ${themeColors.button}
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-offset-1
          `}
        >
          保存
        </button>
        
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}