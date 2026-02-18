'use client';

import { useMemo } from 'react';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import type { ReflectionSummary } from '../types';

import { ReflectionEmptyState } from './ReflectionEmptyState';
import { ReflectionListCard } from './ReflectionListCard';

interface ReflectionListViewProps {
  reflections: ReflectionSummary[];
  onSelect: (id: string) => void;
  onGenerate?: (() => void) | undefined;
}

/** 週グループのラベルキー */
type WeekGroup = 'thisWeek' | 'lastWeek' | 'older';

interface GroupedReflections {
  key: WeekGroup;
  items: ReflectionSummary[];
}

/**
 * Reflectionを週ごとにグループ化する
 */
function groupByWeek(reflections: ReflectionSummary[]): GroupedReflections[] {
  const now = new Date();
  // 今週の月曜日 00:00:00 を算出
  const todayDay = now.getDay();
  const mondayOffset = todayDay === 0 ? -6 : 1 - todayDay;
  const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const groups: Record<WeekGroup, ReflectionSummary[]> = {
    thisWeek: [],
    lastWeek: [],
    older: [],
  };

  for (const r of reflections) {
    const date = new Date(`${r.date}T00:00:00`);
    if (date >= thisWeekStart) {
      groups.thisWeek.push(r);
    } else if (date >= lastWeekStart) {
      groups.lastWeek.push(r);
    } else {
      groups.older.push(r);
    }
  }

  // 空グループは除外
  const result: GroupedReflections[] = [];
  if (groups.thisWeek.length > 0) result.push({ key: 'thisWeek', items: groups.thisWeek });
  if (groups.lastWeek.length > 0) result.push({ key: 'lastWeek', items: groups.lastWeek });
  if (groups.older.length > 0) result.push({ key: 'older', items: groups.older });

  return result;
}

/**
 * Reflection一覧ビュー
 *
 * 週ごとにグループ化された Reflection カードリストを表示。
 * ヘッダーに「生成」ボタン、空状態は ReflectionEmptyState を再利用。
 */
export function ReflectionListView({ reflections, onSelect, onGenerate }: ReflectionListViewProps) {
  const t = useTranslations('calendar.reflection');

  const grouped = useMemo(() => groupByWeek(reflections), [reflections]);

  if (reflections.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center">
          <ReflectionEmptyState onGenerate={onGenerate ?? (() => {})} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー: 生成ボタン */}
      <div className="flex shrink-0 items-center justify-end px-4 py-2">
        <Button variant="ghost" size="sm" onClick={onGenerate}>
          <Sparkles className="size-4" />
          {t('empty.generate')}
        </Button>
      </div>

      {/* リスト */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="flex flex-col gap-4">
          {grouped.map((group) => (
            <section key={group.key}>
              <h3 className="text-muted-foreground mb-1 px-2 text-xs font-medium">
                {t(`list.${group.key}`)}
              </h3>
              <div className="flex flex-col">
                {group.items.map((r) => (
                  <ReflectionListCard key={r.id} reflection={r} onClick={onSelect} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
