'use client';

/**
 * TagsSidebar のロジックを管理するカスタムフック
 */

import type { DragEndEvent } from '@dnd-kit/core';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors';
import { useTagsNavigation } from '@/features/tags/contexts/TagsNavigationContext';
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext';
import {
  useCreateTagGroup,
  useDeleteTagGroup,
  useTagGroups,
  useUpdateTagGroup,
} from '@/features/tags/hooks/useTagGroups';
import { useTags } from '@/features/tags/hooks/useTags';
import type { TagGroup } from '@/features/tags/types';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

import type { GroupSortType } from './types';

interface UseTagsSidebarLogicOptions {
  onAllTagsClick: () => void;
  isLoading?: boolean;
  externalIsCreating?: boolean;
}

export function useTagsSidebarLogic({
  onAllTagsClick,
  isLoading = false,
  externalIsCreating = false,
}: UseTagsSidebarLogicOptions) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const tagsNav = useTagsNavigation();
  const { selection } = useHapticFeedback();
  const { setIsCreatingGroup } = useTagsPageContext();
  const { data: groups = [] } = useTagGroups();
  const { data: allTags = [] } = useTags();
  const createGroupMutation = useCreateTagGroup();
  const updateGroupMutation = useUpdateTagGroup();
  const deleteGroupMutation = useDeleteTagGroup();

  // State
  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(DEFAULT_GROUP_COLOR);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [sortType, setSortType] = useState<GroupSortType>('manual');
  const [manualOrder, setManualOrder] = useState<string[]>([]);

  // Refs
  const inlineFormRef = useRef<HTMLDivElement>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Derived state
  const isLoadingGroups = groups.length === 0 && isLoading;
  const isCreating = externalIsCreating;
  const isArchivePage = tagsNav?.filter === 'archive' || pathname?.includes('/archive');
  const isUncategorizedPage =
    tagsNav?.filter === 'uncategorized' || pathname?.includes('/uncategorized');

  const currentGroupId = useMemo(() => {
    if (tagsNav?.groupId !== undefined) return tagsNav.groupId;
    if (!pathname) return null;
    const match = pathname.match(/\/tags\/g-([a-f0-9-]+)/);
    return match ? match[1] : null;
  }, [tagsNav?.groupId, pathname]);

  const isAllTagsActive = !isArchivePage && !isUncategorizedPage && !currentGroupId;

  const uncategorizedTagsCount = useMemo(() => {
    return allTags.filter((tag) => !tag.group_id && tag.is_active).length;
  }, [allTags]);

  // Helper: グループごとのタグ数をカウント
  const getGroupTagCount = useCallback(
    (groupId: string) => {
      return allTags.filter((tag) => tag.group_id === groupId && tag.is_active).length;
    },
    [allTags],
  );

  // Handler: インライン作成を開始
  const handleStartCreating = useCallback(() => {
    setIsCreatingGroup(true);
    setNewGroupName('');
    setNewGroupColor(DEFAULT_GROUP_COLOR);
  }, [setIsCreatingGroup]);

  // Handler: インライン作成をキャンセル
  const handleCancelCreating = useCallback(() => {
    setIsCreatingGroup(false);
    setNewGroupName('');
    setNewGroupColor(DEFAULT_GROUP_COLOR);
  }, [setIsCreatingGroup]);

  // Effect: クリックアウトサイド検知
  useEffect(() => {
    if (!isCreating) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (inlineFormRef.current && !inlineFormRef.current.contains(event.target as Node)) {
        handleCancelCreating();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreating, handleCancelCreating]);

  // Handler: インライン作成を保存
  const handleSaveNewGroup = useCallback(async () => {
    if (!newGroupName.trim()) {
      toast.error(t('tag.toast.groupNameRequired'));
      return;
    }

    try {
      const slug = newGroupName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

      const result = await createGroupMutation.mutateAsync({
        name: newGroupName.trim(),
        slug: slug || `group-${Date.now()}`,
        description: null,
        color: newGroupColor || null,
      });
      toast.success(t('tag.toast.groupCreated', { name: newGroupName }));
      setIsCreatingGroup(false);
      setNewGroupName('');
      setNewGroupColor(DEFAULT_GROUP_COLOR);

      if (tagsNav) {
        tagsNav.navigateToGroup(result.id);
      } else {
        const locale = pathname?.split('/')[1] || 'ja';
        router.push(`/${locale}/tags/g-${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create tag group:', error);
      toast.error(t('tags.toast.groupCreateFailed'));
    }
  }, [
    newGroupName,
    newGroupColor,
    createGroupMutation,
    router,
    pathname,
    setIsCreatingGroup,
    t,
    tagsNav,
  ]);

  // Handler: 削除確認ダイアログからの削除実行
  const handleConfirmDelete = useCallback(async () => {
    if (!deletingGroup) return;

    try {
      await deleteGroupMutation.mutateAsync({ id: deletingGroup.id });
      toast.success(t('tags.toast.groupDeleted', { name: deletingGroup.name }));
      setDeletingGroup(null);

      if (currentGroupId === deletingGroup.id) {
        if (tagsNav) {
          tagsNav.navigateToFilter('all');
        } else {
          const locale = pathname?.split('/')[1] || 'ja';
          router.push(`/${locale}/tags`);
        }
      }
    } catch (error) {
      console.error('Failed to delete tag group:', error);
      toast.error(t('tag.toast.groupDeleteFailed'));
    }
  }, [deletingGroup, deleteGroupMutation, currentGroupId, router, pathname, t, tagsNav]);

  // Handler: インライン編集を開始
  const handleStartEditing = useCallback((group: TagGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  }, []);

  // Handler: インライン編集をキャンセル
  const handleCancelEditing = useCallback(() => {
    setEditingGroupId(null);
    setEditingGroupName('');
  }, []);

  // Handler: インライン編集を保存
  const handleSaveEditing = useCallback(
    async (group: TagGroup) => {
      if (!editingGroupName.trim()) {
        toast.error(t('tags.toast.groupNameRequired'));
        return;
      }

      try {
        await updateGroupMutation.mutateAsync({
          id: group.id,
          data: {
            name: editingGroupName.trim(),
            description: group.description,
            color: group.color,
          },
        });
        toast.success(t('tags.toast.groupNameChanged', { name: editingGroupName }));
        setEditingGroupId(null);
        setEditingGroupName('');
      } catch (error) {
        console.error('Failed to update tag group:', error);
        toast.error(t('tags.toast.groupNameChangeFailed'));
      }
    },
    [editingGroupName, updateGroupMutation, t],
  );

  // Handler: カラー更新
  const handleUpdateColor = useCallback(
    async (groupId: string, color: string) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;

      try {
        await updateGroupMutation.mutateAsync({
          id: groupId,
          data: {
            name: group.name,
            description: group.description,
            color,
          },
        });
      } catch (error) {
        console.error('Failed to update group color:', error);
      }
    },
    [groups, updateGroupMutation],
  );

  // Handler: グループ削除（確認ダイアログを表示）
  const handleDeleteGroup = useCallback(
    (group: TagGroup) => {
      const tagCount = getGroupTagCount(group.id);
      if (tagCount === 0) {
        deleteGroupMutation
          .mutateAsync({ id: group.id })
          .then(() => {
            toast.success(t('tags.toast.groupDeleted', { name: group.name }));
            if (currentGroupId === group.id) {
              if (tagsNav) {
                tagsNav.navigateToFilter('all');
              } else {
                const locale = pathname?.split('/')[1] || 'ja';
                router.push(`/${locale}/tags`);
              }
            }
          })
          .catch((error) => {
            console.error('Failed to delete tag group:', error);
            toast.error(t('tags.toast.groupDeleteFailed'));
          });
      } else {
        setDeletingGroup(group);
      }
    },
    [getGroupTagCount, deleteGroupMutation, t, currentGroupId, pathname, router, tagsNav],
  );

  // Navigation handlers
  const handleAllTagsClick = useCallback(() => {
    if (tagsNav) {
      tagsNav.navigateToFilter('all');
    } else {
      onAllTagsClick();
    }
  }, [tagsNav, onAllTagsClick]);

  const handleArchiveClick = useCallback(() => {
    if (tagsNav) {
      tagsNav.navigateToFilter('archive');
    } else {
      const locale = pathname?.split('/')[1] || 'ja';
      router.push(`/${locale}/tags/archive`);
    }
  }, [tagsNav, router, pathname]);

  const handleUncategorizedClick = useCallback(() => {
    if (tagsNav) {
      tagsNav.navigateToFilter('uncategorized');
    } else {
      const locale = pathname?.split('/')[1] || 'ja';
      router.push(`/${locale}/tags/uncategorized`);
    }
  }, [tagsNav, router, pathname]);

  const handleGroupClick = useCallback(
    (groupId: string) => {
      if (tagsNav) {
        tagsNav.navigateToGroup(groupId);
      } else {
        const locale = pathname?.split('/')[1] || 'ja';
        router.push(`/${locale}/tags/g-${groupId}`);
      }
    },
    [tagsNav, router, pathname],
  );

  // Effect: manualOrderの初期化
  useEffect(() => {
    if (groups.length > 0 && manualOrder.length === 0) {
      setManualOrder(groups.map((g) => g.id));
    }
    const groupIds = new Set(groups.map((g) => g.id));
    const currentOrderIds = new Set(manualOrder);
    const newIds = groups.filter((g) => !currentOrderIds.has(g.id)).map((g) => g.id);
    const removedIds = manualOrder.filter((id) => !groupIds.has(id));

    if (newIds.length > 0 || removedIds.length > 0) {
      setManualOrder((prev) => {
        const filtered = prev.filter((id) => groupIds.has(id));
        return [...filtered, ...newIds];
      });
    }
  }, [groups, manualOrder]);

  // Handler: ドラッグ終了
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      const overId = String(over.id).startsWith('drop-')
        ? String(over.id).slice(5)
        : String(over.id);
      const activeId = String(active.id);

      if (activeId !== overId) {
        setManualOrder((prev) => {
          const oldIndex = prev.indexOf(activeId);
          const newIndex = prev.indexOf(overId);
          if (oldIndex === -1 || newIndex === -1) return prev;
          return arrayMove(prev, oldIndex, newIndex);
        });
        selection();
      }
    },
    [selection],
  );

  // Sorted groups
  const sortedGroups = useMemo(() => {
    if (sortType === 'manual') {
      if (manualOrder.length === 0) {
        return groups;
      }
      const orderMap = new Map(manualOrder.map((id, index) => [id, index]));
      return [...groups].sort((a, b) => {
        const aIndex = orderMap.get(a.id) ?? Infinity;
        const bIndex = orderMap.get(b.id) ?? Infinity;
        return aIndex - bIndex;
      });
    }

    const sorted = [...groups];
    switch (sortType) {
      case 'nameAsc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        break;
      case 'nameDesc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'ja'));
        break;
      case 'createdAsc':
        sorted.sort(
          (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime(),
        );
        break;
      case 'createdDesc':
        sorted.sort(
          (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
        );
        break;
      case 'tagCountDesc':
        sorted.sort((a, b) => getGroupTagCount(b.id) - getGroupTagCount(a.id));
        break;
      case 'tagCountAsc':
        sorted.sort((a, b) => getGroupTagCount(a.id) - getGroupTagCount(b.id));
        break;
    }
    return sorted;
  }, [groups, sortType, getGroupTagCount, manualOrder]);

  return {
    // State
    t,
    isLoading: isLoading || isLoadingGroups,
    isCreating,
    isAllTagsActive,
    isArchivePage,
    isUncategorizedPage,
    currentGroupId,
    sortType,
    sortedGroups,
    deletingGroup,
    editingGroupId,
    editingGroupName,
    newGroupName,
    newGroupColor,
    uncategorizedTagsCount,
    sensors,

    // Setters
    setSortType,
    setDeletingGroup,
    setEditingGroupName,
    setNewGroupName,
    setNewGroupColor,

    // Refs
    inlineFormRef,

    // Handlers
    handleStartCreating,
    handleCancelCreating,
    handleSaveNewGroup,
    handleConfirmDelete,
    handleStartEditing,
    handleCancelEditing,
    handleSaveEditing,
    handleUpdateColor,
    handleDeleteGroup,
    handleAllTagsClick,
    handleArchiveClick,
    handleUncategorizedClick,
    handleGroupClick,
    handleDragEnd,
    getGroupTagCount,
  };
}
