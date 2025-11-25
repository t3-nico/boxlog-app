'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'

import { SettingsContent } from './SettingsContent'
import { SettingsSidebar } from './SettingsSidebar'

/**
 * 設定ダイアログ（ChatGPT風）
 *
 * 2カラムレイアウト：
 * - 左: カテゴリメニュー（240px / w-60）- ヘッダー含む
 * - 右: 設定コンテンツ（フレキシブル）
 *
 * Note: !important はDialogContentのデフォルト(grid, gap-4, p-6, sm:max-w-lg)を
 * 上書きするために必要
 */
export function SettingsDialog() {
  const { isOpen, closeSettings } = useSettingsDialogStore()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="!flex h-[80vh] !max-w-4xl !flex-col !gap-0 !p-0">
        {/* アクセシビリティ用の非表示タイトル */}
        <VisuallyHidden>
          <DialogTitle>Settings</DialogTitle>
        </VisuallyHidden>

        {/* 2カラムレイアウト */}
        <div className="flex h-full flex-1 overflow-hidden">
          {/* 左: サイドバー（ヘッダー含む） */}
          <SettingsSidebar />

          {/* 右: コンテンツ */}
          <SettingsContent />
        </div>
      </DialogContent>
    </Dialog>
  )
}
