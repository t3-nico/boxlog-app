'use client';

import { SidebarShell } from './SidebarShell';

interface AppSidebarProps {
  /** サイドバーのコンテンツ（app layerから注入） */
  children?: React.ReactNode;
}

/**
 * AppSidebar - アプリケーションのメインサイドバー
 *
 * 全ページで常に表示される。
 * コンテンツはchildren経由でapp layerから注入する（cross-feature import回避）。
 */
export function AppSidebar({ children }: AppSidebarProps) {
  return <SidebarShell>{children}</SidebarShell>;
}
