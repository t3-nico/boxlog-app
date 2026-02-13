import { HOUR_HEIGHT } from '../../views/shared/constants/grid.constants';
import { snapToQuarterHour } from '../../views/shared/hooks/drag-and-drop/utils/position';

/**
 * カレンダーグリッド要素の情報
 */
interface CalendarGridInfo {
  /** グリッド要素 */
  element: HTMLElement;
  /** スクロールコンテナ */
  scrollContainer: HTMLElement;
  /** 表示日付配列における日付インデックス */
  dayIndex: number;
}

/**
 * マウス位置からカレンダーグリッドを検出する
 *
 * [data-calendar-grid] 属性を持つ要素を検索し、
 * マウスが上にあるグリッドを返す
 */
export function findCalendarGridUnderMouse(
  clientX: number,
  clientY: number,
): CalendarGridInfo | null {
  const grids = document.querySelectorAll<HTMLElement>('[data-calendar-grid]');

  for (const grid of grids) {
    const rect = grid.getBoundingClientRect();
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      // スクロールコンテナを検出（グリッドの親で overflow-y-auto を持つもの）
      const scrollContainer =
        (grid.closest('[data-calendar-scroll]') as HTMLElement) ||
        (grid.parentElement as HTMLElement);

      // 日付インデックスを検出
      const dayIndexAttr = grid.getAttribute('data-calendar-day-index');
      const dayIndex = dayIndexAttr ? parseInt(dayIndexAttr, 10) : 0;

      return { element: grid, scrollContainer, dayIndex };
    }
  }

  return null;
}

/**
 * グリッド上のマウス位置から時間を計算する
 */
export function calculateTimeFromGridPosition(
  gridInfo: CalendarGridInfo,
  clientY: number,
): { hour: number; minute: number; snappedTop: number } {
  const rect = gridInfo.element.getBoundingClientRect();
  const scrollTop = gridInfo.scrollContainer.scrollTop;

  // グリッド相対位置（スクロール考慮）
  const relativeY = clientY - rect.top + scrollTop;

  return snapToQuarterHour(Math.max(0, relativeY));
}

/**
 * パネルドラッグ用のゴースト要素を作成する
 */
export function createPanelDragGhost(sourceElement: HTMLElement): HTMLElement {
  const ghost = sourceElement.cloneNode(true) as HTMLElement;

  // 固定位置でマウスに追従
  ghost.style.position = 'fixed';
  ghost.style.zIndex = '9999';
  ghost.style.opacity = '0.85';
  ghost.style.pointerEvents = 'none';
  ghost.style.width = `${sourceElement.offsetWidth}px`;
  ghost.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  ghost.style.transform = 'rotate(2deg) scale(1.02)';
  ghost.style.transition = 'none';
  ghost.style.cursor = 'grabbing';

  document.body.appendChild(ghost);
  return ghost;
}

/**
 * ゴースト要素の位置を更新する
 */
export function updateGhostPosition(ghost: HTMLElement, clientX: number, clientY: number): void {
  ghost.style.left = `${clientX - ghost.offsetWidth / 2}px`;
  ghost.style.top = `${clientY - 20}px`;
}

/**
 * ゴースト要素をクリーンアップする
 */
export function cleanupGhost(ghost: HTMLElement | null): void {
  if (ghost?.parentNode) {
    ghost.parentNode.removeChild(ghost);
  }
}

/**
 * デフォルトの duration (ms) を取得
 *
 * 未スケジュール Plan は常に 1 時間
 */
export const DEFAULT_DURATION_MS = 60 * 60 * 1000; // 1時間

/**
 * スナップ位置からプレビュー高さを計算
 */
export function calculatePreviewHeight(): number {
  return HOUR_HEIGHT; // 1時間 = HOUR_HEIGHT px
}
