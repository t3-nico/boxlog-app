/**
 * CSS変数生成ロジック
 * TypeScriptからCSS変数を生成する統一インターフェース
 */

import {
  neutralColors,
  neutralColorsRGB,
  lightModeColors,
  darkModeColors,
  brandColors,
  semanticColors,
} from './colors'
import { componentSizes, borderRadius, spacing } from './spacing'
import { boxShadow, darkBoxShadow } from './shadows'
import { 
  semanticBackground,
  semanticText,
  semanticBorder,
  semanticInteraction,
  semanticState,
  semanticFeedback,
  primitiveSpacing,
  primitiveBorderRadius,
} from './design-tokens'
import type { ThemeMode } from './types'

/**
 * CSS変数名の定数定義（型安全性のため）
 */
export const CSS_VARIABLE_NAMES = {
  // Core colors
  BACKGROUND: '--color-background',
  FOREGROUND: '--color-foreground',
  CARD: '--color-card',
  CARD_FOREGROUND: '--color-card-foreground',
  POPOVER: '--color-popover',
  POPOVER_FOREGROUND: '--color-popover-foreground',
  PRIMARY: '--color-primary',
  PRIMARY_FOREGROUND: '--color-primary-foreground',
  SECONDARY: '--color-secondary',
  SECONDARY_FOREGROUND: '--color-secondary-foreground',
  MUTED: '--color-muted',
  MUTED_FOREGROUND: '--color-muted-foreground',
  ACCENT: '--color-accent',
  ACCENT_FOREGROUND: '--color-accent-foreground',
  DESTRUCTIVE: '--color-destructive',
  DESTRUCTIVE_FOREGROUND: '--color-destructive-foreground',
  BORDER: '--color-border',
  INPUT: '--color-input',
  RING: '--color-ring',
  
  // Layout
  RADIUS: '--radius',
} as const

export type CSSVariableName = typeof CSS_VARIABLE_NAMES[keyof typeof CSS_VARIABLE_NAMES]

/**
 * カラー値をCSS変数形式に変換
 */
const formatColorValue = (color: string): string => {
  // RGBフォーマット（例: "255 255 255"）の場合はそのまま
  if (/^\d+\s+\d+\s+\d+$/.test(color)) {
    return color
  }
  
  // HEXカラー（例: "#ffffff"）の場合はRGBに変換
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `${r} ${g} ${b}`
  }
  
  // rgb()形式の場合は数値のみ抽出
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    return `${rgbMatch[1]} ${rgbMatch[2]} ${rgbMatch[3]}`
  }
  
  return color
}

/**
 * ライトモード用CSS変数を生成（デザイントークン統合版）
 */
export const generateLightModeVariables = (): Record<string, string> => {
  return {
    [CSS_VARIABLE_NAMES.BACKGROUND]: semanticBackground.primary.light.rgb,
    [CSS_VARIABLE_NAMES.FOREGROUND]: semanticText.primary.light.rgb,
    [CSS_VARIABLE_NAMES.CARD]: semanticBackground.card.light.rgb,
    [CSS_VARIABLE_NAMES.CARD_FOREGROUND]: semanticText.primary.light.rgb,
    [CSS_VARIABLE_NAMES.POPOVER]: semanticBackground.elevated.light.rgb,
    [CSS_VARIABLE_NAMES.POPOVER_FOREGROUND]: semanticText.primary.light.rgb,
    [CSS_VARIABLE_NAMES.PRIMARY]: semanticInteraction.primary.default.light.rgb,
    [CSS_VARIABLE_NAMES.PRIMARY_FOREGROUND]: semanticBackground.primary.light.rgb,
    [CSS_VARIABLE_NAMES.SECONDARY]: semanticBackground.secondary.light.rgb,
    [CSS_VARIABLE_NAMES.SECONDARY_FOREGROUND]: semanticText.primary.light.rgb,
    [CSS_VARIABLE_NAMES.MUTED]: semanticBackground.secondary.light.rgb,
    [CSS_VARIABLE_NAMES.MUTED_FOREGROUND]: semanticText.muted.light.rgb,
    [CSS_VARIABLE_NAMES.ACCENT]: semanticBackground.secondary.light.rgb,
    [CSS_VARIABLE_NAMES.ACCENT_FOREGROUND]: semanticText.primary.light.rgb,
    [CSS_VARIABLE_NAMES.DESTRUCTIVE]: semanticState.error.icon.light.rgb,
    [CSS_VARIABLE_NAMES.DESTRUCTIVE_FOREGROUND]: semanticBackground.primary.light.rgb,
    [CSS_VARIABLE_NAMES.BORDER]: semanticBorder.primary.light.rgb,
    [CSS_VARIABLE_NAMES.INPUT]: semanticBackground.primary.light.rgb,
    [CSS_VARIABLE_NAMES.RING]: semanticFeedback.focus.ring.light.rgb,
  }
}

/**
 * ダークモード用CSS変数を生成（デザイントークン統合版）
 */
export const generateDarkModeVariables = (): Record<string, string> => {
  return {
    [CSS_VARIABLE_NAMES.BACKGROUND]: semanticBackground.primary.dark.rgb,
    [CSS_VARIABLE_NAMES.FOREGROUND]: semanticText.primary.dark.rgb,
    [CSS_VARIABLE_NAMES.CARD]: semanticBackground.card.dark.rgb,
    [CSS_VARIABLE_NAMES.CARD_FOREGROUND]: semanticText.primary.dark.rgb,
    [CSS_VARIABLE_NAMES.POPOVER]: semanticBackground.elevated.dark.rgb,
    [CSS_VARIABLE_NAMES.POPOVER_FOREGROUND]: semanticText.primary.dark.rgb,
    [CSS_VARIABLE_NAMES.PRIMARY]: semanticInteraction.primary.default.dark.rgb,
    [CSS_VARIABLE_NAMES.PRIMARY_FOREGROUND]: semanticBackground.primary.dark.rgb,
    [CSS_VARIABLE_NAMES.SECONDARY]: semanticBackground.secondary.dark.rgb,
    [CSS_VARIABLE_NAMES.SECONDARY_FOREGROUND]: semanticText.primary.dark.rgb,
    [CSS_VARIABLE_NAMES.MUTED]: semanticBackground.secondary.dark.rgb,
    [CSS_VARIABLE_NAMES.MUTED_FOREGROUND]: semanticText.muted.dark.rgb,
    [CSS_VARIABLE_NAMES.ACCENT]: semanticBackground.secondary.dark.rgb,
    [CSS_VARIABLE_NAMES.ACCENT_FOREGROUND]: semanticText.primary.dark.rgb,
    [CSS_VARIABLE_NAMES.DESTRUCTIVE]: semanticState.error.icon.dark.rgb,
    [CSS_VARIABLE_NAMES.DESTRUCTIVE_FOREGROUND]: semanticBackground.primary.dark.rgb,
    [CSS_VARIABLE_NAMES.BORDER]: semanticBorder.primary.dark.rgb,
    [CSS_VARIABLE_NAMES.INPUT]: semanticBackground.tertiary.dark.rgb,
    [CSS_VARIABLE_NAMES.RING]: semanticFeedback.focus.ring.dark.rgb,
  }
}

/**
 * 共通CSS変数を生成（モードに依存しない、デザイントークン統合版）
 */
export const generateCommonVariables = (): Record<string, string> => {
  return {
    // Layout（デザイントークンから取得）
    [CSS_VARIABLE_NAMES.RADIUS]: primitiveBorderRadius.base.rem,
  }
}

/**
 * レスポンシブ用CSS変数を生成
 * 現在はCalendar変数を除外したため、空の実装
 */
export const generateResponsiveVariables = (breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop'): Record<string, string> => {
  // Calendar変数は独立したスタイルファイルで管理
  return {}
}

/**
 * CSS変数文字列を生成（CSS形式）
 */
export const formatCSSVariables = (variables: Record<string, string>, indent = '  '): string => {
  return Object.entries(variables)
    .map(([key, value]) => `${indent}${key}: ${value};`)
    .join('\n')
}

/**
 * 完全なCSS変数セットを生成
 */
export const generateAllCSSVariables = (mode: ThemeMode = 'light'): Record<string, string> => {
  const modeVariables = mode === 'dark' 
    ? generateDarkModeVariables() 
    : generateLightModeVariables()
  
  return {
    ...generateCommonVariables(),
    ...modeVariables,
  }
}

/**
 * CSS変数をインラインスタイルとして適用可能な形式に変換
 */
export const toCSSProperties = (variables: Record<string, string>): React.CSSProperties => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    acc[key as any] = value
    return acc
  }, {} as React.CSSProperties)
}

/**
 * Tailwind v4 @theme ディレクティブ用の変数を生成
 */
export const generateTailwindThemeVariables = (): string => {
  const lightVars = generateLightModeVariables()
  const commonVars = generateCommonVariables()
  
  const allVars = { ...commonVars, ...lightVars }
  
  return formatCSSVariables(allVars)
}