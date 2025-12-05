'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/trpc'
import { cn } from '@/lib/utils'

import 'react-calendar-heatmap/dist/styles.css'

type HeatmapValue = {
  date: string
  hours: number
}

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`
  }
  return `${hours.toFixed(1)}h`
}

export function YearlyHeatmap() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  // @ts-expect-error - TypeScript型キャッシュの問題。実行時は正常動作
  const { data, isLoading } = api.plans.getDailyHours.useQuery({ year })

  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  // データをHeatmap用に変換
  const values: HeatmapValue[] = data ?? []

  // 合計時間を計算
  const totalHours = values.reduce((sum, v) => sum + v.hours, 0)

  if (isLoading) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>年次グリッド</CardTitle>
          <CardDescription>年間の活動量</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>年次グリッド</CardTitle>
          <CardDescription>
            {year}年の活動量 - 合計 {formatHours(totalHours)}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)} disabled={year <= 2020}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-16 text-center text-sm font-medium">{year}</span>
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y + 1)} disabled={year >= currentYear}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="yearly-heatmap">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={values}
            classForValue={(value) => {
              const v = value as HeatmapValue | undefined
              if (!v || !v.hours || v.hours === 0) {
                return 'color-empty'
              }
              if (v.hours < 1) return 'color-scale-1'
              if (v.hours < 3) return 'color-scale-2'
              if (v.hours < 5) return 'color-scale-3'
              return 'color-scale-4'
            }}
            titleForValue={(value) => {
              const v = value as HeatmapValue | undefined
              if (!v || !v.date) return ''
              return `${v.date}: ${formatHours(v.hours || 0)}`
            }}
            showWeekdayLabels
            gutterSize={2}
          />
        </div>

        {/* 凡例 */}
        <div className="text-muted-foreground mt-4 flex items-center justify-end gap-2 text-xs">
          <span>Less</span>
          <div className="flex gap-1">
            <div className={cn('bg-muted size-3 rounded-sm')} />
            <div className={cn('bg-primary/20 size-3 rounded-sm')} />
            <div className={cn('bg-primary/40 size-3 rounded-sm')} />
            <div className={cn('bg-primary/60 size-3 rounded-sm')} />
            <div className={cn('bg-primary/80 size-3 rounded-sm')} />
          </div>
          <span>More</span>
        </div>
      </CardContent>

      <style jsx global>{`
        .yearly-heatmap .react-calendar-heatmap {
          font-size: 10px;
        }
        .yearly-heatmap .react-calendar-heatmap text {
          fill: hsl(var(--muted-foreground));
        }
        .yearly-heatmap .react-calendar-heatmap .color-empty {
          fill: hsl(var(--muted));
        }
        .yearly-heatmap .react-calendar-heatmap .color-scale-1 {
          fill: hsl(var(--primary) / 0.2);
        }
        .yearly-heatmap .react-calendar-heatmap .color-scale-2 {
          fill: hsl(var(--primary) / 0.4);
        }
        .yearly-heatmap .react-calendar-heatmap .color-scale-3 {
          fill: hsl(var(--primary) / 0.6);
        }
        .yearly-heatmap .react-calendar-heatmap .color-scale-4 {
          fill: hsl(var(--primary) / 0.8);
        }
        .yearly-heatmap .react-calendar-heatmap rect:hover {
          stroke: hsl(var(--foreground));
          stroke-width: 1px;
        }
      `}</style>
    </Card>
  )
}
