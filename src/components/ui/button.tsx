import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * ボタンの基本スタイル
 * - アクセシビリティ: aria-disabled対応、フォーカスリング
 * - デジタル庁デザインシステム参考
 */
const buttonVariants = cva(
  [
    // 基本レイアウト
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    // トランジション
    'transition-colors',
    // SVGアイコンのデフォルトサイズと制御
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
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
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover',
        destructive: [
          'bg-destructive text-white',
          'hover:bg-destructive-hover active:bg-destructive-hover',
          'focus-visible:outline-destructive',
          'dark:bg-destructive/60',
        ].join(' '),
        outline: [
          'border border-border bg-secondary text-secondary-foreground shadow-xs',
          'hover:bg-state-hover active:bg-state-hover',
        ].join(' '),
        secondary: 'bg-secondary text-secondary-foreground hover:bg-state-hover active:bg-state-hover',
        ghost: 'hover:bg-state-hover active:bg-state-hover',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        // 8pxグリッド準拠: h-8=32px, h-10=40px
        // default: 高さ32px、パディング16px（px-4）
        default: 'h-8 px-4 py-2',
        // sm: 高さ32px、パディング8px（px-2）
        sm: 'h-8 rounded-md px-2',
        // lg: 高さ40px、パディング32px（px-8）
        lg: 'h-10 rounded-md px-8',
        // アイコンボタン: 8pxグリッド準拠の正方形
        // icon: 32x32px、タップターゲット44px確保
        icon: ['size-8', 'relative after:absolute after:inset-0 after:m-auto after:size-11 after:content-[""]'].join(
          ' '
        ),
        // icon-sm: 24x24px、タップターゲット44px確保
        'icon-sm': [
          'size-6',
          'relative after:absolute after:inset-0 after:m-auto after:size-11 after:content-[""]',
        ].join(' '),
        // icon-lg: 40x40px
        'icon-lg': 'size-10',
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
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    // aria-disabled時はクリックを無効化
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (props['aria-disabled']) {
        e.preventDefault()
        return
      }
      onClick?.(e)
    }

    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={asChild ? onClick : handleClick}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
