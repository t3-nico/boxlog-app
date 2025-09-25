/**
 * BoxLog デザインシステム - 統一エクスポート
 * @description すべてのデザインシステムコンポーネントとトークンを一箇所からエクスポート
 */

// ============================================
// コアテーマトークン（直接インポート）
// ============================================

// タイポグラフィシステム
export { body, heading, special, typography, patterns as typographyPatterns } from './typography'

// スペーシングシステム
export { space, spacing, spacingGuide, patterns as spacingPatterns } from './spacing'

// レイアウトシステム
export {
  breakpoints,
  // BoxLog 3カラムレイアウト
  columns,
  componentZIndex,
  flexPatterns,
  gridPatterns,
  layout,
  layoutHelpers,
  layoutPatterns,
  layoutUtils,
  responsiveContainer,
  // Z-Index システム
  zIndex,
  zIndexClasses,
} from './layout'

// 境界線・角丸・影システム
export {
  borders,
  componentRadius,
  // フォーム要素システム
  formStyles,
  formUtils,
  radius,
  rounded,
  specialRadius,
} from './rounded'

// アニメーションシステム（レガシー互換性用）
// animations は下記で詳細エクスポートしているため削除

// 詳細なカラーシステムをエクスポート
export {
  background,
  border,
  button,
  colors,
  ghost,
  primary,
  secondary,
  selection,
  semantic,
  state,
  text,
} from './colors'

// アイコンシステムをエクスポート
export { commonIcons, icon, iconPatterns, icons, iconUtils } from './icons'

// 角丸ユーティリティをエクスポート（roundedは上記で既にエクスポート済み）
export { radiusUtils } from './rounded'

// アニメーションシステムをエクスポート
export {
  animationGuide,
  patterns as animationPatterns,
  animations,
  appear,
  combineAnimations,
  feedback,
  getAnimationDelay,
  getConditionalAnimation,
  getLoadingAnimation,
  getStagedAnimation,
  hover,
  keyframes,
  loading,
  transition,
} from './animations'

// エレベーションシステムをエクスポート
export {
  elevation,
  borders as elevationBorders,
  elevationGuide,
  patterns as elevationPatterns,
  getBorderForState,
  getCardClasses,
  getElevation,
  getInputClasses,
  getTemporaryUIElevation,
} from './elevation'

// エレベーションで定義されたcardパターンもエクスポート
import { animations } from './animations'
import { colors } from './colors'
import { elevation, patterns } from './elevation'
export const { card } = patterns

// ============================================
// 型定義
// ============================================

export type {
  AlertProps,
  AnimatedProps,
  AnimationPattern,
  AppearVariant,
  ButtonProps,
  CardProps,
  CardVariant,
  ColorCategory,
  ColorPath,
  ComponentState,
  ContainerProps,
  DesignToken,
  ElevatedProps,
  ElevationBorder,
  // エレベーション型
  ElevationLevel,
  ElevationPattern,
  FeedbackVariant,
  FormFieldState,
  FormFieldType,
  FormGroupProps,
  GridCols,
  GridGap,
  GridProps,
  HoverVariant,
  InlineProps,
  LayoutType,
  LinkPattern,
  LinkProps,
  LinkState,
  // リンク型
  LinkVariant,
  LoadingVariant,
  NestedKeys,
  PageContainerProps,
  ResponsiveValue,
  SemanticColor,
  SpacingCategory,
  SpacingPath,
  SpacingProps,
  SpacingSize,
  // 8pxグリッド対応型
  SpacingSize8px,
  StackProps,
  // テーマ型
  Theme,
  ThemeValue,
  // アニメーション型
  TransitionVariant,
  // コンポーネントProps型
  TypographyProps,
  // 基本型
  TypographyVariant,
  UIType,
  // その他の型
  ZIndexLevel,
} from './types'

// ============================================
// Typographyデータとユーティリティ（追加分のみ）
// ============================================

export {
  getDefaultTag,
  // patterns は spacingPatterns として既にエクスポート済み
  // type TypographyVariant は上記で既にエクスポート済み
  getTypographyStyle,
  isTypographyVariant,
  // heading, body, special は上記で既にエクスポート済み
  link,
  linkPatterns,
  linkStates,
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
  cardVariants,
  getAvailableSpacingOptions,
  getCardVariant,
  getGridCols,
  getGridGap,
  getInlineGap,
  getPageContainerStyles,
  getSpacingType,
  // type SpacingSize8px, CardVariant, GridGap, GridCols は上記で既にエクスポート済み
  getStackGap,
  gridCols,
  gridGap,
  inlineGap,
  is8pxGrid,
  pageContainerStyles,
  pxToTailwindSpacing,
  // space, spacingGuide, spacing は上記で既にエクスポート済み
  // patterns は spacingPatterns として既にエクスポート済み
  stackGap,
  validateSpacing,
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
  animations,
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
export function getThemeValue<T extends keyof typeof theme>(category: T, key: string): string | undefined {
  const categoryObj = theme[category] as Record<string, string>
  return categoryObj && typeof categoryObj === 'object' ? categoryObj[key] : undefined
}

/**
 * スペーシングクラスを安全に取得する関数
 * @example
 * ```tsx
 * const spacing = getSpacingClass('page', 'default')
 * const cardPadding = getSpacingClass('card', 'comfortable')
 * ```
 */
export function getSpacingClass(category: keyof typeof spacing, size?: string): string {
  const spacingCategory = spacing[category as keyof typeof spacing]

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
  return typography[variant as keyof typeof typography]
}

/**
 * カラークラスを安全に取得する関数
 * @example
 * ```tsx
 * const primaryColor = getColorClass('brand', 'primary')
 * const successBg = getColorClass('semantic', 'success', 'bg')
 * ```
 */
export function getColorClass(category: keyof typeof colors, type: string, variant?: string): string {
  const colorCategory = colors[category as keyof typeof colors]

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
    'shadcn/ui', // 基本UIコンポーネント
    'kiboUI', // 高度な機能
    'Tailwind CSS', // 直接クラス使用
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
