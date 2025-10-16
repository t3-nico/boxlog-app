'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { useState } from 'react'
import { useKanbanDnd } from '../hooks/useKanbanDnd'
import { useKanbanStore } from '../stores/useKanbanStore'
import type { KanbanCard as KanbanCardType } from '../types'
import { KanbanBoardSkeleton } from './shared/KanbanBoardSkeleton'
import { KanbanCard } from './shared/KanbanCard'
import { KanbanCardDialog } from './shared/KanbanCardDialog'
import { KanbanColumn } from './shared/KanbanColumn'

/**
 * Kanbanボードコンポーネント（メイン）
 *
 * デスクトップ・モバイルで共有するコア実装
 *
 * @example
 * ```tsx
 * <KanbanBoard />
 * ```
 */
export function KanbanBoard() {
  const { activeBoard, addCard, updateCard, deleteCard, selectCard, isLoading } = useKanbanStore()
  const { sensors, handleDragStart, handleDragEnd, handleDragCancel, activeCard } = useKanbanDnd()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<KanbanCardType | undefined>()
  const [targetColumnId, setTargetColumnId] = useState<string | undefined>()

  // ローディング中
  if (isLoading) {
    return <KanbanBoardSkeleton />
  }

  // ボードが未作成の場合の初期化ボタン
  if (!activeBoard) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-xl font-semibold">Kanbanボードがありません</h2>
          <p className="text-muted-foreground mb-6">新しいボードを作成してください</p>
          <Button onClick={() => useKanbanStore.getState().createBoard('マイボード')}>ボードを作成</Button>
        </div>
      </div>
    )
  }

  const handleAddCard = (columnId: string) => {
    const column = activeBoard.columns.find((col) => col.id === columnId)
    setTargetColumnId(columnId)
    setEditingCard(undefined)
    setIsDialogOpen(true)
  }

  const handleEditCard = (card: KanbanCardType) => {
    setEditingCard(card)
    setIsDialogOpen(true)
  }

  const handleSaveCard = (cardInput: Omit<KanbanCardType, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCard) {
      // 既存カードを更新
      updateCard(editingCard.id, cardInput)
    } else if (targetColumnId) {
      // 新規カードを追加
      addCard(targetColumnId, cardInput)
    }
    setIsDialogOpen(false)
    setEditingCard(undefined)
    setTargetColumnId(undefined)
  }

  const handleDeleteCard = (cardId: string) => {
    if (confirm('このカードを削除しますか？')) {
      deleteCard(cardId)
    }
  }

  return (
    <>
      <ScrollArea className="bg-background h-full w-full">
        <div className="p-6">
          {/* ボードヘッダー */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{activeBoard.name}</h1>
              {activeBoard.description && (
                <p className="text-muted-foreground mt-1 text-sm">{activeBoard.description}</p>
              )}
            </div>
          </div>

          {/* Kanbanボード（横スクロール） */}
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex gap-6">
              {activeBoard.columns
                .sort((a, b) => a.order - b.order)
                .map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    onAddCard={handleAddCard}
                    onEditCard={handleEditCard}
                    onDeleteCard={handleDeleteCard}
                  />
                ))}
            </div>

            {/* ドラッグオーバーレイ */}
            <DragOverlay>
              {activeCard && (
                <div className="rotate-3 opacity-90">
                  <KanbanCard card={activeCard} columnId="" index={0} isDragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* カード編集ダイアログ */}
      <KanbanCardDialog
        card={editingCard}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingCard(undefined)
          setTargetColumnId(undefined)
        }}
        onSave={handleSaveCard}
        defaultStatus={
          targetColumnId ? activeBoard.columns.find((col) => col.id === targetColumnId)?.status : undefined
        }
      />
    </>
  )
}
