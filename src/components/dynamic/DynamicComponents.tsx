'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// AI Chat関連の動的インポート
export const DynamicFloatingAIChat = dynamic(
  () => import('@/components/floating-ai-chat').then(mod => ({ default: mod.FloatingAIChat })),
  {
    ssr: false,
    loading: () => null
  }
)

// カレンダービューの動的インポート
export const DynamicCalendarView = dynamic(
  () => import('@/features/calendar/components/CalendarController').then(mod => ({ default: mod.CalendarController })),
  {
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
)

// CreateEventModalの動的インポート
export const DynamicCreateEventModal = dynamic(
  () => import('@/features/events/components/create').then(mod => ({ default: mod.CreateEventModal })),
  {
    ssr: false,
    loading: () => null
  }
)

// 重いUIコンポーネントの動的インポート
export const DynamicRichTextEditor = dynamic(
  () => import('@/components/shadcn-ui/rich-text-editor').then(mod => ({ default: mod.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-32 bg-muted animate-pulse rounded-md"></div>
    )
  }
)

// コマンドパレットの動的インポート
export const DynamicCommandPalette = dynamic(
  () => import('@/features/command-palette/components/command-palette').then(mod => ({ default: mod.CommandPalette })),
  {
    ssr: false,
    loading: () => null
  }
)

// 通知コンポーネントの動的インポート
export const DynamicNotificationDisplay = dynamic(
  () => import('@/features/notifications/components/notification-display').then(mod => ({ default: mod.NotificationDisplay })),
  {
    ssr: false,
    loading: () => null
  }
)