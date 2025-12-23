'use client'

import { CookieConsentBanner } from '@/components/common/cookie-consent-banner'
import { Button } from '@/components/ui/button'
import { MEDIA_QUERIES } from '@/config/ui/breakpoints'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import { useCalendarProviderProps } from '@/features/calendar/hooks/useCalendarProviderProps'
import {
  CreateActionSheet,
  useCreateActionSheet,
  type CreateActionType,
} from '@/features/navigation/components/mobile/CreateActionSheet'
import { MobileBottomNavigation } from '@/features/navigation/components/mobile/MobileBottomNavigation'
import { useNotificationRealtime } from '@/features/notifications/hooks/useNotificationRealtime'
import { TagsNavigationProvider, type TagsFilter } from '@/features/tags/contexts/TagsNavigationContext'
import { TagsPageProvider } from '@/features/tags/contexts/TagsPageContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
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
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile)
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

  // CreateActionSheet状態管理
  const createActionSheet = useCreateActionSheet()

  // FABからのアクション選択ハンドラー
  const handleCreateAction = useCallback((type: CreateActionType) => {
    // TODO: 各アクションの実装
    switch (type) {
      case 'plan':
        console.log('Create new plan')
        break
      case 'record':
        console.log('Create new record')
        break
      case 'template':
        console.log('Add from template')
        break
    }
  }, [])

  // メモ化: コンテンツ部分（children, isMobile, localeに依存）
  const content = useMemo(
    () => (
      <div className="flex h-screen flex-col pb-16 md:pb-0">
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

        {/* Cookie Consent Banner */}
        <CookieConsentBanner />

        {/* Mobile FAB - BottomNavigationの上に配置 */}
        {isMobile ? (
          <Button
            size="icon"
            aria-label={t('common.createNewEvent')}
            className="fixed right-4 bottom-20 z-50 size-14 rounded-2xl shadow-lg"
            onClick={createActionSheet.open}
          >
            <Plus className="size-6" />
          </Button>
        ) : null}

        {/* CreateActionSheet - FABタップ時のボトムシート */}
        {isMobile ? (
          <CreateActionSheet
            open={createActionSheet.isOpen}
            onOpenChange={createActionSheet.setIsOpen}
            onSelect={handleCreateAction}
          />
        ) : null}

        {/* Mobile Bottom Navigation */}
        {isMobile ? <MobileBottomNavigation /> : null}
      </div>
    ),
    [children, isMobile, localeFromPath, t, createActionSheet, handleCreateAction]
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
