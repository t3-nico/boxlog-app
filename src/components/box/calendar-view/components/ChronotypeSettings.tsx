'use client'

import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { CHRONOTYPE_PRESETS, PRODUCTIVITY_COLORS, type ChronotypeType } from '@/types/chronotype'
import { cn } from '@/lib/utils'

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

function RadioGroup({ value, onValueChange, children }: RadioGroupProps) {
  return (
    <div className="space-y-2" role="radiogroup">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { selectedValue: value, onValueChange })
          : child
      )}
    </div>
  )
}

interface RadioGroupItemProps {
  value: string
  id: string
  selectedValue?: string
  onValueChange?: (value: string) => void
}

function RadioGroupItem({ value, id, selectedValue, onValueChange }: RadioGroupItemProps) {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={selectedValue === value}
      onChange={() => onValueChange?.(value)}
      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
    />
  )
}

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min: number
  max: number
  step: number
}

function Slider({ value, onValueChange, min, max, step }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
    />
  )
}

export function ChronotypeSettings() {
  const { chronotype, updateSettings } = useCalendarSettingsStore()
  const [selectedType, setSelectedType] = useState<ChronotypeType>(chronotype.type)
  
  const handleTypeChange = (type: ChronotypeType) => {
    setSelectedType(type)
    updateSettings({ 
      chronotype: { 
        ...chronotype, 
        type 
      } 
    })
  }

  const handleToggle = (enabled: boolean) => {
    updateSettings({ 
      chronotype: { 
        ...chronotype, 
        enabled 
      } 
    })
  }


  const handleOpacityChange = (opacity: number) => {
    updateSettings({ 
      chronotype: { 
        ...chronotype, 
        opacity 
      } 
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chronotype Display</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Show optimal work times based on your biological rhythm
          </p>
        </div>
        <Switch
          checked={chronotype.enabled}
          onCheckedChange={handleToggle}
        />
      </div>
      
      {chronotype.enabled && (
        <>
          {/* Chronotype Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Select Chronotype
            </label>
            <RadioGroup value={selectedType} onValueChange={(value) => handleTypeChange(value as ChronotypeType)}>
              {Object.entries(CHRONOTYPE_PRESETS)
                .filter(([key]) => key !== 'custom') // Custom will be implemented later
                .map(([key, preset]) => (
                <div key={key} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value={key} id={key} />
                  <label htmlFor={key} className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900 dark:text-white">{preset.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{preset.description}</div>
                    
                    {/* プレビュー */}
                    <div className="mt-2 h-4 flex rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                      {preset.productivityZones.map((zone, i) => {
                        const duration = zone.endHour > zone.startHour 
                          ? zone.endHour - zone.startHour 
                          : (24 - zone.startHour) + zone.endHour
                        const width = (duration / 24) * 100
                        
                        const colorMapping = PRODUCTIVITY_COLORS[zone.color as keyof typeof PRODUCTIVITY_COLORS]
                        const bgColor = colorMapping?.bg || zone.color
                        
                        return (
                          <div
                            key={i}
                            style={{ 
                              width: `${width}%`,
                              backgroundColor: zone.level === 'sleep' 
                                ? undefined 
                                : bgColor,
                              backgroundImage: zone.level === 'sleep' 
                                ? `linear-gradient(to bottom, ${colorMapping?.border || bgColor} 60%, transparent 60%)`
                                : undefined,
                              backgroundSize: zone.level === 'sleep' ? '100% 4px' : undefined,
                              backgroundRepeat: zone.level === 'sleep' ? 'repeat-y' : undefined,
                            }}
                            title={`${zone.startHour}:00-${zone.endHour}:00 ${zone.label}${zone.level === 'sleep' ? ' 💤' : ''}`}
                          />
                        )
                      })}
                    </div>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Opacity */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Display Opacity: {chronotype.opacity}%
            </label>
            <Slider
              value={[chronotype.opacity]}
              onValueChange={([value]) => handleOpacityChange(value)}
              min={10}
              max={100}
              step={10}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Light</span>
              <span>Dark</span>
            </div>
          </div>

        </>
      )}
    </div>
  )
}