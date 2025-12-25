'use client';

import {
  MobileSettingsButtonGroup,
  MobileSettingsChip,
  MobileSettingsSection,
  MobileSettingsSheet,
} from '@/components/common';
import { Input } from '@/components/ui/input';
import type { TagColumnId } from '@/features/tags/stores/useTagColumnStore';
import { useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore';
import { FolderTree, List, Search, Settings2, X } from 'lucide-react';
import { useRef } from 'react';

interface ColumnSetting {
  id: TagColumnId;
  label: string;
}

interface VisibleColumn {
  id: string;
  width: number;
}

interface MobileTagsSettingsSheetProps {
  columnSettings: ColumnSetting[];
  visibleColumns: VisibleColumn[];
  onColumnVisibilityChange: (columnId: TagColumnId, visible: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  t: (key: string) => string;
}

/**
 * モバイル用タグ設定シート
 *
 * Notion風の1つのアイコンから全設定にアクセスできるボトムシート
 * - 検索
 * - 表示モード切替（フラット/グループ）
 * - 列設定
 *
 * @example
 * ```tsx
 * <MobileTagsSettingsSheet
 *   columnSettings={columnSettings}
 *   visibleColumns={visibleColumns}
 *   onColumnVisibilityChange={handleColumnVisibilityChange}
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   t={t}
 * />
 * ```
 */
export function MobileTagsSettingsSheet({
  columnSettings,
  visibleColumns,
  onColumnVisibilityChange,
  searchQuery,
  onSearchChange,
  t,
}: MobileTagsSettingsSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 表示モード
  const { displayMode, setDisplayMode } = useTagDisplayModeStore();

  // アクティブな設定があるかどうか
  const hasActiveSettings = searchQuery.length > 0;

  return (
    <MobileSettingsSheet title={t('tags.page.settings')} hasActiveSettings={hasActiveSettings}>
      {/* 検索 */}
      <MobileSettingsSection icon={<Search />} title={t('tags.page.search')}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={t('tags.page.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </MobileSettingsSection>

      {/* 表示モード */}
      <MobileSettingsSection icon={<List />} title={t('tags.page.displayMode.title')}>
        <MobileSettingsButtonGroup
          options={[
            { value: 'flat', label: t('tags.page.displayMode.flat'), icon: <List /> },
            { value: 'grouped', label: t('tags.page.displayMode.grouped'), icon: <FolderTree /> },
          ]}
          value={displayMode}
          onValueChange={setDisplayMode}
          fullWidth
        />
      </MobileSettingsSection>

      {/* 列設定 */}
      <MobileSettingsSection
        icon={<Settings2 />}
        title={t('tags.page.columnSettings')}
        showSeparator={false}
      >
        <div className="flex flex-wrap gap-2">
          {columnSettings.map((col) => {
            const isVisible = visibleColumns.some((c) => c.id === col.id);
            return (
              <MobileSettingsChip
                key={col.id}
                id={`mobile-tag-column-${col.id}`}
                label={col.label}
                checked={isVisible}
                onCheckedChange={(checked) => onColumnVisibilityChange(col.id, checked)}
              />
            );
          })}
        </div>
      </MobileSettingsSection>
    </MobileSettingsSheet>
  );
}
