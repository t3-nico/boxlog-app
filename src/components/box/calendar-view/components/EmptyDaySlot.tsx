'use client'

import React, { useMemo } from 'react'
import { format, isToday, isTomorrow, isYesterday, isPast } from 'date-fns'
import { ja } from 'date-fns/locale'
import { 
  PlusIcon, 
  CalendarDaysIcon, 
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import { cn } from '../utils/view-helpers'

interface EmptyDaySlotProps {
  date: Date
  onEmptySlotClick?: () => void
}

export function EmptyDaySlot({ date, onEmptySlotClick }: EmptyDaySlotProps) {
  // 日付の状態を判定
  const dateStatus = useMemo(() => {
    const today = isToday(date)
    const tomorrow = isTomorrow(date)
    const yesterday = isYesterday(date)
    const past = isPast(date) && !today

    return {
      isToday: today,
      isTomorrow: tomorrow,
      isYesterday: yesterday,
      isPast: past,
      isFuture: !past && !today
    }
  }, [date])

  // メッセージとアイコンを決定
  const content = useMemo(() => {
    if (dateStatus.isToday) {
      return {
        icon: SunIcon,
        title: '今日は予定がありません',
        message: 'リラックスした一日を過ごすか、新しいタスクを追加してみましょう',
        actionText: 'タスクを追加',
        color: 'blue',
        bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10'
      }
    } else if (dateStatus.isTomorrow) {
      return {
        icon: CalendarDaysIcon,
        title: '明日の予定はありません',
        message: '明日の計画を立てて、充実した一日にしましょう',
        actionText: '明日の予定を追加',
        color: 'green',
        bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10'
      }
    } else if (dateStatus.isYesterday) {
      return {
        icon: CheckCircleIcon,
        title: '昨日はお疲れ様でした',
        message: 'タスクがない日も、充実した一日だったはずです',
        actionText: null, // 過去の日は追加不可
        color: 'gray',
        bgGradient: 'from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10'
      }
    } else if (dateStatus.isPast) {
      return {
        icon: MoonIcon,
        title: format(date, 'M月d日は予定がありませんでした', { locale: ja }),
        message: '',
        actionText: null, // 過去の日は追加不可
        color: 'gray',
        bgGradient: 'from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10'
      }
    } else {
      return {
        icon: CloudIcon,
        title: `${format(date, 'M月d日', { locale: ja })}の予定はありません`,
        message: '新しい予定を追加して、計画的な日々を送りましょう',
        actionText: '予定を追加',
        color: 'purple',
        bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10'
      }
    }
  }, [date, dateStatus])

  const handleClick = () => {
    if (content.actionText && !dateStatus.isPast) {
      onEmptySlotClick?.()
    }
  }

  const IconComponent = content.icon

  return (
    <div className={cn(
      "relative p-6 rounded-lg border-2 border-dashed transition-all duration-300",
      "border-gray-200 dark:border-gray-700",
      !dateStatus.isPast && content.actionText && "cursor-pointer hover:border-gray-300 dark:hover:border-gray-600",
      content.bgGradient
    )}>
      {/* 背景のグラデーション */}
      <div className={cn(
        "absolute inset-0 rounded-lg opacity-50",
        `bg-gradient-to-br ${content.bgGradient}`
      )} />
      
      {/* コンテンツ */}
      <div className="relative text-center">
        {/* アイコン */}
        <div className="flex justify-center mb-4">
          <div className={cn(
            "p-3 rounded-full",
            content.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
            content.color === 'green' && "bg-green-100 dark:bg-green-900/30",
            content.color === 'gray' && "bg-gray-100 dark:bg-gray-800",
            content.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30"
          )}>
            <IconComponent className={cn(
              "w-8 h-8",
              content.color === 'blue' && "text-blue-600 dark:text-blue-400",
              content.color === 'green' && "text-green-600 dark:text-green-400",
              content.color === 'gray' && "text-gray-500 dark:text-gray-400",
              content.color === 'purple' && "text-purple-600 dark:text-purple-400"
            )} />
          </div>
        </div>

        {/* タイトル */}
        <h3 className={cn(
          "text-lg font-semibold mb-2",
          content.color === 'blue' && "text-blue-900 dark:text-blue-100",
          content.color === 'green' && "text-green-900 dark:text-green-100",
          content.color === 'gray' && "text-gray-700 dark:text-gray-300",
          content.color === 'purple' && "text-purple-900 dark:text-purple-100"
        )}>
          {content.title}
        </h3>

        {/* メッセージ */}
        {content.message && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {content.message}
          </p>
        )}

        {/* アクションボタン */}
        {content.actionText && !dateStatus.isPast && (
          <button
            onClick={handleClick}
            className={cn(
              "inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
              content.color === 'blue' && "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
              content.color === 'green' && "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
              content.color === 'purple' && "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500"
            )}
          >
            <PlusIcon className="w-4 h-4" />
            <span>{content.actionText}</span>
          </button>
        )}

        {/* 過去の日付用のメッセージ */}
        {dateStatus.isPast && !dateStatus.isYesterday && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            過去の日付のため、新しい予定は追加できません
          </div>
        )}
      </div>

      {/* 装飾的な要素 */}
      <div className="absolute top-3 right-3 opacity-20">
        <div className={cn(
          "w-2 h-2 rounded-full",
          content.color === 'blue' && "bg-blue-400",
          content.color === 'green' && "bg-green-400",
          content.color === 'gray' && "bg-gray-400",
          content.color === 'purple' && "bg-purple-400"
        )} />
      </div>
      <div className="absolute bottom-3 left-3 opacity-20">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          content.color === 'blue' && "bg-blue-300",
          content.color === 'green' && "bg-green-300",
          content.color === 'gray' && "bg-gray-300",
          content.color === 'purple' && "bg-purple-300"
        )} />
      </div>
    </div>
  )
}

// シンプル版（コンパクトな表示用）
interface SimpleEmptyDaySlotProps {
  date: Date
  onEmptySlotClick?: () => void
  compact?: boolean
}

export function SimpleEmptyDaySlot({ 
  date, 
  onEmptySlotClick, 
  compact = false 
}: SimpleEmptyDaySlotProps) {
  const dateStatus = useMemo(() => ({
    isToday: isToday(date),
    isPast: isPast(date) && !isToday(date)
  }), [date])

  const handleClick = () => {
    if (!dateStatus.isPast) {
      onEmptySlotClick?.()
    }
  }

  if (compact) {
    return (
      <div 
        className={cn(
          "p-3 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded",
          !dateStatus.isPast && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
          "transition-colors duration-200"
        )}
        onClick={handleClick}
      >
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {dateStatus.isPast ? '予定なし' : '予定を追加'}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "p-4 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg",
        !dateStatus.isPast && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
        "transition-colors duration-200"
      )}
      onClick={handleClick}
    >
      <CalendarDaysIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {dateStatus.isPast ? '予定はありませんでした' : '予定を追加'}
      </div>
      {!dateStatus.isPast && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          クリックして新しいタスクを作成
        </div>
      )}
    </div>
  )
}

// ウィークエンド専用の空スロット
interface WeekendEmptySlotProps {
  date: Date
  onEmptySlotClick?: () => void
}

export function WeekendEmptySlot({ date, onEmptySlotClick }: WeekendEmptySlotProps) {
  const isWeekend = [0, 6].includes(date.getDay()) // 日曜日(0)または土曜日(6)
  const dateStatus = useMemo(() => ({
    isToday: isToday(date),
    isPast: isPast(date) && !isToday(date)
  }), [date])

  if (!isWeekend) {
    return <EmptyDaySlot date={date} onEmptySlotClick={onEmptySlotClick} />
  }

  const handleClick = () => {
    if (!dateStatus.isPast) {
      onEmptySlotClick?.()
    }
  }

  return (
    <div className={cn(
      "relative p-6 rounded-lg border-2 border-dashed transition-all duration-300",
      "border-amber-200 dark:border-amber-700",
      !dateStatus.isPast && "cursor-pointer hover:border-amber-300 dark:hover:border-amber-600",
      "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10"
    )}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <SunIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-amber-100">
          {dateStatus.isToday ? '今日は週末です' : '週末の予定はありません'}
        </h3>
        
        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
          {dateStatus.isPast 
            ? 'ゆっくりと過ごされたことでしょう' 
            : 'リラックスタイムを楽しむか、趣味の時間にしませんか？'
          }
        </p>

        {!dateStatus.isPast && (
          <button
            onClick={handleClick}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>週末の予定を追加</span>
          </button>
        )}
      </div>
    </div>
  )
}