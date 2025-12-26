'use client';

/**
 * TagInspector のロジックを管理するカスタムフック
 */

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useInspectorKeyboard, type InspectorDisplayMode } from '@/features/inspector';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import {
  useDeleteTag,
  useTags,
  useUpdateTag,
  useUpdateTagColor,
} from '@/features/tags/hooks/useTags';
import { useTagInspectorStore } from '@/features/tags/stores/useTagInspectorStore';

export function useTagInspectorLogic() {
  const {
    isOpen,
    entityId: tagId,
    displayMode,
    closeInspector: closeInspectorStore,
    openInspector,
    setDisplayMode,
  } = useTagInspectorStore();
  const { openInspector: openPlanInspector } = usePlanInspectorStore();
  const { updatePlan } = usePlanMutations();
  const router = useRouter();
  const pathname = usePathname();

  // Close inspector with URL update
  const closeInspector = useCallback(() => {
    closeInspectorStore();
    if (pathname?.match(/\/tags\/t-\d+$/)) {
      const locale = pathname.split('/')[1];
      router.push(`/${locale}/tags`);
    }
  }, [closeInspectorStore, pathname, router]);

  // Data hooks
  const { data: tags = [], isPending } = useTags();
  const { data: groups = [] } = useTagGroups();

  const tag = useMemo(() => {
    if (!tagId) return null;
    return tags.find((t) => t.id === tagId) ?? null;
  }, [tags, tagId]);

  const activeTags = useMemo(() => {
    return tags.filter((t) => t.is_active);
  }, [tags]);

  const currentIndex = useMemo(() => {
    return activeTags.findIndex((t) => t.id === tagId);
  }, [activeTags, tagId]);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < activeTags.length - 1;

  const { data: plans = [], isLoading: isLoadingPlans } = usePlans(
    tag?.id ? { tagId: tag.id } : {},
    {
      enabled: !!tag?.id,
    },
  );

  const tagGroup = useMemo(() => {
    if (!tag?.group_id) return null;
    return groups.find((g) => g.id === tag.group_id) || null;
  }, [groups, tag]);

  // Mutations
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();
  const updateColorMutation = useUpdateTagColor();

  // Local state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);

  // Refs
  const titleRef = useRef<HTMLSpanElement>(null);
  const descriptionRef = useRef<HTMLSpanElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation
  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      const prevTag = activeTags[currentIndex - 1];
      if (prevTag) openInspector(prevTag.id);
    }
  }, [hasPrevious, activeTags, currentIndex, openInspector]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      const nextTag = activeTags[currentIndex + 1];
      if (nextTag) openInspector(nextTag.id);
    }
  }, [hasNext, activeTags, currentIndex, openInspector]);

  // Keyboard shortcuts
  useInspectorKeyboard({
    isOpen,
    hasPrevious,
    hasNext,
    onClose: closeInspector,
    onPrevious: goToPrevious,
    onNext: goToNext,
  });

  // Auto-save with debounce
  const autoSave = useCallback(
    (field: 'name' | 'description', value: string) => {
      if (!tagId || !tag) return;

      const currentValue = tag[field];
      if (currentValue === value) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updateTagMutation.mutate({
          id: tagId,
          data: { [field]: value },
        });
      }, 500);
    },
    [tagId, tag, updateTagMutation],
  );

  // Color change
  const handleColorChange = useCallback(
    (color: string) => {
      if (!tagId) return;
      updateColorMutation.mutate({ id: tagId, color });
      setShowColorPicker(false);
    },
    [tagId, updateColorMutation],
  );

  // Dialog handlers
  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleArchive = useCallback(() => {
    setShowArchiveDialog(true);
  }, []);

  const handleMerge = useCallback(() => {
    setShowMergeDialog(true);
  }, []);

  // Group change
  const handleChangeGroup = useCallback(
    (groupId: string | null) => {
      if (!tagId || !tag) return;
      if (tag.group_id === groupId) return;
      updateTagMutation.mutate({
        id: tagId,
        data: { group_id: groupId },
      });
    },
    [tagId, tag, updateTagMutation],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    // Store state
    isOpen,
    tagId,
    displayMode: displayMode as InspectorDisplayMode,
    setDisplayMode,
    openInspector,
    closeInspector,

    // Data
    tag,
    groups,
    tagGroup,
    plans,
    isPending,
    isLoadingPlans,

    // Navigation
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,

    // Local state
    showColorPicker,
    setShowColorPicker,
    showDeleteDialog,
    setShowDeleteDialog,
    showArchiveDialog,
    setShowArchiveDialog,
    showMergeDialog,
    setShowMergeDialog,

    // Refs
    titleRef,
    descriptionRef,

    // Handlers
    autoSave,
    handleColorChange,
    handleDelete,
    handleArchive,
    handleMerge,
    handleChangeGroup,

    // Plan mutations
    updatePlan,
    openPlanInspector,
    updateTagMutation,
    deleteTagMutation,
  };
}
