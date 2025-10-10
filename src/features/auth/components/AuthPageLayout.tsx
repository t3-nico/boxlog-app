'use client'

import type React from 'react'

import Link from 'next/link'

import { cn } from '@/lib/utils'

export interface AuthPageLayoutProps {
  /** ロゴコンポーネント */
  logo: React.ReactNode
  /** 右側背景のグラデーションクラス名 */
  backgroundGradient?: string
  /** 右側に表示する絵文字 */
  emoji?: string
  /** 右側に表示するタイトル */
  title?: string
  /** 右側に表示する説明文 */
  description?: string
  /** フォームコンポーネント */
  children: React.ReactNode
}

/**
 * 認証ページ共通レイアウトコンポーネント
 *
 * @example
 * ```tsx
 * <AuthPageLayout
 *   logo={<Logo />}
 *   backgroundGradient="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20"
 *   emoji="📦"
 *   title={t('auth.welcome.title')}
 *   description={t('auth.welcome.description')}
 * >
 *   <LoginForm />
 * </AuthPageLayout>
 * ```
 */
export function AuthPageLayout({
  logo,
  backgroundGradient = 'bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20',
  emoji,
  title,
  description,
  children,
}: AuthPageLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* 左側: フォームエリア */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* ロゴ */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            {logo}
          </Link>
        </div>

        {/* フォーム */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>

      {/* 右側: 背景エリア（PC時のみ表示） */}
      <div className="bg-muted relative hidden lg:block">
        <div className={cn('absolute inset-0', backgroundGradient)}>
          <div className="flex h-full items-center justify-center p-8">
            <div className="space-y-4 text-center">
              {emoji != null && <div className="text-muted-foreground/60 text-6xl font-bold">{emoji}</div>}
              {title != null && <h2 className="text-muted-foreground text-3xl font-bold">{title}</h2>}
              {description != null && <p className="text-muted-foreground/80 max-w-md text-lg">{description}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
