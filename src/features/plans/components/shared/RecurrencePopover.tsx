'use client'

import * as Portal from '@radix-ui/react-portal'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { RECURRENCE_OPTIONS, type RecurrenceType } from '../../constants'

import { RecurrenceDialog } from './RecurrenceDialog'

interface RecurrencePopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 繰り返しタイプが変更されたときのコールバック */
  onRepeatTypeChange: (type: RecurrenceType) => void
  triggerRef: React.RefObject<HTMLElement | null>
  recurrenceRule: string | null // RRULE文字列
  onRecurrenceRuleChange: (rrule: string | null) => void
  placement?: 'bottom' | 'right' | 'left' // ポップアップの表示位置
}

export function RecurrencePopover({
  open,
  onOpenChange,
  onRepeatTypeChange,
  triggerRef,
  recurrenceRule,
  onRecurrenceRuleChange,
  placement = 'bottom',
}: RecurrencePopoverProps) {
  const t = useTranslations()
  const popoverRef = useRef<HTMLDivElement>(null)
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  // 位置を動的に計算（useEffect内でref参照）
  useEffect(() => {
    if (!open || !triggerRef?.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const popoverWidth = 192 // w-48 = 12rem = 192px

    if (placement === 'right') {
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 4,
      })
    } else if (placement === 'left') {
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX - popoverWidth - 4,
      })
    } else {
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }
  }, [open, triggerRef, placement])

  // 外側クリックで閉じる（カスタムダイアログが開いている時は除外）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // カスタムダイアログが開いている場合は何もしない
      if (showCustomDialog) return

      const clickedTrigger = triggerRef?.current && triggerRef.current.contains(event.target as Node)
      const clickedPopover = popoverRef.current && popoverRef.current.contains(event.target as Node)

      if (!clickedTrigger && !clickedPopover) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
    return undefined
  }, [open, onOpenChange, triggerRef, showCustomDialog])

  if (!open) return null

  return (
    <>
      {!showCustomDialog && (
        <Portal.Root>
          <div
            ref={popoverRef}
            className="border-input bg-popover fixed z-[9999] w-48 rounded-md border shadow-md"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <div className="p-1">
              <button
                className="hover:bg-state-hover w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  onRepeatTypeChange('none')
                  onOpenChange(false)
                }}
                type="button"
              >
                {t('reminder.none')}
              </button>
              <div className="border-border my-1 border-t" />
              {RECURRENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className="hover:bg-state-hover w-full rounded-sm px-2 py-1.5 text-left text-sm"
                  onClick={() => {
                    onRepeatTypeChange(option.value)
                    onOpenChange(false)
                  }}
                  type="button"
                >
                  {t(option.key)}
                  {option.value === 'weekdays' && ` (${t('calendar.views.weekday')})`}
                </button>
              ))}
              <div className="border-border my-1 border-t" />
              <button
                className="hover:bg-state-hover w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  setShowCustomDialog(true)
                }}
                type="button"
              >
                {t('reminder.custom')}...
              </button>
            </div>
          </div>
        </Portal.Root>
      )}

      {/* カスタム繰り返しDialog */}
      <RecurrenceDialog
        open={showCustomDialog}
        onOpenChange={(open) => {
          setShowCustomDialog(open)
          // ダイアログが閉じたときは RecurrencePopover も閉じる
          if (!open) {
            onOpenChange(false)
          }
        }}
        value={recurrenceRule}
        triggerRef={triggerRef}
        placement={placement}
        onChange={onRecurrenceRuleChange}
      />
    </>
  )
}

// ===== 後方互換性のためのレガシーコンポーネント =====
// TODO: 全てのコンシューマーが新APIに移行後に削除

/** レガシーAPI用のラベル→タイプ変換マップ */
const LEGACY_LABEL_TO_TYPE: Record<string, RecurrenceType> = {
  '': 'none',
  毎日: 'daily',
  毎週: 'weekly',
  毎月: 'monthly',
  毎年: 'yearly',
  平日: 'weekdays',
}

/** レガシーAPI用のタイプ→ラベル変換マップ */
const LEGACY_TYPE_TO_LABEL: Record<RecurrenceType, string> = {
  none: '',
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
  yearly: '毎年',
  weekdays: '平日',
}

interface LegacyRecurrencePopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** @deprecated Use onRepeatTypeChange with RecurrenceType instead */
  onRepeatTypeChange: (type: string) => void
  triggerRef: React.RefObject<HTMLElement | null>
  recurrenceRule: string | null
  onRecurrenceRuleChange: (rrule: string | null) => void
  placement?: 'bottom' | 'right' | 'left'
}

/** @deprecated Use RecurrencePopover with RecurrenceType values instead */
export function LegacyRecurrencePopover({
  open,
  onOpenChange,
  onRepeatTypeChange,
  triggerRef,
  recurrenceRule,
  onRecurrenceRuleChange,
  placement,
}: LegacyRecurrencePopoverProps) {
  // タイプからレガシーラベルに変換してコールバック
  const handleTypeChange = (type: RecurrenceType) => {
    onRepeatTypeChange(LEGACY_TYPE_TO_LABEL[type])
  }

  return (
    <RecurrencePopover
      open={open}
      onOpenChange={onOpenChange}
      onRepeatTypeChange={handleTypeChange}
      triggerRef={triggerRef}
      recurrenceRule={recurrenceRule}
      onRecurrenceRuleChange={onRecurrenceRuleChange}
      placement={placement}
    />
  )
}
