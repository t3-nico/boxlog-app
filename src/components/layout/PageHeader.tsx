'use client';

import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/theme-context';
import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton';
import { NavigationTabs } from '@/features/navigation/components/navigation-tabs';
import { usePageTitleStore } from '@/features/navigation/stores/usePageTitleStore';
import { NotificationDropdown } from '@/features/notifications';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface PageHeaderProps {
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 統合PageHeaderコンポーネント
 *
 * レイアウト層で1回だけレンダリングする設計
 * - 左: モバイルメニュー + タイトル（Zustand Storeから取得）
 * - 右: テーマ切替 + NavigationTabs
 *
 * **デザイン仕様:**
 * - 高さ: 48px固定（h-12）
 * - 背景: 透明（親要素から継承、MainContentと一体化）
 * - 8pxグリッドシステム準拠
 */
export function PageHeader({ className }: PageHeaderProps) {
  const title = usePageTitleStore((state) => state.title);
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations();

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className={cn('flex h-12 shrink-0 items-center justify-between px-4', className)}>
      {/* 左: モバイルメニュー + タイトル */}
      <div className="flex items-center gap-2">
        <MobileMenuButton className="md:hidden" />
        {title && <h1 className="truncate text-lg leading-8 font-bold">{title}</h1>}
      </div>

      {/* 右: 通知 + テーマ切替 + ナビゲーションタブ */}
      <div className="flex items-center gap-2">
        <NotificationDropdown size="sm" />
        <HoverTooltip
          content={resolvedTheme === 'light' ? 'Dark mode' : 'Light mode'}
          side="bottom"
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleThemeToggle}
            aria-label={t('sidebar.theme')}
          >
            {resolvedTheme === 'light' ? (
              <Moon className="size-4" aria-hidden="true" />
            ) : (
              <Sun className="size-4" aria-hidden="true" />
            )}
          </Button>
        </HoverTooltip>
        <NavigationTabs />
      </div>
    </header>
  );
}
