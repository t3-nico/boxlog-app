'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { SettingsContent } from './SettingsContent'
import { SettingsSidebar } from './SettingsSidebar'

/**
 * 設定ダイアログ（ChatGPT風）
 *
 * 2カラムレイアウト：
 * - 左: カテゴリメニュー（192px / w-48）
 * - 右: 設定コンテンツ（フレキシブル）
 *
 * サイズ: 672x576px (max-w-2xl, h-[36rem])
 */
export function SettingsDialog() {
  const { isOpen, closeSettings } = useSettingsDialogStore()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent
        className="border-border !flex !h-[36rem] !max-w-[42rem] !flex-col !gap-0 overflow-hidden border !p-0"
        showCloseButton={false}
      >
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
