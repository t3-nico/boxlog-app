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
// animations は下記で詳細エクスポートしているため削除

// 詳細なカラーシステムをエクスポート
export { colors, primary, secondary, selection, text, background, border, semantic, state, button, ghost } from './colors'

// アイコンシステムをエクスポート
export { icons, icon, iconPatterns, commonIcons, iconUtils } from './icons'

// 角丸ユーティリティをエクスポート（roundedは上記で既にエクスポート済み）
export { radiusUtils } from './rounded'

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

// エレベーションで定義されたcardパターンもエクスポート
import { animations } from './animations'
import { colors } from './colors'
import { patterns , elevation } from './elevation'
export const {card} = patterns

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
// Typographyデータとユーティリティ（追加分のみ）
// ============================================

export {
  // heading, body, special は上記で既にエクスポート済み
  link,
  linkStates,
  linkPatterns,
  // patterns は spacingPatterns として既にエクスポート済み
  // type TypographyVariant は上記で既にエクスポート済み
  getTypographyStyle,
  isTypographyVariant,
  getDefaultTag
} from './typography'

// ============================================
// Typographyコンポーネント
// ============================================

// Note: Typography コンポーネントは削除済み
// 必要な場合は shadcn/ui や kiboUI を使用してください

// ============================================
// Spacingデータとユーティリティ（追加分のみ）
// ============================================

export {
  // space, spacingGuide, spacing は上記で既にエクスポート済み
  // patterns は spacingPatterns として既にエクスポート済み
  stackGap,
  inlineGap,
  cardVariants,
  gridGap,
  gridCols,
  pageContainerStyles,
  // type SpacingSize8px, CardVariant, GridGap, GridCols は上記で既にエクスポート済み
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

// Note: Spacing コンポーネントは削除済み
// 必要な場合は Tailwind CSS クラスを直接使用してください

// ColorShowcaseはcolors.Showcaseでアクセス可能

// ============================================
// デフォルトテーマオブジェクト
// ============================================

// テーマオブジェクトを各ファイルから直接作成
import { icons } from './icons'
import { layout } from './layout'
import { rounded } from './rounded'
import { spacing } from './spacing' 
import { typography } from './typography'

export const theme = {
  typography,
  spacing,
  layout,
  colors,
  icons,
  rounded,
  elevation,
  borders: rounded.borders,
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
  
  console.log('Typography tokens:', Object.keys(typography))
  
  console.log('Spacing tokens:', Object.keys(spacing))
  
  console.log('Available UI libraries:', [
    'shadcn/ui',    // 基本UIコンポーネント
    'kiboUI',       // 高度な機能
    'Tailwind CSS'  // 直接クラス使用
  ])
  
  console.groupEnd()
}

// ============================================
// 型ガード関数
// ============================================

// 型ガード関数は各ファイルから個別エクスポートされているため、ここでは削除

// ============================================
// エクスポートされたオブジェクトの型
// ============================================

export type { theme as ThemeType }

// デフォルトエクスポート
export default theme