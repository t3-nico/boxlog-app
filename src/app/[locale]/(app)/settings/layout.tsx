'use client'

import { usePathname, useRouter } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SETTINGS_CATEGORIES } from '@/features/settings/constants'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * 設定ページレイアウト
 *
 * PC: DesktopLayoutのサイドバー + メインコンテンツ
 * モバイル: スタック遷移（メイン画面 or 詳細画面）
 *
 * PCではDesktopLayoutがSettingsSidebarを表示するため、
 * このlayout.tsxはモバイル用のサイドバーとコンテンツの表示切り替えを担当。
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()

  // 現在のカテゴリを判定
  const currentCategory = SETTINGS_CATEGORIES.find((cat) => pathname?.includes(`/settings/${cat.id}`))?.id

  // モバイルでカテゴリが選択されているか
  const isInCategory = currentCategory !== undefined

  return (
    <div className="bg-background flex h-full w-full">
      {/* モバイル用サイドバー: カテゴリ未選択時のみ表示（PCでは非表示） */}
      <aside
        className={cn(
          'border-border h-full flex-shrink-0 border-r',
          // PC: 非表示（DesktopLayoutのSettingsSidebarを使用）
          'md:hidden',
          // モバイル: カテゴリ未選択時は全幅、選択時は非表示
          isInCategory ? 'hidden' : 'w-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <header className="border-border flex h-14 items-center gap-2 border-b px-4">
            {/* 戻るボタン */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="-ml-2 h-10 w-10"
              aria-label={t('common.back')}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-lg font-semibold">{t('settings.dialog.title')}</h1>
          </header>

          {/* カテゴリリスト */}
          <ScrollArea className="flex-1">
            <nav className="flex flex-col gap-1 p-2">
              {SETTINGS_CATEGORIES.map((category) => {
                const Icon = category.icon
                const isActive = currentCategory === category.id
                const href = `/${locale}/settings/${category.id}`

                return (
                  <Link
                    key={category.id}
                    href={href}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors',
                      isActive ? 'bg-state-selected text-foreground' : 'text-muted-foreground hover:bg-state-hover'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="size-5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium">{t(category.labelKey)}</span>
                      {/* モバイル: 説明文も表示 */}
                      <p className="text-muted-foreground mt-0.5 text-sm">{t(category.descKey)}</p>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main
        className={cn(
          'bg-surface-bright flex h-full min-h-0 flex-1 flex-col overflow-hidden',
          // モバイル: カテゴリ選択時のみ表示、PC: 常時表示
          isInCategory ? 'block' : 'hidden md:block'
        )}
      >
        {children}
      </main>
    </div>
  )
}
