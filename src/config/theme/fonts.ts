/**
 * フォントシステム設定
 * 国際化対応のフォント管理
 */

import type { Locale } from '@/types/i18n'

type FontType = 'sans' | 'mono'

interface FontConfig {
  fontFamilies: Record<Locale, Record<FontType, string[]>>
  weights: Record<Locale, Record<FontType, number[]>>
  preloadUrls: Record<Locale, string[]>
  prefetchUrls: Record<Locale, string[]>
}

const DEFAULT_FONTS: FontConfig = {
  fontFamilies: {
    ja: {
      sans: ['Noto Sans JP', 'Hiragino Sans', 'Meiryo', 'sans-serif'],
      mono: ['JetBrains Mono', 'Source Code Pro', 'monospace'],
    },
    en: {
      sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
  },
  weights: {
    ja: {
      sans: [400, 500, 700],
      mono: [400, 500],
    },
    en: {
      sans: [400, 500, 600, 700],
      mono: [400, 500],
    },
  },
  preloadUrls: {
    ja: [],
    en: [],
  },
  prefetchUrls: {
    ja: [],
    en: [],
  },
}

class FontSystem {
  private config: FontConfig

  constructor(config: FontConfig = DEFAULT_FONTS) {
    this.config = config
  }

  /**
   * 指定ロケールのフォントファミリーを取得
   */
  getFontFamily(locale: Locale, type: FontType = 'sans'): string[] {
    return this.config.fontFamilies[locale]?.[type] || this.config.fontFamilies.en[type]
  }

  /**
   * フォントファミリー文字列を取得
   */
  getFontFamilyString(locale: Locale, type: FontType = 'sans'): string {
    return this.getFontFamily(locale, type)
      .map((font) => (font.includes(' ') ? `"${font}"` : font))
      .join(', ')
  }

  /**
   * 推奨ウェイトを取得
   */
  getRecommendedWeight(locale: Locale): { normal: number; medium: number; bold: number } {
    const weights = this.config.weights[locale]?.sans || [400, 500, 700]
    return {
      normal: weights[0] || 400,
      medium: weights[1] || 500,
      bold: weights[2] || 700,
    }
  }

  /**
   * 最適なフォントを選択
   */
  async selectOptimalFont(locale: Locale): Promise<string[]> {
    // 実際のフォント検出ロジックはここに実装
    return this.getFontFamily(locale, 'sans')
  }

  /**
   * CSS変数を生成
   */
  generateFontCSSVariables(locale: Locale): Record<string, string> {
    const weights = this.getRecommendedWeight(locale)
    return {
      '--font-sans': this.getFontFamilyString(locale, 'sans'),
      '--font-mono': this.getFontFamilyString(locale, 'mono'),
      '--font-weight-normal': String(weights.normal),
      '--font-weight-medium': String(weights.medium),
      '--font-weight-bold': String(weights.bold),
    }
  }

  /**
   * フォントクラスを取得
   */
  getFontClasses(locale: Locale): { sans: string; mono: string } {
    return {
      sans: locale === 'ja' ? 'font-noto-sans-jp' : 'font-inter',
      mono: 'font-jetbrains-mono',
    }
  }

  /**
   * プリロードURLを取得
   */
  getFontPreloadUrls(locale: Locale): string[] {
    return this.config.preloadUrls[locale] || []
  }

  /**
   * プリフェッチURLを取得
   */
  getFontPrefetchUrls(locale: Locale): string[] {
    return this.config.prefetchUrls[locale] || []
  }

  /**
   * ロケールフォントを適用
   */
  applyLocaleFont(style: string, locale: Locale, type: FontType = 'sans'): string {
    return `${style}; font-family: ${this.getFontFamilyString(locale, type)}`
  }

  /**
   * 完全なフォント設定を取得
   */
  getFullFontConfig(locale: Locale): {
    fontFamilies: Record<FontType, string[]>
    weights: Record<FontType, number[]>
  } {
    return {
      fontFamilies: this.config.fontFamilies[locale] || this.config.fontFamilies.en,
      weights: this.config.weights[locale] || this.config.weights.en,
    }
  }

  /**
   * デバッグ情報をログ出力
   */
  debugFontInfo(locale: Locale): void {
    console.log('Font Debug Info:', {
      locale,
      fontFamilies: this.getFontFamily(locale),
      weights: this.getRecommendedWeight(locale),
      cssVariables: this.generateFontCSSVariables(locale),
    })
  }
}

export const fontSystem = new FontSystem()
export type { FontConfig, FontType }
