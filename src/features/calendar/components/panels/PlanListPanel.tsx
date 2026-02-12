'use client';

import { useCallback, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { usePlans } from '@/features/plans/hooks/usePlans';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { groupItems } from '@/features/plans/utils/grouping';
import { useTagsMap } from '@/features/tags/hooks/useTagsMap';
import type { PlanWithTags } from '@/server/services/plans/types';
import { usePanelDrag } from '../../hooks/usePanelDrag';
import { useCalendarFilterStore } from '../../stores/useCalendarFilterStore';

import { PlanListCard } from './PlanListCard';
import { PlanListGroup } from './PlanListGroup';
import type {
  PanelGroupByField,
  PanelScheduleFilter,
  PanelSortField,
  PanelSortOrder,
  PanelStatusFilter,
} from './PlanListSortMenu';
import { PlanListToolbar } from './PlanListToolbar';

/**
 * サイドパネル用のPlanリストパネル
 *
 * 「まだ時間を決めていない、やるべきこと」のリスト
 * - start_time === null && status === 'open' のPlanのみ表示
 * - ソート/グルーピング
 * - 検索
 * - タグフィルター（CalendarSidebarと連動）
 * - クリックでInspector表示
 */
export function PlanListPanel() {
  const t = useTranslations('calendar');

  // 検索状態
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ソート/グルーピング/フィルター状態
  const [sortBy, setSortBy] = useState<PanelSortField>('created_at');
  const [sortOrder, setSortOrder] = useState<PanelSortOrder>('desc');
  const [groupBy, setGroupBy] = useState<PanelGroupByField>(null);
  const [scheduleFilter, setScheduleFilter] = useState<PanelScheduleFilter>('unscheduled');
  const [statusFilter, setStatusFilter] = useState<PanelStatusFilter>('open');

  // グループ折りたたみ状態
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // カレンダーフィルター（タグ）
  const isPlanVisible = useCalendarFilterStore((s) => s.isPlanVisible);

  // Inspector
  const openInspector = usePlanInspectorStore((s) => s.openInspector);
  const openInspectorWithDraft = usePlanInspectorStore((s) => s.openInspectorWithDraft);

  // D&D
  const { handleDragStart } = usePanelDrag();

  // タグ名解決（グルーピング用）
  const { getTagById } = useTagsMap();

  // プラン一覧取得（サーバー側ソート + ステータスフィルター）
  const baseFilters =
    statusFilter === 'all' ? { sortBy, sortOrder } : { status: statusFilter, sortBy, sortOrder };
  const {
    data: plans,
    isLoading,
    error,
  } = usePlans(search ? { ...baseFilters, search } : baseFilters);

  // フィルタリング: スケジュールフィルター + タグフィルター
  const filteredPlans = useMemo(() => {
    if (!plans) return [];

    return plans.filter((plan) => {
      // スケジュールフィルター
      if (scheduleFilter === 'unscheduled' && plan.start_time) {
        return false;
      }
      if (scheduleFilter === 'scheduled' && !plan.start_time) {
        return false;
      }

      // タグフィルター
      const tagIds = plan.tagIds ?? [];
      if (!isPlanVisible(tagIds)) {
        return false;
      }

      return true;
    });
  }, [plans, isPlanVisible, scheduleFilter]);

  // グルーピング
  const groupedPlans = useMemo(() => {
    if (!groupBy) return null;

    const groups = groupItems(filteredPlans, groupBy);

    // タググルーピング時はタグ名でラベルを解決
    if (groupBy === 'tags') {
      return groups.map((group) => {
        if (group.groupKey === 'タグなし') return group;
        const tag = getTagById(group.groupKey);
        return {
          ...group,
          groupLabel: tag?.name ?? group.groupKey,
        };
      });
    }

    return groups;
  }, [filteredPlans, groupBy, getTagById]);

  // ソート変更ハンドラ
  const handleSortChange = useCallback((field: PanelSortField, order: PanelSortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  // グルーピング変更ハンドラ
  const handleGroupByChange = useCallback((field: PanelGroupByField) => {
    setGroupBy(field);
    setCollapsedGroups(new Set());
  }, []);

  // グループ折りたたみ切り替え
  const toggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  // Plan → Record 変換ハンドラ
  const handleCreateRecordFromPlan = useCallback(
    (plan: PlanWithTags) => {
      openInspectorWithDraft(
        {
          title: plan.title || '',
          description: plan.description ?? null,
          start_time: plan.start_time ?? null,
          end_time: plan.end_time ?? null,
          tagIds: plan.tagIds ?? [],
          plan_id: plan.id,
        },
        'record',
      );
    },
    [openInspectorWithDraft],
  );

  // ツールバーの共通 props
  const toolbarProps = {
    search,
    onSearchChange: setSearch,
    isSearchOpen,
    onSearchOpenChange: setIsSearchOpen,
    sortBy,
    sortOrder,
    groupBy,
    scheduleFilter,
    statusFilter,
    onSortChange: handleSortChange,
    onGroupByChange: handleGroupByChange,
    onScheduleFilterChange: setScheduleFilter,
    onStatusFilterChange: setStatusFilter,
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <PlanListToolbar {...toolbarProps} />
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
        <PlanListToolbar {...toolbarProps} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-destructive text-sm">{t('panel.error')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ツールバー */}
      <PlanListToolbar {...toolbarProps} />

      {/* リスト */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredPlans.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <p className="text-sm">{t('panel.noPlans')}</p>
          </div>
        ) : groupedPlans ? (
          // グルーピング表示
          <div className="flex flex-col gap-1">
            {groupedPlans.map((group) => (
              <PlanListGroup
                key={group.groupKey}
                label={group.groupLabel}
                count={group.count}
                isCollapsed={collapsedGroups.has(group.groupKey)}
                onToggle={() => toggleGroup(group.groupKey)}
              >
                {group.items.map((plan) => (
                  <PlanListCard
                    key={plan.id}
                    plan={plan}
                    onClick={() => openInspector(plan.id)}
                    onDragStart={handleDragStart}
                    onCreateRecord={handleCreateRecordFromPlan}
                  />
                ))}
              </PlanListGroup>
            ))}
          </div>
        ) : (
          // フラット表示
          <div className="flex flex-col gap-2">
            {filteredPlans.map((plan) => (
              <PlanListCard
                key={plan.id}
                plan={plan}
                onClick={() => openInspector(plan.id)}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
