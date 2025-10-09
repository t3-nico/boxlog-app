'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'

import { SettingsContent } from './SettingsContent'
import { SettingsSidebar } from './SettingsSidebar'

/**
 * 設定ダイアログ（ChatGPT風）
 *
 * 2カラムレイアウト：
 * - 左: カテゴリメニュー（240px）
 * - 右: 設定コンテンツ（フレキシブル）
 */
export function SettingsDialog() {
  const { isOpen, closeSettings } = useSettingsDialogStore()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="!flex h-[85vh] !max-w-6xl !flex-col gap-0 p-0">
        {/* 2カラムレイアウト */}
        <div className="flex h-full flex-1 overflow-hidden">
          {/* 左: サイドバー */}
          <SettingsSidebar />

          {/* 右: コンテンツ */}
          <SettingsContent />
        </div>
      </DialogContent>
    </Dialog>
  )
}
