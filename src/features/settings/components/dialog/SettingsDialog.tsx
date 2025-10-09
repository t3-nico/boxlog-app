'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/features/i18n/lib/hooks'
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
  const { t } = useI18n()
  const { isOpen, closeSettings } = useSettingsDialogStore()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="!flex h-[85vh] !max-w-6xl !flex-col gap-0 p-0">
        <DialogHeader className="border-border flex-shrink-0 border-b px-6 py-4">
          <DialogTitle>{t('settings.dialog.title')}</DialogTitle>
        </DialogHeader>

        {/* 2カラムレイアウト */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左: サイドバー */}
          <SettingsSidebar />

          {/* 右: コンテンツ */}
          <SettingsContent />
        </div>
      </DialogContent>
    </Dialog>
  )
}
