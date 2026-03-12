'use client';

import { PanelLeftClose } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { getDisplayName } from '@/lib/user';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useTranslations } from 'next-intl';

import { UserMenu } from './UserMenu';

interface SidebarProps {
  /** Sidebarのコンテンツ（composition layerから注入） */
  children: ReactNode;
  /** ヘッダー右側に配置するアクション（通知アイコン等） */
  headerActions?: ReactNode;
}

/**
 * サイドバーコンテナ
 *
 * 全ページのSidebarで共通の外枠を提供する。
 * 各ページはchildrenとして独自のコンテンツを渡す。
 *
 * @example
 * ```tsx
 * <Sidebar headerActions={<NotificationDropdown />}>
 *   <SidebarContent />
 * </Sidebar>
 * ```
 */
export function Sidebar({ children, headerActions }: SidebarProps) {
  const user = useAuthStore((state) => state.user);
  const toggle = useLayoutStore.use.toggleSidebar();
  const t = useTranslations();

  const userData = {
    name: getDisplayName(user, 'User'),
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || null,
  };

  return (
    <aside className="group border-border bg-surface-container text-foreground flex h-full w-full flex-col border-r">
      {/* Header - UserMenu + Actions */}
      <div className="flex h-12 shrink-0 items-center justify-between px-2">
        <UserMenu user={userData} />
        <div className="flex items-center">
          <HoverTooltip content={t('sidebar.closeSidebar')} side="bottom">
            <Button
              variant="ghost"
              icon
              className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={toggle}
              aria-label={t('sidebar.closeSidebar')}
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </HoverTooltip>
          {headerActions}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </aside>
  );
}
