import {
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useKanbanStore } from '../stores/useKanbanStore';
import type { DragEvent, KanbanCard } from '../types';

/**
 * Kanbanボード用のドラッグ&ドロップフック
 *
 * @dnd-kit/coreを使用してマウス、タッチ、キーボード操作に対応
 *
 * @example
 * ```tsx
 * const { sensors, handleDragStart, handleDragEnd, activeCard } = useKanbanDnd()
 *
 * return (
 *   <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
 *     <KanbanBoard />
 *     <DragOverlay>{activeCard && <KanbanCard card={activeCard} />}</DragOverlay>
 *   </DndContext>
 * )
 * ```
 */
export function useKanbanDnd() {
  const moveCard = useKanbanStore((state) => state.moveCard);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  // センサー設定：マウス、タッチ、キーボード操作に対応
  const sensors = useSensors(
    // マウス操作：8px移動で開始（誤操作防止）
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    // タッチ操作：250msロングプレスで開始
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    // キーボード操作
    useSensor(KeyboardSensor),
  );

  /**
   * ドラッグ開始時：ドラッグ中のカードを保存
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = active.data.current?.card as KanbanCard | undefined;

    if (card) {
      setActiveCard(card);
    }
  };

  /**
   * ドラッグ終了時：カードを移動
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // ドロップ先がない場合は何もしない
    if (!over) {
      setActiveCard(null);
      return;
    }

    // 同じ位置にドロップした場合は何もしない
    if (active.id === over.id) {
      setActiveCard(null);
      return;
    }

    // DragEvent構築
    const dragEvent: DragEvent = {
      cardId: active.id as string,
      sourceColumnId: active.data.current?.columnId as string,
      targetColumnId: over.data.current?.columnId as string,
      sourceIndex: active.data.current?.index as number,
      targetIndex: over.data.current?.index as number,
    };

    // カード移動
    moveCard(dragEvent);
    setActiveCard(null);
  };

  /**
   * ドラッグキャンセル時
   */
  const handleDragCancel = () => {
    setActiveCard(null);
  };

  return {
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    activeCard,
  };
}
