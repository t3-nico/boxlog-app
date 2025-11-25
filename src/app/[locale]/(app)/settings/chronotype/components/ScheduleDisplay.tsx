'use client'

import { memo } from 'react'

import { cn } from '@/lib/utils'

import type { ChronoTypeSchedule } from '../chronotype.types'

interface ScheduleDisplayProps {
  profileName: string
  schedules: ChronoTypeSchedule[]
  typeColors: Record<string, string>
  getTypeIcon: (type: ChronoTypeSchedule['type']) => React.ReactNode
}

export const ScheduleDisplay = memo(({ profileName, schedules, typeColors, getTypeIcon }: ScheduleDisplayProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {profileName} のスケジュール
      </h2>

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className={cn('flex items-center justify-between rounded-lg p-3', typeColors[schedule.type])}
          >
            <div className="flex items-center gap-3">
              {getTypeIcon(schedule.type)}
              <div>
                <div className="font-medium">{schedule.label}</div>
                <div className="text-sm opacity-75">{schedule.description}</div>
              </div>
            </div>
            <div className="font-mono text-sm">
              {schedule.startTime} - {schedule.endTime}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

ScheduleDisplay.displayName = 'ScheduleDisplay'
