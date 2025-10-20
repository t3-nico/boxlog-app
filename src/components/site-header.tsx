'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { Bell, PanelLeft, Search } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { useNotificationDialogStore } from '@/features/notifications'
import { useGlobalSearch } from '@/features/search'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * サイト全体のヘッダーコンポーネント
 *
 * - Sidebarトリガーボタン
 * - パンくずリスト（現在位置を表示）
 * - 右側のアクション（将来的に拡張）
 *
 * shadcn/ui パターン準拠
 */
export function SiteHeader() {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)
  const { isOpen, toggle } = useSidebarStore()
  const { open: openGlobalSearch } = useGlobalSearch()
  const { open: openNotifications } = useNotificationDialogStore()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // パスからパンくずリストを生成
  const breadcrumbs = useMemo(() => {
    const segments = pathname?.split('/').filter(Boolean) || []
    // locale部分を除外
    const pathSegments = segments.slice(1)

    const titleMap: Record<string, string> = {
      calendar: t('sidebar.navigation.calendar'),
      board: t('sidebar.navigation.board'),
      table: t('sidebar.navigation.table'),
      stats: t('sidebar.navigation.stats'),
      settings: t('sidebar.navigation.settings'),
      day: t('calendar.views.day'),
      week: t('calendar.views.week'),
      month: t('calendar.views.month'),
    }

    return pathSegments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 2).join('/')}`
      const title = titleMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      return { path, title, segment }
    })
  }, [pathname, t])

  // モバイルでは常に表示、デスクトップではSidebarが閉じているときのみ表示
  const showMenuButton = isMobile || !isOpen

  return (
    <header className="bg-background flex min-h-12 shrink-0 items-center transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 py-2">
        {/* Sidebar Trigger - モバイルは常に表示、デスクトップはSidebar閉じているときのみ */}
        {showMenuButton ? (
          <>
            <Button onClick={toggle} variant="ghost" size="icon-sm" aria-label={t('sidebar.openSidebar')}>
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          </>
        ) : (
          <div className="w-0" />
        )}

        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mr-2">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.path}>{crumb.title}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Global Search Trigger - デスクトップのみ表示 */}
        <Button
          onClick={openGlobalSearch}
          variant="outline"
          className="text-muted-foreground ml-auto hidden h-8 items-center justify-start gap-2 px-3 text-sm font-normal md:flex md:w-48 lg:w-56"
          aria-label={t('siteHeader.search.aria')}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{t('siteHeader.search.placeholder')}</span>
          <kbd className="bg-muted text-muted-foreground pointer-events-none hidden rounded px-1.5 py-0.5 font-mono text-xs select-none lg:inline-flex">
            {t('siteHeader.search.shortcut')}
          </kbd>
        </Button>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Icon */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={openNotifications}
                  aria-label={t('siteHeader.notifications')}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{t('siteHeader.notifications')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <SimpleThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{t('siteHeader.theme')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  )
}
