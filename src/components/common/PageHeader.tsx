'use client';

import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton';
import { NavigationTabs } from '@/features/navigation/components/navigation-tabs';
import { usePageTitleStore } from '@/features/navigation/stores/usePageTitleStore';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 統合PageHeaderコンポーネント
 *
 * レイアウト層で1回だけレンダリングする設計
 * - 左: モバイルメニュー + タイトル（Zustand Storeから取得）
 * - 右: NavigationTabs
 *
 * **デザイン仕様:**
 * - 高さ: 48px固定（h-12）
 * - 背景: 透明（親要素から継承、MainContentと一体化）
 * - 8pxグリッドシステム準拠
 */
export function PageHeader({ className }: PageHeaderProps) {
  const title = usePageTitleStore((state) => state.title);

  return (
    <header className={cn('flex h-12 shrink-0 items-center justify-between px-4', className)}>
      {/* 左: モバイルメニュー + タイトル */}
      <div className="flex items-center gap-2">
        <MobileMenuButton className="md:hidden" />
        {title && <h1 className="truncate text-lg leading-8 font-semibold">{title}</h1>}
      </div>

      {/* 右: ナビゲーションタブ */}
      <NavigationTabs />
    </header>
  );
}
