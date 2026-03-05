'use client';

import { SidebarShell } from './SidebarShell';

interface AppSidebarProps {
  /** サイドバーのコンテンツ（app layerから注入） */
  children?: React.ReactNode;
  /** ヘッダー右側に配置するアクション（通知アイコン等） */
  headerActions?: React.ReactNode;
}

/**
 * AppSidebar - アプリケーションのメインサイドバー
 *
 * 全ページで常に表示される。
 * コンテンツはchildren経由でapp layerから注入する（cross-feature import回避）。
 */
export function AppSidebar({ children, headerActions }: AppSidebarProps) {
  return <SidebarShell headerActions={headerActions}>{children}</SidebarShell>;
}
