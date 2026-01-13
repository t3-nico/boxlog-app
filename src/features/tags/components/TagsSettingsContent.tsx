'use client';

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useTagColumnStore, type TagColumnId } from '@/features/tags/stores/useTagColumnStore';
import { useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore';
import { Columns3, FolderTree, List, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * 表示モードオプション（valueとiconのみ定義、labelは翻訳から取得）
 */
const DISPLAY_MODE_OPTIONS = [
  { value: 'flat', labelKey: 'page.displayMode.flat', icon: List },
  { value: 'grouped', labelKey: 'page.displayMode.grouped', icon: FolderTree },
] as const;

/**
 * タグ設定コンテンツ
 *
 * - 表示モード: RadioGroup（単一選択）
 * - 列の表示: CheckboxItem（複数選択）
 *
 * グループ管理はテーブル内で完結（ヘッダーボタン→インライン作成行）
 */
export function TagsSettingsContent() {
  const t = useTranslations('tag');

  // 表示モード
  const displayMode = useTagDisplayModeStore((state) => state.displayMode);
  const setDisplayMode = useTagDisplayModeStore((state) => state.setDisplayMode);

  // 列設定
  const columns = useTagColumnStore((state) => state.columns);
  const toggleColumnVisibility = useTagColumnStore((state) => state.toggleColumnVisibility);
  const resetColumns = useTagColumnStore((state) => state.resetColumns);

  // 設定可能な列（selectionとname以外）
  const configurableColumns = columns.filter((col) => col.id !== 'selection' && col.id !== 'name');

  // 非表示の列数をカウント
  const hiddenColumnCount = configurableColumns.filter((col) => !col.visible).length;

  // 設定がアクティブかどうか
  const hasActiveSettings = displayMode === 'grouped' || hiddenColumnCount > 0;

  // リセット
  const handleReset = () => {
    setDisplayMode('flat');
    resetColumns();
  };

  return (
    <>
      <DropdownMenuGroup>
        {/* 表示モード */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <List />
            <span className="flex-1">{t('settings.displayMode')}</span>
            {displayMode === 'grouped' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={displayMode}
              onValueChange={(v) => setDisplayMode(v as 'flat' | 'grouped')}
            >
              {DISPLAY_MODE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <option.icon className="size-4" />
                    {t(option.labelKey)}
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 列の表示 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Columns3 />
            <span className="flex-1">{t('settings.columns')}</span>
            {hiddenColumnCount > 0 && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                {hiddenColumnCount}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            {configurableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => toggleColumnVisibility(column.id as TagColumnId)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      {/* リセットボタン（設定がアクティブな場合のみ表示） */}
      {hasActiveSettings && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleReset}>
            <RotateCcw />
            {t('settings.reset')}
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
