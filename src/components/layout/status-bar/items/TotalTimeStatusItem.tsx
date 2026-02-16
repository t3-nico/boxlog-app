'use client';

import { useTranslations } from 'next-intl';

import { HoverTooltip } from '@/components/ui/tooltip';
import { CACHE_5_MINUTES } from '@/constants/time';
import { formatDurationMinutes } from '@/lib/date/format';
import { api } from '@/lib/trpc';

/**
 * 今週の時間をステータスバーに表示（スプラトゥーン塗り結果風）
 *
 * 表示: "8h 30m ██████░░░░ 6h 15m +15%"
 *        Plan(primary)  比率バー  Record(success)  差分
 *
 * - 今週（月〜日）のPlan/Recordを集計
 * - Plan/Recordの比率を角張ったバーで視覚的に表現
 * - 差分パーセントで優勢側を一目で把握
 * - エラー時は非表示（ステータスバーを壊さない）
 */
export function TotalTimeStatusItem() {
  const t = useTranslations('calendar');

  const { data, isPending, isError } = api.plans.getCumulativeTime.useQuery(undefined, {
    staleTime: CACHE_5_MINUTES,
    refetchInterval: CACHE_5_MINUTES,
  });

  if (isError) return null;

  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
        <span>...</span>
      </div>
    );
  }

  const planMinutes = data?.planTotalMinutes ?? 0;
  const recordMinutes = data?.recordTotalMinutes ?? 0;
  const total = planMinutes + recordMinutes;
  const planPercent = total > 0 ? Math.round((planMinutes / total) * 100) : 50;
  const recordPercent = 100 - planPercent;
  const diff = recordPercent - planPercent;

  const planLabel = formatDurationMinutes(planMinutes);
  const recordLabel = formatDurationMinutes(recordMinutes);

  const tooltipText = `${t('statusBar.plan')}: ${planLabel} (${planPercent}%) / ${t('statusBar.record')}: ${recordLabel} (${recordPercent}%)`;

  const diffLabel = diff === 0 ? 'EVEN' : `${diff > 0 ? '+' : ''}${diff}%`;

  return (
    <HoverTooltip content={tooltipText} side="top">
      <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
        <span className="text-primary font-medium tabular-nums">{planLabel}</span>
        <div className="flex h-2 w-20 overflow-hidden rounded-sm">
          <div className="bg-primary h-full" style={{ width: `${planPercent}%` }} />
          <div className="bg-success h-full" style={{ width: `${recordPercent}%` }} />
        </div>
        <span className="text-success font-medium tabular-nums">{recordLabel}</span>
        <span className="text-muted-foreground/50 text-xs tabular-nums">{diffLabel}</span>
      </div>
    </HoverTooltip>
  );
}
