'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { DEFAULT_TAG_COLOR } from '@/config/ui/colors';
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups';
import { useUpdateTag } from '@/features/tags/hooks/use-tags';
import type { Tag } from '@/features/tags/types';

interface TagsPageContextValue {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isCreatingGroup: boolean;
  setIsCreatingGroup: (creating: boolean) => void;
  isCreatingTag: boolean;
  setIsCreatingTag: (creating: boolean) => void;
  // ドラッグ中のタグ
  draggingTag: Tag | null;
}

const TagsPageContext = createContext<TagsPageContextValue | null>(null);

export function useTagsPageContext() {
  const context = useContext(TagsPageContext);
  if (!context) {
    throw new Error('useTagsPageContext must be used within TagsPageProvider');
  }
  return context;
}

interface TagsPageProviderProps {
  children: ReactNode;
}

export function TagsPageProvider({ children }: TagsPageProviderProps) {
  const t = useTranslations();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [draggingTag, setDraggingTag] = useState<Tag | null>(null);

  const { data: groups = [] } = useTagGroups();
  const updateTagMutation = useUpdateTag();

  // センサー設定（タグのドラッグ用）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ドラッグ開始
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;

      // タグのドラッグ
      if (active.data.current?.type === 'tag') {
        const tag = tags.find((t) => t.id === active.id);
        if (tag) {
          setDraggingTag(tag);
        }
      }
    },
    [tags],
  );

  // ドラッグ終了
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      // タグのドラッグ終了
      if (draggingTag) {
        setDraggingTag(null);

        if (!over) return;

        // タグをアーカイブにドロップ
        if (over.data.current?.type === 'archive') {
          const tagId = active.id as string;
          const tag = tags.find((t) => t.id === tagId);

          if (tag && tag.is_active) {
            // 楽観的更新: リストから即座に削除
            const previousTags = [...tags];
            setTags(tags.filter((t) => t.id !== tagId));

            try {
              await updateTagMutation.mutateAsync({
                id: tagId,
                data: { is_active: false },
              });
              toast.success(t('tag.page.tagArchived', { name: tag.name }));
            } catch (error) {
              // エラー時: ロールバック
              console.error('Failed to archive tag:', error);
              setTags(previousTags);
              toast.error(t('tag.page.tagArchiveFailed'));
            }
          }
          return;
        }

        // タグを「すべてのタグ」にドロップ（アーカイブから復元）
        if (over.data.current?.type === 'restore') {
          const tagId = active.id as string;
          const tag = tags.find((t) => t.id === tagId);

          if (tag && !tag.is_active) {
            // 楽観的更新: is_activeをtrueに変更
            const previousTags = [...tags];
            setTags(tags.map((t) => (t.id === tagId ? { ...t, is_active: true } : t)));

            try {
              await updateTagMutation.mutateAsync({
                id: tagId,
                data: { is_active: true },
              });
              toast.success(t('tag.archive.restoreSuccess', { name: tag.name }));
            } catch (error) {
              // エラー時: ロールバック
              console.error('Failed to restore tag:', error);
              setTags(previousTags);
              toast.error(t('tag.archive.restoreFailed'));
            }
          }
          return;
        }

        // タグをグループにドロップ
        if (over.data.current?.type === 'group') {
          const tagId = active.id as string;
          // over.id が 'drop-xxx' 形式の場合は groupId を取得、そうでなければ null
          const groupId = over.data.current.groupId as string | null;
          const tag = tags.find((t) => t.id === tagId);

          if (tag && tag.group_id !== groupId) {
            // 楽観的更新: グループを即座に変更
            const previousTags = [...tags];
            setTags(tags.map((t) => (t.id === tagId ? { ...t, group_id: groupId } : t)));

            const targetGroup = groupId ? groups.find((g) => g.id === groupId) : null;
            const groupName = targetGroup?.name ?? t('tag.sidebar.uncategorized');

            try {
              await updateTagMutation.mutateAsync({
                id: tagId,
                data: { group_id: groupId },
              });
              toast.success(t('tag.page.tagMoved', { name: tag.name, group: groupName }));
            } catch (error) {
              // エラー時: ロールバック
              console.error('Failed to move tag:', error);
              setTags(previousTags);
              toast.error(t('tag.page.tagMoveFailed'));
            }
          }
        }
      }
    },
    [draggingTag, tags, groups, updateTagMutation, t],
  );

  // ドラッグキャンセル
  const handleDragCancel = useCallback(() => {
    setDraggingTag(null);
  }, []);

  return (
    <TagsPageContext.Provider
      value={{
        tags,
        setTags,
        isLoading,
        setIsLoading,
        isCreatingGroup,
        setIsCreatingGroup,
        isCreatingTag,
        setIsCreatingTag,
        draggingTag,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay>
          {draggingTag && (
            <div className="bg-popover border-border flex items-center gap-2 rounded-md border px-3 py-2 shadow-lg">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: draggingTag.color || DEFAULT_TAG_COLOR }}
              />
              <span className="text-sm font-medium">{draggingTag.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </TagsPageContext.Provider>
  );
}
