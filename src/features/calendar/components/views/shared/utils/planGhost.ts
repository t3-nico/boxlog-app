import type { CSSProperties } from 'react'

import type { DragState } from '../hooks/useDragAndDrop'

/**
 * ドラッグ中プランのゴースト表示用スタイル計算
 * 全カレンダービューで共通利用
 *
 * Googleカレンダー/iCal的な動作:
 * - ドラッグ中: 元の位置に薄いゴースト + スナップされた位置にプレビュー表示
 * - リサイズ中: サイズをリアルタイム調整
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

  if (isDragging && dragState.snappedPosition) {
    // ドラッグ中：スナップされた位置にプレビュー表示（Googleカレンダー的動作）
    adjustedStyle = {
      ...adjustedStyle,
      top: `${dragState.snappedPosition.top}px`,
      // 日付間移動がある場合は水平位置も更新
      ...(dragState.snappedPosition.left !== undefined && {
        left: `${dragState.snappedPosition.left}%`,
      }),
      opacity: 0.7,
      zIndex: 1000,
      transition: 'top 0.05s ease-out, left 0.05s ease-out', // スムーズなスナップ
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
 * ドラッグ/リサイズ中のプレビュー時間計算
 * 全カレンダービューで共通利用
 *
 * @param eventId プランID
 * @param dragState ドラッグ状態
 * @returns プレビュー時間（ドラッグ中またはリサイズ中）
 */
export function calculatePreviewTime(eventId: string, dragState: DragState): { start: Date; end: Date } | null {
  const isDragging = dragState.draggedEventId === eventId && dragState.isDragging
  const isResizing = dragState.isResizing && dragState.draggedEventId === eventId

  // ドラッグ中またはリサイズ中の場合プレビュー時間を表示
  return isDragging || isResizing ? dragState.previewTime : null
}
