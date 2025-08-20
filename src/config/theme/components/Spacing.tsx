/**
 * Spacing コンポーネント
 * @description 型安全なスペーシングシステムを提供
 */

import React from 'react'
import { spacing } from '../theme'
import { SpacingProps } from '../types'
import { cn } from '@/lib/utils'

// HTMLタグのマッピング（デフォルト）
const DEFAULT_TAGS: Record<keyof typeof spacing, keyof JSX.IntrinsicElements> = {
  page: 'div',
  section: 'section',
  content: 'div',
  card: 'div',
  inline: 'div',
}

/**
 * Spacing コンポーネント
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
// 特化したSpacingコンポーネント
// ============================================

/**
 * ページレベルの余白コンポーネント
 * @description ページ全体のパディングを提供
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
 * @description セクション間のマージンを提供
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
 * @description コンテンツブロック間のスペーシングを提供
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
 * @description カード内部のパディングを提供
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
 * @description 横並び要素間のスペーシングを提供
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

// ============================================
// レスポンシブスペーシングユーティリティ
// ============================================

/**
 * レスポンシブなページ余白コンポーネント
 * @description 画面サイズに応じて最適な余白を自動選択
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
 * @description 画面サイズに応じて最適なセクション間隔を自動選択
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
 * 全スペーシングスタイルのプレビュー（開発用）
 */
export function SpacingShowcase() {
  if (process.env.NODE_ENV === 'production') return null
  
  return (
    <div className="space-y-8 p-6 bg-white dark:bg-neutral-950 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Spacing Showcase</h2>
      
      {Object.entries(spacing).map(([category, sizes]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-md font-medium text-neutral-700 dark:text-neutral-300">
            {category} spacing
          </h3>
          
          {typeof sizes === 'object' ? (
            Object.entries(sizes).map(([size, className]) => (
              <div key={`${category}-${size}`} className="space-y-2">
                <code className="text-xs text-neutral-500">
                  {category}.{size}: {className}
                </code>
                <div className="border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden">
                  <Spacing category={category as keyof typeof spacing} size={size}>
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm">
                      {category} - {size} サンプルコンテンツ
                    </div>
                  </Spacing>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-2">
              <code className="text-xs text-neutral-500">
                {category}: {sizes}
              </code>
              <div className="border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden">
                <Spacing category={category as keyof typeof spacing}>
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm">
                    {category} サンプルコンテンツ
                  </div>
                </Spacing>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* 組み合わせ例 */}
      <div className="space-y-4 mt-8">
        <h3 className="text-md font-medium text-neutral-700 dark:text-neutral-300">
          組み合わせ例
        </h3>
        
        <div className="border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden">
          <PageSpacing>
            <SectionSpacing>
              <h2 className="text-xl font-semibold">セクションタイトル</h2>
              <ContentSpacing>
                <CardSpacing>
                  <p>カード内のコンテンツ</p>
                </CardSpacing>
                <CardSpacing>
                  <p>別のカード内のコンテンツ</p>
                </CardSpacing>
              </ContentSpacing>
            </SectionSpacing>
          </PageSpacing>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 高度なユーティリティ
// ============================================

/**
 * 条件付きスペーシングコンポーネント
 * @description 条件に基づいてスペーシングを適用
 */
export function ConditionalSpacing({ 
  condition, 
  category, 
  size = 'default',
  fallbackCategory,
  fallbackSize = 'default',
  children, 
  className,
  ...props 
}: SpacingProps & {
  condition: boolean
  fallbackCategory?: keyof typeof spacing
  fallbackSize?: string
}) {
  const actualCategory = condition ? category : (fallbackCategory || category)
  const actualSize = condition ? size : fallbackSize
  
  return (
    <Spacing 
      category={actualCategory} 
      size={actualSize}
      className={className}
      {...props}
    >
      {children}
    </Spacing>
  )
}

/**
 * 動的スペーシングコンポーネント
 * @description プロパティに基づいてスペーシングを動的に選択
 */
export function DynamicSpacing({ 
  level = 1,
  dense = false,
  children, 
  className,
  ...props 
}: Omit<SpacingProps, 'category' | 'size'> & {
  level?: 1 | 2 | 3 | 4 | 5
  dense?: boolean
}) {
  // レベルに基づいてcategoryとsizeを決定
  const getSpacingConfig = () => {
    if (level === 1) return { category: 'page' as const, size: dense ? 'mobile' : 'default' }
    if (level === 2) return { category: 'section' as const, size: dense ? 'small' : 'default' }
    if (level === 3) return { category: 'content' as const, size: dense ? 'small' : 'default' }
    if (level === 4) return { category: 'card' as const, size: dense ? 'compact' : 'default' }
    return { category: 'inline' as const, size: dense ? 'small' : 'default' }
  }
  
  const { category, size } = getSpacingConfig()
  
  return (
    <Spacing 
      category={category} 
      size={size}
      className={className}
      {...props}
    >
      {children}
    </Spacing>
  )
}