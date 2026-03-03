'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useCalendarFilterStore } from '@/stores/useCalendarFilterStore';

import { SidebarSection } from '@/components/layout/SidebarSection';
import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/theme-context';
import { useDeleteTag } from '@/hooks/mutations/useTagMutations';
import { useTagModalNavigation } from '@/hooks/useTagModalNavigation';
import { useTags } from '@/hooks/useTagsQuery';
import { useTagCacheStore } from '@/stores/useTagCacheStore';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/trpc';

import { CreateTagButton } from './components/CreateTagButton';
import { TagFlatList } from './components/TagFlatList';

/**
 * カレンダーフィルターリスト
 *
 * Googleカレンダーの「マイカレンダー」のようなUI
 * - タグ: コロン記法プレフィックスでグルーピング表示
 * - チェックボックスで表示/非表示を切替
 */
export function CalendarFilterList() {
  const t = useTranslations();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: tagStats } = api.plans.getTagStats.useQuery();

  const tagPlanCounts = useMemo(() => tagStats?.counts ?? {}, [tagStats?.counts]);

  const deleteTagMutation = useDeleteTag();

  // セレクタで必要な状態のみ購読
  const visibleTagIds = useCalendarFilterStore((s) => s.visibleTagIds);
  const toggleTag = useCalendarFilterStore((s) => s.toggleTag);
  const initializeWithTags = useCalendarFilterStore((s) => s.initializeWithTags);
  const showOnlyTag = useCalendarFilterStore((s) => s.showOnlyTag);
  const toggleGroupTags = useCalendarFilterStore((s) => s.toggleGroupTags);
  const showOnlyGroupTags = useCalendarFilterStore((s) => s.showOnlyGroupTags);
  const getGroupVisibility = useCalendarFilterStore((s) => s.getGroupVisibility);

  // タグミューテーション状態を監視（Race Condition防止）
  const mutationCount = useTagCacheStore((state) => state.mutationCount);
  const isSettling = useTagCacheStore((state) => state.isSettling);

  // タグ一覧取得後に初期化（mutation中・settling中は競合防止のためスキップ）
  useEffect(() => {
    if (mutationCount > 0 || isSettling) return;

    if (tags && tags.length > 0) {
      initializeWithTags(tags.map((tag) => tag.id));
    }
  }, [tags, initializeWithTags, mutationCount, isSettling]);

  const isLoading = tagsLoading;

  // タグモーダルナビゲーション
  const { openTagCreateModal: _openTagCreateModal } = useTagModalNavigation();

  // 削除確認ダイアログの状態
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // 削除ハンドラー
  const handleDeleteTag = useCallback((tagId: string, tagName: string) => {
    setDeleteTarget({ id: tagId, name: tagName });
  }, []);

  // 削除確認後のハンドラー
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTagMutation.mutateAsync({ id: deleteTarget.id });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="w-full min-w-0 space-y-2 overflow-hidden p-2">
        {/* タグ */}
        <SidebarSection
          title={t('calendar.filter.tags')}
          defaultOpen
          className="py-1"
          action={<CreateTagButton />}
        >
          {isLoading ? (
            <div className="space-y-1 py-1">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : tags && tags.length > 0 ? (
            <TagFlatList
              tags={tags}
              visibleTagIds={visibleTagIds}
              tagCounts={tagPlanCounts}
              onToggleTag={toggleTag}
              onDeleteTag={handleDeleteTag}
              onShowOnlyTag={showOnlyTag}
              onToggleGroupTags={toggleGroupTags}
              onShowOnlyGroupTags={showOnlyGroupTags}
              getGroupVisibility={getGroupVisibility}
            />
          ) : (
            <div className="text-muted-foreground px-2 py-2 text-xs">
              {t('calendar.filter.noTags')}
            </div>
          )}
        </SidebarSection>

        {/* Stats + テーマ切替 */}
        <SidebarUtilities />
      </div>

      {/* タグ削除確認ダイアログ */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={t('calendar.filter.deleteTag.title', { name: deleteTarget?.name ?? '' })}
        description={t('calendar.filter.deleteTag.description')}
        variant="destructive"
      />
    </>
  );
}

/** テーマ切替ユーティリティ */
function SidebarUtilities() {
  const t = useTranslations();
  const { resolvedTheme, setTheme } = useTheme();

  const handleThemeToggle = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  return (
    <div className="flex items-center gap-1 px-2 py-2">
      <HoverTooltip content={resolvedTheme === 'light' ? 'Dark mode' : 'Light mode'} side="right">
        <Button
          variant="ghost"
          icon
          className="size-8"
          onClick={handleThemeToggle}
          aria-label={t('sidebar.theme')}
        >
          {resolvedTheme === 'light' ? (
            <Moon className="size-4" aria-hidden="true" />
          ) : (
            <Sun className="size-4" aria-hidden="true" />
          )}
        </Button>
      </HoverTooltip>
    </div>
  );
}
