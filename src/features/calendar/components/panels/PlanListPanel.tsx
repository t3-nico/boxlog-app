'use client';

import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import { usePlans } from '@/features/plans/hooks/usePlans';
import { usePlanFilterStore } from '@/features/plans/stores/usePlanFilterStore';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import type { PlanStatus } from '@/features/plans/types/plan';
import { useCalendarFilterStore } from '../../stores/useCalendarFilterStore';

import { PlanListCard } from './PlanListCard';
import { PlanListToolbar } from './PlanListToolbar';

/**
 * サイドパネル用のPlanリストパネル
 *
 * - Open/Closedフィルター
 * - 検索
 * - タグフィルター（CalendarSidebarと連動）
 * - クリックでInspector表示
 */
export function PlanListPanel() {
  const t = useTranslations('calendar');

  // フィルター状態
  const status = usePlanFilterStore((s) => s.status);
  const setStatus = usePlanFilterStore((s) => s.setStatus);
  const search = usePlanFilterStore((s) => s.search);
  const setSearch = usePlanFilterStore((s) => s.setSearch);
  const isSearchOpen = usePlanFilterStore((s) => s.isSearchOpen);
  const setIsSearchOpen = usePlanFilterStore((s) => s.setIsSearchOpen);

  // カレンダーフィルター（タグ）
  const isPlanVisible = useCalendarFilterStore((s) => s.isPlanVisible);

  // Inspector
  const openInspector = usePlanInspectorStore((s) => s.openInspector);

  // プラン一覧取得（searchが空文字の場合はundefinedを渡す）
  const { data: plans, isLoading, error } = usePlans(search ? { search } : undefined);

  // フィルタリング
  const filteredPlans = useMemo(() => {
    if (!plans) return [];

    return plans.filter((plan) => {
      // ステータスフィルター（plan.statusはstringなのでasでキャスト）
      if (!status.includes(plan.status as PlanStatus)) {
        return false;
      }

      // タグフィルター（CalendarSidebarと連動）
      const tagIds = plan.tagIds ?? [];
      if (!isPlanVisible(tagIds)) {
        return false;
      }

      return true;
    });
  }, [plans, status, isPlanVisible]);

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <PlanListToolbar
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
          isSearchOpen={isSearchOpen}
          onSearchOpenChange={setIsSearchOpen}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground text-sm">{t('panel.loading')}</div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="flex h-full flex-col">
        <PlanListToolbar
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
          isSearchOpen={isSearchOpen}
          onSearchOpenChange={setIsSearchOpen}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-destructive text-sm">{t('panel.error')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ツールバー */}
      <PlanListToolbar
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        isSearchOpen={isSearchOpen}
        onSearchOpenChange={setIsSearchOpen}
      />

      {/* リスト */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredPlans.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <p className="text-sm">{t('panel.noPlans')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredPlans.map((plan) => (
              <PlanListCard key={plan.id} plan={plan} onClick={() => openInspector(plan.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
