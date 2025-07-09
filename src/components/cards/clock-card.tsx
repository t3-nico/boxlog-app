'use client'

import React, { useState, useEffect } from 'react'
import { ClockIcon, SunIcon, MoonIcon, BoltIcon } from '@heroicons/react/24/outline'

export function ClockCard() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
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
      if (hour >= 6 && hour < 10) return { status: 'peak', label: 'Peak Time', color: 'green', icon: BoltIcon }
      if (hour >= 10 && hour < 14) return { status: 'active', label: 'Active', color: 'blue', icon: SunIcon }
      if (hour >= 14 && hour < 16) return { status: 'low', label: 'Low Energy', color: 'orange', icon: MoonIcon }
      if (hour >= 16 && hour < 20) return { status: 'moderate', label: 'Moderate', color: 'blue', icon: SunIcon }
      return { status: 'rest', label: 'Rest Time', color: 'purple', icon: MoonIcon }
    } else {
      // Night Owl の場合
      if (hour >= 20 || hour < 2) return { status: 'peak', label: 'Peak Time', color: 'green', icon: BoltIcon }
      if (hour >= 6 && hour < 10) return { status: 'low', label: 'Low Energy', color: 'orange', icon: MoonIcon }
      if (hour >= 10 && hour < 16) return { status: 'moderate', label: 'Moderate', color: 'blue', icon: SunIcon }
      return { status: 'active', label: 'Active', color: 'blue', icon: SunIcon }
    }
  }

  const chronoStatus = getChronotypeStatus(time)

  const getStatusColors = (color: string) => {
    switch (color) {
      case 'green': return {
        light: 'bg-green-100 text-green-800',
        dark: 'dark:bg-green-900/50 dark:text-green-200'
      }
      case 'blue': return {
        light: 'bg-blue-100 text-blue-800',
        dark: 'dark:bg-blue-900/50 dark:text-blue-200'
      }
      case 'orange': return {
        light: 'bg-orange-100 text-orange-800',
        dark: 'dark:bg-orange-900/50 dark:text-orange-200'
      }
      case 'purple': return {
        light: 'bg-purple-100 text-purple-800',
        dark: 'dark:bg-purple-900/50 dark:text-purple-200'
      }
      default: return {
        light: 'bg-gray-100 text-gray-800',
        dark: 'dark:bg-gray-700 dark:text-gray-200'
      }
    }
  }

  const statusColors = getStatusColors(chronoStatus.color)
  const StatusIcon = chronoStatus.icon

  return (
    <div className="group relative transition-all duration-300 cursor-pointer
      /* Light Mode - Clean neutral */
      bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-gray-200
      /* Dark Mode - Rich atmospheric */
      dark:bg-gray-900/95 dark:border-gray-700/60 dark:backdrop-blur-xl dark:hover:border-gray-500/60 dark:shadow-2xl">
      <div className="p-3">
        <div className="flex items-center">
          {/* Left: Clock icon + Time + Status */}
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold tabular-nums
              text-gray-900
              dark:text-white dark:drop-shadow-sm">
              {time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: false 
              })}
            </div>
            {/* Chronotype Status Badge - Clickable */}
            <a
              href="/settings/chronotype"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105
                ${statusColors.light} ${statusColors.dark}
                hover:shadow-md`}
              onClick={(e) => e.stopPropagation()}
            >
              <StatusIcon className={`w-3 h-3 ${
                chronoStatus.color === 'green' ? 'text-green-700 dark:text-green-200' :
                chronoStatus.color === 'blue' ? 'text-blue-700 dark:text-blue-200' :
                chronoStatus.color === 'orange' ? 'text-orange-700 dark:text-orange-200' :
                chronoStatus.color === 'purple' ? 'text-purple-700 dark:text-purple-200' :
                'text-gray-700 dark:text-gray-200'
              }`} />
              <span className={`${
                chronoStatus.color === 'green' ? 'text-green-800 dark:text-green-200' :
                chronoStatus.color === 'blue' ? 'text-blue-800 dark:text-blue-200' :
                chronoStatus.color === 'orange' ? 'text-orange-800 dark:text-orange-200' :
                chronoStatus.color === 'purple' ? 'text-purple-800 dark:text-purple-200' :
                'text-gray-800 dark:text-gray-200'
              }`}>
                {chronoStatus.label}
              </span>
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}