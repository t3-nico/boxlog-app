import type { CSSProperties } from 'react'

import type { DragState } from '../hooks/useDragAndDrop'

/**
 * ドラッグ中プランのゴースト表示用スタイル計算
 * 全カレンダービューで共通利用
 *
 * Googleカレンダー/iCal的な動作:
 * - ドラッグ中: 元の位置に薄いゴースト（動かない） + dragElementがマウス追従
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
  // isDragging または isPending（5px移動後の遷移中）でもゴースト表示を適用
  const isDragging =
    dragState.draggedEventId === eventId && (dragState.isDragging || (dragState.isPending && dragState.snappedPosition))
  const isResizing = dragState.isResizing && dragState.draggedEventId === eventId

  let adjustedStyle = { ...originalStyle }

  if (isDragging) {
    // ドラッグ中：元の位置に薄いゴーストを表示（位置は変更しない）
    // dragElement（position: fixed）がマウス追従する
    adjustedStyle = {
      ...adjustedStyle,
      opacity: 0.3, // 薄く表示
      zIndex: 1, // 低いz-indexで背面に
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
 * Googleカレンダー的動作:
 * - ゴースト（元の位置）: 元の時間を表示
 * - dragElement（マウス追従）: プレビュー時間を表示
 *
 * この関数はゴースト用なので、ドラッグ中は null を返して元の時間を表示する
 * リサイズ中のみプレビュー時間を返す（その場でサイズ変更するため）
 *
 * @param eventId プランID
 * @param dragState ドラッグ状態
 * @returns プレビュー時間（リサイズ中のみ）
 */
export function calculatePreviewTime(eventId: string, dragState: DragState): { start: Date; end: Date } | null {
  const isResizing = dragState.isResizing && dragState.draggedEventId === eventId

  // リサイズ中のみプレビュー時間を返す
  // ドラッグ中はゴーストに元の時間を表示するためnullを返す
  return isResizing ? dragState.previewTime : null
}
