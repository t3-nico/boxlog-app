/**
 * BoxLog デザインシステム - 統一エクスポート
 * @description すべてのデザインシステムコンポーネントとトークンを一箇所からエクスポート
 */

// ============================================
// コアテーマトークン（直接インポート）
// ============================================

// タイポグラフィシステム
export { heading, body, special, patterns as typographyPatterns, typography } from './typography'

// スペーシングシステム
export { space, patterns as spacingPatterns, spacingGuide, spacing } from './spacing'

// レイアウトシステム  
export { 
  layout, 
  flexPatterns, 
  gridPatterns, 
  responsiveContainer, 
  layoutUtils,
  // BoxLog 3カラムレイアウト
  columns,
  layoutPatterns,
  layoutHelpers,
  // Z-Index システム
  zIndex,
  zIndexClasses,
  componentZIndex,
  breakpoints
} from './layout'

// 境界線・角丸・影システム
export { 
  rounded, 
  borders, 
  radius, 
  componentRadius, 
  specialRadius,
  // フォーム要素システム
  formStyles,
  formUtils
} from './rounded'

// アニメーションシステム（レガシー互換性用）
export { animations } from './animations'

// 詳細なカラーシステムをエクスポート
export { colors } from './colors'

// アイコンシステムをエクスポート
export { icons, icon, iconPatterns, commonIcons, iconUtils } from './icons'

// 角丸システムをエクスポート
export { rounded, radius, componentRadius, specialRadius, radiusUtils } from './rounded'

// アニメーションシステムをエクスポート
export { 
  transition, 
  hover, 
  loading, 
  appear, 
  feedback, 
  patterns as animationPatterns,
  keyframes,
  animationGuide,
  getAnimationDelay,
  getStagedAnimation,
  getLoadingAnimation,
  getConditionalAnimation,
  combineAnimations,
  animations
} from './animations'

// エレベーションシステムをエクスポート
export {
  borders as elevationBorders,
  elevation,
  patterns as elevationPatterns,
  elevationGuide,
  getElevation,
  getBorderForState,
  getCardClasses,
  getInputClasses,
  getTemporaryUIElevation
} from './elevation'

// ============================================
// 型定義
// ============================================

export type {
  // 基本型
  TypographyVariant,
  SpacingCategory,
  SpacingSize,
  LayoutType,
  ColorCategory,
  SemanticColor,
  
  // リンク型
  LinkVariant,
  LinkState,
  LinkPattern,
  
  // アニメーション型
  TransitionVariant,
  HoverVariant,
  LoadingVariant,
  AppearVariant,
  FeedbackVariant,
  AnimationPattern,
  
  // エレベーション型
  ElevationLevel,
  ElevationBorder,
  ElevationPattern,
  UIType,
  ComponentState,
  
  // コンポーネントProps型
  TypographyProps,
  LinkProps,
  SpacingProps,
  ContainerProps,
  GridProps,
  CardProps,
  AlertProps,
  ButtonProps,
  AnimatedProps,
  ElevatedProps,
  
  // テーマ型
  Theme,
  ResponsiveValue,
  DesignToken,
  NestedKeys,
  SpacingPath,
  ColorPath,
  ThemeValue,
  
  // 8pxグリッド対応型
  SpacingSize8px,
  StackProps,
  InlineProps,
  PageContainerProps,
  FormGroupProps,
  CardVariant,
  GridGap,
  GridCols,
  
  // その他の型
  ZIndexLevel,
  FormFieldState,
  FormFieldType
} from './types'

// ============================================
// Typographyデータとユーティリティ
// ============================================

export {
  heading,
  body,
  special,
  link,
  linkStates,
  linkPatterns,
  patterns,
  type TypographyVariant,
  getTypographyStyle,
  isTypographyVariant,
  getDefaultTag
} from './typography'

// ============================================
// Typographyコンポーネント
// ============================================

export {
  Typography,
  H1, H2, H3, H4, H5, H6,
  BodyLarge, Body, BodySmall,
  Label, ErrorText, Caption, Code,
  PageTitle,
  SectionTitle,
  CardTitle,
  TypographyShowcase
} from '@/components/theme/Typography'

// ============================================
// Spacingデータとユーティリティ
// ============================================

export {
  // 8pxグリッド基本値とパターン
  space,
  patterns,
  spacingGuide,
  stackGap,
  inlineGap,
  cardVariants,
  gridGap,
  gridCols,
  pageContainerStyles,
  type SpacingSize8px,
  type CardVariant,
  type GridGap,
  type GridCols,
  getStackGap,
  getInlineGap,
  getCardVariant,
  getGridGap,
  getGridCols,
  getPageContainerStyles,
  is8pxGrid,
  pxToTailwindSpacing,
  getSpacingType,
  validateSpacing,
  getAvailableSpacingOptions
} from './spacing'

// ============================================
// Spacingコンポーネント（8pxグリッド対応）
// ============================================

export {
  // 8pxグリッド推奨コンポーネント
  Stack,
  Inline,
  PageContainer,
  Card,
  FormGroup,
  Grid,
  
  // 従来のSpacingコンポーネント（互換性維持）
  Spacing,
  PageSpacing,
  SectionSpacing,
  ContentSpacing,
  CardSpacing,
  InlineSpacing,
  ResponsivePageSpacing,
  ResponsiveSectionSpacing,
  SpacingShowcase
} from '@/components/theme/Spacing'

// ColorShowcaseはcolors.Showcaseでアクセス可能

// ============================================
// デフォルトテーマオブジェクト
// ============================================

// テーマオブジェクトを各ファイルから直接作成
import { typography } from './typography'
import { spacing } from './spacing' 
import { layout } from './layout'
import { colors } from './colors'
import { icons } from './icons'
import { rounded, borders } from './rounded'
import { animations } from './animations'
import { elevation } from './elevation'

export const theme = {
  typography,
  spacing,
  layout,
  colors,
  icons,
  rounded,
  elevation,
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
  
  console.log('Spacing (8pxグリッド):', [
    'Stack',        // 縦並び
    'Inline',       // 横並び  
    'PageContainer', // ページ余白
    'Card',         // カード
    'FormGroup',    // フォーム
    'Grid'          // グリッド
  ])
  
  console.log('Spacing (従来):', [
    'Spacing',
    'PageSpacing',
    'SectionSpacing',
    'ContentSpacing',
    'CardSpacing',
    'InlineSpacing'
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