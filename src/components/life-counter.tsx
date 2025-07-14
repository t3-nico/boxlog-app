'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  loadLifeCounterSettings, 
  calculateLifeCounter, 
  formatRemainingDays,
  type LifeCounterSettings 
} from '@/lib/life-counter'
import { Heart } from 'lucide-react'

export function LifeCounter() {
  const [settings, setSettings] = useState<LifeCounterSettings | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  // Load settings and update every hour to recalculate daily
  useEffect(() => {
    const loadSettings = () => {
      const lifeCounterSettings = loadLifeCounterSettings()
      setSettings(lifeCounterSettings)
    }

    loadSettings()

    // Listen for storage changes (when settings are updated in other tabs or components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'life-counter-settings') {
        loadSettings()
      }
    }

    // Listen for custom storage events from same tab
    const handleCustomStorageChange = () => {
      loadSettings()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('life-counter-settings-changed', handleCustomStorageChange)

    // Update current time every hour for daily recalculation
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      loadSettings() // Reload settings in case they changed
    }, 60 * 60 * 1000) // 1 hour

    return () => {
      clearInterval(timer)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('life-counter-settings-changed', handleCustomStorageChange)
    }
  }, [])

  const handleClick = () => {
    router.push('/settings/preferences')
  }

  // Don't render if not loaded yet, disabled, or no birth date set
  if (!settings || !settings.enabled || !settings.birthDate) {
    return null
  }

  const lifeData = calculateLifeCounter(settings.birthDate)
  const displayText = formatRemainingDays(lifeData.remainingDays)

  return (
    <button
      onClick={handleClick}
      className="group flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer border border-red-200 dark:border-red-700"
      title={`${lifeData.isOverLifeExpectancy ? 'Celebrating life beyond 100!' : `Age ${lifeData.age} - Click to adjust settings`}`}
    >
      <Heart className="w-4 h-4 text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform" data-slot="icon" />
      <div className="flex items-center">
        <div className="text-sm font-semibold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
          {displayText}
        </div>
      </div>
    </button>
  )
}