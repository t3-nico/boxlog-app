'use client';

import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';

import { PlanSidebarList } from './sidebar/PlanSidebarList';

interface PlanSidebarProps {
  isLoading?: boolean;
}

/**
 * Plan用サイドバー
 *
 * Plan一覧を表示
 */
export function PlanSidebar({ isLoading = false }: PlanSidebarProps) {
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
        <PlanSidebarList />
      </ScrollArea>
    </SidebarShell>
  );
}
