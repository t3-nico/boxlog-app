'use client';

import dynamic from 'next/dynamic';

import { PlanListPanel, RecordListPanel } from '@/features/calendar';

import type { AsideType } from '@/components/layout/AppAside';

// tiptap + AI SDK を初期バンドルから除外（LCP改善）
const AIInspectorContent = dynamic(
  () => import('@/features/ai/components/AIInspectorContent').then((mod) => mod.AIInspectorContent),
  { ssr: false },
);

/**
 * Stats ページ用アサイドコンテンツレンダラー
 *
 * App layer（composition layer）で feature コンポーネントを組み立てる
 */
export function renderStatsAsideContent(asideType: AsideType): React.ReactNode {
  switch (asideType) {
    case 'plan':
      return <PlanListPanel />;
    case 'record':
      return <RecordListPanel />;
    case 'chat':
      return <AIInspectorContent />;
    case 'reflection':
      return null;
    default:
      return null;
  }
}
