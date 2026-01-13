'use client';

import { Moon, Search, Sun } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/theme-context';
import { NotificationDropdown } from '@/features/notifications';
import { useGlobalSearch } from '@/features/search';
import { useTranslations } from 'next-intl';

/**
 * ヘッダーアクションボタン群
 *
 * PageHeader右側に配置する検索・通知・テーマ切り替えボタン
 * - デスクトップ: 全て表示
 * - モバイル: 検索のみ（通知・テーマはSidebarから）
 */
export function HeaderActions() {
  const { open: openGlobalSearch } = useGlobalSearch();
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations();

  const handleSearchClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      openGlobalSearch();
    },
    [openGlobalSearch],
  );

  const handleThemeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    },
    [setTheme, resolvedTheme],
  );

  return (
    <div className="flex items-center gap-1">
      {/* 検索 - 常に表示 */}
      <HoverTooltip content={t('appBar.actions.search')} side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSearchClick}
          aria-label={t('appBar.actions.search')}
          className="size-10"
        >
          <Search className="size-5" aria-hidden="true" />
        </Button>
      </HoverTooltip>

      {/* 通知 - デスクトップのみ */}
      <div className="hidden md:flex">
        <HoverTooltip content={t('notification.title')} side="bottom">
          <div className="flex items-center justify-center">
            <NotificationDropdown />
          </div>
        </HoverTooltip>
      </div>

      {/* テーマ切り替え - デスクトップのみ */}
      <div className="hidden md:flex">
        <HoverTooltip content={t('sidebar.theme')} side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeClick}
            aria-label={t('sidebar.theme')}
            className="size-10"
          >
            {resolvedTheme === 'light' ? (
              <Moon className="size-5" aria-hidden="true" />
            ) : (
              <Sun className="size-5" aria-hidden="true" />
            )}
          </Button>
        </HoverTooltip>
      </div>
    </div>
  );
}
