'use client';

import { cn } from '@/lib/utils';

import { CalendarViewAnimation } from '../../animations/ViewTransition';

import { DayOfWeekChart } from './components/charts/DayOfWeekChart';
import { HourlyDistributionChart } from './components/charts/HourlyDistributionChart';
import { MonthlyTrendChart } from './components/charts/MonthlyTrendChart';
import { TagTimeChart } from './components/charts/TagTimeChart';
import { YearlyHeatmap } from './components/charts/YearlyHeatmap';
import type { StatsViewProps } from './StatsView.types';

/**
 * StatsView - 累積統計ビュー
 *
 * 全期間/期間フィルター付きの累積チャートを表示。
 * 週次進捗（Hero Cards / Tag Table / Sleep）はサイドパネルに移動済み。
 */
export function StatsView({ className }: StatsViewProps) {
  return (
    <CalendarViewAnimation viewType="agenda">
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
    </CalendarViewAnimation>
  );
}
