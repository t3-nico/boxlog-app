/**
 * BoxLog タイポグラフィコンポーネント
 * シンプル・実用的・迷わない
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { heading, body, special, patterns } from '@/config/theme/typography'

// ============================================
// 型定義
// ============================================

type HeadingVariant = keyof typeof heading
type BodyVariant = keyof typeof body
type SpecialVariant = keyof typeof special

export type TypographyVariant = 
  | `heading.${HeadingVariant}`
  | `body.${BodyVariant}`
  | `special.${SpecialVariant}`

interface TypographyProps {
  variant: TypographyVariant
  className?: string
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
}

// HTMLタグのマッピング
const DEFAULT_TAGS: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
  'heading.h1': 'h1',
  'heading.h2': 'h2',
  'heading.h3': 'h3',
  'heading.h4': 'h4',
  'heading.h5': 'h5',
  'heading.h6': 'h6',
  'body.large': 'p',
  'body.DEFAULT': 'p',
  'body.small': 'p',
  'special.label': 'label',
  'special.error': 'span',
  'special.caption': 'span',
  'special.code': 'code',
}

// スタイル取得関数
function getTypographyStyle(variant: TypographyVariant): string {
  const [category, type] = variant.split('.') as [string, string]
  
  switch (category) {
    case 'heading':
      return heading[type as HeadingVariant]
    case 'body':
      return body[type as BodyVariant]
    case 'special':
      return special[type as SpecialVariant]
    default:
      return body.DEFAULT
  }
}

// ============================================
// メインTypographyコンポーネント
// ============================================

/**
 * Typography コンポーネント
 * 
 * @example
 * ```tsx
 * <Typography variant="heading.h1">ページタイトル</Typography>
 * <Typography variant="body.DEFAULT">本文テキスト</Typography>
 * <Typography variant="special.caption" as="time">2024年1月1日</Typography>
 * ```
 */
export function Typography({ 
  variant, 
  className, 
  children, 
  as,
  ...props 
}: TypographyProps & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  const Component = as || DEFAULT_TAGS[variant]
  const style = getTypographyStyle(variant)
  
  return React.createElement(
    Component,
    {
      className: cn(style, className),
      ...props,
    },
    children
  )
}

// ============================================
// 便利な短縮コンポーネント
// ============================================

/**
 * 見出しコンポーネント群
 */
export function H1({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading.h1" className={className} {...props}>{children}</Typography>
}

export function H2({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading.h2" className={className} {...props}>{children}</Typography>
}

export function H3({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading.h3" className={className} {...props}>{children}</Typography>
}

export function H4({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading.h4" className={className} {...props}>{children}</Typography>
}

export function H5({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading.h5" className={className} {...props}>{children}</Typography>
}

export function H6({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="heading.h6" className={className} {...props}>{children}</Typography>
}

/**
 * 本文コンポーネント群
 */
export function BodyLarge({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body.large" className={className} {...props}>{children}</Typography>
}

export function Body({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body.DEFAULT" className={className} {...props}>{children}</Typography>
}

export function BodySmall({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body.small" className={className} {...props}>{children}</Typography>
}

/**
 * 特殊用途コンポーネント群
 */
export function Label({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="special.label" className={className} {...props}>{children}</Typography>
}

export function ErrorText({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="special.error" className={className} {...props}>{children}</Typography>
}

export function Caption({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="special.caption" className={className} {...props}>{children}</Typography>
}

export function Code({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="special.code" className={className} {...props}>{children}</Typography>
}

// ============================================
// 特化したページ構造コンポーネント
// ============================================

/**
 * ページタイトル専用コンポーネント
 */
export function PageTitle({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <H1 className={className} {...props}>{children}</H1>
}

/**
 * セクションタイトル専用コンポーネント
 */
export function SectionTitle({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <H2 className={className} {...props}>{children}</H2>
}

/**
 * カードタイトル専用コンポーネント
 */
export function CardTitle({ children, className, ...props }: Omit<TypographyProps, 'variant'>) {
  return <H4 className={className} {...props}>{children}</H4>
}

// ============================================
// デバッグ用ユーティリティ
// ============================================

/**
 * 全タイポグラフィスタイルのプレビュー（開発用）
 */
export function TypographyShowcase() {
  if (process.env.NODE_ENV === 'production') return null
  
  const variants: TypographyVariant[] = [
    'heading.h1', 'heading.h2', 'heading.h3', 'heading.h4', 'heading.h5', 'heading.h6',
    'body.large', 'body.DEFAULT', 'body.small',
    'special.label', 'special.error', 'special.caption', 'special.code'
  ]
  
  const examples: Record<TypographyVariant, string> = {
    'heading.h1': 'ページタイトル - BoxLog Dashboard',
    'heading.h2': 'セクションタイトル - 今日のタスク',
    'heading.h3': 'サブセクションタイトル - 完了済みアイテム',
    'heading.h4': 'カードタイトル - プロジェクト会議',
    'heading.h5': 'グループラベル - 基本設定',
    'heading.h6': '最小見出し - ヘルプテキスト',
    'body.large': '大きな本文 - 重要な説明文やリード文に使用します。',
    'body.DEFAULT': '通常の本文 - これは一般的な段落テキストです。読みやすく、適切な行間を持っています。',
    'body.small': '小さな本文 - 補助的な情報や注釈に使用します。',
    'special.label': 'フォームラベル',
    'special.error': 'エラーメッセージ - 入力内容に問題があります',
    'special.caption': '3分前 · 更新日時',
    'special.code': 'npm install boxlog',
  }
  
  return (
    <div className="space-y-6 p-6 bg-white dark:bg-neutral-950 border rounded-lg">
      <H2>Typography Showcase</H2>
      
      <div className="space-y-6">
        {/* 見出し */}
        <section>
          <H3>見出し（6段階）</H3>
          <div className="space-y-3">
            {variants.slice(0, 6).map((variant) => (
              <div key={variant} className="space-y-1">
                <Code className="text-xs">{variant}</Code>
                <Typography variant={variant}>
                  {examples[variant]}
                </Typography>
              </div>
            ))}
          </div>
        </section>
        
        {/* 本文 */}
        <section>
          <H3>本文（3サイズ）</H3>
          <div className="space-y-3">
            {variants.slice(6, 9).map((variant) => (
              <div key={variant} className="space-y-1">
                <Code className="text-xs">{variant}</Code>
                <Typography variant={variant}>
                  {examples[variant]}
                </Typography>
              </div>
            ))}
          </div>
        </section>
        
        {/* 特殊用途 */}
        <section>
          <H3>特殊用途（最小限）</H3>
          <div className="space-y-3">
            {variants.slice(9).map((variant) => (
              <div key={variant} className="space-y-1">
                <Code className="text-xs">{variant}</Code>
                <Typography variant={variant}>
                  {examples[variant]}
                </Typography>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}