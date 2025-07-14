'use client'

import React from 'react'
import { CalendarDays } from 'lucide-react'

export function ScheduleCard() {
  return (
    <div className="group relative transition-all duration-300 cursor-pointer
      /* Light Mode - Clean & Minimal */
      bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-200
      /* Dark Mode - Rich & Atmospheric */
      dark:bg-gray-900/90 dark:border-gray-700/50 dark:backdrop-blur-xl dark:hover:border-blue-500/40 dark:shadow-2xl dark:hover:shadow-blue-500/10">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-gray-900 dark:text-white">Team Meeting</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">in 15 min</div>
          </div>
          {/* Light: Subtle indicator, Dark: Glowing dot */}
          <div className="w-1.5 h-1.5 rounded-full
            bg-blue-400 opacity-50
            dark:bg-blue-400 dark:opacity-80 dark:shadow-[0_0_6px_rgba(59,130,246,0.6)]"></div>
        </div>
      </div>
    </div>
  )
}