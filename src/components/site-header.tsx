'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { PanelLeft } from 'lucide-react'

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
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
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
  const localeFromPath = (pathname.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)
  const { isOpen, toggle } = useSidebarStore()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // パスからパンくずリストを生成
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
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
    <header className="bg-background border-border flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-2 lg:px-6">
        {/* Sidebar Trigger - モバイルは常に表示、デスクトップはSidebar閉じているときのみ */}
        {showMenuButton && (
          <>
            <Button
              onClick={toggle}
              variant="ghost"
              size="icon"
              className="-ml-1"
              aria-label={t('sidebar.openSidebar')}
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          </>
        )}

        {/* Breadcrumb Navigation */}
        <Breadcrumb>
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

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-2">{/* 将来的にアクションボタンを追加 */}</div>
      </div>
    </header>
  )
}
