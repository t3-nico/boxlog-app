'use client'

/**
 * i18n関連のReactフック
 */

import { useEffect, useMemo, useState } from 'react'

import type { Locale } from '@/types/i18n'
import type { TranslatedString } from '@/types/i18n-branded'
import { markAsTranslated } from '@/types/i18n-branded'

import { createTranslation, getDictionary, type Dictionary } from './index'
import { getDirection, isRTL } from './rtl'

// ブラウザの現在の言語を取得するフック
export const useCurrentLocale = (): Locale => {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const htmlElement = document.documentElement
      const currentLang = htmlElement.lang as Locale
      setLocale(currentLang || 'en')
    }
  }, [])

  return locale
}

// RTL状態を取得するフック
export const useRTL = (): {
  isRTL: boolean
  direction: 'ltr' | 'rtl'
  locale: Locale
} => {
  const locale = useCurrentLocale()

  return {
    isRTL: isRTL(locale),
    direction: getDirection(locale),
    locale,
  }
}

// 言語特化のクラス名を生成するフック
export const useDirectionalClasses = () => {
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

// 言語変更を監視するフック
export const useLocaleChange = (callback: (locale: Locale) => void) => {
  useEffect(() => {
    const handleLocaleChange = () => {
      const htmlElement = document.documentElement
      const newLocale = htmlElement.lang as Locale
      callback(newLocale)
    }

    // MutationObserverでlang属性の変更を監視
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
          handleLocaleChange()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    })

    return () => {
      observer.disconnect()
    }
  }, [callback])
}

// メディアクエリと組み合わせた言語対応フック
export const useResponsiveRTL = () => {
  const { isRTL: isRtl, direction, locale } = useRTL()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    setIsMobile(mediaQuery.matches)

    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mediaQuery.addEventListener('change', handleResize)
    return () => mediaQuery.removeEventListener('change', handleResize)
  }, [])

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
export const useRTLAnimation = () => {
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

// 翻訳フック（基本実装）
export const useTranslation = () => {
  const locale = useCurrentLocale()

  // 基本的な翻訳機能（実装されている翻訳システムに合わせて調整）
  const t = (key: string, defaultValue?: string): string => {
    // 今のところデフォルト値を返す（本格的なi18nは将来実装）
    return defaultValue || key
  }

  return {
    t,
    locale,
    ready: true, // 翻訳リソースの読み込み状態
  }
}

/**
 * i18n翻訳フック（型安全版）
 *
 * TranslatedString型を返すことで、ハードコード文字列の使用を防ぎます。
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useI18n } from '@/features/i18n/lib/hooks'
 *
 * export function MyComponent() {
 *   const { t } = useI18n()
 *   return <h1>{t('page.title')}</h1>
 * }
 * ```
 */
export const useI18n = (providedLocale?: 'en' | 'ja') => {
  const detectedLocale = useCurrentLocale()
  const locale = providedLocale || detectedLocale
  const [dictionary, setDictionary] = useState<Dictionary | null>(null)

  useEffect(() => {
    getDictionary(locale as 'en' | 'ja').then(setDictionary)
  }, [locale])

  const t = useMemo(() => {
    if (!dictionary) {
      // 辞書ロード中はキーをそのまま返す
      return (key: string): TranslatedString => markAsTranslated(key)
    }

    return createTranslation(dictionary, locale as 'en' | 'ja')
  }, [dictionary, locale])

  return {
    t,
    locale,
    ready: dictionary !== null,
  }
}
