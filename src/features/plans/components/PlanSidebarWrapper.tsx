'use client';

import { useplans } from '@/features/plans/hooks/usePlans';

import { PlanSidebar } from './PlanSidebar';

/**
 * PlanSidebarWrapper - ローディング状態を管理してPlanSidebarに渡す
 */
export function PlanSidebarWrapper() {
  const { isLoading } = useplans();

  return <PlanSidebar isLoading={isLoading} />;
}
