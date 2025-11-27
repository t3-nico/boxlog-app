'use client'

import { cn } from '@/lib/utils'

interface TimezoneOffsetProps {
  timezone: string
  className?: string
}

export function TimezoneOffset({ timezone, className }: TimezoneOffsetProps) {
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
        if (match) {
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

  const offset = getUTCOffset(timezone)

  return (
    <div className={cn('flex h-8 items-center justify-start text-xs text-gray-600 dark:text-gray-400', className)}>
      <span className="font-medium">UTC{offset}</span>
    </div>
  )
}
