'use client';

import { SettingsSidebar } from '@/features/settings';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MEDIA_QUERIES } from '@/lib/breakpoints';

/**
 * 設定ページレイアウト
 *
 * PC: サイドバー + コンテンツの2カラム
 * Mobile: コンテンツのみ（サイドバーなし、カテゴリリストは page.tsx で表示）
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  if (isMobile) {
    return <div className="flex h-full flex-col">{children}</div>;
  }

  return (
    <div className="flex h-full">
      <SettingsSidebar className="border-border w-60 shrink-0 border-r" />
      <div className="bg-background flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
