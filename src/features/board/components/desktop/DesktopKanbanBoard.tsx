'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { useState } from 'react'
import { useKanbanDnd } from '../../hooks/useKanbanDnd'
import { useKanbanStore } from '../../stores/useKanbanStore'
import type { KanbanCard as KanbanCardType } from '../../types'
import { KanbanBoardSkeleton } from '../shared/KanbanBoardSkeleton'
import { KanbanCard } from '../shared/KanbanCard'
import { KanbanCardDialog } from '../shared/KanbanCardDialog'
import { KanbanColumn } from '../shared/KanbanColumn'

/**
 * デスクトップ専用Kanbanボード
 *
 * ドラッグ&ドロップ + 横スクロールレイアウト
 *
 * @example
 * ```tsx
 * <DesktopKanbanBoard />
 * ```
 */
export function DesktopKanbanBoard() {
  const { activeBoard, addCard, updateCard, deleteCard, isLoading } = useKanbanStore()
  const { sensors, handleDragStart, handleDragEnd, handleDragCancel, activeCard } = useKanbanDnd()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<KanbanCardType | undefined>()
  const [targetColumnId, setTargetColumnId] = useState<string | undefined>()

  // ローディング中
  if (isLoading) {
    return <KanbanBoardSkeleton />
  }

  // ボードが未作成の場合
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
      updateCard(editingCard.id, cardInput)
    } else if (targetColumnId) {
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
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="bg-background flex h-full w-full flex-col">
          {/* Kanbanボード（横スクロール領域） */}
          <ScrollArea className="flex-1 px-4 py-4 md:px-6">
            <div className="flex gap-6" style={{ width: 'fit-content', minWidth: '100%' }}>
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
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
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
