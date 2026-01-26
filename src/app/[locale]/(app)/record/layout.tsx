'use client';

import type { ReactNode } from 'react';

import { usePageTitle } from '@/features/navigation/hooks/usePageTitle';

interface RecordLayoutProps {
  children: ReactNode;
}

/**
 * Record共通レイアウト
 */
export default function RecordLayout({ children }: RecordLayoutProps) {
  usePageTitle('Record');

  return <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>;
}
