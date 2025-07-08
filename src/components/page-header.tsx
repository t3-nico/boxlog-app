'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  BellIcon,
  UserIcon,
  CommandLineIcon,
  SparklesIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { Avatar } from '@/components/avatar'
import { useAuthContext } from '@/contexts/AuthContext'

interface PageHeaderProps {
  title: string
  icon?: React.ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  actions?: React.ReactNode
  onChatToggle?: () => void
  isChatOpen?: boolean
  chatNotifications?: number
  showCalendarStatus?: boolean
}

// Mock data types
interface CurrentEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
}

interface ChronoStatus {
  icon: string
  label: string
  period: string
  type: 'focus' | 'creative' | 'rest'
}

interface ChatButtonProps {
  onClick?: () => void
  isOpen?: boolean
  notifications?: number
}

function ChatButton({ onClick, isOpen = false, notifications = 0 }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-2 transition-colors rounded-lg ${
        isOpen 
          ? 'bg-zinc-950/5 dark:bg-white/5 text-gray-700 dark:text-gray-300' 
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      title="Ask AI (⌘/)"
    >
      <SparklesIcon className={`h-5 w-5 ${
        isOpen 
          ? 'text-orange-500 dark:text-orange-400' 
          : ''
      }`} />
      <span className="text-sm font-medium">Ask AI</span>
      {notifications > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {notifications > 9 ? '9+' : notifications}
        </span>
      )}
    </button>
  )
}

function LiveTime() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      setCurrentTime(timeString)
    }

    // 初回設定
    updateTime()
    
    // 1秒ごとに更新
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
        <ClockIcon className="h-4 w-4" />
        {currentTime}
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  icon,
  breadcrumbs,
  actions,
  onChatToggle,
  isChatOpen = false,
  chatNotifications = 0,
  showCalendarStatus = false
}: PageHeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const router = useRouter()

  // Mock data for current event and chrono status
  const currentEvent: CurrentEvent | null = showCalendarStatus ? {
    id: 'event-123',
    title: 'Team Meeting',
    startTime: '14:00',
    endTime: '15:00',
    date: '2024-01-15'
  } : null

  const chronoStatus: ChronoStatus = {
    icon: 'focus',
    label: 'Focus Time',
    period: '14:00-16:00',
    type: 'focus'
  }

  const handleEventClick = () => {
    if (currentEvent) {
      console.log('Navigate to calendar event:', currentEvent.id)
      // router.push(`/calendar?date=${currentEvent.date}&time=${currentEvent.startTime}`)
    }
  }

  const handleChronoClick = () => {
    router.push('/settings/chronotype')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 lg:bg-white dark:lg:bg-zinc-900">
      <div className="flex items-center justify-between py-1 px-4 md:px-6 lg:px-10">
        {/* 左側：ページ情報 */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h1>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <span className="mx-1">/</span>}
                    {crumb.href ? (
                      <a
                        href={crumb.href}
                        className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* 中央：現在時刻または予定＋クロノタイプ情報 */}
        <div className="hidden md:flex items-center gap-4 text-sm flex-1 justify-center">
          {showCalendarStatus ? (
            <>
              {/* 現在の予定 */}
              <button
                onClick={handleEventClick}
                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-full transition-all duration-200 group"
              >
                <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                {currentEvent ? (
                  <>
                    <span className="text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {currentEvent.title}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {currentEvent.startTime}-{currentEvent.endTime}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Free time</span>
                )}
              </button>
              
              {/* 現在時刻 */}
              <LiveTime />
              
              {/* クロノタイプステータス */}
              <button
                onClick={handleChronoClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 group ${
                  chronoStatus.type === 'focus' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                    : chronoStatus.type === 'creative'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                }`}
              >
                <AcademicCapIcon className="h-4 w-4" />
                <span className="font-medium">{chronoStatus.label}</span>
                <span className="text-xs opacity-75">{chronoStatus.period}</span>
              </button>
            </>
          ) : (
            /* カレンダーステータス非表示時は時刻のみ */
            <LiveTime />
          )}
        </div>

        {/* 右側：チャットアイコンのみ */}
        <div className="flex items-center gap-1">
          {/* チャットボタン */}
          <ChatButton
            onClick={onChatToggle}
            isOpen={isChatOpen}
            notifications={chatNotifications}
          />

          {/* カスタムアクション */}
          {actions}
        </div>
      </div>
    </header>
  )
}