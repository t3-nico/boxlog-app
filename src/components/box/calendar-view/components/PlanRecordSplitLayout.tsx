'use client'

import { useMemo, useRef, ReactNode } from 'react'
import { isSameDay } from 'date-fns'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { ComparisonStats } from './ComparisonStats'
import { DifferenceIndicator } from './DifferenceIndicator'
import type { Task, TaskRecord } from '../types'

interface PlanRecordSplitLayoutProps {
  dates: Date[] // 表示する日付の配列
  tasks: Task[]
  planContent: ReactNode // 左側（予定）のコンテンツ
  onTaskClick?: (task: Task) => void
  onRecordClick?: (record: TaskRecord) => void
  onConvertToRecord?: (task: Task) => void
  showStats?: boolean // 統計表示の有無
  showDifference?: boolean // 差異表示の有無
  className?: string
}

export function PlanRecordSplitLayout({
  dates,
  tasks,
  planContent,
  onTaskClick,
  onRecordClick,
  onConvertToRecord,
  showStats = true,
  showDifference = true,
  className = ''
}: PlanRecordSplitLayoutProps) {
  const { records, getRecordsByDate, createRecordFromTask } = useRecordsStore()
  const scrollSyncRef = useRef<{ left?: HTMLDivElement, right?: HTMLDivElement }>({})
  
  // 該当期間のデータ取得
  const periodTasks = useMemo(() => 
    tasks.filter(task => 
      task.planned_start && dates.some(date => 
        isSameDay(new Date(task.planned_start!), date)
      )
    ), [tasks, dates]
  )
  
  const periodRecords = useMemo(() => 
    records.filter(record => 
      dates.some(date => isSameDay(new Date(record.actual_start), date))
    ), [records, dates]
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
  const handleConvertToRecord = async (task: Task) => {
    try {
      await createRecordFromTask(task)
      onConvertToRecord?.(task)
    } catch (error) {
      console.error('Failed to convert task to record:', error)
    }
  }
  
  // 記録のレンダリング（TimeGrid形式に変換）
  const renderRecords = () => {
    return (
      <div className="p-4 space-y-2">
        {periodRecords.map((record) => (
          <div
            key={record.id}
            className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => onRecordClick?.(record)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-green-900 dark:text-green-100">
                {record.title}
              </h4>
              {record.satisfaction && (
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={i < record.satisfaction! ? 'text-yellow-400' : 'text-gray-300'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-sm text-green-700 dark:text-green-300">
              {new Date(record.actual_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(record.actual_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
              ({record.actual_duration}分)
            </div>
            
            <div className="flex items-center gap-3 mt-2 text-xs">
              {record.focus_level && (
                <span className="text-purple-600 dark:text-purple-400">
                  集中度: {record.focus_level}
                </span>
              )}
              {record.energy_level && (
                <span className="text-blue-600 dark:text-blue-400">
                  エネルギー: {record.energy_level}
                </span>
              )}
              {record.interruptions !== undefined && record.interruptions > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  中断: {record.interruptions}回
                </span>
              )}
              {!record.task_id && (
                <span className="text-orange-600 dark:text-orange-400">
                  予定外
                </span>
              )}
            </div>
          </div>
        ))}
        
        {periodRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-sm">記録がありません</div>
            <div className="text-xs mt-1">タスクを実行して記録を作成しましょう</div>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* 統計ヘッダー */}
      {showStats && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <ComparisonStats tasks={periodTasks} records={periodRecords} />
        </div>
      )}
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex min-h-0">
        {/* 左側：予定 */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              📅 予定 (Plan)
              <span className="text-xs font-normal text-blue-700 dark:text-blue-300">
                {periodTasks.length}件
              </span>
            </h3>
          </div>
          
          <div 
            ref={(el) => {
              if (el) scrollSyncRef.current.left = el
            }}
            className="flex-1 overflow-hidden"
            onScroll={handleScroll('left')}
          >
            {planContent}
          </div>
        </div>
        
        {/* 中央：差異表示 */}
        {showDifference && (
          <DifferenceIndicator 
            tasks={periodTasks} 
            records={periodRecords}
            className="flex-shrink-0"
          />
        )}
        
        {/* 右側：記録 */}
        <div className="flex-1 flex flex-col">
          <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
              ✅ 記録 (Record)
              <span className="text-xs font-normal text-green-700 dark:text-green-300">
                {periodRecords.length}件
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
            {renderRecords()}
          </div>
        </div>
      </div>
    </div>
  )
}