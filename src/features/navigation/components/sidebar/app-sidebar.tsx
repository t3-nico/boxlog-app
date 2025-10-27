'use client'

import { PanelLeftClose } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'

import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const pathname = usePathname()
  const { close } = useSidebarStore()

  // URLから locale を抽出 (例: /ja/calendar -> ja)
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  const data = useMemo(
    () => ({
      navSecondary: [],
    }),
    []
  )

  const userData = {
    name: user?.user_metadata?.username || user?.email?.split('@')[0] || 'ユーザー',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || null,
  }

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-full w-full flex-col">
      {/* Header - User Menu + 閉じるボタン */}
      <div className="mb-2 flex min-h-12 items-center justify-between px-2">
        <div className="flex-1">
          <NavUser user={userData} />
        </div>
        <Button
          onClick={close}
          size="icon"
          variant="ghost"
          aria-label={t('sidebar.closeSidebar')}
          className="text-muted-foreground hover:text-foreground size-8 shrink-0"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-transparent px-2">
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </div>
    </aside>
  )
}
