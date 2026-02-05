'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
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
          <Spinner size="lg" />
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
