'use client';

import { usePathname } from 'next/navigation';
export const useActiveState = () => {
  const pathname = usePathname();
  // const { filters } = useTaskStore()
  const filters: { tags: string[] } = { tags: [] }; // 一時的にモック
  const currentView = (pathname || '/').split('/')[1] || 'calendar';
  const selectedTag = filters.tags?.[0] || null;
  const isViewActive = (viewId: string) => {
    return currentView === viewId;
  };
  const isTagActive = (tagId: string) => {
    return filters.tags?.includes(tagId) || false;
  };
  return {
    currentView,
    selectedTag,
    isViewActive,
    isTagActive,
  };
};
