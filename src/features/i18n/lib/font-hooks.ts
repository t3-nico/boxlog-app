'use client'

/**
 * 国際化対応フォント管理Reactフック
 */

import { useEffect, useState } from 'react'

import { fontSystem } from '@/config/theme/fonts'
import type { Locale } from '@/types/i18n'

import { useCurrentLocale } from './hooks'

// ============================================
// フォントローディングフック
// ============================================

/**
 * 現在のロケールに適したフォントを取得・管理するフック
 */
export const useLocaleFont = () => {
  const locale = useCurrentLocale()
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [optimalFonts, setOptimalFonts] = useState<string[]>([])

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const fonts = await fontSystem.selectOptimalFont(locale)
        setOptimalFonts(fonts)
        setFontsLoaded(true)
      } catch (error) {
        console.warn('Font loading failed:', error)
        // フォールバックフォントを設定
        setOptimalFonts(fontSystem.getFontFamily(locale, 'sans'))
        setFontsLoaded(true)
      }
    }

    loadFonts()
  }, [locale])

  return {
    locale,
    fontsLoaded,
    fontFamily: {
      sans: optimalFonts.join(', '),
      mono: fontSystem.getFontFamilyString(locale, 'mono'),
    },
    recommendedWeight: fontSystem.getRecommendedWeight(locale),
    cssVariables: fontSystem.generateFontCSSVariables(locale),
    classes: fontSystem.getFontClasses(locale),
  }
}

// ============================================
// フォントプリロードフック
// ============================================

/**
 * 必要なフォントをプリロード・プリフェッチするフック
 */
export const useFontPreloader = (locale: Locale) => {
  const [preloadStatus, setPreloadStatus] = useState<{
    preloaded: boolean
    prefetched: boolean
    errors: string[]
  }>({
    preloaded: false,
    prefetched: false,
    errors: [],
  })

  useEffect(() => {
    const preloadFonts = async () => {
      try {
        // 必要なフォントをプリロード
        const preloadUrls = fontSystem.getFontPreloadUrls(locale)
        const prefetchUrls = fontSystem.getFontPrefetchUrls(locale)

        // プリロード実行
        const preloadPromises = preloadUrls.map((url: string) => {
          return new Promise<void>((resolve, reject) => {
            const link = document.createElement('link')
            link.rel = 'preload'
            link.as = 'style'
            link.href = url
            link.onload = () => resolve()
            link.onerror = () => reject(new Error(`Failed to preload: ${url}`))
            document.head.appendChild(link)
          })
        })

        await Promise.all(preloadPromises)
        setPreloadStatus((prev) => ({ ...prev, preloaded: true }))

        // プリフェッチ実行（失敗しても続行）
        prefetchUrls.forEach((url: string) => {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.as = 'style'
          link.href = url
          document.head.appendChild(link)
        })

        setPreloadStatus((prev) => ({ ...prev, prefetched: true }))
      } catch (error) {
        console.warn('Font preloading failed:', error)
        setPreloadStatus((prev) => ({
          ...prev,
          errors: [...prev.errors, String(error)],
        }))
      }
    }

    preloadFonts()
  }, [locale])

  return preloadStatus
}

// ============================================
// 動的スタイル適用フック
// ============================================

/**
 * 動的にフォントスタイルを適用するフック
 */
export const useDynamicFontStyles = () => {
  const { locale, cssVariables, fontsLoaded } = useLocaleFont()

  useEffect(() => {
    if (!fontsLoaded) return

    // CSS変数をドキュメントに適用
    const root = document.documentElement
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // lang属性も更新（まだされていない場合）
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale
    }

    return () => {
      // クリーンアップ（必要に応じて）
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key)
      })
    }
  }, [locale, cssVariables, fontsLoaded])

  return {
    locale,
    fontsLoaded,
    stylesApplied: fontsLoaded,
  }
}

// ============================================
// フォント最適化フック
// ============================================

/**
 * フォント最適化設定を管理するフック
 */
export const useFontOptimization = () => {
  const locale = useCurrentLocale()
  const [optimizationEnabled, setOptimizationEnabled] = useState(true)

  useEffect(() => {
    // Font Display API対応チェック
    const supportsFontDisplay = 'fonts' in document && 'load' in document.fonts

    if (supportsFontDisplay && optimizationEnabled) {
      // フォント最適化を有効化
      const optimizeFonts = async () => {
        try {
          const fontFamily = fontSystem.getFontFamily(locale, 'sans')

          // 重要フォントを先読み
          for (const font of fontFamily.slice(0, 2)) {
            // 最初の2つのフォントのみ
            await document.fonts.load(`16px "${font}"`)
          }
        } catch (error) {
          console.warn('Font optimization failed:', error)
        }
      }

      optimizeFonts()
    }
  }, [locale, optimizationEnabled])

  return {
    optimizationEnabled,
    setOptimizationEnabled,
    supportsFontDisplay: 'fonts' in document && 'load' in document.fonts,
  }
}

// ============================================
// タイポグラフィ統合フック
// ============================================

/**
 * 既存のtypographyシステムと統合したフォントスタイルを取得
 */
export const useTypographyWithLocaleFont = () => {
  const { locale, fontFamily, classes } = useLocaleFont()

  const getLocalizedStyle = (originalStyle: string, fontType: 'sans' | 'mono' = 'sans') => {
    return fontSystem.applyLocaleFont(originalStyle, locale, fontType)
  }

  const getClassWithFont = (baseClasses: string, fontType: 'sans' | 'mono' = 'sans') => {
    const fontClass = fontType === 'mono' ? classes.mono : classes.sans
    return `${baseClasses} ${fontClass}`
  }

  return {
    locale,
    fontFamily,
    classes,
    getLocalizedStyle,
    getClassWithFont,
  }
}

// ============================================
// フォント情報表示フック（デバッグ用）
// ============================================

/**
 * 現在のフォント情報を取得するフック（開発用）
 */
export const useFontDebugInfo = () => {
  const locale = useCurrentLocale()
  const { fontsLoaded, fontFamily } = useLocaleFont()

  return {
    locale,
    fontsLoaded,
    fontFamily,
    fullConfig: fontSystem.getFullFontConfig(locale),
    debugLog: () => fontSystem.debugFontInfo(locale),
  }
}

// ============================================
// パフォーマンス監視フック
// ============================================

/**
 * フォント読み込みパフォーマンスを監視するフック
 */
export const useFontPerformance = () => {
  const [metrics, setMetrics] = useState<{
    loadTime: number | null
    fontsCount: number
    failedFonts: string[]
  }>({
    loadTime: null,
    fontsCount: 0,
    failedFonts: [],
  })

  const locale = useCurrentLocale()

  useEffect(() => {
    const startTime = performance.now()
    let fontsCount = 0
    const failedFonts: string[] = []

    const measureFontLoading = async () => {
      try {
        const fontUrls = fontSystem.getFontPreloadUrls(locale)

        const results = await Promise.allSettled(
          fontUrls.map(async (url: string) => {
            try {
              const response = await fetch(url)
              if (response.ok) {
                fontsCount++
              } else {
                failedFonts.push(url)
              }
            } catch {
              failedFonts.push(url)
            }
          })
        )

        const endTime = performance.now()
        setMetrics({
          loadTime: endTime - startTime,
          fontsCount,
          failedFonts,
        })
      } catch (error) {
        console.warn('Font performance measurement failed:', error)
      }
    }

    measureFontLoading()
  }, [locale])

  return metrics
}

// ============================================
// 便利なエクスポート
// ============================================

export const fontHooks = {
  useLocaleFont,
  useFontPreloader,
  useDynamicFontStyles,
  useFontOptimization,
  useTypographyWithLocaleFont,
  useFontDebugInfo,
  useFontPerformance,
} as const

export default fontHooks
