/**
 * BoxLog スペーシングコンポーネント
 * @description 8pxグリッド準拠・型安全なスペーシングシステムを提供
 */

import React from 'react'
import { spacing } from '@/config/theme/theme'
import { SpacingProps } from '@/config/theme/types'
import { cn } from '@/lib/utils'

// ============================================
// レガシースペーシングコンポーネント（互換性維持）
// ============================================

// HTMLタグのマッピング（デフォルト）
const DEFAULT_TAGS: Record<keyof typeof spacing, keyof JSX.IntrinsicElements> = {
  page: 'div',
  section: 'section',
  content: 'div',
  card: 'div',
  inline: 'div',
}

/**
 * Spacing コンポーネント（レガシー互換性維持）
 * @deprecated 新規開発では8pxグリッドコンポーネント（Stack, Inline, PageContainer等）を使用してください
 * 
 * @example
 * ```tsx
 * <Spacing category="page" size="default">
 *   <h1>ページコンテンツ</h1>
 * </Spacing>
 * 
 * <Spacing category="card" size="comfortable">
 *   <p>カード内容</p>
 * </Spacing>
 * ```
 */
export function Spacing({ 
  category, 
  size = 'default',
  className, 
  children, 
  as,
  ...props 
}: SpacingProps & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  const Component = as || DEFAULT_TAGS[category]
  
  // 指定されたcategoryのスペーシングオブジェクトを取得
  const spacingCategory = spacing[category]
  
  // サイズが指定されている場合は該当するクラスを取得、なければdefaultを使用
  const spacingClass = typeof spacingCategory === 'object' 
    ? spacingCategory[size as keyof typeof spacingCategory] || spacingCategory.default
    : spacingCategory
  
  return React.createElement(
    Component,
    {
      className: cn(spacingClass, className),
      ...props,
    },
    children
  )
}

// ============================================
// 8pxグリッド基準のコンポーネント（推奨）
// ============================================

/**
 * 8pxグリッド基準のスタックコンポーネント
 * @description 縦に並ぶ要素の間隔を制御
 */
export function Stack({ 
  gap = 'md', 
  children, 
  className, 
  ...props 
}: { 
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const gapClasses = {
    xs: 'space-y-2',   // 8px
    sm: 'space-y-4',   // 16px ✅
    md: 'space-y-6',   // 24px ✅
    lg: 'space-y-8',   // 32px ✅
    xl: 'space-y-12',  // 48px ✅
  }

  return (
    <div className={cn(gapClasses[gap], className)} {...props}>
      {children}
    </div>
  )
}

/**
 * 8pxグリッド基準のインラインコンポーネント
 * @description 横に並ぶ要素の間隔を制御
 */
export function Inline({ 
  gap = 'md', 
  children, 
  className, 
  ...props 
}: { 
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const gapClasses = {
    xs: 'flex gap-2',   // 8px
    sm: 'flex gap-4',   // 16px ✅
    md: 'flex gap-6',   // 24px ✅
    lg: 'flex gap-8',   // 32px ✅
    xl: 'flex gap-12',  // 48px ✅
  }

  return (
    <div className={cn(gapClasses[gap], className)} {...props}>
      {children}
    </div>
  )
}

/**
 * レスポンシブページ余白コンポーネント
 * @description 画面サイズに応じた最適なページ余白
 */
export function PageContainer({ 
  children, 
  className,
  ...props 
}: { 
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        'px-4 py-8',        // mobile: 16px × 32px
        'md:px-6 md:py-10', // tablet: 24px × 40px
        'lg:px-8 lg:py-12', // desktop: 32px × 48px ✅
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * カードレイアウトコンポーネント
 * @description 8pxグリッドに基づく標準的なカードレイアウト
 */
export function Card({ 
  children, 
  className,
  variant = 'default',
  ...props 
}: { 
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'compact' | 'comfortable'
} & React.HTMLAttributes<HTMLDivElement>) {
  const variantClasses = {
    compact: 'p-4',        // 16px
    default: 'p-6',        // 24px ✅
    comfortable: 'p-8',    // 32px
  }

  return (
    <div 
      className={cn(
        variantClasses[variant],
        'rounded-lg border bg-white dark:bg-neutral-950',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * フォームグループコンポーネント
 * @description フォーム要素の統一的なレイアウト
 */
export function FormGroup({ 
  children, 
  className,
  ...props 
}: { 
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-6', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * グリッドレイアウトコンポーネント
 * @description 8pxグリッドに基づくグリッドシステム
 */
export function Grid({ 
  children, 
  className,
  gap = 'default',
  cols = 1,
  ...props 
}: { 
  children: React.ReactNode
  className?: string
  gap?: 'tight' | 'default' | 'loose'
  cols?: 1 | 2 | 3 | 4 | 6 | 12
} & React.HTMLAttributes<HTMLDivElement>) {
  const gapClasses = {
    tight: 'gap-2',      // 8px
    default: 'gap-4',    // 16px ✅
    loose: 'gap-6',      // 24px
  }

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  }

  return (
    <div 
      className={cn(
        'grid',
        gapClasses[gap],
        colClasses[cols],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================
// レガシーコンポーネント（互換性維持）
// ============================================

/**
 * ページレベルの余白コンポーネント
 * @deprecated PageContainer コンポーネントを使用してください
 */
export function PageSpacing({ children, className, size = 'default', ...props }: Omit<SpacingProps, 'category'>) {
  return (
    <Spacing 
      category="page" 
      size={size}
      className={className}
      {...props}
    >
      {children}
    </Spacing>
  )
}

/**
 * セクション間隔コンポーネント
 * @deprecated Stack コンポーネント（gap="lg"）を使用してください
 */
export function SectionSpacing({ children, className, size = 'default', ...props }: Omit<SpacingProps, 'category'>) {
  return (
    <Spacing 
      category="section" 
      size={size}
      className={className}
      as="section"
      {...props}
    >
      {children}
    </Spacing>
  )
}

/**
 * コンテンツ間隔コンポーネント
 * @deprecated Stack コンポーネント（gap="sm"）を使用してください
 */
export function ContentSpacing({ children, className, size = 'default', ...props }: Omit<SpacingProps, 'category'>) {
  return (
    <Spacing 
      category="content" 
      size={size}
      className={className}
      {...props}
    >
      {children}
    </Spacing>
  )
}

/**
 * カード内余白コンポーネント
 * @deprecated Card コンポーネントを使用してください
 */
export function CardSpacing({ children, className, size = 'default', ...props }: Omit<SpacingProps, 'category'>) {
  return (
    <Spacing 
      category="card" 
      size={size}
      className={className}
      {...props}
    >
      {children}
    </Spacing>
  )
}

/**
 * インライン間隔コンポーネント
 * @deprecated Inline コンポーネントを使用してください
 */
export function InlineSpacing({ children, className, size = 'default', ...props }: Omit<SpacingProps, 'category'>) {
  return (
    <Spacing 
      category="inline" 
      size={size}
      className={className}
      {...props}
    >
      {children}
    </Spacing>
  )
}

/**
 * レスポンシブなページ余白コンポーネント
 * @deprecated PageContainer コンポーネントを使用してください
 */
export function ResponsivePageSpacing({ children, className, ...props }: Omit<SpacingProps, 'category' | 'size'>) {
  return (
    <PageSpacing 
      size="default" // theme.tsのpage.defaultがレスポンシブ対応済み
      className={className}
      {...props}
    >
      {children}
    </PageSpacing>
  )
}

/**
 * レスポンシブなセクション間隔コンポーネント
 * @deprecated Stack コンポーネント（gap="lg"）を使用してください
 */
export function ResponsiveSectionSpacing({ children, className, ...props }: Omit<SpacingProps, 'category' | 'size'>) {
  return (
    <SectionSpacing 
      size="default" // theme.tsのsection.defaultがレスポンシブ対応済み
      className={className}
      {...props}
    >
      {children}
    </SectionSpacing>
  )
}

// ============================================
// デバッグ用ユーティリティ
// ============================================

/**
 * 8pxグリッドスペーシングのプレビュー（開発用）
 */
export function SpacingShowcase() {
  if (process.env.NODE_ENV === 'production') return null
  
  const space = {
    0: 'p-0',           // 0px
    1: 'p-1',           // 4px  ⚠️ 例外的使用
    2: 'p-2',           // 8px  ✅ 最小単位
    3: 'p-3',           // 12px
    4: 'p-4',           // 16px ✅ 基本
    5: 'p-5',           // 20px
    6: 'p-6',           // 24px ✅ 標準
    8: 'p-8',           // 32px ✅ 大きめ
    10: 'p-10',         // 40px ✅ セクション
    12: 'p-12',         // 48px ✅ 大セクション
    16: 'p-16',         // 64px ✅ 最大
  } as const

  const patterns = {
    // カードレイアウト
    card: {
      wrapper: 'p-6 rounded-lg',           // 24px余白
      header: 'mb-4',                      // 下16px
      content: 'space-y-4',               // 要素間16px
      footer: 'mt-6 pt-4 border-t',       // 上24px + パディング16px
    },
    
    // フォームレイアウト
    form: {
      group: 'mb-6',                      // グループ間24px
      label: 'mb-2',                      // ラベル下8px
      input: 'mb-1',                      // インプット下4px
      helper: 'mt-1',                     // ヘルパー上4px
      error: 'mt-2',                      // エラー上8px
    },
    
    // リストレイアウト
    list: {
      container: 'space-y-2',             // アイテム間8px
      item: 'p-4',                        // アイテム内16px
      compact: 'space-y-1 [&>*]:p-2',    // コンパクト版
    },
    
    // グリッドレイアウト
    grid: {
      default: 'grid gap-4',              // 16pxギャップ
      cards: 'grid gap-6',                // 24pxギャップ
      tight: 'grid gap-2',                // 8pxギャップ
    },
  } as const
  
  return (
    <div className="space-y-8 p-6 bg-white dark:bg-neutral-950 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">BoxLog Spacing System</h2>
      
      {/* 8pxグリッド基本値 */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-neutral-700 dark:text-neutral-300">
          8pxグリッド基本値
        </h3>
        {Object.entries(space).map(([key, className]) => (
          <div key={key} className="flex items-center space-x-4">
            <code className="text-xs text-neutral-500 w-20">
              space.{key}
            </code>
            <code className="text-xs text-neutral-400 w-16">
              {className}
            </code>
            <div className="border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden">
              <div className={cn(className, 'bg-blue-100 dark:bg-blue-900/30')}>
                <div className="bg-blue-500 text-white text-xs px-1">content</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 実用コンポーネント */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-neutral-700 dark:text-neutral-300">
          実用コンポーネント
        </h3>
        
        {/* Stack例 */}
        <div className="border border-neutral-200 dark:border-neutral-700 rounded p-4">
          <h4 className="text-sm font-medium mb-2">Stack (縦並び)</h4>
          <Stack gap="sm">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-xs">要素1</div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-xs">要素2</div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-xs">要素3</div>
          </Stack>
        </div>

        {/* Inline例 */}
        <div className="border border-neutral-200 dark:border-neutral-700 rounded p-4">
          <h4 className="text-sm font-medium mb-2">Inline (横並び)</h4>
          <Inline gap="sm">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded text-xs">ボタン1</div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded text-xs">ボタン2</div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded text-xs">ボタン3</div>
          </Inline>
        </div>

        {/* パターン例 */}
        <div className="border border-neutral-200 dark:border-neutral-700 rounded p-4">
          <h4 className="text-sm font-medium mb-2">カードパターン</h4>
          <div className={cn(patterns.card.wrapper, 'border')}>
            <div className={patterns.card.header}>
              <h5 className="font-medium">カードタイトル</h5>
            </div>
            <div className={patterns.card.content}>
              <p className="text-sm">コンテンツ1</p>
              <p className="text-sm">コンテンツ2</p>
            </div>
            <div className={patterns.card.footer}>
              <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded">アクション</button>
            </div>
          </div>
        </div>
      </div>

      {/* PageContainer例 */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-neutral-700 dark:text-neutral-300">
          レスポンシブレイアウト
        </h3>
        <div className="border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden">
          <PageContainer className="bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="text-sm font-medium">PageContainer</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              レスポンシブな余白（mobile: 16px×32px, tablet: 24px×40px, desktop: 32px×48px）
            </p>
          </PageContainer>
        </div>
      </div>
    </div>
  )
}