import {
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useRef, useState } from 'react';

import type { TagGroup } from '@/features/tags/types';
import { useReorderTagGroups } from './useTagGroups';

/**
 * タググループのドラッグアンドドロップ用フック（シンプル版）
 *
 * 無限ループを避けるため、groupsの同期は最小限に抑える
 */
export function useTagGroupsDnd(groups: TagGroup[]) {
  const [activeGroup, setActiveGroup] = useState<TagGroup | null>(null);
  const [localGroups, setLocalGroups] = useState<TagGroup[]>(groups);
  const reorderMutation = useReorderTagGroups();

  // 前回のグループIDを文字列化して保持
  const prevGroupIdsRef = useRef<string>(groups.map((g) => g.id).join(','));

  // センサー設定
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

  // グループIDが変わった時のみlocalGroupsを更新（useEffect内でref操作）
  const currentGroupIds = groups.map((g) => g.id).join(',');
  useEffect(() => {
    if (currentGroupIds !== prevGroupIdsRef.current && !activeGroup) {
      prevGroupIdsRef.current = currentGroupIds;

      setLocalGroups(groups);
    }
  }, [currentGroupIds, groups, activeGroup]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const group = localGroups.find((g) => g.id === active.id);
    if (group) {
      setActiveGroup(group);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveGroup(null);
      return;
    }

    const oldIndex = localGroups.findIndex((g) => g.id === active.id);
    const newIndex = localGroups.findIndex((g) => g.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      setActiveGroup(null);
      return;
    }

    // 楽観的更新
    const reordered = arrayMove(localGroups, oldIndex, newIndex);
    setLocalGroups(reordered);

    // APIに反映
    const groupIds = reordered.map((g) => g.id);
    reorderMutation.mutate(
      { groupIds },
      {
        onError: () => {
          // エラー時はロールバック
          setLocalGroups(groups);
        },
      },
    );

    setActiveGroup(null);
  };

  const handleDragCancel = () => {
    setActiveGroup(null);
  };

  return {
    sensors,
    activeGroup,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    reorderedGroups: localGroups,
    dndContextProps: {
      sensors,
      collisionDetection: closestCenter,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragCancel: handleDragCancel,
    },
    sortableContextProps: {
      items: localGroups.map((g) => g.id),
      strategy: verticalListSortingStrategy,
    },
  };
}
