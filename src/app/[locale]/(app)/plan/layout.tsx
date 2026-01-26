'use client';

import type { ReactNode } from 'react';

import { usePageTitle } from '@/features/navigation/hooks/usePageTitle';

interface PlanLayoutProps {
  children: ReactNode;
}

/**
 * Plan共通レイアウト
 */
export default function PlanLayout({ children }: PlanLayoutProps) {
  usePageTitle('Plan');

  return <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>;
}
