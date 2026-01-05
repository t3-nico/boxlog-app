import { calendarColors } from '@/features/calendar/theme';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

/**
 * ドラッグ要素を作成する（position: fixed で自由移動）
 *
 * Googleカレンダー的動作:
 * - dragElementはマウス追従用（非表示、位置計算のみに使用）
 * - 実際の表示はスナップ位置でのプレビュー（calculatePlanGhostStyleで処理）
 */
export function createDragElement(originalElement: HTMLElement): {
  dragElement: HTMLElement;
  initialRect: DOMRect;
} {
  const rect = originalElement.getBoundingClientRect();
  const dragElement = originalElement.cloneNode(true) as HTMLElement;

  dragElement.className = '';
  dragElement.classList.add('rounded-md', 'px-2', 'py-1', 'overflow-hidden');

  const activeColorClasses = calendarColors.event.scheduled.active?.split(' ') || [];
  activeColorClasses.forEach((cls) => {
    if (cls) dragElement.classList.add(cls);
  });

  dragElement.style.position = 'fixed';
  dragElement.style.left = `${rect.left}px`;
  dragElement.style.top = `${rect.top}px`;
  dragElement.style.width = `${rect.width}px`;
  dragElement.style.height = `${rect.height}px`;
  // ドラッグ要素を表示（日付間移動のため）
  dragElement.style.opacity = '0.8';
  dragElement.style.pointerEvents = 'none';
  dragElement.style.zIndex = '9999';
  dragElement.style.transition = 'none';
  dragElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  dragElement.style.cursor = 'grabbing';
  dragElement.classList.add('dragging-element');

  document.body.appendChild(dragElement);

  return { dragElement, initialRect: rect };
}

/**
 * ドラッグ要素の位置を更新する（マウス追従用）
 *
 * Googleカレンダー的動作:
 * - ゴースト（元の位置）は固定で薄く表示
 * - dragElementはマウスに追従して自由移動
 *
 * @param dragElement - ドラッグ中の要素（マウス追従）
 * @param originalElementRect - mousedown時点での元要素の位置（基準点）
 * @param deltaX - mousedown時点からのX方向移動量
 * @param deltaY - mousedown時点からのY方向移動量
 */
export function updateDragElementPosition(
  dragElement: HTMLElement | null,
  originalElementRect: DOMRect | null,
  deltaX: number,
  deltaY: number,
): void {
  if (!dragElement || !originalElementRect) return;

  // mousedown時点の位置 + 移動量 = 現在位置
  let newLeft = originalElementRect.left + deltaX;
  let newTop = originalElementRect.top + deltaY;

  const calendarContainer =
    (document.querySelector('[data-calendar-main]') as HTMLElement) ||
    (document.querySelector('.calendar-main') as HTMLElement) ||
    (document.querySelector('main') as HTMLElement);

  if (calendarContainer) {
    const containerRect = calendarContainer.getBoundingClientRect();
    const elementWidth = dragElement.offsetWidth;
    const elementHeight = dragElement.offsetHeight;

    newLeft = Math.max(containerRect.left, Math.min(containerRect.right - elementWidth, newLeft));
    newTop = Math.max(containerRect.top, Math.min(containerRect.bottom - elementHeight, newTop));
  }

  dragElement.style.left = `${newLeft}px`;
  dragElement.style.top = `${newTop}px`;
}

/**
 * ドラッグ要素をクリーンアップする
 *
 * 注意: 元要素の透明度はReact状態で管理されるため、ここでは変更しない
 */
export function cleanupDragElements(
  dragElement: HTMLElement | null,
  _originalElement: HTMLElement | null,
): void {
  if (dragElement) {
    dragElement.remove();
  }
  // 元要素の透明度はReact状態（dragState）で管理
}

/**
 * カラム幅を計算する（日付間移動用）
 */
export function calculateColumnWidth(
  originalElement: HTMLElement | null,
  viewMode: string,
  displayDates: Date[] | undefined,
): number {
  let columnWidth = 0;

  if (viewMode !== 'day' && displayDates) {
    const gridContainer =
      (originalElement?.closest('.flex') as HTMLElement) ||
      (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
      (originalElement?.parentElement?.parentElement as HTMLElement);

    if (gridContainer && gridContainer.offsetWidth > 0) {
      const totalWidth = gridContainer.offsetWidth;
      columnWidth = totalWidth / displayDates.length;
    } else {
      columnWidth = (window.innerWidth / displayDates.length) * 0.75;
    }
  }

  return columnWidth;
}

/**
 * クライアント側で時間重複をチェックする
 * @param events - 現在表示中のプラン一覧
 * @param draggedEventId - ドラッグ中のプランID（自分自身は除外）
 * @param previewStartTime - プレビュー開始時刻
 * @param previewEndTime - プレビュー終了時刻
 * @returns 重複している場合はtrue
 */
export function checkClientSideOverlap(
  events: CalendarPlan[],
  draggedEventId: string,
  previewStartTime: Date,
  previewEndTime: Date,
): boolean {
  // 自分自身を除外した他のプランとの重複チェック
  const result = events.some((event) => {
    // 自分自身はスキップ
    if (event.id === draggedEventId) return false;

    // startDate/endDateがない場合はスキップ
    if (!event.startDate || !event.endDate) {
      console.log('[Overlap] Skipping event without dates:', event.id, event.title);
      return false;
    }

    const eventStart = event.startDate;
    const eventEnd = event.endDate;

    // 時間重複条件: 既存の開始時刻 < 新規の終了時刻 AND 既存の終了時刻 > 新規の開始時刻
    const overlaps = eventStart < previewEndTime && eventEnd > previewStartTime;
    if (overlaps) {
      console.log('[Overlap] Found overlap with:', {
        eventId: event.id,
        eventTitle: event.title,
        eventStart: eventStart.toISOString(),
        eventEnd: eventEnd.toISOString(),
      });
    }
    return overlaps;
  });

  return result;
}

/**
 * ドラッグ要素の重複状態のスタイルを更新する
 * @param dragElement - ドラッグ中の要素
 * @param isOverlapping - 重複しているか
 */
export function updateDragElementOverlapStyle(
  dragElement: HTMLElement | null,
  isOverlapping: boolean,
): void {
  console.log('[Overlap Style] Updating style:', { dragElement: !!dragElement, isOverlapping });

  if (!dragElement) return;

  if (isOverlapping) {
    // 重複時: 赤いボーダー、薄い表示、禁止カーソル
    dragElement.style.border = '2px solid #ef4444'; // red-500
    dragElement.style.opacity = '0.5';
    dragElement.style.cursor = 'not-allowed';
    dragElement.classList.add('drag-overlap');
    console.log('[Overlap Style] Applied overlap style (red border)');
  } else {
    // 正常時: 通常のスタイルに戻す
    dragElement.style.border = '';
    dragElement.style.opacity = '0.8';
    dragElement.style.cursor = 'grabbing';
    dragElement.classList.remove('drag-overlap');
  }
}
