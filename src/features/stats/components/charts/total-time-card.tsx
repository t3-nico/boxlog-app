'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/trpc';

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}分`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) {
    return `${h}時間`;
  }
  return `${h}時間${m}分`;
}

export function TotalTimeCard() {
  const { data, isPending } = api.plans.getTotalTime.useQuery();

  if (isPending) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">予定の合計時間</CardTitle>
          <CardDescription>すべての予定の時間</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-16 items-center justify-center">
            データがありません
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">予定の合計時間</CardTitle>
        <CardDescription>すべての予定の時間</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* 合計時間 */}
          <div className="text-center">
            <div className="text-3xl font-bold">{formatHours(data.totalHours)}</div>
            <div className="text-muted-foreground text-xs">合計</div>
          </div>

          {/* 区切り線 */}
          <div className="bg-border h-12 w-px" />

          {/* 予定数 */}
          <div className="text-center">
            <div className="text-lg font-semibold">{data.planCount}</div>
            <div className="text-muted-foreground text-xs">件の予定</div>
          </div>

          {/* 区切り線 */}
          <div className="bg-border h-12 w-px" />

          {/* 平均時間 */}
          <div className="text-center">
            <div className="text-lg font-semibold">{formatHours(data.avgHoursPerPlan)}</div>
            <div className="text-muted-foreground text-xs">平均 / 件</div>
          </div>
        </div>

        {/* ステータス表示 */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {data.planCount > 0 ? (
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="bg-primary size-2 rounded-full" />
              時間設定済みの予定を集計
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="bg-muted size-2 rounded-full" />
              時間設定済みの予定がありません
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
