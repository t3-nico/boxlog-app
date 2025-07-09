import { useCallback } from 'react'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { formatTimeWithSettings, formatHour } from '@/utils/timezone-utils'

export function useFormattedTime() {
  const { timeFormat, timezone } = useCalendarSettingsStore()
  
  const formatTime = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatTimeWithSettings(dateObj, timeFormat, timezone)
  }, [timeFormat, timezone])
  
  const formatHourLabel = useCallback((hour: number) => {
    return formatHour(hour, timeFormat)
  }, [timeFormat])
  
  return {
    formatTime,
    formatHourLabel,
    timeFormat,
    timezone
  }
}