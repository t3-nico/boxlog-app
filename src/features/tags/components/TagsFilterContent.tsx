'use client';

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import {
  type DateRangeFilter,
  type GroupFilter,
  type UsageFilter,
  useTagFilterStore,
} from '@/features/tags/stores/useTagFilterStore';
import { BarChart3, Calendar, Folder, FolderTree, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * タグフィルターコンテンツ
 *
 * Linear/Account.tsx風の2カラム構造
 * - DropdownMenuSub でカテゴリ → サブメニュー
 * - 使用状況・作成日・グループ: RadioGroup（単一選択）
 */
export function TagsFilterContent() {
  const t = useTranslations('tag');
  const { usage, setUsage, selectedGroup, setSelectedGroup, createdAt, setCreatedAt, reset } =
    useTagFilterStore();
  const { data: allGroups } = useTagGroups();

  // フィルターがアクティブかどうか
  const hasActiveFilters = usage !== 'all' || selectedGroup !== 'all' || createdAt !== 'all';

  return (
    <>
      <DropdownMenuGroup>
        {/* グループフィルター（単一選択） */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderTree />
            <span className="flex-1">{t('filter.group')}</span>
            {selectedGroup !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <ScrollArea className="max-h-64">
              <DropdownMenuRadioGroup
                value={selectedGroup}
                onValueChange={(v) => setSelectedGroup(v as GroupFilter)}
              >
                {/* すべて */}
                <DropdownMenuRadioItem value="all">{t('filter.all')}</DropdownMenuRadioItem>

                {/* 未分類 */}
                <DropdownMenuRadioItem value="uncategorized">
                  <span className="flex items-center gap-2">
                    <Folder className="text-muted-foreground size-4" />
                    {t('filter.uncategorized')}
                  </span>
                </DropdownMenuRadioItem>

                {/* グループ一覧 */}
                {allGroups?.map((group) => (
                  <DropdownMenuRadioItem key={group.id} value={group.id}>
                    <span className="flex items-center gap-2">
                      <Folder className="size-4" style={{ color: group.color ?? undefined }} />
                      {group.name}
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </ScrollArea>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 使用状況フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <BarChart3 />
            <span className="flex-1">{t('filter.usage')}</span>
            {usage !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup value={usage} onValueChange={(v) => setUsage(v as UsageFilter)}>
              <DropdownMenuRadioItem value="all">{t('filter.all')}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="unused">{t('filter.unused')}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="frequently_used">
                {t('filter.frequentlyUsed')}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 作成日フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Calendar />
            <span className="flex-1">{t('filter.createdAt')}</span>
            {createdAt !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={createdAt}
              onValueChange={(v) => setCreatedAt(v as DateRangeFilter)}
            >
              <DropdownMenuRadioItem value="all">{t('filter.all')}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="today">{t('filter.today')}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="this_week">
                {t('filter.thisWeek')}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="this_month">
                {t('filter.thisMonth')}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      {/* リセットボタン（フィルターがアクティブな場合のみ表示） */}
      {hasActiveFilters && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={reset}>
            <RotateCcw />
            {t('filter.reset')}
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
