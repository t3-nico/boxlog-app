'use client'

import { useEffect, useState } from 'react'
import { background, border, text } from '@/config/theme/colors'
import { space } from '@/config/theme/spacing'
import { elevation } from '@/config/theme/elevation'
import { cn } from '@/lib/utils'
import { Pause, Play, CheckCircle, FileText, Calendar, Clock, StickyNote } from 'lucide-react'

export function TaskFooter() {
  // TODO: 実際のタスクデータはstoreから取得
  const [hasActiveTask, setHasActiveTask] = useState(true) // デモ用
  const [isPaused, setIsPaused] = useState(false) // 一時停止状態
  const [elapsedSeconds, setElapsedSeconds] = useState(923) // 15:23 = 923秒
  const totalSeconds = 1500 // 25:00 = 1500秒

  // タグの色パターン
  const tagColors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  ]

  // タグの色を取得
  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length]
  }

  // 秒数を MM:SS 形式に変換
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // プログレスバーのパーセンテージ計算
  const progressPercentage = (elapsedSeconds / totalSeconds) * 100
  
  // 残り時間の計算
  const remainingSeconds = totalSeconds - elapsedSeconds
  
  // プログレスバーの色とアニメーション
  const getProgressBarStyle = () => {
    if (remainingSeconds <= 300) { // 5分以下で黄色 + パルス
      return 'h-full bg-yellow-500 transition-all duration-1000 ease-linear animate-pulse'
    }
    return 'h-full bg-blue-500 transition-all duration-1000 ease-linear'
  }

  // タイマー処理
  useEffect(() => {
    if (!isPaused && elapsedSeconds < totalSeconds) {
      const interval = setInterval(() => {
        setElapsedSeconds(prev => {
          if (prev >= totalSeconds) {
            setIsPaused(true)
            return totalSeconds
          }
          return prev + 1
        })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [isPaused, elapsedSeconds, totalSeconds])

  // タスクがない場合は非表示
  if (!hasActiveTask) return null

  return (
    <div
      className={cn(
        'h-16',  // 64px (16 * 4 = 64)
        'w-full',
        background.base,
        'backdrop-blur-md',
        border.DEFAULT,
        'border-t',
        elevation.lg,  // エレベーション追加
        'transition-transform duration-300 ease-out'
      )}
    >
      <div className={cn(
        'h-full',
        'flex flex-col justify-center',
        'px-4 py-2'  // horizontal: 16px, vertical: 8px
      )}>
        {/* メインコンテンツ - 3カラムグリッド */}
        <div className="grid grid-cols-3 items-center gap-4">
          {/* 左側: タスク情報 */}
          <div className="min-w-0 self-center">
            {/* タスク名 */}
            <div className="mb-1">
              <span className={cn(text.primary, 'text-sm font-medium truncate')}>
                タスク名
              </span>
            </div>
            
            {/* タグ表示（最大3つ） */}
            <div className="flex items-center gap-1">
              <span className={cn('text-xs px-1.5 py-0.5 rounded', getTagColor(0))}>
                🎯 tag1
              </span>
              <span className={cn('text-xs px-1.5 py-0.5 rounded', getTagColor(1))}>
                💼 tag2
              </span>
              <span className={cn('text-xs px-1.5 py-0.5 rounded', getTagColor(2))}>
                🚀 tag3
              </span>
              <span className={cn(text.muted, 'text-xs ml-1')}>
                +2
              </span>
            </div>
          </div>

          {/* 中央: プログレスバーと時間表示 */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              {/* 予定時間 */}
              <div className={cn(text.muted, 'text-sm text-center mb-1 flex items-center justify-center gap-1')}>
                <Clock className="w-3 h-3" />
                <span>10:00 - 12:00</span>
              </div>
              
              {/* プログレスバーと時間 */}
              <div className="flex items-center gap-3">
                {/* 現在時間 */}
                <span className={cn(text.secondary, 'text-base font-mono')}>
                  {formatTime(elapsedSeconds)}
                </span>
                
                {/* プログレスバー */}
                <div className="flex-1">
                  <div className="h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className={getProgressBarStyle()}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* 終了時間 */}
                <span className={cn(text.secondary, 'text-base font-mono')}>
                  {formatTime(totalSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* 右側: コントロールボタン（4つ横並び） */}
          <div className="flex items-center gap-2 justify-end">
            {/* ステータス変更（再生/一時停止） */}
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title={isPaused ? "再開" : "一時停止"}
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>
            
            {/* 完了（Logへ変換） */}
            <button 
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="タスクを完了してログに記録"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            
            {/* クイックメモ */}
            <button 
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="クイックメモ"
            >
              <StickyNote className="w-4 h-4" />
            </button>
            
            {/* カレンダーページへ */}
            <button 
              onClick={() => window.location.href = '/calendar/day'}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="カレンダーを開く"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}