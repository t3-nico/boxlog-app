/**
 * タイポグラフィ設定 - フォント、サイズ、行間の定義
 */

// フォントファミリー
export const fontFamily = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ],
  mono: [
    'JetBrains Mono',
    'Monaco',
    'Cascadia Code',
    'Segoe UI Mono',
    'Roboto Mono',
    'Oxygen Mono',
    'Ubuntu Monospace',
    'Source Code Pro',
    'Fira Mono',
    'Droid Sans Mono',
    'Courier New',
    'monospace'
  ],
} as const

// フォントサイズ（14pxベース）
export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  '5xl': ['3rem', { lineHeight: '1' }],         // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
} as const

// フォント太さ
export const fontWeight = {
  thin: '100',
  extraLight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const

// 行間
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

// 文字間隔
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

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