'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'

import { SettingsContent } from './SettingsContent'
import { SettingsSidebar } from './SettingsSidebar'

/**
 * 設定ダイアログ（ChatGPT風）
 *
 * レイアウト：
 * - ヘッダー: 48px（h-12）- SidebarHeaderと同じ
 * - 左: カテゴリメニュー（240px / w-60）
 * - 右: 設定コンテンツ（フレキシブル）
 *
 * Note: !important はDialogContentのデフォルト(grid, gap-4, p-6, sm:max-w-lg)を
 * 上書きするために必要
 */
export function SettingsDialog() {
  const { isOpen, closeSettings } = useSettingsDialogStore()
  const { t } = useI18n()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="!flex h-[80vh] !max-w-4xl !flex-col !gap-0 !p-0">
        {/* ヘッダー（48px - SidebarHeaderと同じ） */}
        <div className="border-border flex h-12 flex-shrink-0 items-end border-b px-4 pt-2">
          <div className="flex h-10 flex-1 items-center">
            <DialogTitle className="text-base font-semibold">{t('settings.dialog.title')}</DialogTitle>
          </div>
        </div>

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
