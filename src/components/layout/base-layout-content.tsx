'use client'

import { CookieConsentBanner } from '@/components/common/cookie-consent-banner'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import { useCalendarProviderProps } from '@/features/calendar/hooks/useCalendarProviderProps'
import { useI18n } from '@/features/i18n/lib/hooks'
import { MobileBottomNavigation } from '@/features/navigation/components/mobile/MobileBottomNavigation'
import { NotificationDialog } from '@/features/notifications'
import { SettingsDialog } from '@/features/settings/components/dialog'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePathname, useSearchParams } from 'next/navigation'
import React from 'react'
import { DesktopLayout } from './desktop-layout'
import { FloatingActionButton } from './floating-action-button'
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
  const { t } = useI18n(localeFromPath)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const searchParams = useSearchParams()

  const { calendarProviderProps } = useCalendarProviderProps(pathname, searchParams || new URLSearchParams())

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

      {/* Floating Action Button */}
      <FloatingActionButton locale={localeFromPath} />

      {/* Settings Dialog */}
      <SettingsDialog />

      {/* Notification Dialog */}
      <NotificationDialog />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />

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

  return content
}
