'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell'
import { SETTINGS_CATEGORIES } from '@/features/settings/constants'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

/**
 * 設定ダイアログのサイドバー
 *
 * レスポンシブ対応:
 * - モバイル: アイコンのみ表示（48px）
 * - デスクトップ: フル表示（192px）
 *
 * CalendarSidebarと同じ構造：
 * - ヘッダー: 48px（h-12）
 * - カテゴリメニュー: スクロール可能
 */
export function SettingsSidebar() {
  const t = useTranslations()
  const { activeCategory, setActiveCategory } = useSettingsDialogStore()

  return (
    <SidebarShell title={t('settings.dialog.title')} className="border-border w-14 flex-shrink-0 border-r sm:w-48">
      {/* カテゴリメニュー（8pxグリッド準拠） */}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {SETTINGS_CATEGORIES.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium transition-colors sm:justify-start',
                  isActive ? 'bg-state-selected text-foreground' : 'text-muted-foreground hover:bg-state-hover'
                )}
                title={t(category.labelKey)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden truncate sm:inline">{t(category.labelKey)}</span>
              </button>
            )
          })}
        </nav>
      </ScrollArea>
    </SidebarShell>
  )
}
