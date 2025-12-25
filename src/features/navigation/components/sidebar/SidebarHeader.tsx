'use client';

import { PanelLeftClose } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface SidebarHeaderProps {
  title?: string;
  className?: string;
}

/**
 * Sidebarヘッダーコンポーネント（全ページ共通）
 *
 * - ページタイトル表示
 * - モバイル表示時のみ閉じるボタンを表示
 *
 * **デザイン仕様**:
 * - 全体の高さ: 48px固定（h-12）
 * - 上下パディング: 8px（py-2）
 * - コンテナ: 32px（h-8）
 * - 左右パディング: 16px（px-4）
 * - 背景: bg-surface-container
 * - 8pxグリッドシステム準拠
 */
export function SidebarHeader({ title, className }: SidebarHeaderProps) {
  const toggle = useSidebarStore((state) => state.toggle);
  const t = useTranslations();

  return (
    <div className={cn('bg-surface-container flex h-12 items-center px-4 py-2', className)}>
      {/* タイトルコンテナ（32px） */}
      <div className="flex h-8 flex-1 items-center">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>

      {/* 閉じるボタン（モバイルのみ表示） */}
      <Button
        onClick={toggle}
        size="icon"
        variant="ghost"
        aria-label={t('aria.closeSidebar')}
        className={cn('text-muted-foreground shrink-0 md:hidden')}
      >
        <PanelLeftClose className="size-4" />
      </Button>
    </div>
  );
}
