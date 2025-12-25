'use client';

import {
  MobileSettingsChip,
  MobileSettingsRadioGroup,
  MobileSettingsSection,
} from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useBoardStatusFilterStore } from '@/features/board/stores/useBoardStatusFilterStore';
import type { PlanStatus } from '@/features/plans/types/plan';
import { Columns3, Filter, Tag } from 'lucide-react';
import { type DueDateFilter, useInboxFilterStore } from '../../stores/useInboxFilterStore';

/**
 * 期限フィルター選択肢
 */
const DUE_DATE_OPTIONS: Array<{ value: DueDateFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日期限' },
  { value: 'tomorrow', label: '明日期限' },
  { value: 'this_week', label: '今週中' },
  { value: 'next_week', label: '来週' },
  { value: 'overdue', label: '期限切れ' },
  { value: 'no_due_date', label: '期限なし' },
];

/**
 * ステータスラベル
 */
const STATUS_LABELS: Record<PlanStatus, string> = {
  todo: 'Todo',
  doing: 'Doing',
  done: 'Done',
};

const STATUS_LIST: PlanStatus[] = ['todo', 'doing', 'done'];

/**
 * Inbox Board設定コンテンツ
 *
 * TableNavigationの設定シートに表示する内容
 * - 列の表示/非表示（ステータス）
 * - 期限フィルター
 * - タグフィルター
 */
export function InboxBoardSettingsContent() {
  // フィルター
  const { tags, dueDate, setTags, setDueDate } = useInboxFilterStore();

  // 列設定（ステータス表示/非表示）
  const { toggleStatus, isStatusVisible, resetFilters } = useBoardStatusFilterStore();

  // フィルター数をカウント
  const tagFilterCount = tags.length;
  const filterCount = tagFilterCount + (dueDate !== 'all' ? 1 : 0);

  // タグトグル
  const handleTagToggle = (tagId: string) => {
    const newTags = tags.includes(tagId) ? tags.filter((t) => t !== tagId) : [...tags, tagId];
    setTags(newTags);
  };

  return (
    <div className="space-y-6">
      {/* 列設定（ステータス表示/非表示） */}
      <MobileSettingsSection
        icon={<Columns3 />}
        title={
          <div className="flex items-center justify-between">
            <span>列の表示</span>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-auto p-0 text-xs">
              リセット
            </Button>
          </div>
        }
      >
        <div className="space-y-1">
          {STATUS_LIST.map((status) => (
            <div
              key={status}
              className="hover:bg-state-hover flex items-center space-x-2 rounded-sm px-2 py-1.5"
            >
              <Checkbox
                id={`board-status-${status}`}
                checked={isStatusVisible(status)}
                onCheckedChange={() => toggleStatus(status)}
              />
              <Label
                htmlFor={`board-status-${status}`}
                className="flex-1 cursor-pointer text-sm font-normal"
              >
                {STATUS_LABELS[status]}
              </Label>
            </div>
          ))}
        </div>
      </MobileSettingsSection>

      {/* フィルター */}
      <MobileSettingsSection
        icon={<Filter />}
        title={
          <div className="flex items-center gap-2">
            <span>フィルター</span>
            {filterCount > 0 && (
              <Badge variant="secondary" className="px-1.5 text-xs">
                {filterCount}
              </Badge>
            )}
            {filterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTags([]);
                  setDueDate('all');
                }}
                className="ml-auto h-auto p-0 text-xs"
              >
                クリア
              </Button>
            )}
          </div>
        }
      >
        {/* 期限フィルター */}
        <div className="mb-4">
          <Label className="text-muted-foreground mb-2 block text-xs">期限</Label>
          <MobileSettingsRadioGroup
            options={DUE_DATE_OPTIONS}
            value={dueDate}
            onValueChange={setDueDate}
            idPrefix="board-due-date"
          />
        </div>
      </MobileSettingsSection>

      {/* タグフィルター */}
      <MobileSettingsSection icon={<Tag />} title="タグフィルター" showSeparator={false}>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tagId) => (
              <MobileSettingsChip
                key={tagId}
                id={`board-tag-${tagId}`}
                label={tagId}
                checked={true}
                onCheckedChange={() => handleTagToggle(tagId)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">タグフィルターはありません</p>
        )}
      </MobileSettingsSection>
    </div>
  );
}
