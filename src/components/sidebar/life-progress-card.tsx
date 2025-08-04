'use client'

import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { loadLifeCounterSettings, calculateLifeCounter, type LifeCounterSettings } from '@/lib/life-counter'

interface LifeProgressCardProps {
  collapsed?: boolean
}

export function LifeProgressCard({ collapsed = false }: LifeProgressCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lifeCounterSettings, setLifeCounterSettings] = useState<LifeCounterSettings>({
    enabled: false,
    birthDate: null
  })

  // Load life counter settings on mount
  useEffect(() => {
    const settings = loadLifeCounterSettings()
    setLifeCounterSettings(settings)
    
    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent) => {
      setLifeCounterSettings(event.detail)
    }
    
    window.addEventListener('life-counter-settings-changed', handleSettingsChange as EventListener)
    
    return () => {
      window.removeEventListener('life-counter-settings-changed', handleSettingsChange as EventListener)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000 * 60 * 60) // 1時間ごとに更新

    return () => clearInterval(timer)
  }, [])

  // Life counter settings validation and progress calculation
  const getLifeProgress = () => {
    // If life counter is not enabled or no birth date is set, return default values
    if (!lifeCounterSettings.enabled || !lifeCounterSettings.birthDate) {
      return {
        progressPercentage: 0,
        isEnabled: false
      }
    }

    try {
      const lifeData = calculateLifeCounter(lifeCounterSettings.birthDate)
      const progressPercentage = Math.min((lifeData.passedDays / lifeData.totalDays) * 100, 100)
      
      return {
        progressPercentage,
        isEnabled: true,
        age: lifeData.age,
        remainingDays: lifeData.remainingDays
      }
    } catch (error) {
      console.error('Failed to calculate life progress:', error)
      return {
        progressPercentage: 0,
        isEnabled: false
      }
    }
  }

  const lifeProgress = getLifeProgress()

  if (collapsed || !lifeProgress.isEnabled) {
    return null // 折りたたみ時または無効時は非表示
  }

  // 10個のハートコンテナのような表現に変換
  const totalHearts = 10
  const progressRatio = lifeProgress.progressPercentage / 100
  const filledHearts = Math.floor(progressRatio * totalHearts)
  const partialFill = (progressRatio * totalHearts) % 1

  return (
    <div className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
            LIFE
          </span>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Lv.{lifeProgress.age} / 100
        </div>
      </div>
      
      {/* ゼルダ風ハートコンテナ */}
      <div 
        className="flex flex-wrap gap-0.5 w-full justify-between"
        role="progressbar"
        aria-valuenow={Math.round(lifeProgress.progressPercentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`人生エネルギー ${Math.round(lifeProgress.progressPercentage)}%`}
      >
        {Array.from({ length: totalHearts }, (_, i) => {
          let heartState = 'empty'
          if (i < filledHearts) {
            heartState = 'full'
          } else if (i === filledHearts && partialFill > 0) {
            heartState = 'partial'
          }

          return (
            <div
              key={i}
              className={`relative w-4 h-4 transition-all duration-300`}
              style={{
                filter: heartState === 'empty' ? 'brightness(1.1) saturate(1.2)' : 'none',
                animationDelay: `${i * 50}ms`
              }}
            >
              {heartState === 'full' ? (
                // 完全に終わった部分 - グレーのハート
                <div className="absolute inset-0 text-gray-300 dark:text-gray-600">
                  ♥
                </div>
              ) : heartState === 'partial' ? (
                // 部分的に終わった部分 - 赤とグレーの組み合わせ
                <>
                  <div className="absolute inset-0 text-red-500 drop-shadow-sm">
                    ♥
                  </div>
                  <div 
                    className="absolute inset-0 overflow-hidden transition-all duration-500"
                    style={{
                      width: `${partialFill * 100}%`
                    }}
                  >
                    <div className="text-gray-300 dark:text-gray-600">
                      ♥
                    </div>
                  </div>
                </>
              ) : (
                // 残りの人生 - 赤いハート
                <div className="absolute inset-0 text-red-500 drop-shadow-sm scale-110">
                  ♥
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* アクセシビリティ用 */}
      <div className="sr-only">
        人生エネルギー: {lifeProgress.age}歳、{Math.round(lifeProgress.progressPercentage)}% 完了
      </div>
    </div>
  )
}