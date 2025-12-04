'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarHeader } from '@/features/navigation/components/sidebar/SidebarHeader'
import { SETTINGS_CATEGORIES } from '@/features/settings/constants'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

/**
 * 設定ダイアログのサイドバー
 *
 * CalendarSidebarと同じ構造：
 * - ヘッダー: 48px（h-12）
 * - カテゴリメニュー: スクロール可能
 * - 幅: 192px (w-48)
 */
export function SettingsSidebar() {
  const t = useTranslations()
  const { activeCategory, setActiveCategory } = useSettingsDialogStore()

  return (
    <aside className="bg-muted border-border flex w-48 flex-shrink-0 flex-col border-r">
      {/* ヘッダー（48px - SidebarHeaderと同じ） */}
      <SidebarHeader title={t('settings.dialog.title')} className="bg-muted" />

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
                  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium transition-colors',
                  isActive ? 'bg-foreground/12 text-foreground' : 'text-muted-foreground hover:bg-foreground/8'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{t(category.labelKey)}</span>
              </button>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
