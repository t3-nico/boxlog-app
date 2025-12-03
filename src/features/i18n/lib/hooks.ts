'use client'

/**
 * i18nフック - 後方互換性のための再エクスポート
 *
 * 新しいコードでは @/lib/i18n/hooks を直接インポートしてください。
 * このファイルは既存のインポートパスとの互換性のために維持されています。
 */

export {
  type TranslationFunction,
  useCurrentLocale,
  useRTL,
  useDirectionalClasses,
  useLocaleChange,
  useResponsiveRTL,
  useRTLAnimation,
  useTranslation,
  useI18n,
  useI18nNamespaces,
} from '@/lib/i18n/hooks'
