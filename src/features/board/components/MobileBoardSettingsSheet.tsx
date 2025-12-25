'use client';

import {
  MobileSettingsButtonGroup,
  MobileSettingsChip,
  MobileSettingsSection,
  MobileSettingsSheet,
} from '@/components/common';
import type { PlanStatus } from '@/features/plans/types/plan';
import { ArrowDownAZ, ArrowUpAZ, Filter, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBoardStatusFilterStore } from '../stores/useBoardStatusFilterStore';
import { useKanbanStore } from '../stores/useKanbanStore';

/**
 * ステータス選択肢
 */
const STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> = [
  { value: 'todo', label: 'Todo' },
  { value: 'doing', label: 'Doing' },
  { value: 'done', label: 'Done' },
];

/**
 * 優先度フィルター選択肢
 */
const PRIORITY_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
] as const;

/**
 * ソート選択肢
 */
const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: '作成日（新しい順）' },
  { value: 'createdAt-asc', label: '作成日（古い順）' },
  { value: 'updatedAt-desc', label: '更新日（新しい順）' },
  { value: 'updatedAt-asc', label: '更新日（古い順）' },
  { value: 'priority-desc', label: '優先度（高い順）' },
  { value: 'priority-asc', label: '優先度（低い順）' },
  { value: 'title-asc', label: 'タイトル（A→Z）' },
  { value: 'title-desc', label: 'タイトル（Z→A）' },
] as const;

/**
 * モバイル用ボード設定シート
 *
 * Notion風の1つのアイコンから全設定にアクセスできるボトムシート
 * - カラム表示設定（Todo/Doing/Done）
 * - 優先度フィルター
 * - ソート設定
 *
 * @example
 * ```tsx
 * <MobileBoardSettingsSheet />
 * ```
 */
export function MobileBoardSettingsSheet() {
  const t = useTranslations();

  // カラム表示設定
  const {
    visibleStatuses,
    toggleStatus,
    resetFilters: resetStatusFilters,
  } = useBoardStatusFilterStore();

  // フィルター・ソート
  const { filter, setFilter, clearFilter, sort, setSort } = useKanbanStore();

  // アクティブな設定があるかどうか
  const hasActiveSettings =
    visibleStatuses.size < 3 || // 一部カラムが非表示
    Object.keys(filter).length > 0 || // フィルターがある
    sort.key !== 'createdAt' ||
    sort.order !== 'desc'; // デフォルトソートと異なる

  // 全てリセット
  const handleResetAll = () => {
    resetStatusFilters();
    clearFilter();
    setSort({ key: 'createdAt', order: 'desc' });
  };

  return (
    <MobileSettingsSheet
      title={t('board.toolbar.settings') || '表示設定'}
      hasActiveSettings={hasActiveSettings}
      resetLabel="すべてリセット"
      onReset={handleResetAll}
    >
      {/* カラム表示設定 */}
      <MobileSettingsSection icon={<Layers />} title="表示カラム">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <MobileSettingsChip
              key={option.value}
              id={`mobile-board-status-${option.value}`}
              label={option.label}
              checked={visibleStatuses.has(option.value)}
              onCheckedChange={() => toggleStatus(option.value)}
            />
          ))}
        </div>
      </MobileSettingsSection>

      {/* 優先度フィルター */}
      <MobileSettingsSection icon={<Filter />} title={t('board.toolbar.priority') || '優先度'}>
        <MobileSettingsButtonGroup
          options={PRIORITY_OPTIONS.map((opt) => ({
            value: opt.value === 'all' ? null : opt.value,
            label: opt.label,
          }))}
          value={filter.priority ?? null}
          onValueChange={(value) =>
            setFilter({ priority: value as 'low' | 'medium' | 'high' | undefined })
          }
        />
      </MobileSettingsSection>

      {/* ソート */}
      <MobileSettingsSection
        icon={sort.order === 'asc' ? <ArrowUpAZ /> : <ArrowDownAZ />}
        title={t('board.toolbar.sort') || 'ソート'}
        showSeparator={false}
      >
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => {
            const [key, order] = option.value.split('-') as [typeof sort.key, typeof sort.order];
            const isActive = sort.key === key && sort.order === order;
            return (
              <MobileSettingsChip
                key={option.value}
                id={`mobile-board-sort-${option.value}`}
                label={option.label}
                checked={isActive}
                onCheckedChange={() => setSort({ key, order })}
              />
            );
          })}
        </div>
      </MobileSettingsSection>
    </MobileSettingsSheet>
  );
}
