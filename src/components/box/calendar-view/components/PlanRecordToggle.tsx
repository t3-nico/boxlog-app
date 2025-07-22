'use client'

import { RadioGroup } from '@headlessui/react'
import { ClipboardList, CheckCircle, Grid2X2, Columns } from 'lucide-react'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'

const modes = [
  { value: 'plan', name: '計画', icon: ClipboardList },
  { value: 'record', name: '実績', icon: CheckCircle },
  { value: 'both', name: '両方', icon: Grid2X2 },
] as const

export function PlanRecordToggle() {
  const { planRecordMode, updateSettings } = useCalendarSettingsStore()

  return (
    <RadioGroup 
      value={planRecordMode}
      onChange={(value) => updateSettings({ planRecordMode: value })}
      className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg"
    >
      <RadioGroup.Label className="sr-only">Plan/Record表示モード</RadioGroup.Label>
      {modes.map((mode) => (
        <RadioGroup.Option
          key={mode.value}
          value={mode.value}
          className={({ checked }) =>
            `${
              checked
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            } relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-150`
          }
        >
          <mode.icon className="w-4 h-4" />
          <span>{mode.name}</span>
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  )
}