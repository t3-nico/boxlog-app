/**
 * BoxLog デザインシステム型定義
 * @description デザインシステムで使用する型とインターfaces
 */

import { transition, hover, loading, appear, feedback, patterns as animationPatterns } from './animations'
import { animations } from './animations'
import { borders } from './borders'
import { colors } from './colors'
import { elevation, borders as elevationBorders, patterns as elevationPatterns } from './elevation'
import { icons } from './icons'
import { layout } from './layout'
import { rounded } from './rounded'
import { spacing } from './spacing'
import { link, linkStates, linkPatterns } from './typography'

// 循環依存を避けるため、個別ファイルから直接import
import { typography } from './typography'
import { zIndex } from './z-index'

// ============================================
// 基本型定義
// ============================================

/**
 * タイポグラフィバリアント
 * @description 使用可能なタイポグラフィスタイル
 */
export type TypographyVariant = keyof typeof typography

/**
 * リンクバリアント
 * @description 使用可能なリンクスタイル
 */
export type LinkVariant = keyof typeof link

/**
 * リンクステート
 * @description リンクの状態
 */
export type LinkState = keyof typeof linkStates

/**
 * リンクパターン
 * @description リンクの使用パターン
 */
export type LinkPattern = keyof typeof linkPatterns

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
 * アイコンサイズ
 * @description 利用可能なアイコンサイズ
 */
export type IconSize = keyof typeof icons.size

/**
 * アイコンカラー
 * @description 利用可能なアイコンカラー
 */
export type IconColor = keyof typeof icons.color

/**
 * アイコンアニメーション
 * @description 利用可能なアイコンアニメーション
 */
export type IconAnimation = keyof typeof icons.animation

/**
 * 角丸サイズ
 * @description 利用可能な角丸サイズ
 */
export type RadiusSize = keyof typeof rounded

/**
 * コンポーネント角丸
 * @description コンポーネント別の角丸タイプ
 */
export type ComponentRadiusType = keyof typeof rounded.component

/**
 * BoxLog角丸ルール
 * @description BoxLogの統一角丸ルール
 */
export type BoxLogRadiusRule = keyof typeof rounded.boxlog.functional

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
 * Linkコンポーネントのprops
 */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** リンクバリアント */
  variant?: LinkVariant
  /** リンクの状態 */
  state?: LinkState
  /** 追加のCSSクラス */
  className?: string
  /** 子要素 */
  children: React.ReactNode
  /** 外部リンクかどうか */
  external?: boolean
  /** 無効化状態 */
  disabled?: boolean
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
 * 8pxグリッド基準のスペーシングサイズ
 */
export type SpacingSize8px = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Stackコンポーネントのprops
 */
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 縦方向の間隔 */
  gap?: SpacingSize8px
  /** 子要素 */
  children: React.ReactNode
  /** 追加のCSSクラス */
  className?: string
}

/**
 * Inlineコンポーネントのprops
 */
export interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 横方向の間隔 */
  gap?: SpacingSize8px
  /** 子要素 */
  children: React.ReactNode
  /** 追加のCSSクラス */
  className?: string
}

/**
 * PageContainerコンポーネントのprops
 */
export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 子要素 */
  children: React.ReactNode
  /** 追加のCSSクラス */
  className?: string
}

/**
 * Cardバリアント（8pxグリッド対応）
 */
export type CardVariant = 'compact' | 'default' | 'comfortable'

/**
 * Gridギャップ（8pxグリッド対応）
 */
export type GridGap = 'tight' | 'default' | 'loose'

/**
 * Gridカラム数
 */
export type GridCols = 1 | 2 | 3 | 4 | 6 | 12

/**
 * Z-Index階層
 */
export type ZIndexLevel = keyof typeof zIndex

// ============================================
// アニメーション・トランジション型
// ============================================

/**
 * トランジションバリアント
 * @description 使用可能なトランジション
 */
export type TransitionVariant = keyof typeof transition

/**
 * ホバーエフェクト
 * @description 使用可能なホバーアニメーション
 */
export type HoverVariant = keyof typeof hover

/**
 * ローディングアニメーション
 * @description 使用可能なローディング状態
 */
export type LoadingVariant = keyof typeof loading

/**
 * 表示アニメーション
 * @description 要素の表示アニメーション
 */
export type AppearVariant = keyof typeof appear

/**
 * フィードバックアニメーション
 * @description ユーザーアクションのフィードバック
 */
export type FeedbackVariant = keyof typeof feedback

/**
 * アニメーションパターン
 * @description よく使用されるアニメーションパターン
 */
export type AnimationPattern = keyof typeof animationPatterns

// ============================================
// エレベーション・境界線型
// ============================================

/**
 * エレベーションレベル
 * @description 使用可能なエレベーション
 */
export type ElevationLevel = keyof typeof elevation

/**
 * エレベーションボーダー
 * @description 境界線ベースのエレベーション
 */
export type ElevationBorder = keyof typeof elevationBorders

/**
 * エレベーションパターン
 * @description よく使用されるエレベーションパターン
 */
export type ElevationPattern = keyof typeof elevationPatterns

/**
 * UIタイプ（エレベーション用）
 * @description 永続的UI vs 一時的UI
 */
export type UIType = 'permanent' | 'temporary'

/**
 * コンポーネント状態（エレベーション用）
 * @description コンポーネントの操作状態
 */
export type ComponentState = 'default' | 'hover' | 'active' | 'focus' | 'disabled'

/**
 * フォーム要素の状態
 */
export type FormFieldState = 'default' | 'error' | 'success' | 'disabled'

/**
 * フォーム要素の種類
 */
export type FormFieldType = 'input' | 'textarea' | 'select' | 'checkbox' | 'radio'

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
 * Cardコンポーネントのprops（8pxグリッド対応）
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** カードのバリアント */
  variant?: CardVariant
  /** 追加のCSSクラス */
  className?: string
  /** 子要素 */
  children: React.ReactNode
}

/**
 * FormGroupコンポーネントのprops
 */
export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 子要素 */
  children: React.ReactNode
  /** 追加のCSSクラス */
  className?: string
}

/**
 * Gridコンポーネントのprops（8pxグリッド対応）
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** グリッドのギャップ */
  gap?: GridGap
  /** カラム数 */
  cols?: GridCols
  /** 子要素 */
  children: React.ReactNode
  /** 追加のCSSクラス */
  className?: string
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
  /** ローディングアニメーション */
  loadingAnimation?: LoadingVariant
  /** ホバーエフェクト */
  hoverEffect?: HoverVariant
  /** エレベーション */
  elevation?: ElevationLevel
  /** 追加のCSSクラス */
  className?: string
  /** 子要素 */
  children: React.ReactNode
}

/**
 * Animatedコンポーネントのprops
 */
export interface AnimatedProps extends React.HTMLAttributes<HTMLDivElement> {
  /** トランジション */
  transition?: TransitionVariant
  /** ホバーエフェクト */
  hover?: HoverVariant
  /** 表示アニメーション */
  appear?: AppearVariant
  /** フィードバックアニメーション */
  feedback?: FeedbackVariant
  /** アニメーション遅延（ミリ秒） */
  delay?: number
  /** 子要素 */
  children: React.ReactNode
  /** 追加のCSSクラス */
  className?: string
}

/**
 * Elevatedコンポーネントのprops
 */
export interface ElevatedProps extends React.HTMLAttributes<HTMLDivElement> {
  /** エレベーションレベル */
  level?: ElevationLevel
  /** UIタイプ */
  uiType?: UIType
  /** コンポーネント状態 */
  state?: ComponentState
  /** エレベーションパターン */
  pattern?: ElevationPattern
  /** 子要素 */
  children: React.ReactNode
  /** 追加のCSSクラス */
  className?: string
}

/**
 * Iconコンポーネントのprops
 */
export interface IconProps {
  /** アイコンの名前（Lucide Reactのアイコン名） */
  name: string
  /** アイコンのサイズ */
  size?: IconSize
  /** アイコンの色 */
  color?: IconColor
  /** アニメーション */
  animation?: IconAnimation
  /** 追加のCSSクラス */
  className?: string
  /** アクセシビリティ用のラベル */
  'aria-label'?: string
  /** 装飾目的の場合はtrueに設定 */
  decorative?: boolean
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
  elevation: typeof elevation
  link: typeof link
  transition: typeof transition
  hover: typeof hover
  loading: typeof loading
  appear: typeof appear
  feedback: typeof feedback
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