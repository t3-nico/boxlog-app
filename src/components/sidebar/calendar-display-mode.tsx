'use client'

import { useState, useEffect } from 'react'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { SidebarHeading, SidebarSection } from '@/components/sidebar'
import { Checkbox } from '@/components/ui/checkbox'

export function CalendarDisplayMode() {
  const { planRecordMode, updateSettings } = useCalendarSettingsStore()
  
  // チェックボックスの状態を管理
  const [eventChecked, setEventChecked] = useState(false)
  const [logChecked, setLogChecked] = useState(false)

  // planRecordModeの変更を監視してチェックボックス状態を更新
  useEffect(() => {
    switch (planRecordMode) {
      case 'plan':
        setEventChecked(true)
        setLogChecked(false)
        break
      case 'record':
        setEventChecked(false)
        setLogChecked(true)
        break
      case 'both':
        setEventChecked(true)
        setLogChecked(true)
        break
      case 'none':
        setEventChecked(false)
        setLogChecked(false)
        break
      default:
        setEventChecked(false)
        setLogChecked(false)
    }
  }, [planRecordMode])

  // チェックボックスの変更処理
  const handleEventChange = (checked: boolean) => {
    setEventChecked(checked)
    
    if (checked && logChecked) {
      updateSettings({ planRecordMode: 'both' })
    } else if (checked && !logChecked) {
      updateSettings({ planRecordMode: 'plan' })
    } else if (!checked && logChecked) {
      updateSettings({ planRecordMode: 'record' })
    } else {
      // 両方uncheckedの場合は何も表示しない
      updateSettings({ planRecordMode: 'none' as any })
    }
  }

  const handleLogChange = (checked: boolean) => {
    setLogChecked(checked)
    
    if (eventChecked && checked) {
      updateSettings({ planRecordMode: 'both' })
    } else if (!eventChecked && checked) {
      updateSettings({ planRecordMode: 'record' })
    } else if (eventChecked && !checked) {
      updateSettings({ planRecordMode: 'plan' })
    } else {
      // 両方uncheckedの場合は何も表示しない
      updateSettings({ planRecordMode: 'none' as any })
    }
  }

  return (
    <SidebarSection>
      <SidebarHeading>Calendar</SidebarHeading>
      <div className="space-y-2 px-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="event-checkbox"
            checked={eventChecked}
            onCheckedChange={handleEventChange}
          />
          <label
            htmlFor="event-checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
          >
            Event
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="log-checkbox"
            checked={logChecked}
            onCheckedChange={handleLogChange}
          />
          <label
            htmlFor="log-checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
          >
            Log
          </label>
        </div>
      </div>
    </SidebarSection>
  )
}