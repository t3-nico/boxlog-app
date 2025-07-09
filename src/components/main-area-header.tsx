'use client'

import React, { useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/button'
import { ScheduleCard } from '@/components/cards/schedule-card'
import { ClockCard } from '@/components/cards/clock-card'
import { FocusCard } from '@/components/cards/focus-card'
import { ProgressCard } from '@/components/cards/progress-card'

interface MainAreaHeaderProps {
  className?: string
}

export function MainAreaHeader({ className }: MainAreaHeaderProps) {
  return (
    <div className={`sticky top-0 z-10 lg:bg-white dark:lg:bg-gray-800 ${className}`}>
      <div className="px-4 py-3">
        {/* Adaptive Priority Grid */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3"><ScheduleCard /></div>
          <div className="col-span-4"><ClockCard /></div>
          <div className="col-span-3"><FocusCard /></div>
          <div className="col-span-2"><ProgressCard /></div>
        </div>
      </div>
    </div>
  )
}


export function AskAIButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <SparklesIcon className="w-4 h-4" />
        <span>Ask AI</span>
      </Button>
    </div>
  )
}