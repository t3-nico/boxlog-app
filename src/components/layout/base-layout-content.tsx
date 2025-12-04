'use client'

import { CookieConsentBanner } from '@/components/common/cookie-consent-banner'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import { useCalendarProviderProps } from '@/features/calendar/hooks/useCalendarProviderProps'
import { MobileBottomNavigation } from '@/features/navigation/components/mobile/MobileBottomNavigation'
import { useNotificationRealtime } from '@/features/notifications/hooks/useNotificationRealtime'
import { SettingsDialog } from '@/features/settings/components/dialog'
import { TagsPageProvider } from '@/features/tags/contexts/TagsPageContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useSearchParams } from 'next/navigation'
import React from 'react'
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
  const localeFromPath = (pathname.split('/')[1] || 'ja') as 'ja' | 'en'
  const t = useTranslations()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const searchParams = useSearchParams()
  const { calendarProviderProps } = useCalendarProviderProps(pathname, searchParams || new URLSearchParams())
  const user = useAuthStore((state) => state.user)

  // タグページかどうかを判定
  const isTagsPage = pathname?.startsWith(`/${localeFromPath}/tags`) ?? false

  // Realtime通知購読（Toast表示）
  useNotificationRealtime(user?.id, true)

  const content = (
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

      {/* Mobile FAB - BottomNavigationの上に配置 */}
      {isMobile ? (
        <Button
          size="icon"
          aria-label={t('common.createNewEvent')}
          className="fixed right-4 bottom-20 z-50 size-14 rounded-2xl shadow-lg"
          onClick={() => {
            // TODO: PlanInspectorを開く
            console.log('Create new plan')
          }}
        >
          <Plus className="size-6" />
        </Button>
      ) : null}

      {/* Mobile Bottom Navigation */}
      {isMobile ? <MobileBottomNavigation /> : null}
    </div>
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

  // タグページの場合はTagsPageProviderでラップ
  if (isTagsPage) {
    return <TagsPageProvider>{content}</TagsPageProvider>
  }

  return content
}
