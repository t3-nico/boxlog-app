'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatsPeriodStore } from '@/features/stats/stores';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

import 'react-calendar-heatmap/dist/styles.css';

type HeatmapValue = {
  date: string;
  hours: number;
};

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${hours.toFixed(1)}h`;
}

export function YearlyHeatmap() {
  const currentYear = new Date().getFullYear();
  const year = useStatsPeriodStore((state) => state.heatmapYear);
  const setYear = useStatsPeriodStore((state) => state.setHeatmapYear);

  const { data, isPending } = api.plans.getDailyHours.useQuery({ year });

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // データをHeatmap用に変換
  const values: HeatmapValue[] = data ?? [];

  // 合計時間を計算
  const totalHours = values.reduce((sum, v) => sum + v.hours, 0);

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>年次グリッド</CardTitle>
          <CardDescription>年間の活動量</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>年次グリッド</CardTitle>
          <CardDescription>
            {year}年の活動量 - 合計 {formatHours(totalHours)}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYear(year - 1)}
            disabled={year <= 2020}
            aria-label="前年"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-16 text-center text-sm font-normal">{year}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYear(year + 1)}
            disabled={year >= currentYear}
            aria-label="翌年"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* モバイルで横スクロール対応 */}
        <div className="yearly-heatmap -mx-2 overflow-x-auto px-2 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="min-w-[650px]">
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={values}
              classForValue={(value) => {
                const v = value as HeatmapValue | undefined;
                if (!v || !v.hours || v.hours === 0) {
                  return 'color-empty';
                }
                if (v.hours < 1) return 'color-scale-1';
                if (v.hours < 3) return 'color-scale-2';
                if (v.hours < 5) return 'color-scale-3';
                return 'color-scale-4';
              }}
              titleForValue={(value) => {
                const v = value as HeatmapValue | undefined;
                if (!v || !v.date) return '';
                return `${v.date}: ${formatHours(v.hours || 0)}`;
              }}
              showWeekdayLabels
              gutterSize={2}
            />
          </div>
        </div>

        {/* 凡例 */}
        <div className="text-muted-foreground mt-4 flex items-center justify-end gap-2 text-xs">
          <span>Less</span>
          <div className="flex gap-1">
            <div className={cn('bg-muted size-3 rounded')} />
            <div className={cn('bg-primary/20 size-3 rounded')} />
            <div className={cn('bg-primary/40 size-3 rounded')} />
            <div className={cn('bg-primary/60 size-3 rounded')} />
            <div className={cn('bg-primary/80 size-3 rounded')} />
          </div>
          <span>More</span>
        </div>
      </CardContent>

      <style jsx global>{`
        .yearly-heatmap .react-calendar-heatmap {
          font-size: 10px;
        }
        .yearly-heatmap .react-calendar-heatmap text {
          fill: var(--color-muted-foreground);
        }
        .yearly-heatmap .react-calendar-heatmap .color-empty {
          fill: var(--color-muted);
        }
        .yearly-heatmap .react-calendar-heatmap .color-scale-1 {
          fill: oklch(from var(--primary) l c h / 20%);
        }
        .yearly-heatmap .react-calendar-heatmap .color-scale-2 {
          fill: oklch(from var(--primary) l c h / 40%);
        }
        .yearly-heatmap .react-calendar-heatmap .color-scale-3 {
          fill: oklch(from var(--primary) l c h / 60%);
        }
        .yearly-heatmap .react-calendar-heatmap .color-scale-4 {
          fill: oklch(from var(--primary) l c h / 80%);
        }
        .yearly-heatmap .react-calendar-heatmap rect:hover {
          stroke: var(--color-foreground);
          stroke-width: 1px;
        }
      `}</style>
    </Card>
  );
}
