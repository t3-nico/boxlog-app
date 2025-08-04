'use client'

import { useState, useEffect } from 'react'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { SidebarHeading, SidebarSection } from '@/components/sidebar'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronRight } from 'lucide-react'

export function CalendarDisplayMode() {
  const { planRecordMode, updateSettings } = useCalendarSettingsStore()
  
  // チェックボックスの状態を管理
  const [eventChecked, setEventChecked] = useState(false)
  const [logChecked, setLogChecked] = useState(false)
  
  // 折りたたみ状態を管理
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      {/* クリック可能な見出し */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full text-left group hover:bg-accent/50 rounded-md px-2 py-1 -mx-2 -my-1 transition-colors"
      >
        <SidebarHeading>Calendar</SidebarHeading>
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 transition-all duration-200 group-hover:scale-110" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 transition-all duration-200 group-hover:scale-110" />
        )}
      </button>
      
      {/* 折りたたみ可能なコンテンツ */}
      {!isCollapsed && (
        <div className="space-y-2 px-2 mt-2">
          <div className="flex items-center space-x-2 hover:bg-accent/30 rounded-md px-2 py-1 -mx-2 transition-colors cursor-pointer group">
            <Checkbox
              id="event-checkbox"
              checked={eventChecked}
              onCheckedChange={handleEventChange}
              className="transition-transform group-hover:scale-110"
            />
            <label
              htmlFor="event-checkbox"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 cursor-pointer flex-1 transition-colors group-hover:text-gray-900 dark:group-hover:text-gray-100"
            >
              Event
            </label>
          </div>
          <div className="flex items-center space-x-2 hover:bg-accent/30 rounded-md px-2 py-1 -mx-2 transition-colors cursor-pointer group">
            <Checkbox
              id="log-checkbox"
              checked={logChecked}
              onCheckedChange={handleLogChange}
              className="transition-transform group-hover:scale-110"
            />
            <label
              htmlFor="log-checkbox"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 cursor-pointer flex-1 transition-colors group-hover:text-gray-900 dark:group-hover:text-gray-100"
            >
              Log
            </label>
          </div>
        </div>
      )}
    </SidebarSection>
  )
}