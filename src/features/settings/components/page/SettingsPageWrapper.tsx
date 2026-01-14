'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { usePageTitle } from '@/features/navigation/hooks/usePageTitle';

interface SettingsPageWrapperProps {
  title: string;
  children: React.ReactNode;
}

/**
 * 設定ページの共通ラッパー
 *
 * - タイトル管理（usePageTitleでZustand Storeにセット）
 * - スクロール可能なコンテンツ領域
 *
 * PageHeaderはレイアウト層（desktop-layout/mobile-layout）でレンダリングされる
 */
export function SettingsPageWrapper({ title, children }: SettingsPageWrapperProps) {
  // タイトルをZustand Storeにセット
  usePageTitle(title);

  return (
    <div className="flex h-full flex-col">
      {/* コンテンツ */}
      <ScrollArea className="flex-1">
        <div className="p-6">{children}</div>
      </ScrollArea>
    </div>
  );
}
