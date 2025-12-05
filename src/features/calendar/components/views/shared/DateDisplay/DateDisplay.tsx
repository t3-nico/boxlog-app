'use client'

import React from 'react'

import { format, isToday, isWeekend } from 'date-fns'

import { cn } from '@/lib/utils'

import type { DateDisplayProps } from './DateDisplay.types'

// 日付表示用のフォーマットユーティリティ
const useDateFormats = (
  date: Date,
  showDayName: boolean,
  showMonthYear: boolean,
  dayNameFormat: string,
  dateFormat: string
) => {
  const dayName = showDayName
    ? format(date, dayNameFormat === 'short' ? 'EEE' : dayNameFormat === 'long' ? 'EEEE' : 'EEEEE')
    : undefined

  const dateString = format(date, dateFormat)
  const monthYear = showMonthYear ? format(date, 'MMM yyyy') : undefined

  return { dayName, dateString, monthYear }
}

// スタイルクラスを生成
const generateDateClassName = (
  today: boolean,
  weekend: boolean,
  isSelected: boolean,
  onClick?: Function,
  className?: string
) => {
  const classes = ['text-center py-2 px-1 transition-colors']

  // ボタンの場合、デフォルトスタイルをリセット + フォーカス表示
  if (onClick) {
    classes.push(
      'border-0 bg-transparent font-inherit text-inherit outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-md'
    )
  }

  // ホバー効果（当日以外のみ）
  if (onClick && !today) {
    classes.push('cursor-pointer hover:bg-state-hover')
  }

  // クリック可能だが当日の場合
  if (onClick && today) {
    classes.push('cursor-pointer')
  }

  // 選択状態（当日以外）
  if (isSelected && !today) {
    classes.push('bg-primary/10 text-primary')
  }

  // 週末（当日以外）
  if (weekend && !today) {
    classes.push('text-muted-foreground')
  }

  if (className) {
    classes.push(className)
  }

  return cn(...classes)
}

// キーボードイベントハンドラー
const createKeyDownHandler = (onClick?: (date: Date) => void, date?: Date) => {
  if (!onClick || !date) return undefined

  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(date)
    }
  }
}

// アクセシビリティ属性を生成
const generateAccessibilityProps = (onClick?: Function, dateFormat?: string, date?: Date) => {
  if (!onClick) return {}

  return {
    'aria-label': date && dateFormat ? `Select ${format(date, dateFormat)}` : undefined,
  }
}

// 月年表示コンポーネント
const MonthYearDisplay = ({ monthYear }: { monthYear?: string }) => {
  if (!monthYear) return null

  return <div className="text-muted-foreground mb-1 text-xs">{monthYear}</div>
}

// 日付メイン表示コンポーネント
const DateMainDisplay = ({ dayName, dateString, today }: { dayName?: string; dateString: string; today: boolean }) => (
  <div className="flex flex-col items-center">
    {dayName ? (
      <div className={cn('text-xs font-medium', today ? 'text-primary-foreground/75' : 'text-muted-foreground')}>
        {dayName}
      </div>
    ) : null}

    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full text-lg font-medium',
        today && 'bg-primary text-primary-foreground font-semibold'
      )}
    >
      {dateString}
    </div>
  </div>
)

export const DateDisplay = ({
  date,
  className,
  isToday: todayProp,
  isSelected = false,
  showDayName = true,
  showMonthYear = true,
  dayNameFormat = 'short',
  dateFormat = 'd',
  onClick,
  onDoubleClick,
}: DateDisplayProps) => {
  const today = todayProp ?? isToday(date)
  const weekend = isWeekend(date)

  const { dayName, dateString, monthYear } = useDateFormats(date, showDayName, showMonthYear, dayNameFormat, dateFormat)
  const dateClassName = generateDateClassName(today, weekend, isSelected, onClick, className)
  const keyDownHandler = createKeyDownHandler(onClick, date)
  const accessibilityProps = generateAccessibilityProps(onClick, dateFormat, date)

  // クリック可能な場合はbuttonとして、そうでなければdivとして扱う
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      className={dateClassName}
      onClick={() => onClick?.(date)}
      onDoubleClick={() => onDoubleClick?.(date)}
      onKeyDown={keyDownHandler}
      {...accessibilityProps}
    >
      <MonthYearDisplay {...(monthYear && { monthYear })} />
      <DateMainDisplay {...(dayName && { dayName })} dateString={dateString} today={today} />
    </Component>
  )
}
