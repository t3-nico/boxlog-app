/**
 * i18n - 後方互換性のための再エクスポート
 *
 * next-intlへ完全移行済み。
 * 新しいコードでは以下を直接インポートしてください：
 * - Server Component: import { getTranslations } from 'next-intl/server'
 * - Client Component: import { useTranslations } from 'next-intl'
 * - ルーティング: import { routing, type Locale } from '@/i18n/routing'
 */

// next-intl routing からの再エクスポート
export { routing, type Locale } from '@/i18n/routing'

// next-intl server からの再エクスポート（Server Component用）
export { getTranslations, getLocale, getMessages } from 'next-intl/server'

// next-intl client からの再エクスポート（Client Component用）
export { useTranslations, useLocale } from 'next-intl'

// next-intl navigation からの再エクスポート
export { Link, redirect, usePathname, useRouter, getPathname } from '@/i18n/navigation'
