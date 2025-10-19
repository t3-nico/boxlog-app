'use client'

import { BarChart3, Calendar, PanelLeftClose, Search, SquareKanban, Table as TableIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthContext } from '@/features/auth'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'

import { NavMain } from './nav-main'
import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const { user } = useAuthContext()
  const pathname = usePathname()
  const { close } = useSidebarStore()

  // URLから locale を抽出 (例: /ja/calendar -> ja)
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t, locale } = useI18n(localeFromPath)

  const data = useMemo(
    () => ({
      navMain: [
        {
          title: t('sidebar.navigation.calendar'),
          url: `/${locale}/calendar`,
          icon: Calendar,
        },
        {
          title: t('sidebar.navigation.board'),
          url: `/${locale}/board`,
          icon: SquareKanban,
        },
        {
          title: t('sidebar.navigation.table'),
          url: `/${locale}/table`,
          icon: TableIcon,
        },
        {
          title: t('sidebar.navigation.stats'),
          url: `/${locale}/stats`,
          icon: BarChart3,
        },
      ],
      navSecondary: [
        {
          title: t('sidebar.navigation.search'),
          url: '#',
          icon: Search,
        },
      ],
    }),
    [t, locale]
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
        <NavUser user={userData} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={close} size="icon-sm" variant="ghost" className="shrink-0">
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t('sidebar.closeSidebar')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-transparent px-2">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </div>
    </aside>
  )
}
