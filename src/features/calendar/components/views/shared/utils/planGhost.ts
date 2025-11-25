// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import type { CSSProperties } from 'react'

import type { DragState } from '../hooks/useDragAndDrop'

/**
 * ドラッグ中プランのゴースト表示用スタイル計算
 * 全カレンダービューで共通利用
 *
 * @param originalStyle 元のプランスタイル
 * @param eventId プランID
 * @param dragState ドラッグ状態
 * @returns ゴースト表示を考慮した調整済みスタイル
 */
export function calculatePlanGhostStyle(
  originalStyle: CSSProperties,
  eventId: string,
  dragState: DragState
): CSSProperties {
  const isDragging = dragState.draggedEventId === eventId && dragState.isDragging
  const isResizing = dragState.isResizing && dragState.draggedEventId === eventId

  let adjustedStyle = { ...originalStyle }

  if (isDragging) {
    // ドラッグ中：元の位置に通常表示（EventBlockのactiveカラーで表示）
    // 透明化は行わず、EventBlockのisActiveプロパティでカラー変更
    adjustedStyle = {
      ...adjustedStyle,
      // 位置やサイズの変更はしない（元位置でのゴースト表示）
    }
  } else if (isResizing && dragState.snappedPosition?.height) {
    // リサイズ中：サイズをリアルタイム調整
    adjustedStyle = {
      ...adjustedStyle,
      height: `${dragState.snappedPosition.height}px`,
      zIndex: 1000,
    }
  }

  return adjustedStyle
}

// 後方互換性のためのエイリアス
/** @deprecated Use calculatePlanGhostStyle instead */
export const calculateEventGhostStyle = calculatePlanGhostStyle

/**
 * リサイズ中のプレビュー時間計算
 * 全カレンダービューで共通利用
 *
 * @param eventId プランID
 * @param dragState ドラッグ状態
 * @returns プレビュー時間（リサイズ中のみ）
 */
export function calculatePreviewTime(eventId: string, dragState: DragState): string | null {
  const isDragging = dragState.draggedEventId === eventId && dragState.isDragging
  const isResizing = dragState.isResizing && dragState.draggedEventId === eventId

  // リサイズ中かつドラッグ中でない場合のみプレビュー時間を表示
  return isResizing && !isDragging ? dragState.previewTime : null
}
