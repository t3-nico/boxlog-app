import { useCallback } from 'react';

import { HOUR_HEIGHT } from '../constants/grid.constants';

export interface TimeCalculationResult {
  hour: number;
  minute: number;
  timeString: string;
}

export interface UseTimeCalculationOptions {
  snapToMinutes?: number; // スナップする分単位（デフォルト: 15分）
  maxHour?: number; // 最大時間（デフォルト: 23）
  minHour?: number; // 最小時間（デフォルト: 0）
}

/**
 * クリック位置から時刻を計算するフック
 * 全カレンダービューで共通利用可能
 *
 * @param options 計算オプション
 * @returns 位置→時刻計算関数
 */
export function useTimeCalculation({
  snapToMinutes = 15,
  maxHour = 23,
  minHour = 0,
}: UseTimeCalculationOptions = {}) {
  /**
   * Y座標（ピクセル）から時刻を計算
   * @param clickY クリック位置のY座標
   * @returns 計算された時刻情報
   */
  const calculateTimeFromY = useCallback(
    (clickY: number): TimeCalculationResult => {
      // Y座標から時間の小数値を計算
      const hourDecimal = Math.max(0, clickY / HOUR_HEIGHT);

      // 時間と分に分離
      let hour = Math.floor(hourDecimal);
      let minute = (hourDecimal - hour) * 60;

      // 指定した分単位にスナップ
      minute = Math.round(minute / snapToMinutes) * snapToMinutes;

      // 分が60以上の場合は時間に繰り上げ
      if (minute >= 60) {
        hour += 1;
        minute = 0;
      }

      // 時間範囲を制限
      hour = Math.max(minHour, Math.min(maxHour, hour));
      minute = Math.max(0, Math.min(59, minute));

      // 時刻文字列を生成
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      return {
        hour,
        minute,
        timeString,
      };
    },
    [snapToMinutes, maxHour, minHour],
  );

  /**
   * マウスイベントから時刻を計算
   * @param e マウスイベント
   * @param containerElement コンテナ要素（省略時は e.currentTarget）
   * @returns 計算された時刻情報
   */
  const calculateTimeFromEvent = useCallback(
    (e: React.MouseEvent<HTMLElement>, containerElement?: HTMLElement): TimeCalculationResult => {
      const element = containerElement || e.currentTarget;
      const rect = element.getBoundingClientRect();
      const clickY = e.clientY - rect.top;

      return calculateTimeFromY(clickY);
    },
    [calculateTimeFromY],
  );

  return {
    calculateTimeFromY,
    calculateTimeFromEvent,
  };
}
