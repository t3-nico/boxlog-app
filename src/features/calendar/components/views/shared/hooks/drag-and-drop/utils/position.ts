import { HOUR_HEIGHT } from '../../../constants/grid.constants';

/**
 * 15分単位でスナップする
 */
export function snapToQuarterHour(yPosition: number): {
  snappedTop: number;
  hour: number;
  minute: number;
} {
  const hourDecimal = yPosition / HOUR_HEIGHT;
  let hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)));
  const minuteDecimal = (hourDecimal - hour) * 60;
  let minute = Math.round(minuteDecimal / 15) * 15;

  // 60分になった場合は時間を繰り上げる
  if (minute >= 60) {
    minute = 0;
    hour = Math.min(23, hour + 1);
  }

  const snappedTop = (hour + minute / 60) * HOUR_HEIGHT;

  return { snappedTop, hour, minute };
}

/**
 * マウス位置を境界内に制限する
 */
export function getConstrainedPosition(clientX: number, clientY: number) {
  const calendarContainer =
    (document.querySelector('[data-calendar-main]') as HTMLElement) ||
    (document.querySelector('.calendar-main') as HTMLElement) ||
    (document.querySelector('main') as HTMLElement);

  let constrainedX = clientX;
  let constrainedY = clientY;

  if (calendarContainer) {
    const rect = calendarContainer.getBoundingClientRect();
    constrainedX = Math.max(rect.left, Math.min(rect.right, clientX));
    constrainedY = Math.max(rect.top, Math.min(rect.bottom, clientY));
  }

  return { constrainedX, constrainedY };
}

/**
 * スナップされた位置を計算する
 */
export function calculateSnappedPosition(
  originalTop: number,
  _originalDateIndex: number | undefined,
  deltaY: number,
  targetDateIndex: number,
  viewMode: string,
  displayDates: Date[] | undefined,
): { snappedTop: number; snappedLeft: number | undefined; hour: number; minute: number } {
  const newTop = originalTop + deltaY;
  const { snappedTop, hour, minute } = snapToQuarterHour(newTop);

  let snappedLeft = undefined;
  if (viewMode !== 'day' && displayDates) {
    const columnWidthPercent = 100 / displayDates.length;
    snappedLeft = targetDateIndex * columnWidthPercent + 1;
  }

  return { snappedTop, snappedLeft, hour, minute };
}

/**
 * ターゲット日付インデックスを計算する
 */
export function calculateTargetDateIndex(
  constrainedX: number,
  originalDateIndex: number,
  hasMoved: boolean,
  originalElement: HTMLElement | null,
  columnWidth: number | undefined,
  _deltaX: number,
  viewMode: string,
  displayDates: Date[] | undefined,
): number {
  let targetDateIndex = originalDateIndex;

  if (viewMode !== 'day' && displayDates && hasMoved) {
    const gridContainer =
      (originalElement?.closest('.flex') as HTMLElement) ||
      (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
      (originalElement?.parentElement?.parentElement as HTMLElement);

    if (gridContainer && columnWidth && columnWidth > 0) {
      const rect = gridContainer.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(constrainedX - rect.left, rect.width));

      const columnIndex = Math.floor(relativeX / columnWidth);
      const newTargetIndex = Math.max(0, Math.min(displayDates.length - 1, columnIndex));

      targetDateIndex = newTargetIndex;
    }
  }

  return targetDateIndex;
}
