'use client';

import { ArrowDown, ArrowLeft, ArrowUp, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { useStatsFilterStore } from '../stores/useStatsFilterStore';
import type { StatsTagBreakdown } from '../types/stats.types';

interface StatsTableProps {
  tagBreakdown: StatsTagBreakdown[];
}

function formatMinutesToDisplay(minutes: number): string {
  const hours = minutes / 60;
  if (hours === 0) return '0h';
  if (hours >= 10) return `${Math.round(hours)}h`;
  if (hours >= 1) return `${Math.round(hours * 10) / 10}h`;
  return `${minutes}m`;
}

function DeltaIndicator({
  currentMinutes,
  previousMinutes,
}: {
  currentMinutes: number;
  previousMinutes: number;
}) {
  const deltaMinutes = currentMinutes - previousMinutes;
  const deltaHours = deltaMinutes / 60;

  if (Math.abs(deltaMinutes) < 1) {
    return (
      <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
        <Minus className="h-3 w-3" />
        <span>±0</span>
      </span>
    );
  }

  const formatted =
    Math.abs(deltaHours) >= 1
      ? `${Math.round(Math.abs(deltaHours) * 10) / 10}h`
      : `${Math.round(Math.abs(deltaMinutes))}m`;

  return (
    <span
      className={cn(
        'flex items-center gap-0.5 text-xs font-medium',
        deltaMinutes > 0
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400',
      )}
    >
      {deltaMinutes > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      <span>
        {deltaMinutes > 0 ? '+' : '-'}
        {formatted}
      </span>
    </span>
  );
}

/**
 * Stats テーブル: タグ別 Plan/Done/%/vs先週
 */
export function StatsTable({ tagBreakdown }: StatsTableProps) {
  const t = useTranslations('calendar.stats');
  const selectedTagId = useStatsFilterStore((s) => s.selectedTagId);
  const setSelectedTag = useStatsFilterStore((s) => s.setSelectedTag);

  // ドリルダウンモード: 選択タグの子タグだけ表示
  const displayData = selectedTagId
    ? tagBreakdown.filter((item) => item.parentId === selectedTagId)
    : tagBreakdown.filter((item) => item.parentId === null);

  // 表示データの合計
  const totals = displayData.reduce(
    (acc, item) => ({
      planned: acc.planned + item.plannedMinutes,
      actual: acc.actual + item.actualMinutes,
      prevActual: acc.prevActual + item.previousActualMinutes,
    }),
    { planned: 0, actual: 0, prevActual: 0 },
  );

  const totalPercent = totals.planned > 0 ? Math.round((totals.actual / totals.planned) * 100) : 0;

  return (
    <div className="px-4 pb-4">
      {/* ドリルダウン中: 戻るボタン */}
      {selectedTagId && (
        <button
          type="button"
          onClick={() => setSelectedTag(null)}
          className="text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('backToAll')}
        </button>
      )}

      {/* テーブル */}
      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-left text-xs font-medium">
              <th className="px-3 py-2">{t('tag')}</th>
              <th className="px-3 py-2 text-right">{t('plan')}</th>
              <th className="px-3 py-2 text-right">{t('done')}</th>
              <th className="px-3 py-2 text-right">{t('percent')}</th>
              <th className="px-3 py-2 text-right">{t('vsLastWeek')}</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {displayData.map((item) => {
              const percent =
                item.plannedMinutes > 0
                  ? Math.round((item.actualMinutes / item.plannedMinutes) * 100)
                  : item.actualMinutes > 0
                    ? 100
                    : 0;

              const hasChildren = tagBreakdown.some((t) => t.parentId === item.tagId);

              return (
                <tr
                  key={item.tagId}
                  className={cn(
                    'hover:bg-muted/30 transition-colors',
                    hasChildren && 'cursor-pointer',
                  )}
                  onClick={hasChildren ? () => setSelectedTag(item.tagId) : undefined}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.tagColor }}
                      />
                      <span className="text-foreground text-sm font-medium">{item.tagName}</span>
                      {hasChildren && (
                        <span className="text-muted-foreground text-xs">&rsaquo;</span>
                      )}
                    </div>
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5 text-right text-sm">
                    {formatMinutesToDisplay(item.plannedMinutes)}
                  </td>
                  <td className="text-foreground px-3 py-2.5 text-right text-sm font-medium">
                    {formatMinutesToDisplay(item.actualMinutes)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        percent >= 100
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : percent >= 70
                            ? 'text-foreground'
                            : 'text-amber-600 dark:text-amber-400',
                      )}
                    >
                      {percent}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <DeltaIndicator
                      currentMinutes={item.actualMinutes}
                      previousMinutes={item.previousActualMinutes}
                    />
                  </td>
                </tr>
              );
            })}

            {/* Total row */}
            <tr className="bg-muted/30 border-t-2 font-medium">
              <td className="px-3 py-2.5">
                <span className="text-foreground text-sm">{t('total')}</span>
              </td>
              <td className="text-muted-foreground px-3 py-2.5 text-right text-sm">
                {formatMinutesToDisplay(totals.planned)}
              </td>
              <td className="text-foreground px-3 py-2.5 text-right text-sm">
                {formatMinutesToDisplay(totals.actual)}
              </td>
              <td className="px-3 py-2.5 text-right">
                <span className="text-foreground text-sm">{totalPercent}%</span>
              </td>
              <td className="px-3 py-2.5 text-right">
                <DeltaIndicator
                  currentMinutes={totals.actual}
                  previousMinutes={totals.prevActual}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {displayData.length === 0 && (
        <div className="text-muted-foreground py-8 text-center text-sm">{t('noTagData')}</div>
      )}
    </div>
  );
}
