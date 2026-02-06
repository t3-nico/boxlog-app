'use client';

import { PanelLeftClose } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import { useSidebarStore } from '../../stores/useSidebarStore';

import { CreateNewDropdown } from './CreateNewDropdown';
import { NavUser } from './nav-user';

interface SidebarShellProps {
  /** Sidebarのコンテンツ */
  children: ReactNode;
  /** 追加のクラス名 */
  className?: string;
  /** NavUserを非表示にする（AppSidebarで独自に表示する場合） */
  hideNavUser?: boolean;
}

/**
 * Sidebar共通シェルコンポーネント
 *
 * 全ページのSidebarで共通の外枠を提供する。
 * 各ページはchildrenとして独自のコンテンツを渡す。
 *
 * **デザイン仕様**:
 * - 背景: bg-surface-container
 * - テキスト: text-foreground
 * - 右ボーダー: border-r border-border
 * - 幅: 親要素に合わせる（w-full）
 * - 高さ: 親要素に合わせる（h-full）
 * - レイアウト: flexbox縦方向
 * - 上部: NavUser + 検索・新規作成アイコン（Linear風）
 *
 * @example
 * ```tsx
 * <SidebarShell>
 *   <SidebarContent />
 * </SidebarShell>
 * ```
 */
export function SidebarShell({ children, className, hideNavUser = false }: SidebarShellProps) {
  const user = useAuthStore((state) => state.user);
  const toggle = useSidebarStore.use.toggle();
  const t = useTranslations();

  const userData = {
    name: user?.user_metadata?.username || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || null,
  };

  return (
    <aside
      className={cn(
        'group border-border bg-surface-container text-foreground flex h-full w-full flex-col border-r',
        className,
      )}
    >
      {/* Header - NavUser + Actions (Linear風) */}
      {!hideNavUser && (
        <div className="flex h-12 shrink-0 items-center justify-between px-2">
          <NavUser user={userData} />
          <div className="flex items-center gap-1">
            <HoverTooltip content={t('sidebar.closeSidebar')} side="bottom">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={toggle}
                aria-label={t('sidebar.closeSidebar')}
              >
                <PanelLeftClose className="size-4" />
              </Button>
            </HoverTooltip>
            <CreateNewDropdown
              size="sm"
              tooltipContent={t('sidebar.quickCreate')}
              tooltipSide="bottom"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </aside>
  );
}
