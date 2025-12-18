import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * ボタンバリアント定義
 *
 * サイズ設計（8pxグリッド準拠、Carbon Design System参考）:
 * - sm:      24px (h-6)  - コンパクトUI、ツールバー、テーブル内
 * - default: 32px (h-8)  - 標準的なアクション
 * - lg:      40px (h-10) - 主要なCTA、フォーム送信
 *
 * パディング設計:
 * - 左右パディングは高さの50%を基準（視覚的バランス）
 * - sm: 12px (px-3), default: 16px (px-4), lg: 24px (px-6)
 *
 * アイコンサイズ:
 * - sm: 14px (size-3.5), default: 16px (size-4), lg: 20px (size-5)
 */
const buttonVariants = cva(
  [
    // 基本レイアウト
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium',
    // トランジション
    'transition-colors',
    // フォーカス状態（アクセシビリティ）
    'outline-none',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    // 無効状態（aria-disabled推奨、disabled属性も対応）
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    // バリデーションエラー状態
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-hover',
        destructive: [
          'bg-destructive text-white shadow-sm',
          'hover:bg-destructive-hover active:bg-destructive-hover',
          'focus-visible:outline-destructive',
          'dark:bg-destructive/60',
        ].join(' '),
        outline: [
          'border border-input bg-background text-foreground shadow-sm',
          'hover:bg-state-hover active:bg-state-hover',
        ].join(' '),
        secondary: [
          'bg-secondary text-secondary-foreground shadow-sm',
          'hover:bg-state-hover active:bg-state-hover',
        ].join(' '),
        ghost: 'text-foreground hover:bg-state-hover active:bg-state-hover',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        // sm: 24px高さ、12pxパディング、14pxアイコン
        sm: [
          'h-6 px-3 text-xs',
          "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:shrink-0",
        ].join(' '),
        // default: 32px高さ、16pxパディング、16pxアイコン
        default: [
          'h-8 px-4 text-sm',
          "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        ].join(' '),
        // lg: 40px高さ、24pxパディング、20pxアイコン
        lg: [
          'h-10 px-6 text-base',
          "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0",
        ].join(' '),
        // アイコンボタン: 8pxグリッド準拠の正方形
        // icon-sm: 24x24px、タップターゲット44px確保
        'icon-sm': [
          'size-6',
          'relative after:absolute after:inset-0 after:m-auto after:size-11 after:content-[""]',
          "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:shrink-0",
        ].join(' '),
        // icon: 32x32px、タップターゲット44px確保
        icon: [
          'size-8',
          'relative after:absolute after:inset-0 after:m-auto after:size-11 after:content-[""]',
          "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        ].join(' '),
        // icon-lg: 40x40px
        'icon-lg': [
          'size-10',
          "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0",
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** 子要素にスタイルを委譲する（Linkなどで使用） */
  asChild?: boolean
  /** ローディング状態 */
  isLoading?: boolean
  /** ローディング中に表示するテキスト（省略時は children を表示） */
  loadingText?: string
}

/**
 * ボタンコンポーネント
 *
 * @example
 * // 基本的な使用
 * <Button>ラベル</Button>
 *
 * @example
 * // アイコン付きボタン
 * <Button>
 *   <Plus className="size-4" />
 *   新規作成
 * </Button>
 *
 * @example
 * // アイコンのみのボタン（アクセシビリティ対応）
 * <Button variant="ghost" size="icon" aria-label="設定を開く">
 *   <Settings className="size-4" />
 * </Button>
 *
 * @example
 * // 無効化ボタン（aria-disabled推奨）
 * <Button aria-disabled={true}>送信</Button>
 *
 * @example
 * // ローディング状態
 * <Button isLoading>保存中...</Button>
 * <Button isLoading loadingText="送信中...">送信</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      onClick,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    // aria-disabled または isLoading 時はクリックを無効化
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (props['aria-disabled'] || isLoading) {
        e.preventDefault()
        return
      }
      onClick?.(e)
    }

    // ローディング中のコンテンツ
    const content = isLoading ? (
      <>
        <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        {loadingText ?? children}
      </>
    ) : (
      children
    )

    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={asChild ? onClick : handleClick}
        disabled={isLoading || disabled}
        aria-busy={isLoading || undefined}
        ref={ref}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
