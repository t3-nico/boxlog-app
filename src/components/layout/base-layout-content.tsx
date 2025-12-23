'use client'

import { CookieConsentBanner } from '@/components/common/cookie-consent-banner'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import { useCalendarProviderProps } from '@/features/calendar/hooks/useCalendarProviderProps'
import { MobileBottomNavigation } from '@/features/navigation/components/mobile/MobileBottomNavigation'
import { useNotificationRealtime } from '@/features/notifications/hooks/useNotificationRealtime'
import { SettingsDialog } from '@/features/settings/components/dialog'
import { TagsNavigationProvider, type TagsFilter } from '@/features/tags/contexts/TagsNavigationContext'
import { TagsPageProvider } from '@/features/tags/contexts/TagsPageContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useMemo } from 'react'
import { DesktopLayout } from './desktop-layout'
import { MobileLayout } from './mobile-layout'

interface BaseLayoutContentProps {
  children: React.ReactNode
}

/**
 * BaseLayoutのClient Component部分
 *
 * レイアウトのオーケストレーションのみを担当：
 * - デスクトップ/モバイルレイアウトの切り替え
 * - カレンダープロバイダーのラップ
 * - 共通UI要素（FAB、ダイアログ、バナー等）の配置
 *
 * hooks（useNavigationStore, useGlobalSearch等）を使用するため、
 * Client Componentとして分離
 */
export function BaseLayoutContent({ children }: BaseLayoutContentProps) {
  const pathname = usePathname() || '/'
  const t = useTranslations()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)

  // メモ化: localeをパスから抽出
  const localeFromPath = useMemo(() => {
    return (pathname.split('/')[1] || 'ja') as 'ja' | 'en'
  }, [pathname])

  // メモ化: カレンダープロバイダーのprops
  const { calendarProviderProps } = useCalendarProviderProps(pathname, searchParams || new URLSearchParams())

  // メモ化: タグページかどうかを判定
  const isTagsPage = useMemo(() => {
    return pathname?.startsWith(`/${localeFromPath}/tags`) ?? false
  }, [pathname, localeFromPath])

  // メモ化: タグページの初期フィルターをURLから解析
  const initialTagsFilter = useMemo((): TagsFilter => {
    if (!isTagsPage) return 'all'
    const tagsPath = pathname?.replace(`/${localeFromPath}/tags`, '') || ''
    if (tagsPath === '/uncategorized') return 'uncategorized'
    if (tagsPath === '/archive') return 'archive'
    // /tags/g-{number} → group-{number}
    const groupMatch = tagsPath.match(/^\/g-(\d+)$/)
    if (groupMatch?.[1]) return `group-${parseInt(groupMatch[1], 10)}`
    return 'all'
  }, [isTagsPage, pathname, localeFromPath])

  // Realtime通知購読（Toast表示）
  useNotificationRealtime(user?.id, true)

  // メモ化: コンテンツ部分（children, isMobile, localeに依存）
  const content = useMemo(
    () => (
      <div className="flex h-screen flex-col">
        {/* アクセシビリティ: スキップリンク */}
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
        >
          {t('common.skipToMainContent')}
        </a>

        {/* メインレイアウト */}
        {isMobile ? (
          <MobileLayout locale={localeFromPath}>{children}</MobileLayout>
        ) : (
          <DesktopLayout locale={localeFromPath}>{children}</DesktopLayout>
        )}

        {/* Settings Dialog */}
        <SettingsDialog />

        {/* Cookie Consent Banner */}
        <CookieConsentBanner />

        {/* Mobile FAB - BottomNavigationの上に配置（iOS Safe Area対応） */}
        {isMobile ? (
          <Button
            size="icon"
            aria-label={t('common.createNewEvent')}
            className="fixed right-4 z-50 size-14 rounded-2xl shadow-lg"
            style={{
              // iOS Safe Area対応: ボトムナビ(64px) + 余白(16px) + Safe Area
              bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
            }}
            onClick={() => {
              console.log('Create new plan')
            }}
          >
            <Plus className="size-6" />
          </Button>
        ) : null}

        {/* Mobile Bottom Navigation */}
        {isMobile ? <MobileBottomNavigation /> : null}
      </div>
    ),
    [children, isMobile, localeFromPath, t]
  )

  // カレンダーページの場合はCalendarNavigationProviderでラップ
  if (calendarProviderProps) {
    return (
      <CalendarNavigationProvider
        initialDate={calendarProviderProps.initialDate}
        initialView={calendarProviderProps.initialView}
      >
        {content}
      </CalendarNavigationProvider>
    )
  }

  // タグページの場合はTagsNavigationProvider + TagsPageProviderでラップ
  if (isTagsPage) {
    return (
      <TagsNavigationProvider initialFilter={initialTagsFilter}>
        <TagsPageProvider>{content}</TagsPageProvider>
      </TagsNavigationProvider>
    )
  }

  return content
}
