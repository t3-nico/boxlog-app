'use client'

import { useEffect, useRef } from 'react'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { useTranslations } from 'next-intl'

import { AboutLegalSettings } from '../about-legal-settings'
import { AccountSettings } from '../account-settings'
import { CalendarSettings } from '../calendar-settings'
import { ChronotypeSettings } from '../chronotype-settings'
import { DataExportSettings } from '../data-export-settings'
import { IntegrationSettings } from '../integration-settings'
import { NotificationSettings } from '../notification-settings'
import { PlanBillingSettings } from '../plan-billing-settings'
import { PreferencesSettings } from '../preferences-settings'
import { SettingsLayout } from '../SettingsLayout'
import { TagsSettings } from '../tags-settings'

/**
 * 設定ダイアログのコンテンツ領域
 *
 * ChatGPT風7カテゴリ構成:
 * - General: 言語、テーマ、起動画面
 * - Personalization: カレンダー、タグ
 * - Notifications: 通知設定
 * - Data controls: エクスポート、連携
 * - Account: プロフィール、セキュリティ
 * - Subscription: プラン、課金
 * - About: 法的情報、バージョン
 */
export function SettingsContent() {
  const { activeCategory, closeSettings, scrollToSection, clearScrollTarget } = useSettingsDialogStore()
  const t = useTranslations()
  const chronotypeRef = useRef<HTMLDivElement>(null)

  // スクロールターゲットへのスクロール処理
  useEffect(() => {
    if (scrollToSection === 'chronotype' && activeCategory === 'personalization' && chronotypeRef.current) {
      // DOMが描画されるまで少し待つ
      const timer = setTimeout(() => {
        chronotypeRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
        clearScrollTarget()
      }, 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [scrollToSection, activeCategory, clearScrollTarget])

  // カテゴリごとのtitleを取得
  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'general':
        return t('settings.dialog.categories.general')
      case 'personalization':
        return t('settings.dialog.categories.personalization')
      case 'notifications':
        return t('settings.dialog.categories.notifications')
      case 'data-controls':
        return t('settings.dialog.categories.dataControls')
      case 'account':
        return t('settings.dialog.categories.account')
      case 'subscription':
        return t('settings.dialog.categories.subscription')
      case 'about':
        return t('settings.dialog.categories.about')
      default:
        return ''
    }
  }

  const title = getCategoryTitle()

  const closeButton = (
    <Button variant="ghost" size="icon" onClick={closeSettings} className="h-8 w-8">
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </Button>
  )

  return (
    <main className="bg-surface-bright flex min-h-0 flex-1 flex-col overflow-hidden">
      <SettingsLayout title={title} actions={closeButton}>
        {/* General: 言語、テーマ、起動画面（既存のPreferencesSettingsを再利用） */}
        {activeCategory === 'general' && <PreferencesSettings />}

        {/* Personalization: カレンダー + クロノタイプ + タグ */}
        {activeCategory === 'personalization' && (
          <div className="space-y-8">
            <CalendarSettings />
            <div ref={chronotypeRef}>
              <ChronotypeSettings />
            </div>
            <TagsSettings />
          </div>
        )}

        {/* Notifications: 通知設定 */}
        {activeCategory === 'notifications' && <NotificationSettings />}

        {/* Data controls: エクスポート + 連携 */}
        {activeCategory === 'data-controls' && (
          <div className="space-y-8">
            <DataExportSettings />
            <IntegrationSettings />
          </div>
        )}

        {/* Account: プロフィール、セキュリティ */}
        {activeCategory === 'account' && <AccountSettings />}

        {/* Subscription: プラン、課金 */}
        {activeCategory === 'subscription' && <PlanBillingSettings />}

        {/* About: 法的情報、バージョン */}
        {activeCategory === 'about' && <AboutLegalSettings />}
      </SettingsLayout>
    </main>
  )
}
