'use client';

import React from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export const SettingsLayout = ({ children, title, actions }: SettingsLayoutProps) => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* ヘッダー部分（PageHeaderと同じ仕様: 48px = py-2 + h-8コンテナ） */}
      <div className="flex h-12 shrink-0 items-center px-4 py-2">
        <div className="flex h-8 flex-1 items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {actions != null && <div className="flex h-8 items-center gap-2">{actions}</div>}
      </div>

      {/* メインコンテンツ */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="w-full px-4 pb-8">{children}</div>
      </ScrollArea>
    </div>
  );
};
