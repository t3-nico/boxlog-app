'use client'

import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ReminderPopoverProps {
  reminderType: string
  onReminderTypeChange: (type: string) => void
}

export function ReminderPopover({ reminderType, onReminderTypeChange }: ReminderPopoverProps) {
  const reminderRef = useRef<HTMLDivElement>(null)
  const [showReminder, setShowReminder] = useState(false)

  // 外側クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reminderRef.current && !reminderRef.current.contains(event.target as Node)) {
        setShowReminder(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 通知が設定されているかどうか
  const hasReminder = reminderType && reminderType !== ''

  return (
    <div className="relative" ref={reminderRef}>
      <Button
        variant="ghost"
        size="sm"
        className={hasReminder ? 'text-foreground h-8 gap-2 px-2' : 'text-muted-foreground h-8 gap-2 px-2'}
        type="button"
        onClick={() => setShowReminder(!showReminder)}
      >
        <Bell className="h-4 w-4" />
        <span className="text-sm">{reminderType || '通知'}</span>
      </Button>
      {/* リマインダー設定ポップアップ */}
      {showReminder && (
        <div className="border-input bg-popover absolute top-10 left-0 z-50 w-56 rounded-md border shadow-md">
          <div className="p-1">
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onReminderTypeChange('')
                setShowReminder(false)
              }}
              type="button"
            >
              選択しない
            </button>
            <div className="border-border my-1 border-t" />
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onReminderTypeChange('開始時刻')
                setShowReminder(false)
              }}
              type="button"
            >
              イベント開始時刻
            </button>
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onReminderTypeChange('10分前')
                setShowReminder(false)
              }}
              type="button"
            >
              10分前
            </button>
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onReminderTypeChange('30分前')
                setShowReminder(false)
              }}
              type="button"
            >
              30分前
            </button>
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onReminderTypeChange('1時間前')
                setShowReminder(false)
              }}
              type="button"
            >
              1時間前
            </button>
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onReminderTypeChange('1日前')
                setShowReminder(false)
              }}
              type="button"
            >
              1日前
            </button>
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onReminderTypeChange('1週間前')
                setShowReminder(false)
              }}
              type="button"
            >
              1週間前
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
