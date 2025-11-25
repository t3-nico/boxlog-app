// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import type { CSSProperties } from 'react'
import { useMemo } from 'react'

import type { DragState } from './useDragAndDrop'

/**
 * Googleカレンダー風ゴースト表示のためのスタイル計算フック
 * 全カレンダービューで共通利用可能
 *
 * @param originalStyle 元のイベントスタイル
 * @param eventId イベントID
 * @param dragState ドラッグ状態
 * @returns ゴースト表示を考慮した調整済みスタイル
 */
export function useEventGhost(originalStyle: CSSProperties, eventId: string, dragState: DragState): CSSProperties {
  return useMemo((): CSSProperties => {
    const isDragging = dragState.draggedEventId === eventId && dragState.isDragging
    const isResizingThis = dragState.isResizing && dragState.draggedEventId === eventId

    // ドラッグ・リサイズ中の表示制御（Googleカレンダー風ゴースト）
    if (isDragging) {
      // ドラッグ中：元位置にゴースト表示（位置固定、半透明）
      return {
        ...originalStyle, // 元の位置を完全保持
        opacity: 0.3, // ゴースト表示
        pointerEvents: 'none',
      }
    } else if (isResizingThis && dragState.snappedPosition?.height) {
      // リサイズ中：サイズをリアルタイム調整
      return {
        ...originalStyle,
        height: `${dragState.snappedPosition.height}px`,
        zIndex: 1000,
      }
    }

    // 通常時：元のスタイルをそのまま使用
    return originalStyle
  }, [originalStyle, eventId, dragState])
}

/**
 * EventBlockのpreviewTime表示制御
 * リサイズ中のみプレビュー時間を表示
 *
 * @param eventId イベントID
 * @param dragState ドラッグ状態
 * @returns プレビュー時間（リサイズ中のみ）
 */
export function useEventPreviewTime(eventId: string, dragState: DragState): string | null {
  return useMemo(() => {
    const isDragging = dragState.draggedEventId === eventId && dragState.isDragging
    const isResizingThis = dragState.isResizing && dragState.draggedEventId === eventId

    // リサイズ中かつドラッグ中でない場合のみプレビュー時間を表示
    return isResizingThis && !isDragging ? dragState.previewTime : null
  }, [eventId, dragState.draggedEventId, dragState.isDragging, dragState.isResizing, dragState.previewTime])
}
