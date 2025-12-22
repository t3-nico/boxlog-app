'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { SettingsContent } from './SettingsContent'
import { SettingsSidebar } from './SettingsSidebar'

/**
 * 設定ダイアログ（ChatGPT風）
 *
 * レスポンシブ対応:
 * - モバイル: 全幅、サイドバーを縮小表示
 * - デスクトップ: 2カラムレイアウト（サイドバー192px + コンテンツ）
 *
 * サイズ: 672x576px (max-w-2xl, h-[36rem])
 */
export function SettingsDialog() {
  const { isOpen, closeSettings } = useSettingsDialogStore()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent
        className="border-border !flex !h-[90vh] !max-h-[36rem] !w-[95vw] !max-w-[42rem] !flex-col !gap-0 overflow-hidden border !p-0 sm:!h-[36rem] sm:!w-auto"
        showCloseButton={false}
      >
        {/* アクセシビリティ用の非表示タイトル */}
        <VisuallyHidden>
          <DialogTitle>Settings</DialogTitle>
        </VisuallyHidden>

        {/* 2カラムレイアウト（モバイルではサイドバーを縮小） */}
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
