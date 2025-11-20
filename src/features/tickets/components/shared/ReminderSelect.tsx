'use client'

import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// 通知オプションの定義（UI表示文字列）
export const REMINDER_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '開始時刻', label: 'イベント開始時刻' },
  { value: '10分前', label: '10分前' },
  { value: '30分前', label: '30分前' },
  { value: '1時間前', label: '1時間前' },
  { value: '1日前', label: '1日前' },
  { value: '1週間前', label: '1週間前' },
] as const

interface ReminderSelectProps {
  value: string // UI表示文字列（'', '開始時刻', '10分前', ...）
  onChange: (value: string) => void
  variant?: 'inspector' | 'compact' | 'button' // inspectorスタイル、compactスタイル、または buttonスタイル
}

/**
 * 通知選択コンポーネント（ボタン + カスタムポップオーバー）
 *
 * Inspector、Card、Tableの全てで共通して使用
 * - inspector: Inspectorで使用する横長スタイル（Bell + テキスト）
 * - compact: Card/Tableで使用するコンパクトスタイル（Bell のみ）
 * - button: Card/Tableポップオーバー内で使用する標準ボタンスタイル（繰り返しと同じ）
 */
export function ReminderSelect({ value, onChange, variant = 'inspector' }: ReminderSelectProps) {
  const reminderRef = useRef<HTMLDivElement>(null)
  const [showPopover, setShowPopover] = useState(false)

  // 外側クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reminderRef.current && !reminderRef.current.contains(event.target as Node)) {
        setShowPopover(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 通知が設定されているかどうか
  const hasReminder = value && value !== ''

  // 表示ラベルを取得
  const getDisplayLabel = () => {
    if (!value || value === '') return 'なし'
    const option = REMINDER_OPTIONS.find((opt) => opt.value === value)
    return option?.label || value
  }

  return (
    <div className="relative" ref={reminderRef}>
      {variant === 'button' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowPopover(!showPopover)
          }}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-fit items-center gap-1 rounded-md border bg-transparent px-2 py-0 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{getDisplayLabel()}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 opacity-50"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className={hasReminder ? 'text-foreground h-8 gap-2 px-2' : 'text-muted-foreground h-8 gap-2 px-2'}
          type="button"
          onClick={() => setShowPopover(!showPopover)}
        >
          <Bell className="h-4 w-4" />
          {variant === 'inspector' && <span className="text-sm">{value || '通知'}</span>}
        </Button>
      )}

      {showPopover && (
        <div className="border-input bg-popover absolute top-10 left-0 z-50 w-56 rounded-md border shadow-md">
          <div className="p-1">
            {REMINDER_OPTIONS.map((option, index) => (
              <>
                {index === 1 && <div key="separator" className="border-border my-1 border-t" />}
                <button
                  key={option.value}
                  className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                  onClick={() => {
                    onChange(option.value)
                    setShowPopover(false)
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
