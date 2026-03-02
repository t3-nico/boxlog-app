'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { BarChart3, CircleSlash, Moon, Sun } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { useCalendarFilterStore, type ItemType } from '@/stores/useCalendarFilterStore';

import { SidebarSection } from '@/components/layout/SidebarSection';
import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/theme-context';
import { useDeleteTag, useReorderTags, useUpdateTag } from '@/hooks/mutations/useTagMutations';
import { useTagModalNavigation } from '@/hooks/useTagModalNavigation';
import { useTags } from '@/hooks/useTagsQuery';
import { useTagCacheStore } from '@/stores/useTagCacheStore';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/trpc';

import { TagSortableTree } from '@/components/tags/TagSortableTree';
import { CreateTagButton } from './components/CreateTagButton';
import { FilterItem } from './components/FilterItem';

/** Planのデフォルト色 */
const PLAN_COLOR = '#3b82f6'; // blue-500
/** Recordのデフォルト色 */
const RECORD_COLOR = '#10b981'; // emerald-500

/**
 * カレンダーフィルターリスト
 *
 * Googleカレンダーの「マイカレンダー」のようなUI
 * - 種類: Plan / Record
 * - タグ: グループ別に階層表示
 */
export function CalendarFilterList() {
  const t = useTranslations();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: tagStats } = api.plans.getTagStats.useQuery();

  const tagPlanCounts = useMemo(() => tagStats?.counts ?? {}, [tagStats?.counts]);
  const untaggedCount = tagStats?.untaggedCount ?? 0;

  // タグ別カウント（フラット構造のため各タグのカウントをそのまま使用）
  const parentTagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tags?.forEach((tag) => {
      counts[tag.id] = tagPlanCounts[tag.id] ?? 0;
    });
    return counts;
  }, [tags, tagPlanCounts]);

  const deleteTagMutation = useDeleteTag();
  const reorderTagsMutation = useReorderTags();
  const updateTagMutation = useUpdateTag();

  // TagSortableTree用のタグ更新ハンドラー
  const handleUpdateTag = useCallback(
    (
      tagId: string,
      data: {
        name?: string;
        color?: string;
      },
    ) => {
      updateTagMutation.mutate({ id: tagId, ...data });
    },
    [updateTagMutation],
  );

  // TagSortableTree用の並び替えハンドラー
  const handleReorder = useCallback(
    (updates: Array<{ id: string; sort_order: number }>) => {
      reorderTagsMutation.mutate({ updates });
    },
    [reorderTagsMutation],
  );

  // セレクタで必要な状態のみ購読（CLAUDE.md: 全状態購読禁止）
  const visibleTypes = useCalendarFilterStore((s) => s.visibleTypes);
  const visibleTagIds = useCalendarFilterStore((s) => s.visibleTagIds);
  const showUntagged = useCalendarFilterStore((s) => s.showUntagged);
  // アクション（参照安定）
  const toggleType = useCalendarFilterStore((s) => s.toggleType);
  const toggleTag = useCalendarFilterStore((s) => s.toggleTag);
  const toggleUntagged = useCalendarFilterStore((s) => s.toggleUntagged);
  const initializeWithTags = useCalendarFilterStore((s) => s.initializeWithTags);
  const showOnlyTag = useCalendarFilterStore((s) => s.showOnlyTag);
  const showOnlyUntagged = useCalendarFilterStore((s) => s.showOnlyUntagged);

  // タグミューテーション状態を監視（Race Condition防止）
  // mutationCountは参照カウント方式：複数mutation同時実行に対応
  const mutationCount = useTagCacheStore((state) => state.mutationCount);
  const isSettling = useTagCacheStore((state) => state.isSettling);

  // タグ一覧取得後に初期化（mutation中・settling中は競合防止のためスキップ）
  useEffect(() => {
    // mutation中（カウント > 0）またはinvalidate完了待機中はスキップ
    if (mutationCount > 0 || isSettling) return;

    if (tags && tags.length > 0) {
      initializeWithTags(tags.map((tag) => tag.id));
    }
  }, [tags, initializeWithTags, mutationCount, isSettling]);

  const isLoading = tagsLoading;

  // タグモーダルナビゲーション
  const { openTagCreateModal, openTagMergeModal } = useTagModalNavigation();

  // 削除確認ダイアログの状態（IDと名前を保持）
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // タグ追加ハンドラー
  const handleAddTag = () => {
    openTagCreateModal();
  };

  // 親タグ削除ハンドラー
  const handleDeleteParentTag = (tagId: string, tagName: string) => {
    setDeleteTarget({ id: tagId, name: tagName });
  };

  // 削除確認後のハンドラー
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteTagMutation.mutateAsync({ id: deleteTarget.id });
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="w-full min-w-0 space-y-2 overflow-hidden p-2">
        {/* 種類（Plan / Record） */}
        <SidebarSection title={t('calendar.filter.type')} defaultOpen className="py-1">
          <FilterItem
            label="Plan"
            checkboxColor={PLAN_COLOR}
            checked={visibleTypes.plan}
            onCheckedChange={() => toggleType('plan' as ItemType)}
          />
          <FilterItem
            label="Record"
            checkboxColor={RECORD_COLOR}
            checked={visibleTypes.record}
            onCheckedChange={() => toggleType('record' as ItemType)}
          />
        </SidebarSection>

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
            <>
              <TagSortableTree
                tags={tags}
                visibleTagIds={visibleTagIds}
                tagCounts={tagPlanCounts}
                parentTagCounts={parentTagCounts}
                onToggleTag={toggleTag}
                onUpdateTag={handleUpdateTag}
                onDeleteTag={(tagId: string, tagName: string) =>
                  handleDeleteParentTag(tagId, tagName)
                }
                onAddChildTag={handleAddTag}
                onShowOnlyTag={showOnlyTag}
                onOpenMergeModal={openTagMergeModal}
                onReorder={handleReorder}
                indentationWidth={16}
              />

              {/* タグなし */}
              <FilterItem
                label={t('calendar.filter.untagged')}
                checked={showUntagged}
                onCheckedChange={toggleUntagged}
                onShowOnlyThis={showOnlyUntagged}
                checkboxColor="#6B7280"
                labelClassName="text-muted-foreground"
                count={untaggedCount}
                icon={<CircleSlash className="size-4" />}
              />
            </>
          ) : (
            <div className="text-muted-foreground px-2 py-2 text-xs">
              {t('calendar.filter.noTags')}
            </div>
          )}
        </SidebarSection>

        {/* 通知 + テーマ切替 */}
        <SidebarUtilities />
      </div>

      {/* 親タグ削除確認ダイアログ */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={t('calendar.filter.deleteParentTag.title', { name: deleteTarget?.name ?? '' })}
        description={t('calendar.filter.deleteParentTag.description')}
        variant="destructive"
      />
    </>
  );
}

/** Stats + テーマ切替ユーティリティ */
function SidebarUtilities() {
  const t = useTranslations();
  const locale = useLocale();
  const { resolvedTheme, setTheme } = useTheme();

  const handleThemeToggle = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  return (
    <div className="flex items-center gap-1 px-2 py-2">
      <HoverTooltip content={t('calendar.views.stats')} side="right">
        <Button variant="ghost" icon className="size-8" asChild>
          <Link href={`/${locale}/stats`} aria-label={t('calendar.views.stats')}>
            <BarChart3 className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </HoverTooltip>
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
