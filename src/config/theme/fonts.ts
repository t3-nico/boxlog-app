/**
 * BoxLog 国際対応フォントシステム
 * 既存のconfig/theme/typographyと統合された国際フォント管理
 */

import type { Locale } from '@/types/i18n'

// ============================================
// フォントファミリー定義
// ============================================

export const fontFamilies = {
  // 欧文フォント（英語・ヨーロッパ言語）
  latin: {
    sans: [
      'Inter', // BoxLogのメインフォント
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },

  // 日本語フォント
  japanese: {
    sans: [
      'Inter', // 欧文部分
      '"Noto Sans JP"', // 日本語メイン
      '"Hiragino Kaku Gothic ProN"',
      '"Hiragino Sans"',
      'Meiryo',
      'sans-serif',
    ],
    mono: ['JetBrains Mono', '"Noto Sans Mono CJK JP"', '"SF Mono"', 'Menlo', 'monospace'],
  },

  // 中国語フォント（簡体字）
  chinese: {
    sans: ['Inter', '"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
    mono: ['JetBrains Mono', '"Noto Sans Mono CJK SC"', 'monospace'],
  },

  // 韓国語フォント
  korean: {
    sans: ['Inter', '"Noto Sans KR"', '"Apple SD Gothic Neo"', 'Malgun Gothic', 'sans-serif'],
    mono: ['JetBrains Mono', '"Noto Sans Mono CJK KR"', 'monospace'],
  },

  // アラビア語フォント
  arabic: {
    sans: ['Inter', '"Noto Sans Arabic"', 'Tahoma', 'Arial', 'sans-serif'],
    mono: ['JetBrains Mono', '"Noto Sans Mono"', 'monospace'],
  },

  // デフォルト（フォールバック）
  default: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
} as const

// ============================================
// 言語別フォント設定
// ============================================

const localeToFontMapping: Record<string, keyof typeof fontFamilies> = {
  en: 'latin',
  ja: 'japanese',
  zh: 'chinese',
  'zh-CN': 'chinese',
  'zh-TW': 'chinese',
  ko: 'korean',
  ar: 'arabic',
  he: 'arabic', // ヘブライ語もアラビア語フォントセットを使用
}

// ============================================
// フォント取得関数
// ============================================

/**
 * 指定されたロケールに適したフォントファミリーを取得
 */
export const getFontFamily = (locale: Locale, type: 'sans' | 'mono' = 'sans'): string[] => {
  const fontKey = (locale as keyof typeof localeToFontMapping) in localeToFontMapping ? localeToFontMapping[locale as keyof typeof localeToFontMapping] : 'default'
  const fontFamily = (fontKey as keyof typeof fontFamilies) in fontFamilies ? fontFamilies[fontKey as keyof typeof fontFamilies] : fontFamilies.default

  // 無効なフォントタイプの場合はデフォルトのsansを返す
  if (!fontFamily || !((type as keyof typeof fontFamily) in fontFamily)) {
    return fontFamilies.default.sans
  }

  return fontFamily[type]
}

/**
 * CSS font-family文字列を生成
 */
export const getFontFamilyString = (locale: Locale, type: 'sans' | 'mono' = 'sans'): string => {
  return getFontFamily(locale, type).join(', ')
}

// ============================================
// フォント重み管理
// ============================================

/**
 * フォント重み定数（既存のtypography.tsと整合）
 */
export const fontWeights = {
  normal: '400',
  medium: '500', // typography.tsで使用
  semibold: '600', // typography.tsで使用
  bold: '700',
} as const

/**
 * 言語別推奨フォント重み
 */
export const getRecommendedWeight = (locale: Locale): keyof typeof fontWeights => {
  // 日本語・中国語・韓国語は少し太めが読みやすい
  if (['ja', 'zh', 'zh-CN', 'ko'].includes(locale)) {
    return 'medium'
  }

  // アラビア語・ヘブライ語は標準
  if (['ar', 'he'].includes(locale)) {
    return 'normal'
  }

  // 英語等のラテン文字は標準
  return 'normal'
}

// ============================================
// Tailwind CSS統合
// ============================================

/**
 * 動的フォントクラス生成
 */
export const getFontClasses = (
  locale: Locale
): {
  sans: string
  mono: string
  weight: {
    normal: string
    medium: string
    semibold: string
    bold: string
  }
} => {
  const fontKey = locale in localeToFontMapping ? localeToFontMapping[locale] : 'default'

  return {
    sans: `font-${fontKey}-sans`,
    mono: `font-${fontKey}-mono`,
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  }
}

// ============================================
// CSS変数生成
// ============================================

/**
 * CSS カスタムプロパティを生成
 */
export const generateFontCSSVariables = (locale: Locale): Record<string, string> => {
  const sansFonts = getFontFamilyString(locale, 'sans')
  const monoFonts = getFontFamilyString(locale, 'mono')

  return {
    '--font-sans': sansFonts,
    '--font-mono': monoFonts,
    '--font-weight-normal': fontWeights.normal,
    '--font-weight-medium': fontWeights.medium,
    '--font-weight-semibold': fontWeights.semibold,
    '--font-weight-bold': fontWeights.bold,
  }
}

// ============================================
// フォント読み込み管理
// ============================================

/**
 * 必要なフォントのプリロード用URL生成
 */
export const getFontPreloadUrls = (locale: Locale): string[] => {
  const urls: string[] = []

  // 全言語でInterをプリロード
  urls.push('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap')

  // 言語別フォント
  const fontKey = locale in localeToFontMapping ? localeToFontMapping[locale] : undefined
  if (fontKey) {
    switch (fontKey) {
      case 'japanese':
        urls.push('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600&display=swap')
        break
      case 'chinese':
        urls.push('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap')
        break
      case 'korean':
        urls.push('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600&display=swap')
        break
      case 'arabic':
        urls.push('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600&display=swap')
        break
    }
  }

  return urls
}

/**
 * 次に読み込む可能性のあるフォント（プリフェッチ用）
 */
export const getFontPrefetchUrls = (currentLocale: Locale): string[] => {
  const allUrls = [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600&display=swap',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600&display=swap',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600&display=swap',
  ]

  // 現在のロケール以外のフォントを返す
  const currentUrls = getFontPreloadUrls(currentLocale)
  return allUrls.filter((url) => !currentUrls.includes(url))
}

// ============================================
// typography.ts統合
// ============================================

/**
 * 既存のtypography.tsスタイルに言語対応フォントを適用
 */
export const applyLocaleFont = (originalStyle: string, locale: Locale, fontType: 'sans' | 'mono' = 'sans'): string => {
  const fontFamily = getFontFamilyString(locale, fontType)

  // 既存のクラスを保持しつつフォントを適用
  return `${originalStyle} [font-family:${fontFamily}]`
}

// ============================================
// フォント検証・フォールバック
// ============================================

/**
 * フォントが利用可能かチェック
 */
export const checkFontAvailability = async (fontName: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false

  try {
    await document.fonts.load(`16px "${fontName}"`)
    return document.fonts.check(`16px "${fontName}"`)
  } catch {
    return false
  }
}

/**
 * 最適なフォントを選択
 */
export const selectOptimalFont = async (locale: Locale): Promise<string[]> => {
  const fontFamily = getFontFamily(locale, 'sans')
  const availableFonts: string[] = []

  for (const font of fontFamily) {
    if (await checkFontAvailability(font)) {
      availableFonts.push(font)
    }
  }

  // 利用可能フォントがない場合はフォールバック
  return availableFonts.length > 0 ? availableFonts : fontFamilies.default.sans
}

// ============================================
// ユーティリティ関数
// ============================================

/**
 * フォント情報をすべて取得
 */
export const getFullFontConfig = (locale: Locale) => {
  return {
    locale,
    fontFamily: {
      sans: getFontFamilyString(locale, 'sans'),
      mono: getFontFamilyString(locale, 'mono'),
    },
    recommendedWeight: getRecommendedWeight(locale),
    cssVariables: generateFontCSSVariables(locale),
    preloadUrls: getFontPreloadUrls(locale),
    prefetchUrls: getFontPrefetchUrls(locale),
    classes: getFontClasses(locale),
  }
}

/**
 * 現在サポートしている言語一覧
 */
export const getSupportedFontLocales = (): string[] => {
  return Object.keys(localeToFontMapping)
}

/**
 * デバッグ用フォント情報
 */
export const debugFontInfo = (locale: Locale) => {
  console.group(`Font Info for locale: ${locale}`)
  console.log('Font Family:', getFontFamilyString(locale, 'sans'))
  console.log('Mono Family:', getFontFamilyString(locale, 'mono'))
  console.log('Recommended Weight:', getRecommendedWeight(locale))
  console.log('Preload URLs:', getFontPreloadUrls(locale))
  console.groupEnd()
}

// ============================================
// デフォルトエクスポート
// ============================================

export const fontSystem = {
  fontFamilies,
  fontWeights,
  getFontFamily,
  getFontFamilyString,
  getRecommendedWeight,
  getFontClasses,
  generateFontCSSVariables,
  getFontPreloadUrls,
  getFontPrefetchUrls,
  applyLocaleFont,
  checkFontAvailability,
  selectOptimalFont,
  getFullFontConfig,
  getSupportedFontLocales,
  debugFontInfo,
} as const

export default fontSystem
