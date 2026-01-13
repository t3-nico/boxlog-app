'use client';

import { useMemo } from 'react';

import { useAuthStore } from '@/features/auth/stores/useAuthStore';

import { NavSecondary } from './nav-secondary';
import { NavUser } from './nav-user';

/**
 * アプリケーション共通Sidebar
 *
 * - コンテンツエリア（上部）
 * - ユーザーメニュー（下部固定）
 *
 * **デザイン仕様**:
 * - 幅: 240px（ResizablePanel制御）
 * - 8pxグリッドシステム準拠
 * - セマンティックトークン使用
 * - SidebarHeaderは削除（タイトルはPageHeaderで管理）
 */
export function AppSidebar() {
  const user = useAuthStore((state) => state.user);

  const data = useMemo(
    () => ({
      navSecondary: [],
    }),
    [],
  );

  const userData = {
    name: user?.user_metadata?.username || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || null,
  };

  return (
    <aside className="bg-surface-container text-foreground flex h-full w-full flex-col">
      {/* Content - スクロールコンテナ */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto bg-transparent px-2 py-2">
        <NavSecondary items={data.navSecondary} />
      </div>

      {/* User Menu - 下部固定 */}
      <div className="border-border mt-auto border-t px-2 py-2">
        <NavUser user={userData} />
      </div>
    </aside>
  );
}
