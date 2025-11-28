'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { useI18n } from '@/features/i18n/lib/hooks'

interface LegalLayoutProps {
  children: ReactNode
}

/**
 * 法的文書ページ共通レイアウト
 * - Privacy Policy、Terms of Service、OSS Creditsで共有
 * - ナビゲーションリンク、最終更新日時を表示
 * - i18n対応（日本語/英語）
 */
export default function LegalLayout({ children }: LegalLayoutProps) {
  const { t } = useI18n()

  return (
    <div className="bg-background min-h-screen">
      {/* ヘッダーナビゲーション */}
      <header className="border-b-border bg-card border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4 md:px-8">
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/calendar" className="text-muted-foreground text-sm transition-colors hover:underline">
              {t('legal.navigation.backToApp')}
            </Link>
            <div className="border-l-border ml-auto flex flex-wrap gap-4 border-l pl-4">
              <Link href="/legal/privacy" className="text-muted-foreground text-sm transition-colors hover:underline">
                {t('legal.navigation.privacy')}
              </Link>
              <Link href="/legal/terms" className="text-muted-foreground text-sm transition-colors hover:underline">
                {t('legal.navigation.terms')}
              </Link>
              <Link href="/legal/security" className="text-muted-foreground text-sm transition-colors hover:underline">
                {t('legal.navigation.security')}
              </Link>
              <Link href="/legal/cookies" className="text-muted-foreground text-sm transition-colors hover:underline">
                {t('legal.navigation.cookies')}
              </Link>
              <Link
                href="/legal/oss-credits"
                className="text-muted-foreground text-sm transition-colors hover:underline"
              >
                {t('legal.navigation.ossCredits')}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>{children}</main>

      {/* フッター */}
      <footer className="border-t-border bg-muted/20 mt-16 border-t">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-muted-foreground text-sm">
              <p className="mb-1">{t('legal.footer.copyright')}</p>
              <p>{t('legal.footer.contact', { email: 'support@boxlog.app' })}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/legal/privacy" className="text-muted-foreground text-sm transition-colors hover:underline">
                {t('legal.navigation.privacy')}
              </Link>
              <Link href="/legal/terms" className="text-muted-foreground text-sm transition-colors hover:underline">
                {t('legal.navigation.terms')}
              </Link>
              <Link href="/legal/security" className="text-muted-foreground text-sm transition-colors hover:underline">
                {t('legal.navigation.security')}
              </Link>
              <Link href="/legal/cookies" className="text-muted-foreground text-sm transition-colors hover:underline">
                {t('legal.navigation.cookies')}
              </Link>
              <Link
                href="/legal/oss-credits"
                className="text-muted-foreground text-sm transition-colors hover:underline"
              >
                {t('legal.navigation.ossCredits')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
