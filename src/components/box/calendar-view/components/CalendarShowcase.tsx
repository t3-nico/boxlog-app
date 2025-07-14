'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { addDays, startOfWeek } from 'date-fns'
import { RefinedCalendarIntegration } from './RefinedCalendarIntegration'
import { cn } from '@/lib/utils'
import { 
  Play,
  Pause,
  Eye,
  Settings
} from 'lucide-react'

// デモ用のサンプルタスク
const generateSampleTasks = () => {
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
  
  return [
    // 予定タスク
    {
      id: '1',
      title: 'チーム会議',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
      status: 'scheduled' as const,
      priority: 'high' as const,
      description: '週次チーム会議 - プロジェクト進捗確認',
      isPlan: true,
      color: '#3b82f6'
    },
    {
      id: '2',
      title: 'コードレビュー',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      status: 'in_progress' as const,
      priority: 'medium' as const,
      description: 'プルリクエスト #123 のレビュー',
      isPlan: true,
      color: '#f59e0b'
    },
    {
      id: '3',
      title: 'ランチミーティング',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
      status: 'completed' as const,
      priority: 'low' as const,
      description: 'クライアントとの非公式会議',
      isPlan: true,
      color: '#10b981'
    },
    
    // 記録タスク
    {
      id: '4',
      title: 'チーム会議（実績）',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 15),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 45),
      status: 'completed' as const,
      priority: 'high' as const,
      description: '実際の会議時間',
      isRecord: true,
      satisfaction: 4,
      focusLevel: 5,
      energyLevel: 4,
      color: '#10b981'
    },
    {
      id: '5',
      title: 'ドキュメント作成',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30),
      status: 'completed' as const,
      priority: 'medium' as const,
      description: 'API仕様書の更新',
      isRecord: true,
      satisfaction: 3,
      focusLevel: 4,
      energyLevel: 3,
      color: '#10b981'
    },
    
    // 明日のタスク
    {
      id: '6',
      title: 'プロジェクト企画',
      startTime: addDays(today, 1),
      endTime: new Date(addDays(today, 1).getTime() + 2 * 60 * 60 * 1000),
      status: 'scheduled' as const,
      priority: 'high' as const,
      description: '新機能の企画検討',
      isPlan: true,
      color: '#8b5cf6'
    }
  ]
}

interface CalendarShowcaseProps {
  className?: string
}

export function CalendarShowcase({ className }: CalendarShowcaseProps) {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [splitMode, setSplitMode] = useState(false)
  const [showDemo, setShowDemo] = useState(true)
  const [tasks, setTasks] = useState(generateSampleTasks())
  
  // 表示する日付の計算
  const dates = useMemo(() => {
    const today = new Date()
    
    switch (view) {
      case 'day':
        return [today]
      case 'week':
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
        return Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))
      case 'month':
        // 簡単な月表示（4週間）
        const startOfMonth = startOfWeek(today, { weekStartsOn: 1 })
        return Array.from({ length: 28 }, (_, i) => addDays(startOfMonth, i))
      default:
        return [today]
    }
  }, [view])
  
  // タスク作成ハンドラー
  const handleTaskCreate = (taskData: any) => {
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      startTime: taskData.planned_start,
      endTime: new Date(taskData.planned_start.getTime() + taskData.planned_duration * 60000),
      status: taskData.status,
      priority: taskData.priority,
      description: taskData.description,
      isPlan: true,
      color: '#3b82f6'
    }
    
    setTasks(prev => [...prev, newTask])
  }
  
  // タスク更新ハンドラー
  const handleTaskUpdate = (id: string, updates: any) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ))
  }
  
  // タスク削除ハンドラー
  const handleTaskDelete = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }
  
  // デモ操作
  const runDemo = () => {
    setShowDemo(true)
    
    // デモシーケンス
    setTimeout(() => setSplitMode(true), 1000)
    setTimeout(() => setView('day'), 2000)
    setTimeout(() => setView('week'), 3000)
    setTimeout(() => setSplitMode(false), 4000)
    setTimeout(() => setShowDemo(false), 5000)
  }
  
  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* コントロールパネル */}
      <motion.div
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              洗練されたカレンダーUI/UX
            </h2>
            
            {/* ビュー切り替え */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['day', 'week', 'month'] as const).map((v) => (
                <motion.button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                    view === v
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {v === 'day' ? '日' : v === 'week' ? '週' : '月'}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 分割モード切り替え */}
            <motion.button
              onClick={() => setSplitMode(!splitMode)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                splitMode
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-4 h-4" />
              分割モード
            </motion.button>
            
            {/* デモ実行ボタン */}
            <motion.button
              onClick={runDemo}
              disabled={showDemo}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
                showDemo
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
              whileHover={!showDemo ? { scale: 1.05 } : undefined}
              whileTap={!showDemo ? { scale: 0.95 } : undefined}
            >
              {showDemo ? (
                <>
                  <Pause className="w-4 h-4" />
                  デモ実行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  デモを実行
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      {/* カレンダー本体 */}
      <motion.div
        className="flex-1 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <RefinedCalendarIntegration
          dates={dates}
          tasks={tasks}
          view={view}
          splitMode={splitMode}
          onTaskCreate={handleTaskCreate}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          className="h-full"
        />
      </motion.div>
      
      {/* 機能説明パネル */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-gray-200 dark:border-gray-700 p-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>ドラッグ&ドロップでタスク作成</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>リアルタイムアニメーション</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>マイクロインタラクション</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>スマートな時間表示</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ✨ Google Calendar & Togglを超える洗練された体験
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// 使用例を示すサンプルページ
export function CalendarShowcasePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            BoxLog カレンダー UI/UX 洗練化
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Google CalendarやTogglを超える美しいインタラクションを体験してください
          </p>
        </motion.div>
        
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          style={{ height: 'calc(100vh - 200px)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CalendarShowcase />
        </motion.div>
      </div>
    </div>
  )
}