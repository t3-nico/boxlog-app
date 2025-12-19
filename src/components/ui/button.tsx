import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * ボタンバリアント定義
 *
 * ## バリアント設計（Material Design 3 / Carbon Design System 参考）
 *
 * | variant     | 用途                                         | 例                           |
 * |-------------|----------------------------------------------|------------------------------|
 * | primary     | 主要CTA、画面で最も重要なアクション          | 保存、送信、作成、購入       |
 * | outline     | 副次アクション、primaryとペアで使用          | キャンセル、戻る、詳細       |
 * | ghost       | アイコンボタン、ツールバー、軽量な操作       | 閉じる、メニュー、設定       |
 * | text        | テキストリンク風、インライン操作             | 詳細を見る、もっと見る       |
 * | destructive | 破壊的アクション、確認ダイアログ内           | 削除、解除、退会             |
 *
 * ## サイズ設計（8pxグリッド準拠）
 *
 * | size    | 高さ  | 用途                                         | 例                           |
 * |---------|-------|----------------------------------------------|------------------------------|
 * | sm      | 24px  | コンパクトUI、テーブル内、ドロップダウン     | フィルター、ソート、タグ     |
 * | default | 32px  | 標準的なアクション、ほとんどの場面           | ダイアログボタン、ツールバー |
 * | lg      | 40px  | 主要なCTA、フォーム送信、ランディング        | ログイン、登録、購入         |
 *
 * ## アイコンボタンサイズ
 *
 * | size    | サイズ | 用途                                         |
 * |---------|--------|----------------------------------------------|
 * | icon-sm | 24px   | コンパクトなアイコン操作                     |
 * | icon    | 32px   | 標準的なアイコンボタン                       |
 * | icon-lg | 40px   | 強調されたアイコンボタン                     |
 *
 * ## スペック詳細
 *
 * | size    | 高さ  | パディング | アイコン | フォント |
 * |---------|-------|------------|----------|----------|
 * | sm      | 24px  | 12px       | 14px     | text-xs  |
 * | default | 32px  | 16px       | 16px     | text-sm  |
 * | lg      | 40px  | 24px       | 20px     | text-base|
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
        // 主要CTA - 最も強調されるボタン
        primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-hover',
        // 副次アクション - ボーダー付きの控えめなボタン
        outline: [
          'border border-input bg-background text-foreground shadow-sm',
          'hover:bg-state-hover active:bg-state-hover',
        ].join(' '),
        // アイコンボタン・ツールバー - 背景なし、ホバーで背景出現
        ghost: 'text-foreground hover:bg-state-hover active:bg-state-hover',
        // テキストリンク風 - 下線スタイル
        text: 'text-primary underline-offset-4 hover:underline',
        // 破壊的アクション - 削除、解除など
        destructive: [
          'bg-destructive text-white shadow-sm',
          'hover:bg-destructive-hover active:bg-destructive-hover',
          'focus-visible:outline-destructive',
          'dark:bg-destructive/60',
        ].join(' '),
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
      variant: 'primary',
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
 * // 基本的な使用（primary）
 * <Button>保存</Button>
 * <Button variant="primary">送信</Button>
 *
 * @example
 * // 副次アクション（outline）
 * <Button variant="outline">キャンセル</Button>
 *
 * @example
 * // アイコンボタン（ghost）
 * <Button variant="ghost" size="icon" aria-label="設定を開く">
 *   <Settings className="size-4" />
 * </Button>
 *
 * @example
 * // テキストリンク風（text）
 * <Button variant="text">詳細を見る</Button>
 *
 * @example
 * // 破壊的アクション（destructive）
 * <Button variant="destructive">削除</Button>
 *
 * @example
 * // ローディング状態
 * <Button isLoading>保存中...</Button>
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
