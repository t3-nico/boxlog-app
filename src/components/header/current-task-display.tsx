'use client'

import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CurrentTaskDisplay() {
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
      <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" data-slot="icon" />
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