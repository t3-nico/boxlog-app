'use client'

import React from 'react'
import { Clock as ClockIcon, Sun as SunIcon, Moon as MoonIcon, GraduationCap as AcademicCapIcon, Lightbulb as LightBulbIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { CHRONOTYPE_PRESETS, getProductivityZoneForHour } from '@/types/chronotype'

export function TimeDisplay() {
  const [time, setTime] = React.useState(new Date())
  const [mounted, setMounted] = React.useState(false)
  const router = useRouter()
  const { chronotype } = useCalendarSettingsStore()

  React.useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 現在のクロノタイプステータスを取得
  const getCurrentChronoStatus = () => {
    if (!chronotype.enabled) {
      return {
        status: 'Off',
        label: 'Chronotype Off',
        icon: ClockIcon,
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }
    }

    const currentHour = time.getHours()
    
    const profile = chronotype.type === 'custom' && chronotype.customZones
      ? { 
          type: 'custom' as const,
          name: 'Custom Profile',
          description: 'Custom chronotype profile',
          productivityZones: chronotype.customZones 
        }
      : CHRONOTYPE_PRESETS[chronotype.type]
    
    const currentZone = getProductivityZoneForHour(profile, currentHour)
    
    if (!currentZone) {
      return {
        status: 'Unknown',
        label: 'Unknown Zone',
        icon: ClockIcon,
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }
    }

    // レベルに応じてアイコンと色を決定（設定ページのtypeIconsと統一）
    const getStatusDisplay = (level: string, label: string) => {
      switch (level) {
        case 'peak':
          return {
            status: label,
            label,
            icon: AcademicCapIcon, // focus type → AcademicCapIcon
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/20 border-green-300 dark:border-green-600'
          }
        case 'good':
          return {
            status: label,
            label,
            icon: LightBulbIcon, // creative type → LightBulbIcon
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600'
          }
        case 'moderate':
          return {
            status: label,
            label,
            icon: ClockIcon, // admin type → ClockIcon
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-300 dark:border-blue-600'
          }
        case 'low':
          return {
            status: label,
            label,
            icon: MoonIcon, // rest type → MoonIcon
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
          }
        case 'sleep':
          return {
            status: label,
            label,
            icon: () => <span className="text-base">💤</span>, // sleep type → 💤 emoji
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600'
          }
        default:
          return {
            status: label,
            label,
            icon: MoonIcon,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
          }
      }
    }

    return getStatusDisplay(currentZone.level, currentZone.label)
  }

  const chronoStatus = getCurrentChronoStatus()
  const ChronoIcon = chronoStatus.icon

  const handleChronotypeClick = () => {
    router.push('/settings/chronotype')
  }

  return (
    <div className="flex items-center gap-1.5">
      <ClockIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" data-slot="icon" />
      <div className="flex items-center gap-1">
        <div className="text-base font-bold tabular-nums text-gray-600 dark:text-gray-300">
          {mounted ? time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
          }) : '--:--:--'}
        </div>
        <button
          onClick={handleChronotypeClick}
          className={`flex items-center gap-1 px-2 py-1 border rounded-md ml-1 transition-colors cursor-pointer ${chronoStatus.bgColor}`}
          title={`${chronoStatus.label} - Go to Chronotype Settings`}
        >
          {ChronoIcon && typeof ChronoIcon === 'function' ? (
            <ChronoIcon className={`w-3 h-3 ${chronoStatus.color}`} data-slot="icon" />
          ) : null}
          <div className={`text-xs font-medium ${chronoStatus.color}`}>
            {chronoStatus.status}
          </div>
        </button>
      </div>
    </div>
  )
}