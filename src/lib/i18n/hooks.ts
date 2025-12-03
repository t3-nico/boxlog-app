'use client'

/**
 * i18n関連のReactフック
 *
 * next-intlのuseTranslationsをラップし、既存のAPIとの互換性を提供します。
 */

import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useSyncExternalStore } from 'react'

import type { TranslatedString } from '@/types/i18n-branded'
import { markAsTranslated } from '@/types/i18n-branded'

// 互換性のための型定義
export type Locale = 'en' | 'ja'

// 拡張翻訳関数の型定義（後方互換性用）
export interface TranslationFunction {
  (key: string, variables?: Record<string, string | number>): TranslatedString
  plural: (key: string, count: number, variables?: Record<string, string | number>) => TranslatedString
  icu: (message: string, count: number, variables?: Record<string, string | number>) => TranslatedString
}

// Re-export TranslationFunction for external use
export type { TranslatedString }

/**
 * 現在の言語を取得するフック
 *
 * next-intlのuseLocaleをラップして、型安全な言語を返します。
 */
export function useCurrentLocale(): Locale {
  const locale = useLocale()
  return locale as Locale
}

// RTL判定（将来の拡張用）
function isRTL(locale: Locale): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur']
  return rtlLocales.includes(locale)
}

function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}

// RTL状態を取得するフック
export function useRTL(): {
  isRTL: boolean
  direction: 'ltr' | 'rtl'
  locale: Locale
} {
  const locale = useCurrentLocale()

  return {
    isRTL: isRTL(locale),
    direction: getDirection(locale),
    locale,
  }
}

// 言語特化のクラス名を生成するフック
export function useDirectionalClasses() {
  const { isRTL: isRtl, locale } = useRTL()

  return {
    // テキスト配置
    textAlign: isRtl ? 'text-right' : 'text-left',
    textAlignReverse: isRtl ? 'text-left' : 'text-right',

    // フレックスボックス
    flexRow: isRtl ? 'flex-row-reverse' : 'flex-row',
    flexRowReverse: isRtl ? 'flex-row' : 'flex-row-reverse',

    // マージン
    ml: (value: string) => (isRtl ? `mr-${value}` : `ml-${value}`),
    mr: (value: string) => (isRtl ? `ml-${value}` : `mr-${value}`),
    marginStart: (value: string) => (isRtl ? `mr-${value}` : `ml-${value}`),
    marginEnd: (value: string) => (isRtl ? `ml-${value}` : `mr-${value}`),

    // パディング
    pl: (value: string) => (isRtl ? `pr-${value}` : `pl-${value}`),
    pr: (value: string) => (isRtl ? `pl-${value}` : `pr-${value}`),
    paddingStart: (value: string) => (isRtl ? `pr-${value}` : `pl-${value}`),
    paddingEnd: (value: string) => (isRtl ? `pl-${value}` : `pr-${value}`),

    // 位置
    left: (value: string) => (isRtl ? `right-${value}` : `left-${value}`),
    right: (value: string) => (isRtl ? `left-${value}` : `right-${value}`),
    positionStart: (value: string) => (isRtl ? `right-${value}` : `left-${value}`),
    positionEnd: (value: string) => (isRtl ? `left-${value}` : `right-${value}`),

    // ボーダー
    borderLeft: (width = '2') => (isRtl ? `border-r-${width}` : `border-l-${width}`),
    borderRight: (width = '2') => (isRtl ? `border-l-${width}` : `border-r-${width}`),
    borderStart: (width = '2') => (isRtl ? `border-r-${width}` : `border-l-${width}`),
    borderEnd: (width = '2') => (isRtl ? `border-l-${width}` : `border-r-${width}`),

    // 角丸
    roundedLeft: (size = 'md') => (isRtl ? `rounded-r-${size}` : `rounded-l-${size}`),
    roundedRight: (size = 'md') => (isRtl ? `rounded-l-${size}` : `rounded-r-${size}`),
    roundedStart: (size = 'md') => (isRtl ? `rounded-r-${size}` : `rounded-l-${size}`),
    roundedEnd: (size = 'md') => (isRtl ? `rounded-l-${size}` : `rounded-r-${size}`),

    // アイコン配置
    iconStart: isRtl ? 'icon-right' : 'icon-left',
    iconEnd: isRtl ? 'icon-left' : 'icon-right',

    locale,
  }
}

// 言語変更を監視するフック（レガシー互換性用）
export function useLocaleChange(callback: (locale: Locale) => void): void {
  // next-intlではルーティングベースの言語切替なので、このフックは不要
  // 互換性のために空実装を維持
  void callback
}

// メディアクエリと組み合わせた言語対応フック
export function useResponsiveRTL() {
  const { isRTL: isRtl, direction, locale } = useRTL()

  // useSyncExternalStoreベースのメディアクエリ監視
  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === 'undefined') return () => {}
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    mediaQuery.addEventListener('change', callback)
    return () => mediaQuery.removeEventListener('change', callback)
  }, [])

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 768px)').matches
  }, [])

  const isMobile = useSyncExternalStore(subscribe, getSnapshot, () => false)

  return {
    isRTL: isRtl,
    direction,
    locale,
    isMobile,
    // モバイルでのRTL専用調整
    mobileRTLClasses: isRtl && isMobile ? 'mobile-rtl' : '',
    // デスクトップでのRTL専用調整
    desktopRTLClasses: isRtl && !isMobile ? 'desktop-rtl' : '',
  }
}

// RTL対応のアニメーション設定フック
export function useRTLAnimation() {
  const { isRTL: isRtl } = useRTL()

  return {
    // スライドイン方向
    slideInDirection: isRtl ? 'slide-in-right' : 'slide-in-left',
    slideOutDirection: isRtl ? 'slide-out-left' : 'slide-out-right',

    // ドロップダウン配置
    dropdownPlacement: isRtl ? 'bottom-start' : 'bottom-end',
    tooltipPlacement: isRtl ? 'left' : 'right',

    // トランジション方向
    transitionDirection: isRtl ? 'reverse' : 'normal',

    // CSS Transform対応
    getTransform: (value: string) => {
      if (!isRtl) return value

      // translateX値を反転
      if (value.includes('translateX(')) {
        return value.replace(/translateX\(([^)]+)\)/, (_match, translateValue) => {
          const numValue = parseFloat(translateValue)
          const unit = translateValue.replace(numValue.toString(), '')
          return `translateX(${-numValue}${unit})`
        })
      }

      return value
    },
  }
}

// 翻訳フック（基本実装 - レガシー互換性用）
export function useTranslation() {
  const locale = useCurrentLocale()
  const t = useTranslations()

  return {
    t: (key: string, defaultValue?: string): string => {
      try {
        return t(key as Parameters<typeof t>[0])
      } catch {
        return defaultValue || key
      }
    },
    locale,
    ready: true,
  }
}

/**
 * i18n翻訳フック（next-intlラッパー）
 *
 * next-intlのuseTranslationsをラップし、既存のAPIとの互換性を提供します。
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useI18n } from '@/lib/i18n/hooks'
 *
 * export function MyComponent() {
 *   const { t } = useI18n()
 *   return <h1>{t('app.name')}</h1>
 * }
 * ```
 */
export function useI18n(_providedLocale?: 'en' | 'ja') {
  const locale = useCurrentLocale()
  const nextIntlT = useTranslations()

  // next-intlのt関数をラップして、既存のAPIと互換性を持たせる
  const t = ((key: string, variables?: Record<string, string | number>): TranslatedString => {
    try {
      // next-intlのt関数を呼び出し
      const result = nextIntlT(key as Parameters<typeof nextIntlT>[0], variables)
      return markAsTranslated(result)
    } catch {
      // キーが見つからない場合はキーをそのまま返す
      return markAsTranslated(key)
    }
  }) as TranslationFunction

  // 複数形処理関数（next-intlの機能を使用）
  t.plural = (key: string, count: number, variables?: Record<string, string | number>): TranslatedString => {
    try {
      const result = nextIntlT(key as Parameters<typeof nextIntlT>[0], { count, ...variables })
      return markAsTranslated(result)
    } catch {
      return markAsTranslated(key)
    }
  }

  // ICU形式処理関数
  t.icu = (message: string, count: number, variables?: Record<string, string | number>): TranslatedString => {
    // next-intlはICU形式をネイティブサポート
    // 直接メッセージを処理する場合はそのまま返す
    try {
      const result = nextIntlT(message as Parameters<typeof nextIntlT>[0], { count, ...variables })
      return markAsTranslated(result)
    } catch {
      return markAsTranslated(message)
    }
  }

  return {
    t,
    locale,
    ready: true, // next-intlは常にready
  }
}

/**
 * ネームスペース指定のi18n翻訳フック
 *
 * next-intlのuseTranslationsをネームスペース指定で使用します。
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useI18nNamespaces } from '@/lib/i18n/hooks'
 *
 * export function CalendarPage() {
 *   const { t } = useI18nNamespaces('calendar')
 *   return <h1>{t('title')}</h1>
 * }
 * ```
 */
export function useI18nNamespaces(namespace?: string) {
  const locale = useCurrentLocale()
  const nextIntlT = useTranslations(namespace as Parameters<typeof useTranslations>[0])

  const t = ((key: string, variables?: Record<string, string | number>): TranslatedString => {
    try {
      const result = nextIntlT(key as Parameters<typeof nextIntlT>[0], variables)
      return markAsTranslated(result)
    } catch {
      return markAsTranslated(key)
    }
  }) as TranslationFunction

  t.plural = (key: string, count: number, variables?: Record<string, string | number>): TranslatedString => {
    try {
      const result = nextIntlT(key as Parameters<typeof nextIntlT>[0], { count, ...variables })
      return markAsTranslated(result)
    } catch {
      return markAsTranslated(key)
    }
  }

  t.icu = (message: string, count: number, variables?: Record<string, string | number>): TranslatedString => {
    try {
      const result = nextIntlT(message as Parameters<typeof nextIntlT>[0], { count, ...variables })
      return markAsTranslated(result)
    } catch {
      return markAsTranslated(message)
    }
  }

  return {
    t,
    locale,
    ready: true,
    loading: false,
  }
}
