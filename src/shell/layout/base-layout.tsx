import React, { Suspense } from 'react';

import { BaseLayoutContent } from './base-layout-content';

interface BaseLayoutProps {
  children: React.ReactNode;
}

/**
 * アプリケーション全体の基盤レイアウト
 *
 * Next.js公式パターン: Server Componentとして実装し、
 * Client ComponentはBaseLayoutContentに分離
 *
 * 注: Providersは app/layout.tsx で既にラップされているため、
 * ここでは重複してラップしない
 *
 * 重要: BaseLayoutContentはuseSearchParams()を使用するため、
 * Next.js 15ではSuspense境界が必須
 *
 * @see https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#moving-client-components-down-the-tree
 */
export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <Suspense fallback={null}>
      <BaseLayoutContent>{children}</BaseLayoutContent>
    </Suspense>
  );
}
