'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { HOUR_HEIGHT } from '@/features/calendar/constants/calendar-constants'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

interface EventResizeHandleProps {
  type: 'start' | 'end'
  eventId: string
  currentTime: string
  onTimeChange: (newTime: string) => void
  minDuration?: number // 分単位（デフォルト30分）
  maxTime?: string // 最大時刻（例: "23:45"）
  otherTime?: string // もう一方の時刻（制限用）
  className?: string
}

interface ResizeState {
  isResizing: boolean
  startY: number
  initialTime: string
  currentPreviewTime: string | null
  isInvalid: boolean
}

// ヘルパー: 時刻バリデーション
const useTimeValidation = (type: 'start' | 'end', otherTime: string | undefined, minDuration: number) => {
  const timeToMinutes = useCallback((time: string): number => {
    const [hours = 0, minutes = 0] = time.split(':').map(Number)
    return hours * 60 + minutes
  }, [])

  const isValidTime = useCallback(
    (newMinutes: number): boolean => {
      if (!otherTime) return true

      const otherMinutes = timeToMinutes(otherTime)

      if (type === 'start') {
        // 開始時刻は終了時刻より最小時間分早くある必要がある
        return newMinutes + minDuration <= otherMinutes
      } else {
        // 終了時刻は開始時刻より最小時間分遅くある必要がある
        return newMinutes >= otherMinutes + minDuration
      }
    },
    [type, otherTime, minDuration, timeToMinutes]
  )

  return { timeToMinutes, isValidTime }
}

// Custom hook: キーボードイベント処理
function useKeyboardEvents(
  isResizing: boolean,
  setIsShiftPressed: (pressed: boolean) => void,
  setResizeState: React.Dispatch<React.SetStateAction<ResizeState>>
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
      if (e.key === 'Escape' && isResizing) {
        setResizeState((prev) => ({
          ...prev,
          isResizing: false,
          currentPreviewTime: null,
          isInvalid: false,
        }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isResizing, setIsShiftPressed, setResizeState])
}

// Custom hook: マウス/タッチイベント処理
function useMouseTouchEvents(
  resizeState: ResizeState,
  setResizeState: React.Dispatch<React.SetStateAction<ResizeState>>,
  onTimeChange: (time: string) => void,
  type: 'start' | 'end',
  maxTime: string,
  snapTime: (minutes: number) => number,
  timeToMinutes: (time: string) => number,
  minutesToTime: (minutes: number) => string,
  isValidTime: (minutes: number) => boolean
) {
  useEffect(() => {
    if (!resizeState.isResizing) return

    const handleMove = (clientY: number) => {
      const deltaY = clientY - resizeState.startY
      const deltaMinutes = Math.round(deltaY / (HOUR_HEIGHT / 60))

      const initialMinutes = timeToMinutes(resizeState.initialTime)
      let newMinutes = initialMinutes + (type === 'end' ? deltaMinutes : -deltaMinutes)

      // スナップ処理
      newMinutes = snapTime(newMinutes)

      // 時刻の範囲制限
      const maxMinutes = timeToMinutes(maxTime)
      newMinutes = Math.max(0, Math.min(newMinutes, maxMinutes))

      const newTime = minutesToTime(newMinutes)
      const finalMinutes = timeToMinutes(newTime)
      const isValid = isValidTime(finalMinutes)

      setResizeState((prev) => ({
        ...prev,
        currentPreviewTime: newTime,
        isInvalid: !isValid,
      }))
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleMove(e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientY)
      }
    }

    const handleEnd = () => {
      if (resizeState.currentPreviewTime && !resizeState.isInvalid) {
        onTimeChange(resizeState.currentPreviewTime)
      }

      setResizeState((prev) => ({
        ...prev,
        isResizing: false,
        currentPreviewTime: null,
        isInvalid: false,
      }))
    }

    // イベントリスナーを追加
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [resizeState, onTimeChange, type, maxTime, snapTime, timeToMinutes, minutesToTime, isValidTime, setResizeState])
}

// 子コンポーネント: リサイズハンドル本体
const ResizeHandleBody = ({
  type,
  className,
  resizeState,
  handleRef,
  handleMouseDown,
  handleTouchStart,
  currentTime,
  maxTime,
  onTimeChange,
  timeToMinutes,
}: {
  type: 'start' | 'end'
  className?: string
  resizeState: ResizeState
  handleRef: React.RefObject<HTMLDivElement>
  handleMouseDown: (e: React.MouseEvent) => void
  handleTouchStart: (e: React.TouchEvent) => void
  currentTime: string
  maxTime: string
  onTimeChange: (time: string) => void
  timeToMinutes: (time: string) => number
}) => (
  <div
    ref={handleRef}
    className={cn(
      'group absolute right-0 left-0 z-30',
      'transition-colors duration-200 hover:bg-white/20',
      'focus:ring-ring focus:ring-2 focus:outline-none focus:ring-inset',
      resizeState.isResizing && 'bg-white/30',
      type === 'start' ? 'top-0 cursor-ns-resize' : 'bottom-0 cursor-ns-resize',
      className
    )}
    style={{
      height: '8px',
      marginTop: type === 'start' ? '-4px' : '0',
      marginBottom: type === 'end' ? '-4px' : '0',
    }}
    title={`Drag to ${type === 'start' ? 'change start time' : 'resize duration'}`}
    role="slider"
    tabIndex={0}
    aria-label={`${type === 'start' ? '開始時間' : '終了時間'}をリサイズ (矢印キーで調整、Shift+矢印で大きく調整)`}
    aria-orientation="vertical"
    aria-valuenow={timeToMinutes(currentTime)}
    aria-valuemin={0}
    aria-valuemax={timeToMinutes(maxTime)}
    onMouseDown={handleMouseDown}
    onTouchStart={handleTouchStart}
    onKeyDown={(e) => {
      e.preventDefault()

      const [hours = 0, minutes = 0] = currentTime.split(':').map(Number)
      let newHours = hours
      let newMinutes = minutes

      // キーボード操作の処理
      switch (e.key) {
        case 'ArrowUp':
          if (e.shiftKey) {
            // Shift + ↑: 1時間早める
            newHours = Math.max(0, newHours - 1)
          } else {
            // ↑: 15分早める
            newMinutes -= 15
            if (newMinutes < 0) {
              newMinutes = 45
              newHours = Math.max(0, newHours - 1)
            }
          }
          break

        case 'ArrowDown':
          if (e.shiftKey) {
            // Shift + ↓: 1時間遅らせる
            newHours = Math.min(23, newHours + 1)
          } else {
            // ↓: 15分遅らせる
            newMinutes += 15
            if (newMinutes >= 60) {
              newMinutes = 0
              newHours = Math.min(23, newHours + 1)
            }
          }
          break

        case 'Enter':
        case ' ':
          // 現在の時間で確定（何もしない）
          return

        case 'Escape':
          // フォーカスを外す
          e.currentTarget.blur()
          return

        default:
          return
      }

      // 新しい時間を適用
      const newTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
      onTimeChange(newTime)
    }}
  >
    {/* 視覚的インジケーター */}
    <div
      className={cn(
        'absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 transition-all duration-200',
        resizeState.isResizing
          ? resizeState.isInvalid
            ? 'bg-red-400'
            : 'bg-blue-400'
          : 'bg-white/40 group-hover:bg-white/60'
      )}
    />

    {/* ドット（中央） */}
    <div
      className={cn(
        'absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200',
        resizeState.isResizing
          ? resizeState.isInvalid
            ? 'bg-red-400'
            : 'bg-blue-400'
          : 'bg-white/60 group-hover:bg-white/80'
      )}
    />
  </div>
)

// 子コンポーネント: リサイズツールチップ
const ResizeTooltip = ({
  resizeState,
  displayTime,
  type,
  isShiftPressed,
  t,
}: {
  resizeState: ResizeState
  displayTime: string
  type: 'start' | 'end'
  isShiftPressed: boolean
  t: (key: string) => string
}) => {
  if (!resizeState.isResizing || !resizeState.currentPreviewTime) return null

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-[9999] rounded-md px-3 py-2 text-sm font-medium',
        '-translate-x-1/2 transform border shadow-lg',
        resizeState.isInvalid ? 'border-destructive bg-destructive text-destructive-foreground' : 'border-border bg-popover text-popover-foreground'
      )}
      style={{
        left: '50%',
        top: `${resizeState.startY - 40}px`,
      }}
    >
      {displayTime}
      {resizeState.isInvalid ? (
        <div className="mt-1 text-xs opacity-90">
          {type === 'start' ? t('calendar.resize.tooCloseToEnd') : t('calendar.resize.tooCloseToStart')}
        </div>
      ) : null}
      {isShiftPressed ? <div className="mt-1 text-xs opacity-75">5min intervals</div> : null}
    </div>
  )
}

// 子コンポーネント: リサイズ境界線
const ResizeBorder = ({ resizeState }: { resizeState: ResizeState }) => {
  if (!resizeState.isResizing) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-md transition-all duration-200',
        'border-2',
        resizeState.isInvalid ? 'border-red-400' : 'border-blue-400'
      )}
      style={{ zIndex: 25 }}
    />
  )
}

export const PlanResizeHandle = ({
  type,
  eventId: _eventId,
  currentTime,
  onTimeChange,
  minDuration = 30,
  maxTime = '23:45',
  otherTime,
  className,
}: EventResizeHandleProps) => {
  const { t } = useI18n()
  const snapInterval = useCalendarSettingsStore((state) => state.snapInterval)
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    startY: 0,
    initialTime: currentTime,
    currentPreviewTime: null,
    isInvalid: false,
  })
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const handleRef = useRef<HTMLDivElement>(null)

  // ヘルパーフックを使用
  const { timeToMinutes, isValidTime } = useTimeValidation(type, otherTime, minDuration)

  // 分を時刻文字列に変換
  const minutesToTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }, [])

  // スナップ処理
  const snapTime = useCallback(
    (minutes: number): number => {
      const interval = isShiftPressed ? 5 : snapInterval
      return Math.round(minutes / interval) * interval
    },
    [snapInterval, isShiftPressed]
  )

  // キーボードイベントの処理
  useKeyboardEvents(resizeState.isResizing, setIsShiftPressed, setResizeState)

  // マウス/タッチイベントの処理
  useMouseTouchEvents(
    resizeState,
    setResizeState,
    onTimeChange,
    type,
    maxTime,
    snapTime,
    timeToMinutes,
    minutesToTime,
    isValidTime
  )

  const handleStart = useCallback(
    (clientY: number) => {
      setResizeState({
        isResizing: true,
        startY: clientY,
        initialTime: currentTime,
        currentPreviewTime: null,
        isInvalid: false,
      })
    },
    [currentTime]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      handleStart(e.clientY)
    },
    [handleStart]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientY)
      }
    },
    [handleStart]
  )

  const displayTime = resizeState.currentPreviewTime || currentTime

  return (
    <>
      <ResizeHandleBody
        type={type}
        className={className}
        resizeState={resizeState}
        handleRef={handleRef}
        handleMouseDown={handleMouseDown}
        handleTouchStart={handleTouchStart}
        currentTime={currentTime}
        maxTime={maxTime}
        onTimeChange={onTimeChange}
        timeToMinutes={timeToMinutes}
      />

      <ResizeTooltip
        resizeState={resizeState}
        displayTime={displayTime}
        type={type}
        isShiftPressed={isShiftPressed}
        t={t}
      />

      <ResizeBorder resizeState={resizeState} />
    </>
  )
}

// 後方互換性のためのエイリアス
/** @deprecated Use PlanResizeHandle instead */
export const EventResizeHandle = PlanResizeHandle
