'use client'

import React, { useState } from 'react'
import { SparklesIcon, CalendarIcon, ClockIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/button'
import { ScheduleCard } from '@/components/cards/schedule-card'
import { ClockCard } from '@/components/cards/clock-card'
import { usePathname, useRouter } from 'next/navigation'

interface MainAreaHeaderProps {
  className?: string
  onToggleChat?: () => void
  isChatOpen?: boolean
}

export function MainAreaHeader({ className, onToggleChat, isChatOpen }: MainAreaHeaderProps) {
  const pathname = usePathname()
  
  // パス名から表示名を取得
  const getPageTitle = (path: string) => {
    if (path === '/calendar') return 'Calendar'
    if (path === '/table') return 'Table'
    if (path === '/board') return 'Board'
    if (path === '/stats') return 'Stats'
    if (path === '/search') return 'Search'
    if (path === '/add') return 'Add'
    if (path.startsWith('/settings')) return 'Settings'
    return 'Dashboard'
  }

  return (
    <div className={`sticky top-0 z-10 lg:bg-white dark:lg:bg-gray-800 ${className}`}>
      <div className="px-4 pt-1 pb-2">
        <div className="grid grid-cols-3 items-center h-12">
          {/* Left: Current Page */}
          <div className="flex items-center">
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">
              {getPageTitle(pathname)}
            </div>
          </div>
          
          {/* Center: Current Task & Time */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <CurrentTaskDisplay />
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <TimeDisplay />
            </div>
          </div>
          
          {/* Right: AI Button */}
          <div className="flex items-center justify-end">
            {!isChatOpen && <AskAIButton onToggle={onToggleChat || (() => {})} />}
          </div>
        </div>
      </div>
    </div>
  )
}


// 現在の予定表示コンポーネント
function CurrentTaskDisplay() {
  const router = useRouter()
  
  // 実際の実装では現在の予定を取得
  const currentSchedule = {
    id: '1', // 実際の実装では予定のIDを使用
    title: "Team Meeting",
    startTime: "14:00",
    endTime: "15:00"
  }
  
  const handleScheduleClick = () => {
    // 実際の実装では予定のIDやタイムスタンプをパラメータで渡す
    router.push(`/calendar?eventId=${currentSchedule.id}`)
  }
  
  return (
    <button
      onClick={handleScheduleClick}
      className="group flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer"
      title="カレンダーで詳細を見る"
    >
      <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
      <div className="flex items-center gap-1">
        <div className="text-base font-medium text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {currentSchedule.title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          {currentSchedule.startTime} - {currentSchedule.endTime}
        </div>
      </div>
    </button>
  )
}

// 時間表示コンポーネント
function TimeDisplay() {
  const [time, setTime] = React.useState(new Date())
  const router = useRouter()

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // クロノタイプと現在時刻から状態を判定
  const getChronotypeStatus = (currentTime: Date) => {
    const hour = currentTime.getHours()
    const chronotype = 'Morning' // 実際にはユーザー設定から取得
    
    if (chronotype === 'Morning') {
      if (hour >= 6 && hour < 10) return { status: 'Peak', icon: SunIcon }
      if (hour >= 10 && hour < 14) return { status: 'Active', icon: SunIcon }
      if (hour >= 14 && hour < 16) return { status: 'Low', icon: MoonIcon }
      if (hour >= 16 && hour < 20) return { status: 'Moderate', icon: SunIcon }
      return { status: 'Rest', icon: MoonIcon }
    } else {
      // Night Owl の場合
      if (hour >= 20 || hour < 2) return { status: 'Peak', icon: SunIcon }
      if (hour >= 6 && hour < 10) return { status: 'Low', icon: MoonIcon }
      if (hour >= 10 && hour < 16) return { status: 'Moderate', icon: SunIcon }
      return { status: 'Active', icon: SunIcon }
    }
  }

  const chronoStatus = getChronotypeStatus(time)
  const ChronoIcon = chronoStatus.icon

  const handleChronotypeClick = () => {
    router.push('/settings/chronotype')
  }

  return (
    <div className="flex items-center gap-1.5">
      <ClockIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <div className="flex items-center gap-1">
        <div className="text-base font-bold tabular-nums text-gray-600 dark:text-gray-300">
          {time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
          })}
        </div>
        <button
          onClick={handleChronotypeClick}
          className="flex items-center gap-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md ml-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          title="クロノタイプ設定"
        >
          <ChronoIcon className="w-3 h-3 text-amber-500 dark:text-amber-400" />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {chronoStatus.status}
          </div>
        </button>
      </div>
    </div>
  )
}

function AskAIButton({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      title="Ask AI"
    >
      <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      <span className="text-sm font-medium text-gray-900 dark:text-white">Ask AI</span>
    </button>
  )
}