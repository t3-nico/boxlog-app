'use client';

import { FolderTree, List, Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  MobileSettingsButtonGroup,
  MobileSettingsChip,
  MobileSettingsSection,
} from '@/components/common';
import { useTagColumnStore, type TagColumnId } from '@/features/tags/stores/useTagColumnStore';
import { useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore';

/**
 * タグ設定コンテンツ
 *
 * TableSettingsSheet内で表示するタグ固有の設定
 * - 表示モード切替（フラット/グループ）
 * - 列設定
 *
 * @example
 * ```tsx
 * <TableNavigation
 *   config={{
 *     ...config,
 *     settingsContent: <TagsSettingsContent />,
 *   }}
 * />
 * ```
 */
export function TagsSettingsContent() {
  const t = useTranslations();

  // 表示モード
  const { displayMode, setDisplayMode } = useTagDisplayModeStore();

  // 列設定
  const columns = useTagColumnStore((state) => state.columns);
  const toggleColumnVisibility = useTagColumnStore((state) => state.toggleColumnVisibility);

  // 設定可能な列（selectionとname以外）
  const configurableColumns = columns.filter((col) => col.id !== 'selection' && col.id !== 'name');

  return (
    <>
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
          {configurableColumns.map((col) => (
            <MobileSettingsChip
              key={col.id}
              id={`tag-column-${col.id}`}
              label={col.label}
              checked={col.visible}
              onCheckedChange={() => toggleColumnVisibility(col.id as TagColumnId)}
            />
          ))}
        </div>
      </MobileSettingsSection>
    </>
  );
}
