'use client';

import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import { PlanCard } from '@/features/board/components/shared/PlanCard';
import { useCalendarFilterStore } from '@/features/calendar/stores/useCalendarFilterStore';
import { useInboxData } from '@/features/inbox/hooks/useInboxData';

import type { OpenSort } from './OpenNavigation';

interface OpenCardListProps {
  sort: OpenSort;
}

/**
 * OpenCardList - Calendar Sidebar用カードリスト（status: openかつ未スケジュールのプラン）
 *
 * **機能**:
 * - usePlansData でデータ取得
 * - ソート（作成日/更新日）
 * - カレンダーにスケジュールされていないプランのみ表示
 * - PlanCard を再利用（ドラッグ可能）
 *
 * **Note**: PlanCard の useDraggable は既に実装済みなので、
 * DndContext 内に配置すれば自動的にドラッグ可能になる
 */
export function OpenCardList({ sort }: OpenCardListProps) {
  const t = useTranslations('calendar.open');

  // status: 'open' のプランのみ取得
  const { items, isPending, error } = useInboxData({ status: 'open' });

  // カレンダーフィルター（タグフィルター）
  const isPlanVisible = useCalendarFilterStore((state) => state.isPlanVisible);

  // フィルタリング・ソート処理
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 0. スケジュール済みを除外（start_time がないもののみ表示）
    result = result.filter((item) => !item.start_time);

    // 1. カレンダーフィルター（タグによる表示/非表示）
    result = result.filter((item) => {
      const tagIds = item.tags?.map((tag) => tag.id) || [];
      return isPlanVisible(tagIds);
    });

    // 2. ソート
    result.sort((a, b) => {
      if (sort === 'created') {
        // 作成日順（新しい順）
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sort === 'updated') {
        // 更新日順（新しい順）
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return 0;
    });

    return result;
  }, [items, sort, isPlanVisible]);

  // ローディング表示
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground mt-2 text-sm">{t('loading')}</p>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-destructive text-sm font-medium">{t('error')}</p>
        <p className="text-muted-foreground mt-1 text-xs">{error.message}</p>
      </div>
    );
  }

  // 空状態
  if (filteredAndSortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">{t('noTasks')}</p>
      </div>
    );
  }

  // カードリスト表示（PlanCardを再利用）
  // パディングはこのコンポーネント内で管理（スクロール時の見切れ防止）
  return (
    <div className="flex flex-col gap-2 overflow-y-auto px-4 py-2">
      {filteredAndSortedItems.map((item) => (
        <PlanCard key={item.id} item={item} />
      ))}
    </div>
  );
}
