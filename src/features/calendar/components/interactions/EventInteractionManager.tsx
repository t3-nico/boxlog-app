'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { CalendarEvent } from '@/features/events'

// インタラクション状態の管理
export interface InteractionState {
  // クリック・選択状態
  selectedEventId: string | null
  isCreating: boolean
  
  // ドラッグ状態
  isDragging: boolean
  dragStartTime: string | null
  dragEndTime: string | null
  dragDate: Date | null
  
  // ホバー状態
  hoveredEventId: string | null
  hoveredTimeSlot: { date: Date; time: string } | null
  
  // 作成中のイベント
  creatingEvent: {
    date: Date
    startTime: string
    endTime: string
    isVisible: boolean
  } | null
}

interface EventInteractionContextType {
  state: InteractionState
  actions: {
    // イベント選択
    selectEvent: (eventId: string | null) => void
    
    // ホバー操作
    setHoveredEvent: (eventId: string | null) => void
    setHoveredTimeSlot: (date: Date | null, time: string | null) => void
    
    // ドラッグ操作
    startDrag: (date: Date, time: string) => void
    updateDrag: (date: Date, time: string) => void
    endDrag: () => void
    cancelDrag: () => void
    
    // イベント作成
    startCreating: (date: Date, startTime: string, endTime?: string) => void
    finishCreating: () => void
    cancelCreating: () => void
    
    // リセット
    resetState: () => void
  }
}

// デフォルト状態
const defaultState: InteractionState = {
  selectedEventId: null,
  isCreating: false,
  isDragging: false,
  dragStartTime: null,
  dragEndTime: null,
  dragDate: null,
  hoveredEventId: null,
  hoveredTimeSlot: null,
  creatingEvent: null
}

// Context作成
const EventInteractionContext = React.createContext<EventInteractionContextType | null>(null)

// Provider コンポーネント
export function EventInteractionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InteractionState>(defaultState)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // イベント選択
  const selectEvent = useCallback((eventId: string | null) => {
    setState(prev => ({ ...prev, selectedEventId: eventId }))
  }, [])

  // ホバー操作
  const setHoveredEvent = useCallback((eventId: string | null) => {
    setState(prev => ({ ...prev, hoveredEventId: eventId }))
  }, [])

  const setHoveredTimeSlot = useCallback((date: Date | null, time: string | null) => {
    setState(prev => ({
      ...prev,
      hoveredTimeSlot: date && time ? { date, time } : null
    }))
  }, [])

  // ドラッグ操作
  const startDrag = useCallback((date: Date, time: string) => {
    setState(prev => ({
      ...prev,
      isDragging: true,
      dragDate: date,
      dragStartTime: time,
      dragEndTime: time,
      isCreating: false
    }))
  }, [])

  const updateDrag = useCallback((date: Date, time: string) => {
    setState(prev => {
      if (!prev.isDragging || !prev.dragDate) return prev
      
      // 同じ日付の場合のみドラッグを継続
      if (date.toDateString() === prev.dragDate.toDateString()) {
        return {
          ...prev,
          dragEndTime: time
        }
      }
      return prev
    })
  }, [])

  const endDrag = useCallback(() => {
    setState(prev => {
      if (!prev.isDragging || !prev.dragDate || !prev.dragStartTime || !prev.dragEndTime) {
        return { ...prev, isDragging: false, dragStartTime: null, dragEndTime: null, dragDate: null }
      }

      // 開始時刻と終了時刻を正規化
      const startTime = prev.dragStartTime
      const endTime = prev.dragEndTime
      
      const startMinutes = timeToMinutes(startTime)
      const endMinutes = timeToMinutes(endTime)
      
      // 時間範囲が有効な場合のみイベント作成状態に移行
      if (Math.abs(endMinutes - startMinutes) >= 15) { // 最小15分
        const finalStartTime = startMinutes <= endMinutes ? startTime : endTime
        const finalEndTime = startMinutes <= endMinutes ? endTime : startTime
        
        return {
          ...prev,
          isDragging: false,
          dragStartTime: null,
          dragEndTime: null,
          dragDate: null,
          isCreating: true,
          creatingEvent: {
            date: prev.dragDate,
            startTime: finalStartTime,
            endTime: finalEndTime,
            isVisible: true
          }
        }
      }
      
      return {
        ...prev,
        isDragging: false,
        dragStartTime: null,
        dragEndTime: null,
        dragDate: null
      }
    })
  }, [])

  const cancelDrag = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      dragStartTime: null,
      dragEndTime: null,
      dragDate: null
    }))
  }, [])

  // イベント作成
  const startCreating = useCallback((date: Date, startTime: string, endTime?: string) => {
    const finalEndTime = endTime || addMinutesToTime(startTime, 30) // デフォルト30分
    
    setState(prev => ({
      ...prev,
      isCreating: true,
      creatingEvent: {
        date,
        startTime,
        endTime: finalEndTime,
        isVisible: true
      }
    }))
  }, [])

  const finishCreating = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreating: false,
      creatingEvent: null
    }))
  }, [])

  const cancelCreating = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCreating: false,
      creatingEvent: null
    }))
  }, [])

  // 状態リセット
  const resetState = useCallback(() => {
    setState(defaultState)
  }, [])

  // キーボードイベント処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (state.isDragging) {
            cancelDrag()
          } else if (state.isCreating) {
            cancelCreating()
          } else if (state.selectedEventId) {
            selectEvent(null)
          }
          break
        case 'Enter':
          if (state.isCreating && state.creatingEvent) {
            // イベント作成を確定（親コンポーネントで処理）
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, cancelDrag, cancelCreating, selectEvent])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const actions = {
    selectEvent,
    setHoveredEvent,
    setHoveredTimeSlot,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    startCreating,
    finishCreating,
    cancelCreating,
    resetState
  }

  return (
    <EventInteractionContext.Provider value={{ state, actions }}>
      {children}
    </EventInteractionContext.Provider>
  )
}

// カスタムフック
export function useEventInteraction() {
  const context = React.useContext(EventInteractionContext)
  if (!context) {
    throw new Error('useEventInteraction must be used within EventInteractionProvider')
  }
  return context
}

// ユーティリティ関数
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

function addMinutesToTime(timeString: string, minutesToAdd: number): string {
  const totalMinutes = timeToMinutes(timeString) + minutesToAdd
  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// ドラッグ選択範囲の視覚化コンポーネント
export function DragSelectionOverlay() {
  const { state } = useEventInteraction()
  
  if (!state.isDragging || !state.dragDate || !state.dragStartTime || !state.dragEndTime) {
    return null
  }

  const startMinutes = timeToMinutes(state.dragStartTime)
  const endMinutes = timeToMinutes(state.dragEndTime)
  
  const top = Math.min(startMinutes, endMinutes) * (72 / 60) // HOUR_HEIGHT / 60
  const height = Math.abs(endMinutes - startMinutes) * (72 / 60)

  return (
    <div
      className="absolute left-0 right-0 bg-blue-200/50 border border-blue-400 pointer-events-none z-20"
      style={{
        top: `${top}px`,
        height: `${height}px`
      }}
    >
      <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
      <div className="absolute top-1 left-2 text-xs text-blue-700 font-medium">
        {state.dragStartTime} - {state.dragEndTime}
      </div>
    </div>
  )
}