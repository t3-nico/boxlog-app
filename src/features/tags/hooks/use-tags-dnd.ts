import {
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useState } from 'react'

import type { TagWithChildren } from '@/types/tags'

/**
 * タグテーブル用のドラッグ&ドロップフック
 *
 * テーブル行からサイドバーグループへのタグ移動をサポート
 *
 * @example
 * ```tsx
 * const { sensors, activeTag, handleDragStart, handleDragEnd } = useTagsDnd()
 *
 * return (
 *   <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
 *     <TagsTable />
 *     <DragOverlay>{activeTag && <DragPreview tag={activeTag} />}</DragOverlay>
 *   </DndContext>
 * )
 * ```
 */
export function useTagsDnd() {
  const [activeTag, setActiveTag] = useState<TagWithChildren | null>(null)

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
    useSensor(KeyboardSensor)
  )

  /**
   * ドラッグ開始時：ドラッグ中のタグを保存
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const tag = active.data.current?.tag as TagWithChildren | undefined

    console.log('[useTagsDnd] Drag start:', { tag, activeId: active.id })

    if (tag) {
      setActiveTag(tag)
    }
  }

  /**
   * ドラッグ終了時：タグをグループに移動
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    console.log('[useTagsDnd] Drag end:', {
      activeId: active.id,
      overId: over?.id,
      overData: over?.data.current,
    })

    // ドロップ先がない場合は何もしない
    if (!over) {
      console.log('[useTagsDnd] No drop target')
      setActiveTag(null)
      return
    }

    // ドロップ先がグループでない場合は何もしない
    if (!over.data.current?.type || over.data.current.type !== 'group') {
      console.log('[useTagsDnd] Drop target is not a group:', over.data.current)
      setActiveTag(null)
      return
    }

    const tagId = active.id as string
    const targetGroupId = over.data.current.groupId as string | null

    console.log('[useTagsDnd] Moving tag to group:', { tagId, targetGroupId })

    // コールバック関数があればイベントを通知
    if (active.data.current?.onDropToGroup) {
      active.data.current.onDropToGroup(tagId, targetGroupId)
    }

    setActiveTag(null)
  }

  /**
   * ドラッグキャンセル時
   */
  const handleDragCancel = () => {
    setActiveTag(null)
  }

  return {
    sensors,
    activeTag,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }
}
