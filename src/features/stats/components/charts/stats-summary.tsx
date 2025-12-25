'use client';

import { CheckCircle2, Clock, TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/trpc';

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${hours.toFixed(1)}h`;
}

export function StatsSummary() {
  const { data, isPending } = api.plans.getSummary.useQuery();

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardContent>
        </Card>
        <Card className="bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardContent>
        </Card>
        <Card className="bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isPositive = data.monthComparison >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 完了タスク */}
      <Card className="bg-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">完了タスク</CardTitle>
          <CheckCircle2 className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.completedTasks}</div>
          <p className="text-muted-foreground text-xs">今週 {data.thisWeekCompleted} 件完了</p>
        </CardContent>
      </Card>

      {/* 今月の作業時間 */}
      <Card className="bg-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今月の作業時間</CardTitle>
          <Clock className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(data.thisMonthHours)}</div>
          <p className="text-muted-foreground text-xs">
            {isPositive ? (
              <Badge className="bg-success hover:bg-success">+{data.monthComparison}%</Badge>
            ) : (
              <Badge variant="destructive">{data.monthComparison}%</Badge>
            )}{' '}
            前月比
          </p>
        </CardContent>
      </Card>

      {/* 累計時間 */}
      <Card className="bg-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">累計時間</CardTitle>
          {isPositive ? (
            <TrendingUp className="text-muted-foreground size-4" />
          ) : (
            <TrendingDown className="text-muted-foreground size-4" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(data.totalHours)}</div>
          <p className="text-muted-foreground text-xs">先月 {formatHours(data.lastMonthHours)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
