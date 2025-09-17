import React from 'react'

import { Activity, Bell, Clock, FileText, Edit3, ArrowRight } from 'lucide-react'
import { Tag as TagIcon } from 'lucide-react'

import { text, colors } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

// Timeline event types
interface BaseTimelineEvent {
  type: string
  field?: string
  action?: string
  value?: string
  oldValue?: string
  newValue?: string
}

interface CreatedEvent extends BaseTimelineEvent {
  type: 'created'
}

interface StatusEvent extends BaseTimelineEvent {
  type: 'status'
  oldValue: string
  newValue: string
}

interface ReminderEvent extends BaseTimelineEvent {
  type: 'reminder'
  value: string
}

interface TimeEvent extends BaseTimelineEvent {
  field: 'time'
  oldValue: string
  newValue: string
}

interface TagEvent extends BaseTimelineEvent {
  field: 'tags'
  action: 'added' | 'removed'
  oldValue?: string
  newValue?: string
}

interface MemoEvent extends BaseTimelineEvent {
  field: 'memo'
  action: 'added' | 'updated'
  newValue: string
}

export type TimelineEvent = CreatedEvent | StatusEvent | ReminderEvent | TimeEvent | TagEvent | MemoEvent

/**
 * イベントタイプに基づいてアイコンを取得
 */
export const getEventIcon = (event: TimelineEvent) => {
  if (event.type === 'created') return <Edit3 className="w-3 h-3" />
  if (event.type === 'status') return <Activity className="w-3 h-3" />
  if (event.type === 'reminder') return <Bell className="w-3 h-3" />

  if (event.field === 'time') return <Clock className="w-3 h-3" />
  if (event.field === 'tags') return <TagIcon className="w-3 h-3" />
  if (event.field === 'memo') return <FileText className="w-3 h-3" />

  return <Edit3 className="w-3 h-3" />
}

/**
 * 作成イベントの説明文を生成
 */
export const renderCreatedEventDescription = () => {
  return <span className={text.primary}>作成</span>
}

/**
 * ステータス変更イベントの説明文を生成
 */
export const renderStatusEventDescription = (event: StatusEvent) => {
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      <span className={text.muted}>ステータス:</span>
      <span className={text.muted}>{event.oldValue}</span>
      <ArrowRight className={cn('w-3 h-3', text.muted)} />
      <span className={cn(text.primary, 'font-medium')}>{event.newValue}</span>
    </span>
  )
}

/**
 * リマインダーイベントの説明文を生成
 */
export const renderReminderEventDescription = (event: ReminderEvent) => {
  return <span className={text.primary}>{event.value}</span>
}

/**
 * 時間変更イベントの説明文を生成
 */
export const renderTimeEventDescription = (event: TimeEvent) => {
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      <span className={text.muted}>時間変更:</span>
      <span className={cn(text.muted, 'font-mono text-xs')}>{event.oldValue}</span>
      <ArrowRight className={cn('w-3 h-3', text.muted)} />
      <span className={cn(text.primary, 'font-mono text-xs font-medium')}>{event.newValue}</span>
    </span>
  )
}

/**
 * タグ追加イベントの説明文を生成
 */
export const renderTagAddedEventDescription = (event: TagEvent) => {
  return (
    <span className="flex items-center gap-1.5">
      <span className={text.muted}>タグ追加:</span>
      <span className={cn(
        'px-2 py-0.5 text-xs rounded-full border',
        colors.background.accent,
        text.primary
      )}>
        {event.newValue}
      </span>
    </span>
  )
}

/**
 * タグ削除イベントの説明文を生成
 */
export const renderTagRemovedEventDescription = (event: TagEvent) => {
  return (
    <span className="flex items-center gap-1.5">
      <span className={text.muted}>タグ削除:</span>
      <span className={cn(
        'px-2 py-0.5 text-xs rounded-full border border-dashed',
        'bg-transparent text-neutral-500 dark:text-neutral-400'
      )}>
        {event.oldValue}
      </span>
    </span>
  )
}

/**
 * メモイベントの説明文を生成
 */
export const renderMemoEventDescription = (event: MemoEvent) => {
  return (
    <span className="flex items-center gap-1.5">
      <span className={text.muted}>メモ{event.action === 'added' ? '追加' : '更新'}:</span>
      <span className={cn(text.primary, 'text-xs')}>
        {event.newValue.length > 20 ? `${event.newValue.slice(0, 20)}...` : event.newValue}
      </span>
    </span>
  )
}

/**
 * イベントの説明文を生成（メイン関数）
 */
export const getEventDescription = (event: TimelineEvent) => {
  if (event.type === 'created') {
    return renderCreatedEventDescription()
  }

  if (event.type === 'status') {
    return renderStatusEventDescription(event)
  }

  if (event.type === 'reminder') {
    return renderReminderEventDescription(event)
  }

  if (event.field === 'time') {
    return renderTimeEventDescription(event)
  }

  if (event.field === 'tags' && event.action === 'added') {
    return renderTagAddedEventDescription(event)
  }

  if (event.field === 'tags' && event.action === 'removed') {
    return renderTagRemovedEventDescription(event)
  }

  if (event.field === 'memo') {
    return renderMemoEventDescription(event)
  }

  return <span className={text.primary}>更新</span>
}