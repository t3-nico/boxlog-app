'use client'

import * as Portal from '@radix-ui/react-portal'
import { useEffect, useRef, useState } from 'react'

import { RecurrenceDialog } from './RecurrenceDialog'

interface RecurrencePopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRepeatTypeChange: (type: string) => void
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
                className="hover:bg-foreground/8 w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  onRepeatTypeChange('')
                  onOpenChange(false)
                }}
                type="button"
              >
                選択しない
              </button>
              <div className="border-border my-1 border-t" />
              <button
                className="hover:bg-foreground/8 w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  onRepeatTypeChange('毎日')
                  onOpenChange(false)
                }}
                type="button"
              >
                毎日
              </button>
              <button
                className="hover:bg-foreground/8 w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  onRepeatTypeChange('毎週')
                  onOpenChange(false)
                }}
                type="button"
              >
                毎週
              </button>
              <button
                className="hover:bg-foreground/8 w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  onRepeatTypeChange('毎月')
                  onOpenChange(false)
                }}
                type="button"
              >
                毎月
              </button>
              <button
                className="hover:bg-foreground/8 w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  onRepeatTypeChange('毎年')
                  onOpenChange(false)
                }}
                type="button"
              >
                毎年
              </button>
              <button
                className="hover:bg-foreground/8 w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  onRepeatTypeChange('平日')
                  onOpenChange(false)
                }}
                type="button"
              >
                平日（月〜金）
              </button>
              <div className="border-border my-1 border-t" />
              <button
                className="hover:bg-foreground/8 w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  setShowCustomDialog(true)
                }}
                type="button"
              >
                カスタム...
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
