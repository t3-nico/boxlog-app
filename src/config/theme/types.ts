/**
 * BoxLog デザインシステム型定義
 * @description デザインシステムで使用する型とインターfaces
 */

import { typography, spacing, layout, colors, borders, animations } from './theme'

// ============================================
// 基本型定義
// ============================================

/**
 * タイポグラフィバリアント
 * @description 使用可能なタイポグラフィスタイル
 */
export type TypographyVariant = keyof typeof typography

/**
 * スペーシングカテゴリ
 * @description スペーシングの種類
 */
export type SpacingCategory = keyof typeof spacing

/**
 * スペーシングサイズ
 * @description 各カテゴリで使用可能なサイズ
 */
export type SpacingSize<T extends SpacingCategory> = keyof typeof spacing[T]

/**
 * レイアウトタイプ
 * @description レイアウトの種類
 */
export type LayoutType = keyof typeof layout

/**
 * カラーカテゴリ
 * @description カラーの種類
 */
export type ColorCategory = keyof typeof colors

/**
 * セマンティックカラー
 * @description semantic色で使用可能な色
 */
export type SemanticColor = keyof typeof colors.semantic

// ============================================
// コンポーネントProps型
// ============================================

/**
 * Typographyコンポーネントのprops
 */
export interface TypographyProps {
  /** タイポグラフィバリアント */
  variant: TypographyVariant
  /** 追加のCSSクラス */
  className?: string
  /** 子要素 */
  children: React.ReactNode
  /** HTMLタグをオーバーライド */
  as?: keyof JSX.IntrinsicElements
}

/**
 * Spacingコンポーネントのprops
 */
export interface SpacingProps {
  /** スペーシングのカテゴリ */
  category: SpacingCategory
  /** スペーシングのサイズ */
  size?: string
  /** 追加のCSSクラス */
  className?: string
  /** 子要素 */
  children: React.ReactNode
  /** HTMLタグ */
  as?: keyof JSX.IntrinsicElements
}

/**
 * Containerコンポーネントのprops
 */
export interface ContainerProps {
  /** コンテナサイズ */
  size?: keyof typeof layout.container
  /** 追加のCSSクラス */
  className?: string
  /** 子要素 */
  children: React.ReactNode
  /** HTMLタグ */
  as?: keyof JSX.IntrinsicElements
}

/**
 * Gridコンポーネントのprops
 */
export interface GridProps {
  /** グリッドパターン */
  pattern?: keyof typeof layout.grid
  /** カスタムグリッドクラス */
  grid?: string
  /** 追加のCSSクラス */
  className?: string
  /** 子要素 */
  children: React.ReactNode
  /** HTMLタグ */
  as?: keyof JSX.IntrinsicElements
}

/**
 * Cardコンポーネントのprops
 */
export interface CardProps {
  /** カードの内側余白サイズ */
  padding?: keyof typeof spacing.card
  /** 境界線スタイル */
  border?: keyof typeof borders.border
  /** 角丸サイズ */
  radius?: keyof typeof borders.radius
  /** 影のスタイル */
  shadow?: keyof typeof borders.shadow
  /** ホバー効果 */
  hover?: keyof typeof animations.hover
  /** 追加のCSSクラス */
  className?: string
  /** 子要素 */
  children: React.ReactNode
  /** クリックハンドラ */
  onClick?: () => void
}

/**
 * Alertコンポーネントのprops
 */
export interface AlertProps {
  /** アラートの種類 */
  variant: SemanticColor
  /** タイトル */
  title?: string
  /** メッセージ */
  message: string
  /** 閉じるボタンを表示するか */
  dismissible?: boolean
  /** 閉じる時のハンドラ */
  onDismiss?: () => void
  /** 追加のCSSクラス */
  className?: string
}

/**
 * Buttonコンポーネントのprops
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンの種類 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | keyof typeof colors.semantic
  /** ボタンのサイズ */
  size?: 'sm' | 'default' | 'lg'
  /** ローディング状態 */
  loading?: boolean
  /** 追加のCSSクラス */
  className?: string
  /** 子要素 */
  children: React.ReactNode
}

// ============================================
// ユーティリティ型
// ============================================

/**
 * テーマオブジェクトの型
 */
export interface Theme {
  typography: typeof typography
  spacing: typeof spacing
  layout: typeof layout
  colors: typeof colors
  borders: typeof borders
  animations: typeof animations
}

/**
 * レスポンシブ値の型
 * @description mobile, tablet, desktopに対応した値
 */
export interface ResponsiveValue<T> {
  mobile?: T
  tablet?: T
  desktop?: T
  default: T
}

/**
 * デザイントークンの型
 * @description デザイントークンの構造
 */
export interface DesignToken {
  /** トークンの名前 */
  name: string
  /** トークンの値 */
  value: string
  /** トークンの説明 */
  description?: string
  /** 使用例 */
  example?: string
  /** 使用場面 */
  usage?: string
}

// ============================================
// 高度な型ユーティリティ
// ============================================

/**
 * ネストしたオブジェクトのキーを取得
 */
export type NestedKeys<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? `${K & string}.${NestedKeys<T[K]>}`
        : K & string
    }[keyof T]
  : never

/**
 * スペーシングの完全な型パス
 * @example 'page.default' | 'section.large' | 'content.small'
 */
export type SpacingPath = NestedKeys<typeof spacing>

/**
 * カラーの完全な型パス
 * @example 'brand.primary' | 'semantic.success.bg'
 */
export type ColorPath = NestedKeys<typeof colors>

/**
 * 型安全なテーマアクセサ
 */
export type ThemeValue<T extends keyof Theme, K extends keyof Theme[T]> = Theme[T][K]