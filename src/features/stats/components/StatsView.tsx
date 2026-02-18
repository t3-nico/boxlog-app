'use client';

import { cn } from '@/lib/utils';

import type { StatsViewProps } from '../types/stats.types';
import { DayOfWeekChart } from './charts/DayOfWeekChart';
import { HourlyDistributionChart } from './charts/HourlyDistributionChart';
import { MonthlyTrendChart } from './charts/MonthlyTrendChart';
import { TagTimeChart } from './charts/TagTimeChart';
import { YearlyHeatmap } from './charts/YearlyHeatmap';

/**
 * StatsView - 累積統計ビュー
 *
 * 全期間/期間フィルター付きの累積チャートを表示。
 * 週次進捗（Hero Cards / Tag Table / Sleep）はアサイドに移動済み。
 */
export function StatsView({ className }: StatsViewProps) {
  return (
    <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <YearlyHeatmap />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TagTimeChart />
            <MonthlyTrendChart />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <HourlyDistributionChart />
            <DayOfWeekChart />
          </div>
        </div>
      </div>
    </div>
  );
}
