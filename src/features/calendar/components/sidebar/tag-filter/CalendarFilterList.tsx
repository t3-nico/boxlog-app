'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { CircleSlash } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useCalendarFilterStore, type ItemType } from '../../../stores/useCalendarFilterStore';

import { SidebarSection } from '@/features/navigation/components/sidebar/SidebarSection';
import { TagMergeModal } from '@/features/tags/components/tag-merge-modal';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import { useTagModalNavigation } from '@/features/tags/hooks/useTagModalNavigation';
import { useDeleteTag, useReorderTags, useTags, useUpdateTag } from '@/features/tags/hooks/useTags';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/trpc';

import { SortableTree } from '../sortable-tree/SortableTree';
import { TagSortableTree } from '../sortable-tree/TagSortableTree';
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
  const { isLoading: groupsLoading } = useTagGroups();
  const { data: tagStats } = api.plans.getTagStats.useQuery();
  const tagPlanCounts = tagStats?.counts ?? {};
  const untaggedCount = tagStats?.untaggedCount ?? 0;

  // 親タグ用のカウント計算（親タグ自体 + 子タグ合計）
  const parentTagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tags?.forEach((tag) => {
      if (tag.parent_id === null) {
        const parentCount = tagPlanCounts[tag.id] ?? 0;
        const childrenCount =
          tags
            ?.filter((t) => t.parent_id === tag.id)
            .reduce((sum, t) => sum + (tagPlanCounts[t.id] ?? 0), 0) ?? 0;
        counts[tag.id] = parentCount + childrenCount;
      }
    });
    return counts;
  }, [tags, tagPlanCounts]);

  const deleteTagMutation = useDeleteTag();
  const reorderTagsMutation = useReorderTags();
  const updateTagMutation = useUpdateTag();

  // マージモーダル用の状態
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);

  // TagSortableTree用のタグ更新ハンドラー
  const handleUpdateTag = useCallback(
    (
      tagId: string,
      data: {
        name?: string;
        color?: string;
        description?: string | null;
        parentId?: string | null;
      },
    ) => {
      const updateData: {
        name?: string;
        color?: string;
        description?: string;
        parent_id?: string | null;
      } = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.description !== undefined) updateData.description = data.description ?? '';
      if (data.parentId !== undefined) updateData.parent_id = data.parentId;
      updateTagMutation.mutate({ id: tagId, ...updateData });
    },
    [updateTagMutation],
  );

  // TagSortableTree用の並び替えハンドラー
  const handleReorder = useCallback(
    (updates: Array<{ id: string; sort_order: number; parent_id: string | null }>) => {
      reorderTagsMutation.mutate({ updates });
    },
    [reorderTagsMutation],
  );

  const {
    visibleTypes,
    visibleTagIds,
    showUntagged,
    toggleType,
    toggleTag,
    toggleUntagged,
    initializeWithTags,
    showOnlyTag,
    showOnlyUntagged,
    showOnlyGroupTags,
  } = useCalendarFilterStore();

  // タグ一覧取得後に初期化
  useEffect(() => {
    if (tags && tags.length > 0) {
      initializeWithTags(tags.map((tag) => tag.id));
    }
  }, [tags, initializeWithTags]);

  const isLoading = tagsLoading || groupsLoading;

  // タグモーダルナビゲーション
  const { openTagCreateModal } = useTagModalNavigation();

  // 削除確認ダイアログの状態
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // 子タグ追加ハンドラー
  const handleAddChildTag = (parentId: string) => {
    openTagCreateModal(parentId);
  };

  // 親タグ削除ハンドラー
  const handleDeleteParentTag = (groupId: string) => {
    setDeleteTargetId(groupId);
  };

  // 削除確認後のハンドラー
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    await deleteTagMutation.mutateAsync({ id: deleteTargetId });
    setDeleteTargetId(null);
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
            disabled
            disabledReason={t('calendar.filter.comingSoon')}
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
                onDeleteTag={(tagId) => handleDeleteParentTag(tagId)}
                onAddChildTag={handleAddChildTag}
                onShowOnlyTag={showOnlyTag}
                onShowOnlyGroupTags={showOnlyGroupTags}
                onOpenMergeModal={(tagId) => setMergeTargetId(tagId)}
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

        {/* 見本（公式SortableTree） */}
        <SidebarSection title="見本" defaultOpen className="py-1">
          <SortableTree collapsible indicator indentationWidth={24} />
        </SidebarSection>
      </div>

      {/* 親タグ削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title={t('calendar.filter.deleteParentTag.title')}
        description={t('calendar.filter.deleteParentTag.description')}
      />

      {/* タグマージモーダル */}
      {mergeTargetId &&
        tags &&
        (() => {
          const sourceTag = tags.find((t) => t.id === mergeTargetId);
          if (!sourceTag) return null;
          const hasChildren = tags.some((t) => t.parent_id === mergeTargetId);
          return (
            <TagMergeModal
              open={mergeTargetId !== null}
              onClose={() => setMergeTargetId(null)}
              sourceTag={{ id: sourceTag.id, name: sourceTag.name, color: sourceTag.color }}
              hasChildren={hasChildren}
            />
          );
        })()}
    </>
  );
}
