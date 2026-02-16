'use client';

import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';

/**
 * 設定画面用サイドバー
 *
 * TODO: 設定セクションのナビゲーションを実装
 */
export function SettingsSidebar() {
  return (
    <SidebarShell>
      <div className="p-4">
        <p className="text-muted-foreground text-sm">Settings</p>
      </div>
    </SidebarShell>
  );
}
