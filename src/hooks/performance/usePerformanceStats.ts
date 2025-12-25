/**
 * パフォーマンス統計追跡フック
 */

// パフォーマンス計測のため、render中にperformance.now()とrefへの書き込みが必要
import { useEffect, useRef } from 'react';

import type { PerformanceStatsResult } from './types';

/**
 * コンポーネントのパフォーマンス統計を追跡
 *
 * 最近10回のレンダリング時間を保持し、平均・最大・最小を計算
 *
 * @param componentName - 追跡対象のコンポーネント名
 * @param enabled - 追跡を有効にするか
 * @returns パフォーマンス統計
 */
export function usePerformanceStats(
  componentName: string,
  enabled = false,
): PerformanceStatsResult {
  const renderTimes = useRef<number[]>([]);
  const renderStartTime = useRef<number | undefined>(undefined);

  renderStartTime.current = performance.now();

  useEffect(() => {
    if (!enabled) return;

    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - (renderStartTime.current || renderEndTime);

    // 最近の10回のレンダリング時間を保持
    renderTimes.current.push(renderDuration);
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    // 統計情報を計算
    const times = renderTimes.current;
    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    // 5回に1回統計を出力
    if (times.length % 5 === 0) {
      console.debug(
        `${componentName} Performance Stats - Average: ${average.toFixed(2)}ms, Max: ${max.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Recent: ${times.map((t) => t.toFixed(1)).join(', ')}ms`,
      );
    }
  });

  return {
    currentRenderTime: renderStartTime.current ? performance.now() - renderStartTime.current : 0,
    averageRenderTime:
      renderTimes.current.length > 0
        ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
        : 0,
    renderCount: renderTimes.current.length,
  };
}
