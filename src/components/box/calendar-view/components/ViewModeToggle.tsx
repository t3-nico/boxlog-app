'use client'

import { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { 
  ClipboardList, 
  CheckCircle, 
  Columns 
} from 'lucide-react'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

const modes = [
  { 
    value: 'both' as const, 
    name: '両方', 
    shortName: '両方',
    icon: Columns,
    description: '予定と記録を左右に表示'
  },
  { 
    value: 'plan' as const, 
    name: '予定のみ', 
    shortName: '予定',
    icon: ClipboardList,
    description: '予定を全幅表示'
  },
  { 
    value: 'record' as const, 
    name: '記録のみ', 
    shortName: '記録',
    icon: CheckCircle,
    description: '記録を全幅表示'
  },
] as const

interface ViewModeToggleProps {
  size?: 'sm' | 'md'
  showLabels?: boolean
  className?: string
}

export function ViewModeToggle({ 
  size = 'md', 
  showLabels = true,
  className 
}: ViewModeToggleProps) {
  const { planRecordMode, updateSettings } = useCalendarSettingsStore()
  const [hoveredMode, setHoveredMode] = useState<string | null>(null)

  const isSmall = size === 'sm'

  const handleKeyDown = (event: React.KeyboardEvent, value: typeof planRecordMode) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      updateSettings({ planRecordMode: value })
    }
  }

  return (
    <RadioGroup 
      value={planRecordMode}
      onChange={(value) => updateSettings({ planRecordMode: value })}
      className={cn(
        "flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden",
        isSmall ? "p-0.5" : "p-1",
        className
      )}
    >
      <RadioGroup.Label className="sr-only">表示モード切替</RadioGroup.Label>
      {modes.map((mode) => (
        <RadioGroup.Option
          key={mode.value}
          value={mode.value}
          className={({ checked }) =>
            cn(
              "relative flex items-center gap-2 cursor-pointer transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              checked
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600',
              isSmall ? "px-2 py-1" : "px-3 py-2"
            )
          }
          onMouseEnter={() => setHoveredMode(mode.value)}
          onMouseLeave={() => setHoveredMode(null)}
          onKeyDown={(event) => handleKeyDown(event, mode.value)}
        >
          {({ checked }) => (
            <>
              <mode.icon className={cn(
                "flex-shrink-0 transition-transform duration-150",
                checked && "scale-110",
                isSmall ? "w-4 h-4" : "w-4 h-4"
              )} />
              {showLabels && (
                <span className={cn(
                  "font-medium whitespace-nowrap transition-all duration-150",
                  checked && "font-semibold",
                  isSmall ? "text-xs" : "text-sm"
                )}>
                  {isSmall ? mode.shortName : mode.name}
                </span>
              )}
              
              {/* ツールチップ（アイコンのみ時） */}
              {!showLabels && hoveredMode === mode.value && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap z-50">
                  {mode.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              )}
              
              {/* アクセシビリティ用の説明 */}
              <div className="sr-only">
                {mode.description}
                {checked && ' - 現在選択中'}
              </div>
            </>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  )
}