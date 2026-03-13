'use client';

import { cn } from '@/lib/utils';

import type { StatsViewProps } from '../../types/stats.types';

import { EstimationAccuracyChart } from './EstimationAccuracyChart';
import { StatsMetricsGrid } from './StatsMetricsGrid';

/**
 * InsightsView — Insightsタブのメインコンテンツ
 *
 * Phase 1: KPIメトリクスグリッド + 見積もり精度チャート
 * Phase 2: パターン検出コンポーネントを追加予定
 */
export function InsightsView({ className }: StatsViewProps) {
  return (
    <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <StatsMetricsGrid />
          <EstimationAccuracyChart />
        </div>
      </div>
    </div>
  );
}
