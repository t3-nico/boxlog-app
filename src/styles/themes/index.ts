/**
 * テーマシステム統合エクスポート
 */

// 基本カラーシステム
export * from './colors'
export * from './semantic-colors'

// レイアウト・デザイン
export * from './spacing'
export * from './typography'
export * from './shadows'

// インタラクション
export * from './animations'
export * from './breakpoints'

// 型定義
export * from './types'

// 統合テーマオブジェクト
import { 
  neutralColors, 
  neutralColorsRGB, 
  lightModeColors, 
  darkModeColors, 
  brandColors 
} from './colors'

import { 
  semanticColors, 
  taskStatusColors, 
  priorityColors, 
  chronotypeColors, 
  tagPresetColors, 
  calendarColors 
} from './semantic-colors'

import { 
  spacing, 
  componentSizes, 
  zIndex, 
  borderWidth, 
  borderRadius, 
  maxWidth 
} from './spacing'

import { 
  fontFamily, 
  fontSize, 
  fontWeight, 
  lineHeight, 
  letterSpacing, 
  textStyles,
  calendarTextStyles 
} from './typography'

import { 
  boxShadow, 
  darkBoxShadow, 
  componentShadows, 
  calendarShadows, 
  focusRing 
} from './shadows'

import { 
  easing, 
  duration, 
  transitions, 
  keyframes, 
  calendarAnimations, 
  componentAnimations 
} from './animations'

import { 
  breakpoints, 
  deviceConfig, 
  containers, 
  mediaQueries, 
  calendarResponsive 
} from './breakpoints'

import type { 
  Theme, 
  ThemeConfig, 
  CalendarThemeConfig, 
  ComponentThemeConfig,
  ThemeMode 
} from './types'

// 統合テーマオブジェクト
export const theme: Theme = {
  // メイン設定
  config: {
    mode: 'system' as ThemeMode,
    
    colors: {
      light: {
        background: lightModeColors.bgPrimary,
        foreground: lightModeColors.textPrimary,
        card: lightModeColors.bgCard,
        popover: lightModeColors.bgCard,
        primary: brandColors.primary.default,
        secondary: lightModeColors.bgSecondary,
        muted: lightModeColors.textMuted,
        accent: lightModeColors.bgSecondary,
        destructive: semanticColors.error.rgb,
        border: lightModeColors.borderPrimary,
        input: lightModeColors.borderPrimary,
        ring: brandColors.primary.default,
      },
      dark: {
        background: darkModeColors.bgPrimary,
        foreground: darkModeColors.textPrimary,
        card: darkModeColors.bgCard,
        popover: darkModeColors.bgCard,
        primary: brandColors.primary.light,
        secondary: darkModeColors.bgSecondary,
        muted: darkModeColors.textMuted,
        accent: darkModeColors.bgSecondary,
        destructive: semanticColors.error.rgb,
        border: darkModeColors.borderPrimary,
        input: darkModeColors.borderPrimary,
        ring: brandColors.primary.light,
      },
    },
    
    spacing,
    typography: {
      fontFamily,
      fontSize,
      fontWeight,
    },
    shadows: boxShadow,
    borderRadius,
    breakpoints,
    animations: {
      easing,
      duration,
      transitions,
      keyframes,
    },
  } satisfies ThemeConfig,
  
  // カレンダー専用設定
  calendar: {
    hourHeight: componentSizes.calendar.hourHeight,
    timeColumn: {
      width: componentSizes.calendar.timeColumnWidth,
      background: lightModeColors.bgSecondary,
      textColor: lightModeColors.textSecondary,
    },
    currentTimeLine: {
      color: calendarColors.currentTimeLine.rgb,
      thickness: '2px',
      dotSize: '8px',
    },
    eventBlock: {
      borderRadius: borderRadius.md,
      padding: spacing[3],
      shadow: componentShadows.card.default,
    },
    grid: {
      lineColor: lightModeColors.borderPrimary,
      businessHoursColor: calendarColors.businessHours.rgb,
      weekendTextColor: calendarColors.weekend.rgb,
    },
  } satisfies CalendarThemeConfig,
  
  // コンポーネント設定
  components: {
    button: {
      sizes: {
        xs: componentSizes.button.xs,
        sm: componentSizes.button.sm,
        md: componentSizes.button.md,
        lg: componentSizes.button.lg,
        xl: componentSizes.button.xl,
      },
      variants: {
        default: {
          background: brandColors.primary.default,
          color: '#ffffff',
          hover: {
            background: `rgb(${brandColors.primary.default} / 0.9)`,
            color: '#ffffff',
          },
        },
        secondary: {
          background: lightModeColors.bgSecondary,
          color: lightModeColors.textPrimary,
          border: lightModeColors.borderPrimary,
          hover: {
            background: lightModeColors.hoverBg,
            color: lightModeColors.hoverText,
          },
        },
        destructive: {
          background: semanticColors.error.rgb,
          color: '#ffffff',
          hover: {
            background: `rgb(${semanticColors.error.rgb} / 0.9)`,
            color: '#ffffff',
          },
        },
      },
    },
    card: {
      background: lightModeColors.bgCard,
      border: lightModeColors.borderPrimary,
      shadow: componentShadows.card.default,
      borderRadius: borderRadius.lg,
      padding: componentSizes.card.padding,
    },
    input: {
      height: componentSizes.input.height,
      padding: componentSizes.input.padding,
      background: lightModeColors.bgPrimary,
      border: lightModeColors.borderPrimary,
      borderRadius: borderRadius.md,
      focus: {
        borderColor: brandColors.primary.default,
        ring: focusRing.default,
      },
    },
  } satisfies ComponentThemeConfig,
  
  // ユーティリティ関数
  utils: {
    getColor: (context, mode = 'light') => {
      return theme.config.colors[mode][context] || '#000000'
    },
    getSemanticColor: (type, shade = 500) => {
      return semanticColors[type]?.[shade as keyof typeof semanticColors.success] || semanticColors[type].rgb
    },
    getRgbColor: (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result 
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
        : '0 0 0'
    },
    getHslColor: (hex) => {
      // HSL変換ロジック（簡略版）
      return hex // 実装時に完全なHSL変換を追加
    },
    getBreakpoint: (key) => breakpoints[key],
    getMediaQuery: (key, type = 'up') => mediaQueries[type][key],
    getSpacing: (size) => spacing[size],
    getFontSize: (size) => fontSize[size],
    getFontWeight: (weight) => fontWeight[weight],
    getShadow: (size, mode = 'light') => {
      return mode === 'dark' ? darkBoxShadow[size] : boxShadow[size]
    },
    getTransition: (type) => transitions.all[type as keyof typeof transitions.all] || transitions.all.normal,
    getEasing: (type) => easing[type as keyof typeof easing] || easing.standard,
  },
}

// CSS変数生成ヘルパー
export const generateCSSVariables = (mode: ThemeMode = 'light') => {
  const colors = theme.config.colors[mode === 'dark' ? 'dark' : 'light']
  
  return Object.entries(colors).reduce((vars, [key, value]) => {
    vars[`--${key}`] = value
    return vars
  }, {} as Record<string, string>)
}

// Tailwind設定生成ヘルパー
export const generateTailwindConfig = () => {
  return {
    colors: {
      ...neutralColors,
      ...Object.entries(semanticColors).reduce((acc, [key, colors]) => {
        acc[key] = colors
        return acc
      }, {} as Record<string, any>),
      ...Object.entries(brandColors).reduce((acc, [key, colors]) => {
        acc[key] = colors
        return acc
      }, {} as Record<string, any>),
    },
    spacing,
    fontSize,
    fontWeight,
    boxShadow: {
      ...boxShadow,
      'dark-xs': darkBoxShadow.xs,
      'dark-sm': darkBoxShadow.sm,
      'dark-md': darkBoxShadow.md,
      'dark-lg': darkBoxShadow.lg,
      'dark-xl': darkBoxShadow.xl,
      'dark-2xl': darkBoxShadow['2xl'],
    },
    borderRadius,
    screens: breakpoints,
    animation: Object.entries(calendarAnimations).reduce((acc, [key, config]) => {
      acc[key] = `${key} ${config.duration || duration.normal} ${config.timing || easing.standard} ${config.iteration || ''}`
      return acc
    }, {} as Record<string, string>),
    keyframes: Object.entries(keyframes).reduce((acc, [key, frames]) => {
      acc[key] = frames
      return acc
    }, {} as Record<string, any>),
  }
}

// デフォルトエクスポート
export default theme

// 個別エクスポート（後方互換性用）
export { 
  // カラー
  neutralColors,
  neutralColorsRGB, 
  lightModeColors,
  darkModeColors,
  brandColors,
  semanticColors,
  taskStatusColors,
  priorityColors,
  tagPresetColors,
  
  // レイアウト
  spacing,
  componentSizes,
  zIndex,
  borderRadius,
  
  // タイポグラフィ
  fontFamily,
  fontSize,
  fontWeight,
  textStyles,
  calendarTextStyles,
  
  // シャドウ
  boxShadow,
  darkBoxShadow,
  componentShadows,
  calendarShadows,
  focusRing,
  
  // アニメーション
  easing,
  duration,
  transitions,
  calendarAnimations,
  componentAnimations,
  
  // レスポンシブ
  breakpoints,
  deviceConfig,
  mediaQueries,
  calendarResponsive,
}