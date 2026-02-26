'use client';

import { useCallback, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { useRecordData, type RecordFilters } from '@/hooks/useRecordData';
import { useTagsMap } from '@/hooks/useTagsMap';
import type { RecordGroupByField } from '@/lib/record-grouping';
import { groupRecordItems } from '@/lib/record-grouping';
import { usePlanInspectorStore } from '@/stores/usePlanInspectorStore';
import type { WorkedAtFilter } from '@/stores/useRecordFilterStore';
import { useRecordInspectorStore } from '@/stores/useRecordInspectorStore';

import { useCalendarFilterStore } from '../../stores/useCalendarFilterStore';

import { PlanListGroup } from './PlanListGroup';
import { RecordListCard } from './RecordListCard';
import type {
  RecordPanelDateFilter,
  RecordPanelGroupByField,
  RecordPanelSortField,
  RecordPanelSortOrder,
} from './RecordListSortMenu';
import { RecordListToolbar } from './RecordListToolbar';

/**
 * RecordPanelDateFilter → WorkedAtFilter の変換
 */
function toWorkedAtFilter(dateFilter: RecordPanelDateFilter): WorkedAtFilter {
  switch (dateFilter) {
    case 'today':
      return 'today';
    case 'this_week':
      return 'this_week';
    case 'this_month':
      return 'this_month';
    default:
      return 'all';
  }
}

/**
 * アサイド用の Record リストパネル
 *
 * PlanListPanel と同構造:
 * - 検索・ソート・グルーピング・日付フィルター
 * - カレンダーフィルター（タグ）と連動
 * - クリックで RecordInspector 表示
 * - +ボタンで新規 Record 作成（PlanInspector 経由）
 */
export function RecordListPanel() {
  const t = useTranslations('calendar');

  // 検索状態
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ソート/グルーピング/フィルター状態
  const [sortBy, setSortBy] = useState<RecordPanelSortField>('worked_at');
  const [sortOrder, setSortOrder] = useState<RecordPanelSortOrder>('desc');
  const [groupBy, setGroupBy] = useState<RecordPanelGroupByField>(null);
  const [dateFilter, setDateFilter] = useState<RecordPanelDateFilter>('all');

  // グループ折りたたみ状態
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // カレンダーフィルター（タグ）
  const isPlanVisible = useCalendarFilterStore((s) => s.isPlanVisible);

  // Inspector
  const openRecordInspector = useRecordInspectorStore((s) => s.openInspector);
  const openInspectorWithDraft = usePlanInspectorStore((s) => s.openInspectorWithDraft);

  // タグ名解決（グルーピング用）
  const { getTagById } = useTagsMap();

  // Record 一覧取得
  const filters: RecordFilters = { workedAt: toWorkedAtFilter(dateFilter) };
  if (search) {
    filters.search = search;
  }
  const { items, isPending, error } = useRecordData(filters, {
    field: sortBy,
    direction: sortOrder,
  });

  // フィルタリング: タグフィルター
  const filteredRecords = useMemo(() => {
    return items.filter((record) => {
      const tagIds = record.tagIds ?? [];
      return isPlanVisible(tagIds);
    });
  }, [items, isPlanVisible]);

  // グルーピング
  const groupedRecords = useMemo(() => {
    if (!groupBy) return null;

    const groups = groupRecordItems(filteredRecords, groupBy as RecordGroupByField);

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
  }, [filteredRecords, groupBy, getTagById]);

  // ハンドラ
  const handleSortChange = useCallback(
    (field: RecordPanelSortField, order: RecordPanelSortOrder) => {
      setSortBy(field);
      setSortOrder(order);
    },
    [],
  );

  const handleGroupByChange = useCallback((field: RecordPanelGroupByField) => {
    setGroupBy(field);
    setCollapsedGroups(new Set());
  }, []);

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

  const handleCreateRecord = useCallback(() => {
    openInspectorWithDraft({}, 'record');
  }, [openInspectorWithDraft]);

  // ツールバー props
  const toolbarProps = {
    search,
    onSearchChange: setSearch,
    isSearchOpen,
    onSearchOpenChange: setIsSearchOpen,
    sortBy,
    sortOrder,
    groupBy,
    dateFilter,
    onSortChange: handleSortChange,
    onGroupByChange: handleGroupByChange,
    onDateFilterChange: setDateFilter,
    onCreateRecord: handleCreateRecord,
  };

  // ローディング状態
  if (isPending) {
    return (
      <div className="flex h-full flex-col">
        <RecordListToolbar {...toolbarProps} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground text-sm">{t('aside.loading')}</div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="flex h-full flex-col">
        <RecordListToolbar {...toolbarProps} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-destructive text-sm">{t('aside.error')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ツールバー */}
      <RecordListToolbar {...toolbarProps} />

      {/* リスト */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredRecords.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <p className="text-sm">{t('aside.noRecords')}</p>
          </div>
        ) : groupedRecords ? (
          // グルーピング表示
          <div className="flex flex-col gap-1">
            {groupedRecords.map((group) => (
              <PlanListGroup
                key={group.groupKey}
                label={group.groupLabel}
                count={group.count}
                isCollapsed={collapsedGroups.has(group.groupKey)}
                onToggle={() => toggleGroup(group.groupKey)}
              >
                {group.items.map((record) => (
                  <RecordListCard
                    key={record.id}
                    record={record}
                    onClick={() => openRecordInspector(record.id)}
                  />
                ))}
              </PlanListGroup>
            ))}
          </div>
        ) : (
          // フラット表示
          <div className="flex flex-col gap-2">
            {filteredRecords.map((record) => (
              <RecordListCard
                key={record.id}
                record={record}
                onClick={() => openRecordInspector(record.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
