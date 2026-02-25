'use client';

import React from 'react';

interface MainContentWrapperProps {
  children: React.ReactNode;
}

/**
 * メインコンテンツラッパー
 *
 * シンプルなmain要素ラッパー
 * InspectorはPopover/Drawerで表示されるため、レイアウト調整不要
 */
export function MainContentWrapper({ children }: MainContentWrapperProps) {
  return (
    <div className="flex min-h-0 flex-1">
      <main id="main-content" className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
