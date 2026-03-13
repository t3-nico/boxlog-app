'use client';

import { cn } from '@/lib/utils';

import type { StatsViewProps } from '../types/stats.types';
import { StatsMetricsGrid } from './insights/StatsMetricsGrid';

/**
 * StatsView - 振り返りビュー（Review タブ）
 *
 * 期間ベースの振り返り。KPIメトリクス。
 */
export function StatsView({ className }: StatsViewProps) {
  return (
    <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <StatsMetricsGrid />
        </div>
      </div>
    </div>
  );
}
