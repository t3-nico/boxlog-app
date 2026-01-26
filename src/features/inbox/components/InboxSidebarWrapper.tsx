'use client';

import { useplans } from '@/features/plans/hooks/usePlans';

import { InboxSidebar } from './InboxSidebar';

/**
 * InboxSidebarWrapper - ローディング状態を管理してInboxSidebarに渡す
 */
export function InboxSidebarWrapper() {
  const { isLoading } = useplans();

  return <InboxSidebar isLoading={isLoading} />;
}
