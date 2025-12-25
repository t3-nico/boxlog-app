/**
 * グリッド計算ユーティリティ
 */

import { MS_PER_MINUTE } from '@/constants/time';

import { HOUR_HEIGHT } from '../constants/grid.constants';

/**
 * 時刻をピクセル位置に変換
 * @param time - 変換する時刻
 * @param hourHeight - 1時間の高さ（デフォルト: 60px）
 * @returns Y座標（px）
 */
export function timeToPixels(time: Date, hourHeight: number = HOUR_HEIGHT): number {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  return (totalMinutes * hourHeight) / 60;
}

/**
 * ピクセル位置を時刻に変換
 * @param pixels - Y座標（px）
 * @param baseDate - 基準日
 * @param hourHeight - 1時間の高さ（デフォルト: 60px）
 * @returns 時刻
 */
export function pixelsToTime(
  pixels: number,
  baseDate: Date,
  hourHeight: number = HOUR_HEIGHT,
): Date {
  const totalMinutes = (pixels * 60) / hourHeight;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * 時刻から時間と分を取得
 * @param pixels - Y座標（px）
 * @param hourHeight - 1時間の高さ（デフォルト: 60px）
 * @returns {hour, minute}
 */
export function pixelsToTimeValues(
  pixels: number,
  hourHeight: number = HOUR_HEIGHT,
): { hour: number; minute: number } {
  const totalMinutes = (pixels * 60) / hourHeight;
  const hour = Math.floor(totalMinutes / 60);
  const minute = Math.floor(totalMinutes % 60);
  return { hour, minute };
}

/**
 * イベントの位置スタイルを計算
 * @param start - 開始時刻
 * @param end - 終了時刻
 * @param column - 列番号（0ベース）
 * @param totalColumns - 総列数
 * @param hourHeight - 1時間の高さ
 * @returns CSSスタイル
 */
export function getEventStyle(
  start: Date,
  end: Date,
  column: number = 0,
  totalColumns: number = 1,
  hourHeight: number = HOUR_HEIGHT,
): React.CSSProperties {
  const top = timeToPixels(start, hourHeight);
  const bottom = timeToPixels(end, hourHeight);
  const height = Math.max(bottom - top, 20); // 最小高さ20px

  const width = 100 / totalColumns;
  const left = (100 / totalColumns) * column;

  return {
    position: 'absolute',
    top: `${top}px`,
    height: `${height}px`,
    left: `${left}%`,
    width: `${width}%`,
    zIndex: 10,
  };
}

/**
 * グリッドの総高さを計算
 * @param startHour - 開始時間（0-24）
 * @param endHour - 終了時間（0-24）
 * @param hourHeight - 1時間の高さ
 * @returns 総高さ（px）
 */
export function calculateGridHeight(
  startHour: number = 0,
  endHour: number = 24,
  hourHeight: number = HOUR_HEIGHT,
): number {
  return (endHour - startHour) * hourHeight;
}

/**
 * 時間範囲内かチェック
 * @param time - チェックする時刻
 * @param startHour - 開始時間（0-24）
 * @param endHour - 終了時間（0-24）
 * @returns 範囲内ならtrue
 */
export function isTimeInRange(time: Date, startHour: number, endHour: number): boolean {
  const hour = time.getHours();
  return hour >= startHour && hour < endHour;
}

/**
 * 15分単位に丸める
 * @param time - 丸める時刻
 * @param direction - 'up' | 'down' | 'nearest'
 * @returns 丸められた時刻
 */
export function roundToQuarterHour(
  time: Date,
  direction: 'up' | 'down' | 'nearest' = 'nearest',
): Date {
  const result = new Date(time);
  const minutes = result.getMinutes();
  const quarterHour = 15;

  let roundedMinutes: number;
  if (direction === 'up') {
    roundedMinutes = Math.ceil(minutes / quarterHour) * quarterHour;
  } else if (direction === 'down') {
    roundedMinutes = Math.floor(minutes / quarterHour) * quarterHour;
  } else {
    roundedMinutes = Math.round(minutes / quarterHour) * quarterHour;
  }

  if (roundedMinutes === 60) {
    result.setHours(result.getHours() + 1, 0, 0, 0);
  } else {
    result.setMinutes(roundedMinutes, 0, 0);
  }

  return result;
}

/**
 * イベントの継続時間を分で取得
 * @param start - 開始時刻
 * @param end - 終了時刻
 * @returns 継続時間（分）
 */
export function getDurationInMinutes(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / MS_PER_MINUTE);
}

/**
 * スクロール位置を計算
 * @param targetHour - スクロール先の時間
 * @param hourHeight - 1時間の高さ
 * @param containerHeight - コンテナの高さ
 * @returns スクロール位置（px）
 */
export function calculateScrollPosition(
  targetHour: number,
  hourHeight: number = HOUR_HEIGHT,
  containerHeight: number = 600,
): number {
  const targetPosition = targetHour * hourHeight;
  // 画面の中央に表示するように調整
  return Math.max(0, targetPosition - containerHeight / 3);
}
