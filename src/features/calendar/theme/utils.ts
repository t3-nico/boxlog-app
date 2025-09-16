// features/calendar/theme/utils.ts
// テーマ関連のユーティリティ関数（Tailwindクラスベース）

import { colors } from '@/config/theme'

import { calendarAnimations } from './animations'
import { calendarColors } from './colors'
import type { CalendarColors } from './colors'
import { calendarStyles } from './styles'

// イベントの色クラスを取得
export const getEventColor = (
  status: keyof CalendarColors['event'],
  property: 'background' | 'text' | 'hover' = 'background'
): string => {
  const colors = calendarColors.event[status]
  return colors?.[property] || calendarColors.event.scheduled[property]
}

// UI状態の色クラスを取得
export const getStatusColor = (
  state: keyof CalendarColors['states'],
  property: 'background' | 'text' = 'background'
): string => {
  const colors = calendarColors.states[state]
  return colors?.[property] || ''
}

// 共通テーマから必要な色クラスを取得するヘルパー

export const getCommonColor = (
  category: keyof typeof colors,
  type: string
): string => {
  const colorCategory = colors[category]
  if (typeof colorCategory === 'object' && type in colorCategory) {
    return (colorCategory as any)[type]
  }
  return ''
}

// スタイルクラスを取得
export const getCalendarStyle = (
  category: keyof typeof calendarStyles,
  property?: string
): any => {
  const styles = calendarStyles[category]
  
  if (!property) return styles
  
  // ネストされたプロパティの場合 (例: 'fontSize.title')
  const keys = property.split('.')
  let result: any = styles
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return undefined
    }
  }
  
  return result
}

// アニメーションクラスを取得
export const getCalendarAnimation = (
  type: keyof typeof calendarAnimations
): string => {
  return calendarAnimations[type]
}

// 完全なイベントクラス名を生成（すべてscheduledカラーベース）
export const getEventClassName = (
  options: {
    isDragging?: boolean
    isGhost?: boolean
    isSelected?: boolean
    isConflict?: boolean
  } = {}
): string => {
  const { isDragging, isGhost, isSelected, isConflict } = options
  
  // 基本クラス（すべてscheduledカラー使用、ボーダーなし）
  const classes = [
    // 背景色 - scheduledカラー
    getEventColor('scheduled', 'background'),
    // テキスト色 - scheduledカラー
    getEventColor('scheduled', 'text'),
    // 基本スタイル
    calendarStyles.event.borderRadius,
    calendarStyles.event.padding,
    calendarStyles.event.minHeight,
    calendarStyles.event.fontSize.title,
    calendarStyles.event.shadow.default,
    calendarStyles.transitions.default,
    // ホバー効果 - scheduledカラー
    getEventColor('scheduled', 'hover'),
    // カーソル
    'cursor-pointer select-none'
  ]
  
  // 状態による追加クラス（scheduledカラーは維持）
  if (isDragging) {
    classes.push(
      calendarAnimations.dragScale,
      calendarStyles.event.shadow.dragging,
      'z-50'
    )
  }
  
  if (isGhost) {
    // ゴーストのみ特別な色を使用（ボーダーなし）
    classes.length = 0 // 基本クラスをクリア
    classes.push(
      getStatusColor('ghost', 'background'),
      getStatusColor('ghost', 'text'),
      calendarStyles.event.borderRadius,
      calendarStyles.event.padding,
      calendarStyles.event.minHeight,
      calendarStyles.event.fontSize.title,
      calendarAnimations.ghostAppear
    )
  }
  
  if (isSelected) {
    // 選択時は背景のみ変更（ボーダーなし）
    classes.push(
      getStatusColor('selected', 'background'),
      'ring-2 ring-blue-400'
    )
  }
  
  if (isConflict) {
    // 衝突時は背景のみ変更（ボーダーなし）
    classes.push(
      getStatusColor('conflict', 'background'),
      calendarAnimations.pulse
    )
  }
  
  return classes.filter(Boolean).join(' ')
}

// カレンダーグリッドのクラス名を生成
export const getCalendarGridClassName = (): string => {
  return [
    'relative',
    calendarStyles.grid.gap,
    'overflow-hidden'
  ].join(' ')
}

// 時間カラムのクラス名を生成
export const getTimeColumnClassName = (): string => {
  return [
    colors.text.muted,  // 共通テーマの薄いテキスト色
    calendarStyles.event.fontSize.time,
    'pr-2 text-right',
    calendarStyles.grid.columnMinWidth
  ].join(' ')
}

// グリッド線のクラス名を生成
export const getGridLineClassName = (): string => {
  return [
    'border-t',
    colors.border.DEFAULT,  // 共通テーマのボーダー色
    'absolute left-0 right-0'
  ].join(' ')
}

// 今日ハイライトのクラス名を生成
export const getTodayHighlightClassName = (): string => {
  return [
    colors.selection.DEFAULT,  // 共通テーマの選択背景色
    'absolute inset-0 pointer-events-none'
  ].join(' ')
}

// 週末ハイライトのクラス名を生成
export const getWeekendHighlightClassName = (): string => {
  return [
    colors.background.surface,  // 共通テーマのサーフェス色
    'absolute inset-0 pointer-events-none'
  ].join(' ')
}

// 現在時刻線のクラス名を生成
export const getCurrentTimeLineClassName = (): string => {
  return [
    'border-t-2',
    colors.semantic.error.border,  // 共通テーマのエラー色（赤）
    'absolute left-0 right-0 z-20',
    'pointer-events-none'
  ].join(' ')
}

// ドロップゾーンのクラス名を生成
export const getDropZoneClassName = (isActive: boolean = false): string => {
  const baseClasses = [
    'absolute inset-0',
    'transition-all duration-150'
  ]
  
  if (isActive) {
    baseClasses.push(calendarAnimations.dropZone)
  }
  
  return baseClasses.join(' ')
}

// プレースホルダーのクラス名を生成（scheduledカラー + 透明度）
export const getPlaceholderClassName = (): string => {
  return [
    // scheduledカラーベース + 透明度
    'bg-blue-50/50 dark:bg-blue-950/30',
    'border-l-4 border-blue-600 dark:border-blue-400',
    'text-transparent',
    calendarStyles.event.borderRadius,
    calendarStyles.event.padding,
    calendarStyles.event.minHeight,
    calendarAnimations.placeholderPulse,
    'border-dashed'
  ].join(' ')
}

// コンポーネント用のヘルパー関数
export const combineClasses = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}