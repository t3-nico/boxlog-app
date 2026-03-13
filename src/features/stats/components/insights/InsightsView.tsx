'use client';

import { cn } from '@/lib/utils';

import type { StatsViewProps } from '../../types/stats.types';

import { TagTimeChart } from '../charts/TagTimeChart';

import { EstimationAccuracyChart } from './EstimationAccuracyChart';
import { StatsMetricsGrid } from './StatsMetricsGrid';

/**
 * InsightsView — Insightsタブのメインコンテンツ
 *
 * KPIメトリクスグリッド + タグ別時間チャート + 見積もり精度チャート
 */
export function InsightsView({ className }: StatsViewProps) {
  return (
    <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <StatsMetricsGrid />
          <TagTimeChart />
          <EstimationAccuracyChart />
        </div>
      </div>
    </div>
  );
}
