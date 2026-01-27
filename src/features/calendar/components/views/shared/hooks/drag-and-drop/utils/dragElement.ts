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

  // セマンティックトークンを直接使用
  dragElement.classList.add('bg-container');

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
    if (event.id === draggedEventId) return false;
    if (!event.startDate || !event.endDate) return false;

    const eventStart = event.startDate;
    const eventEnd = event.endDate;

    // 時間重複条件: 既存の開始時刻 < 新規の終了時刻 AND 既存の終了時刻 > 新規の開始時刻
    return eventStart < previewEndTime && eventEnd > previewStartTime;
  });

  return result;
}

/**
 * ドラッグ要素の重複状態のスタイルを更新する
 * GAFA準拠の視覚的フィードバック（Apple HIG + Material Design）:
 * - 赤いオーバーレイ + ボーダー + グロー
 * - 禁止アイコン（⊘）
 * - 禁止カーソル（not-allowed）
 *
 * @param dragElement - ドラッグ中の要素
 * @param isOverlapping - 重複しているか
 */
export function updateDragElementOverlapStyle(
  dragElement: HTMLElement | null,
  isOverlapping: boolean,
): void {
  if (!dragElement) return;

  // オーバーレイのID
  const OVERLAY_ID = 'drag-overlap-overlay';

  if (isOverlapping) {
    // 重複時: DragSelectionPreviewと同じシンプルなデザイン
    // ボーダーやシャドウは付けず、赤いカーテンだけを表示
    dragElement.style.setProperty('border', 'none', 'important');
    dragElement.style.setProperty('box-shadow', 'none', 'important');
    dragElement.style.cursor = 'not-allowed';
    dragElement.classList.add('drag-overlap');

    // 赤いオーバーレイ + Banアイコン + テキスト（DragSelectionPreviewと統一）
    if (!dragElement.querySelector(`#${OVERLAY_ID}`)) {
      // 元のカード内容を非表示にして、赤いカーテンだけを見せる
      Array.from(dragElement.children).forEach((child) => {
        if ((child as HTMLElement).id !== OVERLAY_ID) {
          (child as HTMLElement).style.visibility = 'hidden';
        }
      });
      dragElement.style.setProperty('background', 'transparent', 'important');

      const overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      // DragSelectionPreviewと同じ薄い赤カーテン（セマンティックトークン使用）
      overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: oklch(from var(--destructive) l c h / 60%);
        border-radius: inherit;
        display: flex;
        flex-direction: column;
        padding: 8px;
        z-index: 100;
        pointer-events: none;
      `;
      // DragSelectionPreviewと同じレイアウト（アイコン + テキスト）
      overlay.innerHTML = `
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--destructive-foreground)" stroke-width="2.5" stroke-linecap="round" style="flex-shrink: 0;">
            <circle cx="12" cy="12" r="10"/>
            <path d="m4.9 4.9 14.2 14.2"/>
          </svg>
          <span style="color: var(--destructive-foreground); font-size: 12px; font-weight: 500;">時間が重複しています</span>
        </div>
      `;
      dragElement.appendChild(overlay);
    }
  } else {
    // 正常時: 通常のスタイルに戻す
    dragElement.style.removeProperty('border');
    dragElement.style.removeProperty('box-shadow');
    dragElement.style.removeProperty('background');
    dragElement.style.cursor = '';
    dragElement.classList.remove('drag-overlap');

    // 元のカード内容を再表示
    Array.from(dragElement.children).forEach((child) => {
      if ((child as HTMLElement).id !== OVERLAY_ID) {
        (child as HTMLElement).style.visibility = '';
      }
    });

    // オーバーレイを削除
    const overlay = dragElement.querySelector(`#${OVERLAY_ID}`);
    if (overlay) {
      overlay.remove();
    }
  }
}

/**
 * ドロップ失敗時のスナップバックアニメーション（Apple HIG準拠）
 * 要素が元の位置に戻る/消えるアニメーションを実行
 *
 * @param dragElement - ドラッグ中の要素
 * @param originalRect - 元の位置情報
 * @param onComplete - アニメーション完了時のコールバック
 */
export function animateSnapBack(
  dragElement: HTMLElement | null,
  originalRect: DOMRect | null,
  onComplete: () => void,
): void {
  if (!dragElement) {
    onComplete();
    return;
  }

  if (originalRect) {
    // 元の位置にスナップバック
    dragElement.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    dragElement.style.left = `${originalRect.left}px`;
    dragElement.style.top = `${originalRect.top}px`;
    dragElement.style.opacity = '0.3';
    dragElement.style.transform = 'scale(0.95)';

    setTimeout(() => {
      dragElement.style.opacity = '0';
      setTimeout(onComplete, 100);
    }, 200);
  } else {
    // 元の位置が不明な場合はフェードアウト
    dragElement.style.animation = 'snap-back 0.3s ease-out forwards';
    setTimeout(onComplete, 300);
  }
}
