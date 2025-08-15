'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { HOUR_HEIGHT } from '../../../constants/calendar-constants'
import { format, addMinutes, startOfDay } from 'date-fns'

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

export function EventResizeHandle({
  type,
  eventId,
  currentTime,
  onTimeChange,
  minDuration = 30,
  maxTime = "23:45",
  otherTime,
  className
}: EventResizeHandleProps) {
  const snapInterval = useCalendarSettingsStore((state) => state.snapInterval)
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    startY: 0,
    initialTime: currentTime,
    currentPreviewTime: null,
    isInvalid: false
  })
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const handleRef = useRef<HTMLDivElement>(null)

  // 時刻文字列を分に変換
  const timeToMinutes = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }, [])

  // 分を時刻文字列に変換
  const minutesToTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }, [])

  // スナップ処理
  const snapTime = useCallback((minutes: number): number => {
    const interval = isShiftPressed ? 5 : snapInterval
    return Math.round(minutes / interval) * interval
  }, [snapInterval, isShiftPressed])

  // 時刻の妥当性チェック
  const validateTime = useCallback((newTime: string): boolean => {
    if (!otherTime) return true

    const newMinutes = timeToMinutes(newTime)
    const otherMinutes = timeToMinutes(otherTime)

    if (type === 'start') {
      // 開始時刻は終了時刻より最小時間分早くある必要がある
      return newMinutes <= otherMinutes - minDuration
    } else {
      // 終了時刻は開始時刻より最小時間分遅くある必要がある
      return newMinutes >= otherMinutes + minDuration
    }
  }, [type, otherTime, minDuration, timeToMinutes])

  // キーボードイベントの処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
      if (e.key === 'Escape' && resizeState.isResizing) {
        // ESCキーでキャンセル
        setResizeState(prev => ({
          ...prev,
          isResizing: false,
          currentPreviewTime: null,
          isInvalid: false
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
  }, [resizeState.isResizing])

  // マウス/タッチイベントの処理
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
      const isValid = validateTime(newTime)
      
      setResizeState(prev => ({
        ...prev,
        currentPreviewTime: newTime,
        isInvalid: !isValid
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
      
      setResizeState(prev => ({
        ...prev,
        isResizing: false,
        currentPreviewTime: null,
        isInvalid: false
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
  }, [resizeState, onTimeChange, type, maxTime, snapTime, timeToMinutes, minutesToTime, validateTime])

  const handleStart = useCallback((clientY: number) => {
    setResizeState({
      isResizing: true,
      startY: clientY,
      initialTime: currentTime,
      currentPreviewTime: null,
      isInvalid: false
    })
  }, [currentTime])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    handleStart(e.clientY)
  }, [handleStart])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.touches.length > 0) {
      handleStart(e.touches[0].clientY)
    }
  }, [handleStart])

  const displayTime = resizeState.currentPreviewTime || currentTime

  return (
    <>
      {/* リサイズハンドル */}
      <div
        ref={handleRef}
        className={cn(
          "absolute left-0 right-0 z-30 group",
          "hover:bg-white/20 transition-colors duration-200",
          resizeState.isResizing && "bg-white/30",
          type === 'start' ? "top-0 cursor-ns-resize" : "bottom-0 cursor-ns-resize",
          className
        )}
        style={{
          height: '8px',
          marginTop: type === 'start' ? '-4px' : '0',
          marginBottom: type === 'end' ? '-4px' : '0'
        }}
        title={`Drag to ${type === 'start' ? 'change start time' : 'resize duration'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* 視覚的インジケーター */}
        <div 
          className={cn(
            "absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 transition-all duration-200",
            resizeState.isResizing 
              ? (resizeState.isInvalid ? "bg-red-400" : "bg-blue-400") 
              : "bg-white/40 group-hover:bg-white/60"
          )}
        />
        
        {/* ドット（中央） */}
        <div 
          className={cn(
            "absolute left-1/2 top-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200",
            resizeState.isResizing 
              ? (resizeState.isInvalid ? "bg-red-400" : "bg-blue-400") 
              : "bg-white/60 group-hover:bg-white/80"
          )}
        />
      </div>

      {/* リサイズ中のツールチップ */}
      {resizeState.isResizing && resizeState.currentPreviewTime && (
        <div
          className={cn(
            "fixed z-[9999] px-3 py-2 rounded-md text-sm font-medium pointer-events-none",
            "shadow-lg border transform -translate-x-1/2",
            resizeState.isInvalid 
              ? "bg-red-500 text-white border-red-600" 
              : "bg-gray-900 text-white border-gray-700"
          )}
          style={{
            left: '50%',
            top: `${resizeState.startY - 40}px`
          }}
        >
          {displayTime}
          {resizeState.isInvalid && (
            <div className="text-xs mt-1 opacity-90">
              {type === 'start' ? 'Too close to end time' : 'Too close to start time'}
            </div>
          )}
          {isShiftPressed && (
            <div className="text-xs mt-1 opacity-75">
              5min intervals
            </div>
          )}
        </div>
      )}

      {/* リサイズ中の境界線強調 */}
      {resizeState.isResizing && (
        <div
          className={cn(
            "absolute inset-0 rounded-md pointer-events-none transition-all duration-200",
            "border-2",
            resizeState.isInvalid ? "border-red-400" : "border-blue-400"
          )}
          style={{ zIndex: 25 }}
        />
      )}
    </>
  )
}