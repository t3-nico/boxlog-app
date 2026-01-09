'use client';

import { useEffect } from 'react';

import { useTagFilterStore } from '@/features/tags/stores/useTagFilterStore';

interface GroupFilterSetterProps {
  groupId: string;
}

/**
 * グループフィルターを設定するコンポーネント
 *
 * g-{groupId} ルートで使用され、マウント時にフィルターストアを設定
 */
export function GroupFilterSetter({ groupId }: GroupFilterSetterProps) {
  const setSelectedGroup = useTagFilterStore((state) => state.setSelectedGroup);

  useEffect(() => {
    setSelectedGroup(groupId);
  }, [groupId, setSelectedGroup]);

  return null;
}
