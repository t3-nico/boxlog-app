'use client';

import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';

import { InboxSidebarList } from './sidebar/InboxSidebarList';

interface InboxSidebarProps {
  isLoading?: boolean;
}

/**
 * Inbox用サイドバー
 *
 * Plan + Record 一覧を表示
 */
export function InboxSidebar({ isLoading = false }: InboxSidebarProps) {
  if (isLoading) {
    return (
      <SidebarShell>
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </SidebarShell>
    );
  }

  return (
    <SidebarShell>
      <ScrollArea className="h-full w-full">
        <InboxSidebarList />
      </ScrollArea>
    </SidebarShell>
  );
}
