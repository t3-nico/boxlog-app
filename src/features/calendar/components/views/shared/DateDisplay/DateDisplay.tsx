'use client'

import React from 'react'

import { format, isToday, isWeekend } from 'date-fns'

import { secondary, selection } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

import type { DateDisplayProps } from './DateDisplay.types'

// 日付表示用のフォーマットユーティリティ
const useDateFormats = (date: Date, showDayName: boolean, showMonthYear: boolean, dayNameFormat: string, dateFormat: string) => {
  const dayName = showDayName 
    ? format(date, dayNameFormat === 'short' ? 'EEE' : dayNameFormat === 'long' ? 'EEEE' : 'EEEEE')
    : undefined
    
  const dateString = format(date, dateFormat)
  const monthYear = showMonthYear ? format(date, 'MMM yyyy') : undefined
  
  return { dayName, dateString, monthYear }
}

// スタイルクラスを生成
const generateDateClassName = (today: boolean, weekend: boolean, isSelected: boolean, onClick?: Function, className?: string) => {
  const classes = ['text-center py-2 px-1 transition-colors']
  
  // ホバー効果（当日以外のみ）
  if (onClick && !today) {
    classes.push('cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20')
  }
  
  // クリック可能だが当日の場合
  if (onClick && today) {
    classes.push('cursor-pointer')
  }
  
  // 選択状態（当日以外）
  if (isSelected && !today) {
    classes.push(`${selection.active} ${selection.text}`)
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
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': date && dateFormat ? `Select ${format(date, dateFormat)}` : undefined
  }
}

// 月年表示コンポーネント
const MonthYearDisplay = ({ monthYear }: { monthYear?: string }) => {
  if (!monthYear) return null
  
  return (
    <div className="text-xs text-muted-foreground mb-1">
      {monthYear}
    </div>
  )
}

// 日付メイン表示コンポーネント
const DateMainDisplay = ({ dayName, dateString, today }: { dayName?: string, dateString: string, today: boolean }) => (
  <div className="flex flex-col items-center">
    {dayName && (
      <div className="text-xs font-medium text-muted-foreground">
        {dayName}
      </div>
    )}
    
    <div className={cn(
      'text-lg font-medium w-8 h-8 rounded-full flex items-center justify-center',
      today && `${secondary.today} ${secondary.text} font-semibold`
    )}>
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
  onDoubleClick
}: DateDisplayProps) => {
  const today = todayProp ?? isToday(date)
  const weekend = isWeekend(date)
  
  const { dayName, dateString, monthYear } = useDateFormats(date, showDayName, showMonthYear, dayNameFormat, dateFormat)
  const dateClassName = generateDateClassName(today, weekend, isSelected, onClick, className)
  const keyDownHandler = createKeyDownHandler(onClick, date)
  const accessibilityProps = generateAccessibilityProps(onClick, dateFormat, date)

  return (
    <div
      className={dateClassName}
      onClick={() => onClick?.(date)}
      onDoubleClick={() => onDoubleClick?.(date)}
      onKeyDown={keyDownHandler}
      {...accessibilityProps}
    >
      <MonthYearDisplay monthYear={monthYear} />
      <DateMainDisplay dayName={dayName} dateString={dateString} today={today} />
    </div>
  )
}