/**
 * 公開ページ用の軽量Providers
 *
 * @description
 * 認証不要なページ（/auth/、/legal/、/error/）で使用する最小限のProviders。
 * tRPC、Realtime購読、GlobalSearch等の重い機能を含まない。
 *
 * 含まれるProvider:
 * - ThemeProvider（テーマ切替）
 * - TooltipProvider（ツールチップ）
 *
 * @see /CLAUDE.md - プロバイダー階層の詳細
 */

'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/contexts/theme-context'

interface PublicProvidersProps {
  children: React.ReactNode
}

export function PublicProviders({ children }: PublicProvidersProps) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300} skipDelayDuration={100}>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  )
}
