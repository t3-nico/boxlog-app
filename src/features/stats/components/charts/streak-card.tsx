'use client';

import { Flame, Trophy } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/trpc';

export function StreakCard() {
  const { data, isPending } = api.plans.getStreak.useQuery();

  if (isPending) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="text-warning size-5" />
            連続日数
          </CardTitle>
          <CardDescription>継続は力なり</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="text-warning size-5" />
          連続日数
        </CardTitle>
        <CardDescription>継続は力なり</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* 現在のストリーク */}
          <div className="text-center">
            <div className="text-3xl font-bold">{data.currentStreak}</div>
            <div className="text-muted-foreground text-xs">日連続</div>
          </div>

          {/* 区切り線 */}
          <div className="bg-border h-12 w-px" />

          {/* 最長記録 */}
          <div className="flex items-center gap-2 text-center">
            <Trophy className="text-warning size-4" />
            <div>
              <div className="text-lg font-bold">{data.longestStreak}</div>
              <div className="text-muted-foreground text-xs">最長記録</div>
            </div>
          </div>

          {/* 区切り線 */}
          <div className="bg-border h-12 w-px" />

          {/* アクティブ日数 */}
          <div className="text-center">
            <div className="text-lg font-bold">{data.totalActiveDays}</div>
            <div className="text-muted-foreground text-xs">日 / 年</div>
          </div>
        </div>

        {/* 今日のステータス */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {data.hasActivityToday ? (
            <span className="text-success flex items-center gap-1">
              <span className="bg-success size-2 rounded-full" />
              今日も達成済み
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="bg-muted size-2 rounded-full" />
              今日はまだ記録なし
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
