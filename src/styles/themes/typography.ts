/**
 * タイポグラフィ設定 - フォント、サイズ、行間の定義
 * デザイントークンシステムと統合済み
 */

import { 
  primitiveTypography,
  typographyTokens,
} from './design-tokens'

// フォントファミリー（デザイントークンから取得）
export const fontFamily = primitiveTypography.fontFamily

// フォントサイズ（デザイントークンから取得、Tailwind形式）
export const fontSize = Object.entries(primitiveTypography.fontSize).reduce((acc, [key, value]) => {
  acc[key as keyof typeof primitiveTypography.fontSize] = [value.rem, { lineHeight: value.lineHeight }]
  return acc
}, {} as Record<keyof typeof primitiveTypography.fontSize, [string, { lineHeight: string }]>)

// フォント太さ（デザイントークンから取得）
export const fontWeight = primitiveTypography.fontWeight

// 行間（デザイントークンから取得）
export const lineHeight = primitiveTypography.lineHeight

// 文字間隔（デザイントークンから取得）
export const letterSpacing = primitiveTypography.letterSpacing

// テキストサイズ設定（意味的）
export const textStyles = {
  // 見出し
  heading: {
    h1: {
      fontSize: fontSize['4xl'],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight,
    },
    h2: {
      fontSize: fontSize['3xl'],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight,
    },
    h3: {
      fontSize: fontSize['2xl'],
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.normal,
    },
    h5: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    },
    h6: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
  
  // 本文
  body: {
    large: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.relaxed,
    },
    default: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
    },
    small: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
    },
  },
  
  // キャプション・ラベル
  caption: {
    default: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.tight,
    },
    small: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.tight,
    },
  },
  
  // ボタン
  button: {
    large: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.none,
    },
    default: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.none,
    },
    small: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.none,
    },
  },
  
  // モノスペース
  code: {
    inline: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.normal,
    },
    block: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.relaxed,
    },
  },
} as const

// カレンダー専用テキストスタイル
export const calendarTextStyles = {
  // 日付ヘッダー
  dateHeader: {
    day: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.tight,
    },
    weekday: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.wide,
      textTransform: 'uppercase' as const,
    },
  },
  
  // 時間ラベル
  timeLabel: {
    hour: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.tight,
      fontFamily: fontFamily.mono,
    },
  },
  
  // イベント
  event: {
    title: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.tight,
    },
    time: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.tight,
      fontFamily: fontFamily.mono,
    },
    description: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
    },
  },
  
  // ミニカレンダー
  miniCalendar: {
    month: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.tight,
    },
    weekday: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.tight,
    },
    date: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.tight,
    },
  },
} as const

// 型定義
export type FontFamilyKey = keyof typeof fontFamily
export type FontSizeKey = keyof typeof fontSize
export type FontWeightKey = keyof typeof fontWeight
export type LineHeightKey = keyof typeof lineHeight
export type LetterSpacingKey = keyof typeof letterSpacing