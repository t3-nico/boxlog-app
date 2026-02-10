'use client';

import { useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import 'react-calendar-heatmap/dist/styles.css';

/** YearlyHeatmap - 年次活動ヒートマップ */
const meta = {
  title: 'Features/Stats/YearlyHeatmap',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Types & Helpers
// ─────────────────────────────────────────────────────────

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

/** ランダムなヒートマップデータを生成 */
function generateMockValues(year: number): HeatmapValue[] {
  const values: HeatmapValue[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const current = new Date(startDate);
  while (current <= endDate) {
    // 70%の確率でアクティビティあり
    if (Math.random() > 0.3) {
      const dateStr = current.toISOString().split('T')[0] ?? '';
      values.push({
        date: dateStr,
        hours: Math.round(Math.random() * 8 * 10) / 10,
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return values;
}

// ─────────────────────────────────────────────────────────
// Presentational Component
// ─────────────────────────────────────────────────────────

function YearlyHeatmapDisplay({
  initialYear,
  values,
}: {
  initialYear: number;
  values: HeatmapValue[];
}) {
  const [year, setYear] = useState(initialYear);
  const currentYear = new Date().getFullYear();

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const totalHours = values.reduce((sum, v) => sum + v.hours, 0);

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
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────

const mockValues2025 = generateMockValues(2025);

const emptyValues: HeatmapValue[] = [];

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** デフォルト（データあり） */
export const Default: Story = {
  render: () => <YearlyHeatmapDisplay initialYear={2025} values={mockValues2025} />,
};

/** データなし */
export const Empty: Story = {
  render: () => <YearlyHeatmapDisplay initialYear={2025} values={emptyValues} />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <YearlyHeatmapDisplay initialYear={2025} values={mockValues2025} />
      <YearlyHeatmapDisplay initialYear={2025} values={emptyValues} />
    </div>
  ),
};
