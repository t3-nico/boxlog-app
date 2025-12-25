/**
 * 公開ページ用の軽量Providers
 *
 * @description
 * 認証不要なページ（/auth/、/legal/、/error/）で使用する最小限のProviders。
 * tRPC、Realtime購読、GlobalSearch等の重い機能を含まない。
 *
 * 含まれるProvider:
 * - PublicThemeProvider（テーマ切替 - tRPC不使用）
 *
 * @see /CLAUDE.md - プロバイダー階層の詳細
 */

'use client';

import { PublicThemeProvider } from '@/contexts/public-theme-context';

interface PublicProvidersProps {
  children: React.ReactNode;
}

export function PublicProviders({ children }: PublicProvidersProps) {
  return <PublicThemeProvider>{children}</PublicThemeProvider>;
}
