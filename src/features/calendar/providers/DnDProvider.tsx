'use client'

import React from 'react'

import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'

interface DnDProviderProps {
  children: React.ReactNode
}

/**
 * DnDProvider - dnd-kit を使用したドラッグ・アンド・ドロップコンテキスト
 *
 * **変更履歴**:
 * - react-dnd から @dnd-kit/core に移行（TicketKanbanBoardとの統一のため）
 *
 * **Note**:
 * - TicketCard（Sidebar）からCalendar グリッドへのドラッグが可能
 * - PointerSensor: 8px移動したらドラッグ開始（誤動作防止）
 */
export const DnDProvider = ({ children }: DnDProviderProps) => {
  // ドラッグセンサー設定（ポインターでドラッグ）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動したらドラッグ開始
      },
    })
  )

  return <DndContext sensors={sensors}>{children}</DndContext>
}
