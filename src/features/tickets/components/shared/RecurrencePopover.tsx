'use client'

import { Button } from '@/components/ui/button'
import { Repeat } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface RecurrencePopoverProps {
  repeatType: string
  onRepeatTypeChange: (type: string) => void
}

export function RecurrencePopover({ repeatType, onRepeatTypeChange }: RecurrencePopoverProps) {
  const repeatRef = useRef<HTMLDivElement>(null)
  const [showRepeat, setShowRepeat] = useState(false)

  // 外側クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (repeatRef.current && !repeatRef.current.contains(event.target as Node)) {
        setShowRepeat(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={repeatRef}>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground h-8 gap-2 px-2"
        type="button"
        onClick={() => setShowRepeat(!showRepeat)}
      >
        <Repeat className="h-4 w-4" />
        <span className="text-sm">{repeatType || '繰り返し'}</span>
      </Button>
      {/* リピート設定ポップアップ */}
      {showRepeat && (
        <div className="border-input bg-popover absolute top-10 left-0 z-50 w-48 rounded-md border shadow-md">
          <div className="p-1">
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onRepeatTypeChange('')
                setShowRepeat(false)
              }}
              type="button"
            >
              選択しない
            </button>
            <div className="border-border my-1 border-t" />
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onRepeatTypeChange('毎日')
                setShowRepeat(false)
              }}
              type="button"
            >
              毎日
            </button>
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onRepeatTypeChange('毎週')
                setShowRepeat(false)
              }}
              type="button"
            >
              毎週
            </button>
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onRepeatTypeChange('毎月')
                setShowRepeat(false)
              }}
              type="button"
            >
              毎月
            </button>
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onRepeatTypeChange('毎年')
                setShowRepeat(false)
              }}
              type="button"
            >
              毎年
            </button>
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onRepeatTypeChange('平日')
                setShowRepeat(false)
              }}
              type="button"
            >
              平日（月〜金）
            </button>
            <div className="border-border my-1 border-t" />
            <button
              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
              onClick={() => {
                onRepeatTypeChange('カスタム')
                setShowRepeat(false)
              }}
              type="button"
            >
              カスタム...
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
