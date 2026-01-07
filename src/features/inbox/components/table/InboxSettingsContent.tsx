'use client';

import {
  MobileSettingsButtonGroup,
  MobileSettingsChip,
  MobileSettingsSection,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Group, Settings2 } from 'lucide-react';
import { useInboxColumnStore } from '../../stores/useInboxColumnStore';
import { useInboxGroupStore } from '../../stores/useInboxGroupStore';
import type { GroupByField } from '../../types/group';

/**
 * グループ化オプション
 */
const GROUP_BY_OPTIONS: Array<{ value: GroupByField; label: string }> = [
  { value: null, label: 'なし' },
  { value: 'status', label: 'ステータス' },
  { value: 'due_date', label: '期限' },
  { value: 'tags', label: 'タグ' },
];

/**
 * Inbox設定コンテンツ
 *
 * TableNavigationの設定シートに表示する内容
 * - グループ化設定
 * - 列設定
 *
 * フィルターはフィルターシートで表示（InboxFilterContent）
 */
export function InboxSettingsContent() {
  // グループ化
  const { groupBy, setGroupBy } = useInboxGroupStore();

  // 列設定
  const { columns, toggleColumnVisibility, resetColumns } = useInboxColumnStore();
  const configurableColumns = columns.filter((col) => col.id !== 'selection');

  return (
    <div className="space-y-6">
      {/* グループ化 */}
      <MobileSettingsSection icon={<Group />} title="グループ化">
        <MobileSettingsButtonGroup
          options={GROUP_BY_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          value={groupBy}
          onValueChange={setGroupBy}
        />
      </MobileSettingsSection>

      {/* 列設定 */}
      <MobileSettingsSection
        icon={<Settings2 />}
        title={
          <div className="flex items-center justify-between">
            <span>列の表示</span>
            <Button variant="ghost" size="sm" onClick={resetColumns} className="h-auto p-0 text-xs">
              リセット
            </Button>
          </div>
        }
        showSeparator={false}
      >
        <div className="flex flex-wrap gap-2">
          {configurableColumns.map((column) => (
            <MobileSettingsChip
              key={column.id}
              id={`settings-column-${column.id}`}
              label={column.label}
              checked={column.visible}
              onCheckedChange={() => toggleColumnVisibility(column.id)}
            />
          ))}
        </div>
      </MobileSettingsSection>
    </div>
  );
}
