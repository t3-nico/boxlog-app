'use client'

import { useCallback } from 'react'

import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { cn } from '@/lib/utils'

interface TimezoneOffsetProps {
  timezone: string
  className?: string
}

export function TimezoneOffset({ timezone, className }: TimezoneOffsetProps) {
  const openSettings = useSettingsDialogStore((state) => state.openSettings)

  const getUTCOffset = (tz: string): string => {
    try {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset',
      })
      const parts = formatter.formatToParts(now)
      const offsetPart = parts.find((part) => part.type === 'timeZoneName')

      if (offsetPart?.value) {
        const match = offsetPart.value.match(/GMT([+-]\d+)/)
        if (match && match[1]) {
          const offset = parseInt(match[1])
          return offset >= 0 ? `+${offset}` : `${offset}`
        }
      }

      const tzOffset = now
        .toLocaleString('en-US', {
          timeZone: tz,
          timeZoneName: 'shortOffset',
        })
        .match(/UTC([+-]\d+)/)?.[1]

      return tzOffset || '+0'
    } catch {
      return '+0'
    }
  }

  const handleClick = useCallback(() => {
    openSettings('calendar')
  }, [openSettings])

  const offset = getUTCOffset(timezone)

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'text-muted-foreground flex h-8 items-center justify-start text-xs',
        'hover:text-foreground cursor-pointer rounded transition-colors',
        className
      )}
    >
      <span className="font-medium">UTC{offset}</span>
    </button>
  )
}
