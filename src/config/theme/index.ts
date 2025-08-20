/**
 * BoxLog デザインシステム - 統一エクスポート
 * @description すべてのデザインシステムコンポーネントとトークンを一箇所からエクスポート
 */

// ============================================
// コアテーマトークン
// ============================================

export {
  typography,
  spacing,
  layout,
  borders,
  animations,
  examples
} from './theme'

// 詳細なカラーシステムをエクスポート
export { colors } from './colors'

// ============================================
// 型定義
// ============================================

export type {
  TypographyVariant,
  SpacingCategory,
  SpacingSize,
  LayoutType,
  ColorCategory,
  SemanticColor,
  TypographyProps,
  SpacingProps,
  ContainerProps,
  GridProps,
  CardProps,
  AlertProps,
  ButtonProps,
  Theme,
  ResponsiveValue,
  DesignToken,
  NestedKeys,
  SpacingPath,
  ColorPath,
  ThemeValue
} from './types'

// ============================================
// Typographyコンポーネント
// ============================================

export {
  Typography,
  PageTitle,
  SectionTitle,
  CardTitle,
  Body,
  Caption,
  ErrorText,
  TypographyShowcase
} from './components/Typography'

// ============================================
// Spacingコンポーネント
// ============================================

export {
  Spacing,
  PageSpacing,
  SectionSpacing,
  ContentSpacing,
  CardSpacing,
  InlineSpacing,
  ResponsivePageSpacing,
  ResponsiveSectionSpacing,
  SpacingShowcase,
  ConditionalSpacing,
  DynamicSpacing
} from './components/Spacing'

// ColorShowcaseはcolors.Showcaseでアクセス可能

// ============================================
// デフォルトテーマオブジェクト
// ============================================

import { 
  typography, 
  spacing, 
  layout, 
  colors, 
  borders, 
  animations 
} from './theme'

export const theme = {
  typography,
  spacing,
  layout,
  colors,
  borders,
  animations
} as const

// ============================================
// ユーティリティ関数
// ============================================

/**
 * ネストしたテーマ値にアクセスするヘルパー関数
 * @example
 * ```tsx
 * const pageSpacing = getThemeValue('spacing', 'page')
 * const primaryColor = getThemeValue('colors', 'brand')
 * ```
 */
export function getThemeValue<T extends keyof typeof theme>(
  category: T,
  key: keyof typeof theme[T]
): typeof theme[T][keyof typeof theme[T]] {
  return theme[category][key]
}

/**
 * スペーシングクラスを安全に取得する関数
 * @example
 * ```tsx
 * const spacing = getSpacingClass('page', 'default')
 * const cardPadding = getSpacingClass('card', 'comfortable')
 * ```
 */
export function getSpacingClass(
  category: keyof typeof spacing,
  size?: string
): string {
  const spacingCategory = spacing[category]
  
  if (typeof spacingCategory === 'string') {
    return spacingCategory
  }
  
  if (typeof spacingCategory === 'object' && size) {
    return spacingCategory[size as keyof typeof spacingCategory] || spacingCategory.default
  }
  
  if (typeof spacingCategory === 'object') {
    return spacingCategory.default
  }
  
  return ''
}

/**
 * タイポグラフィクラスを取得する関数
 * @example
 * ```tsx
 * const headingClass = getTypographyClass('h1')
 * const bodyClass = getTypographyClass('body')
 * ```
 */
export function getTypographyClass(variant: keyof typeof typography): string {
  return typography[variant]
}

/**
 * カラークラスを安全に取得する関数
 * @example
 * ```tsx
 * const primaryColor = getColorClass('brand', 'primary')
 * const successBg = getColorClass('semantic', 'success', 'bg')
 * ```
 */
export function getColorClass(
  category: keyof typeof colors,
  type: string,
  variant?: string
): string {
  const colorCategory = colors[category]
  
  if (typeof colorCategory === 'object') {
    const colorType = colorCategory[type as keyof typeof colorCategory]
    
    if (typeof colorType === 'string') {
      return colorType
    }
    
    if (typeof colorType === 'object' && variant) {
      return colorType[variant as keyof typeof colorType] || ''
    }
  }
  
  return ''
}

// ============================================
// 開発用ユーティリティ
// ============================================

/**
 * 全デザインシステムの概要を表示（開発用）
 */
export function showDesignSystemOverview() {
  if (process.env.NODE_ENV === 'production') return
  
  console.group('🎨 BoxLog Design System Overview')
  
  console.log('📝 Typography variants:', Object.keys(typography))
  console.log('📏 Spacing categories:', Object.keys(spacing))
  console.log('🎨 Color categories:', Object.keys(colors))
  console.log('🏗️ Layout options:', Object.keys(layout))
  console.log('🎭 Border options:', Object.keys(borders))
  console.log('✨ Animation options:', Object.keys(animations))
  
  console.groupEnd()
}

/**
 * 使用可能なコンポーネント一覧を表示（開発用）
 */
export function showAvailableComponents() {
  if (process.env.NODE_ENV === 'production') return
  
  console.group('🧩 Available Components')
  
  console.log('Typography:', [
    'Typography',
    'PageTitle',
    'SectionTitle', 
    'CardTitle',
    'Body',
    'Caption',
    'ErrorText'
  ])
  
  console.log('Spacing:', [
    'Spacing',
    'PageSpacing',
    'SectionSpacing',
    'ContentSpacing',
    'CardSpacing',
    'InlineSpacing',
    'ResponsivePageSpacing',
    'ResponsiveSectionSpacing'
  ])
  
  console.groupEnd()
}

// ============================================
// 型ガード関数
// ============================================

/**
 * タイポグラフィバリアントかどうかを判定
 */
export function isTypographyVariant(value: string): value is keyof typeof typography {
  return value in typography
}

/**
 * スペーシングカテゴリかどうかを判定
 */
export function isSpacingCategory(value: string): value is keyof typeof spacing {
  return value in spacing
}

/**
 * カラーカテゴリかどうかを判定
 */
export function isColorCategory(value: string): value is keyof typeof colors {
  return value in colors
}

// ============================================
// エクスポートされたオブジェクトの型
// ============================================

export type { theme as ThemeType }

// デフォルトエクスポート
export default theme