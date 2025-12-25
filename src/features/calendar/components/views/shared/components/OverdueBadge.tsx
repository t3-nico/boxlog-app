'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { cn } from '@/lib/utils';

import type { OverduePlan } from '../../../../hooks/useOverduePlans';

interface OverdueBadgeProps {
  /** 未完了プラン配列 */
  overduePlans: OverduePlan[];
  /** 追加のクラス名 */
  className?: string;
  /** 追加のスタイル */
  style?: React.CSSProperties;
}

/**
 * 超過時間をフォーマット
 * @param minutes 超過時間（分）
 * @returns フォーマット済み文字列（例: "2h 30m", "45m"）
 */
function formatOverdueTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * OverdueBadge - 未完了プランのバッジコンポーネント
 *
 * @description
 * 未完了で期限切れのプランの件数を表示するバッジ。
 * クリックするとポップオーバーでプラン一覧を表示し、
 * 各プランをクリックするとInspectorを開く。
 */
export function OverdueBadge({ overduePlans, className, style }: OverdueBadgeProps) {
  const t = useTranslations('calendar.overdue');
  const openInspector = usePlanInspectorStore((state) => state.openInspector);

  // 未完了プランがない場合は非表示
  if (overduePlans.length === 0) {
    return null;
  }

  const handlePlanClick = (planId: string) => {
    openInspector(planId);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'text-destructive',
            'flex items-center justify-center gap-1 text-xs font-medium md:gap-1.5',
            'transition-colors focus:outline-none',
            className,
          )}
          style={style}
        >
          <AlertCircle className="size-3 flex-shrink-0" />
          <span className="truncate">{t('badge', { count: overduePlans.length })}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-border border-b px-3 py-2">
          <h4 className="text-sm font-semibold">{t('popoverTitle')}</h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {overduePlans.map(({ plan, overdueMinutes }) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => handlePlanClick(plan.id)}
              className={cn(
                'hover:bg-state-hover w-full px-3 py-2 text-left transition-colors',
                'border-border border-b last:border-b-0',
                'focus:bg-state-focus focus:outline-none',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{plan.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {t('overdueBy', { time: formatOverdueTime(overdueMinutes) })}
                  </p>
                </div>
                <div
                  className="mt-1 size-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: plan.color }}
                  aria-hidden="true"
                />
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
