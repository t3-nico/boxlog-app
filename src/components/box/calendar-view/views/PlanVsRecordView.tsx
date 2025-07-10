'use client'

import { useMemo, useRef, useEffect } from 'react'
import { format, isSameDay, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { ComparisonStats } from '../components/ComparisonStats'
import { DifferenceIndicator } from '../components/DifferenceIndicator'
import { RecordTaskCard } from '../components/RecordTaskCard'
import { PlanTaskCard } from '../components/PlanTaskCard'
import { TimeGrid } from '../TimeGrid'
import type { Task, TaskRecord } from '../types'

interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

interface PlanVsRecordViewProps {
  date: Date
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onRecordClick?: (record: TaskRecord) => void
  onConvertToRecord?: (task: Task) => void
  onCreateTask?: (task: CreateTaskInput) => void
}

export function PlanVsRecordView({ 
  date, 
  tasks,
  onTaskClick, 
  onRecordClick,
  onConvertToRecord,
  onCreateTask 
}: PlanVsRecordViewProps) {
  const { records, getRecordsByDate } = useRecordsStore()
  const scrollSyncRef = useRef<{ left?: HTMLDivElement, right?: HTMLDivElement }>({})
  
  // 該当日のデータ取得
  const dayTasks = useMemo(() => 
    tasks.filter(task => 
      task.planned_start && isSameDay(new Date(task.planned_start), date)
    ), [tasks, date]
  )
  
  const dayRecords = useMemo(() => 
    getRecordsByDate(date), [date, records]
  )
  
  // スクロール同期
  const handleScroll = (side: 'left' | 'right') => (e: React.UIEvent) => {
    const source = e.currentTarget as HTMLDivElement
    const target = side === 'left' ? scrollSyncRef.current.right : scrollSyncRef.current.left
    
    if (target && target.scrollTop !== source.scrollTop) {
      target.scrollTop = source.scrollTop
    }
  }
  
  // 予定を記録に変換
  const handleConvertToRecord = (task: Task) => {
    onConvertToRecord?.(task)
  }
  
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            予定 vs 記録
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(date, 'yyyy年M月d日 (E)', { locale: ja })}
          </div>
        </div>
        
        <ComparisonStats tasks={dayTasks} records={dayRecords} />
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex min-h-0">
        {/* 左側：予定 */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              📅 予定 (Plan)
              <span className="text-sm font-normal text-blue-700 dark:text-blue-300">
                {dayTasks.length}件
              </span>
            </h3>
          </div>
          
          <div 
            ref={(el) => {
              if (el) scrollSyncRef.current.left = el
            }}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
            onScroll={handleScroll('left')}
          >
            {dayTasks.length > 0 ? (
              <div className="p-4 space-y-2">
                {dayTasks.map((task) => (
                  <PlanTaskCard
                    key={task.id}
                    task={task}
                    hasRecord={!!task.record_id}
                    onClick={() => onTaskClick?.(task)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📝</div>
                  <div className="text-sm">この日の予定はありません</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 中央：差異表示 */}
        <DifferenceIndicator 
          tasks={dayTasks} 
          records={dayRecords}
          className="flex-shrink-0"
        />
        
        {/* 右側：記録 */}
        <div className="flex-1 flex flex-col">
          <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
              ✅ 記録 (Record)
              <span className="text-sm font-normal text-green-700 dark:text-green-300">
                {dayRecords.length}件
              </span>
            </h3>
          </div>
          
          <div 
            ref={(el) => {
              if (el) scrollSyncRef.current.right = el
            }}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
            onScroll={handleScroll('right')}
          >
            {dayRecords.length > 0 ? (
              <div className="p-4 space-y-2">
                {dayRecords.map((record) => (
                  <RecordTaskCard
                    key={record.id}
                    record={record}
                    originalTask={dayTasks.find(t => t.id === record.task_id)}
                    onClick={() => onRecordClick?.(record)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-sm">この日の記録はありません</div>
                  <div className="text-xs mt-1">予定を実行して記録を作成しましょう</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 説明パネル（初回表示時） */}
      {dayTasks.length === 0 && dayRecords.length === 0 && (
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 flex items-center justify-center">
          <div className="max-w-md text-center p-6">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              予定 vs 記録 ビュー
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              左側に予定、右側に実際の記録を表示し、計画と実行の差異を可視化します。
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>• 予定と記録の時間差を中央に表示</div>
              <div>• 満足度や集中度も記録可能</div>
              <div>• 予定外の作業も記録できます</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}