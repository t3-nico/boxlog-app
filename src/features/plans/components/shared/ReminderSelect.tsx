'use client'

import { Bell } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

import { REMINDER_MINUTES, REMINDER_OPTIONS } from '../../constants'

interface ReminderSelectProps {
  /** リマインダー値（分数） */
  value: number | null
  /** 値が変更されたときのコールバック */
  onChange: (value: number | null) => void
  /** 表示バリアント */
  variant?: 'inspector' | 'compact' | 'button'
  /** 無効化フラグ */
  disabled?: boolean
}

/**
 * 通知選択コンポーネント（ボタン + カスタムポップオーバー）
 *
 * Inspector、Card、Tableの全てで共通して使用
 * - inspector: Inspectorで使用する横長スタイル（Bell + テキスト）
 * - compact: Card/Tableで使用するコンパクトスタイル（Bell のみ）
 * - button: Card/Tableポップオーバー内で使用する標準ボタンスタイル
 */
export function ReminderSelect({ value, onChange, variant = 'inspector', disabled = false }: ReminderSelectProps) {
  const t = useTranslations()
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
  const hasReminder = value !== null

  // 表示ラベルを取得
  const getDisplayLabel = () => {
    if (value === null) return t('reminder.none')
    const option = REMINDER_OPTIONS.find((opt) => opt.value === value)
    return option ? t(option.key) : t('reminder.custom')
  }

  // オプションリスト
  const options = [
    { value: null, key: 'reminder.none' },
    ...REMINDER_OPTIONS,
  ] as const

  return (
    <div className="relative" ref={reminderRef}>
      {variant === 'button' ? (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) {
              setShowPopover(!showPopover)
            }
          }}
          className="border-border bg-secondary text-secondary-foreground hover:bg-state-hover focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-fit items-center gap-1 rounded-md border px-2 py-0 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
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
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setShowPopover(!showPopover)
            }
          }}
        >
          <Bell className="h-4 w-4" />
          {variant === 'inspector' && <span className="text-sm">{getDisplayLabel()}</span>}
        </Button>
      )}

      {showPopover && !disabled && (
        <div className="border-input bg-popover absolute top-10 left-0 z-50 w-56 rounded-md border shadow-md">
          <div className="p-1">
            {options.map((option, index) => (
              <div key={option.key}>
                {index === 1 && <div className="border-border my-1 border-t" />}
                <button
                  className="hover:bg-state-hover w-full rounded-sm px-2 py-1.5 text-left text-sm"
                  onClick={() => {
                    onChange(option.value)
                    setShowPopover(false)
                  }}
                  type="button"
                >
                  {t(option.key)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ===== 後方互換性のためのレガシーコンポーネント =====
// TODO: 全てのコンシューマーが新APIに移行後に削除

/** @deprecated Use ReminderSelect with number values instead */
export const REMINDER_OPTIONS_LEGACY = [
  { value: '', label: '選択しない' },
  { value: '開始時刻', label: 'イベント開始時刻' },
  { value: '10分前', label: '10分前' },
  { value: '30分前', label: '30分前' },
  { value: '1時間前', label: '1時間前' },
  { value: '1日前', label: '1日前' },
  { value: '1週間前', label: '1週間前' },
] as const

/** レガシーAPI用のラベル→分数変換マップ */
const LEGACY_LABEL_TO_MINUTES: Record<string, number | null> = {
  '': null,
  開始時刻: REMINDER_MINUTES.AT_START,
  '10分前': REMINDER_MINUTES.MIN_10,
  '30分前': REMINDER_MINUTES.MIN_30,
  '1時間前': REMINDER_MINUTES.HOUR_1,
  '1日前': REMINDER_MINUTES.DAY_1,
  '1週間前': REMINDER_MINUTES.WEEK_1,
}

/** レガシーAPI用の分数→ラベル変換マップ */
const LEGACY_MINUTES_TO_LABEL: Record<number, string> = {
  [REMINDER_MINUTES.AT_START]: '開始時刻',
  [REMINDER_MINUTES.MIN_10]: '10分前',
  [REMINDER_MINUTES.MIN_30]: '30分前',
  [REMINDER_MINUTES.HOUR_1]: '1時間前',
  [REMINDER_MINUTES.DAY_1]: '1日前',
  [REMINDER_MINUTES.WEEK_1]: '1週間前',
}

interface LegacyReminderSelectProps {
  value: string
  onChange: (value: string) => void
  variant?: 'inspector' | 'compact' | 'button'
  disabled?: boolean
}

/** @deprecated Use ReminderSelect with number values instead */
export function LegacyReminderSelect({ value, onChange, variant, disabled }: LegacyReminderSelectProps) {
  // レガシーラベルを分数に変換
  const numericValue = LEGACY_LABEL_TO_MINUTES[value] ?? null

  // 分数からレガシーラベルに変換してコールバック
  const handleChange = (minutes: number | null) => {
    if (minutes === null) {
      onChange('')
    } else {
      onChange(LEGACY_MINUTES_TO_LABEL[minutes] ?? '')
    }
  }

  return <ReminderSelect value={numericValue} onChange={handleChange} variant={variant} disabled={disabled} />
}
