'use client'

import React from 'react'
import { BarChart4 } from 'lucide-react'

export function ProgressCard() {
  const completedTasks = 7
  const totalTasks = 12
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="group relative transition-all duration-300 cursor-pointer
      /* Light Mode - Clean Professional */
      bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-purple-200
      /* Dark Mode - Rich Cyberpunk */
      dark:bg-gray-900/95 dark:border-gray-700/60 dark:backdrop-blur-xl dark:hover:border-purple-500/50 dark:shadow-2xl dark:hover:shadow-purple-500/10">
      <div className="p-3">
        <div className="flex flex-col items-center text-center gap-1">
          {/* Compact vertical layout for narrow card */}
          <div className="w-6 h-6 rounded-xl flex items-center justify-center
            bg-purple-50 text-purple-600
            dark:bg-gradient-to-br dark:from-purple-500 dark:to-violet-600 dark:text-white dark:shadow-lg dark:shadow-purple-500/30">
            <BarChart4 className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold
            bg-purple-100 text-purple-700 px-2 py-1 rounded-lg
            dark:bg-purple-900/50 dark:text-purple-300 dark:shadow-inner">
            {progressPercentage}%
          </div>
          <div className="text-xs font-medium
            text-gray-600
            dark:text-gray-300">
            {completedTasks}/{totalTasks}
          </div>
        </div>
        
        {/* Compact progress bar */}
        <div className="relative w-full rounded-full overflow-hidden mt-2
          h-2 bg-gray-100
          dark:h-2 dark:bg-gray-800/80">
          <div 
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
              bg-gradient-to-r from-purple-500 to-purple-600
              dark:bg-gradient-to-r dark:from-purple-400 dark:via-violet-500 dark:to-purple-600
              dark:shadow-[0_0_8px_rgba(147,51,234,0.4)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}