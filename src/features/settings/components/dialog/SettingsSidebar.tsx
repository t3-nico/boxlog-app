'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/features/i18n/lib/hooks'
import { SETTINGS_CATEGORIES } from '@/features/settings/constants'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { cn } from '@/lib/utils'

/**
 * 設定ダイアログのサイドバー
 *
 * カテゴリメニューを表示し、選択されたカテゴリをハイライト
 */
export function SettingsSidebar() {
  const { t } = useI18n()
  const { activeCategory, setActiveCategory } = useSettingsDialogStore()

  return (
    <aside className="bg-sidebar border-border w-60 flex-shrink-0 border-r">
      <ScrollArea className="h-full">
        <nav className="space-y-0 p-4">
          {SETTINGS_CATEGORIES.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'flex w-full items-center gap-1 rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <div className="truncate">{t(category.labelKey)}</div>
                </div>
              </button>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
