'use client'

import React, { useState, useEffect } from 'react'
import { Zap, Moon, Sun } from 'lucide-react'

export function FocusCard() {
  const [focusMode, setFocusMode] = useState(false)
  const [focusTime, setFocusTime] = useState(0)
  const chronotype = 'Morning'

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (focusMode) {
      timer = setInterval(() => {
        setFocusTime(prev => prev + 1)
      }, 1000)
    } else {
      setFocusTime(0)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [focusMode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isActive = focusMode

  return (
    <div className={`group relative transition-all duration-300 cursor-pointer ${
      isActive 
        ? /* Light: Soft green tint, Dark: Vibrant green glow */
          'bg-green-50 border border-green-200 rounded-2xl shadow-sm hover:shadow-lg ' +
          'dark:bg-green-900/30 dark:border-green-500/50 dark:backdrop-blur-xl dark:shadow-green-500/20'
        : /* Light: Clean neutral, Dark: Rich atmospheric */
          'bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-green-200 ' +
          'dark:bg-gray-900/95 dark:border-gray-700/60 dark:backdrop-blur-xl dark:hover:border-green-500/40 dark:shadow-2xl'
    }`}>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Dynamic icon styling based on state and theme */}
            <div className={`w-5 h-5 rounded-xl flex items-center justify-center ${
              isActive
                ? /* Active: Light soft green, Dark vibrant gradient */
                  'bg-green-100 text-green-600 ' +
                  'dark:bg-gradient-to-br dark:from-green-500 dark:to-emerald-600 dark:text-white dark:shadow-lg dark:shadow-green-500/30'
                : /* Inactive: Light neutral, Dark metallic */
                  'bg-gray-100 text-gray-600 ' +
                  'dark:bg-gradient-to-br dark:from-gray-600 dark:to-gray-800 dark:text-gray-300 dark:shadow-lg'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`text-xs font-semibold transition-colors ${
                isActive 
                  ? 'text-green-700 dark:text-green-200'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {isActive ? 'Active' : 'Focus'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <div className="text-xs font-mono transition-all duration-500
                text-green-700 bg-green-100 px-2 py-1 rounded-lg
                dark:text-green-300 dark:bg-green-900/50 dark:shadow-inner">
                {formatTime(focusTime)}
              </div>
            )}
            {/* Chronotype indicators with enhanced styling */}
            {chronotype === 'Morning' ? (
              <Sun className="w-4 h-4 
                text-amber-500 
                dark:text-amber-400 dark:drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]" />
            ) : (
              <Moon className="w-4 h-4 
                text-indigo-500 
                dark:text-indigo-400 dark:drop-shadow-[0_0_3px_rgba(99,102,241,0.5)]" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}