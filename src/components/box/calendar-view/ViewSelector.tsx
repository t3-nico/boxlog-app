'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { getViewDisplayName } from './utils/calendar-helpers'
import type { ViewSelectorProps, CalendarViewType } from './types'

export function ViewSelector({ value, onChange }: ViewSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const viewOptions: { value: CalendarViewType; label: string; shortcut: string }[] = [
    { value: 'day', label: '日', shortcut: '1' },
    { value: 'split-day', label: '分割日', shortcut: '2' },
    { value: '3day', label: '3日', shortcut: '3' },
    { value: 'week-no-weekend', label: '平日', shortcut: '5' },
    { value: 'week', label: '週', shortcut: '7' },
    { value: '2week', label: '2週', shortcut: '14' },
    { value: 'schedule', label: 'スケジュール', shortcut: 'A' },
  ]

  const handleSelect = (viewType: CalendarViewType) => {
    onChange(viewType)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {getViewDisplayName(value)}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20">
            <div className="py-1">
              {viewOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                    value === option.value 
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Ctrl+{option.shortcut}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}