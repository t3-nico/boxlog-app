/**
 * Button コンポーネントの統一スタイル定義
 * shadcn/ui Button コンポーネントの class-variance-authority 形式を保持
 */

import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  // ベーススタイル - フォーカス、状態管理を統一
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9'
      },
      // 特定の状態
      loading: {
        true: 'cursor-wait'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

// Danger Button の特別バリアント
export const dangerButtonVariants = cva(
  // Danger Button の基本クラス - destructiveバリアントをベースに
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
  {
    variants: {
      intent: {
        delete: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500/20',
        warning: 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-500/20'
      }
    },
    defaultVariants: {
      intent: 'delete'
    }
  }
)

// 共通の状態スタイル
export const buttonStates = {
  loading: 'cursor-wait opacity-75',
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  pending: 'cursor-progress',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  error: 'bg-red-600 hover:bg-red-700 text-white'
} as const

// アイコン付きボタンのスタイル
export const iconButtonStyles = {
  base: 'relative flex items-center justify-center',
  iconOnly: '[&>svg]:size-4 [&>svg]:shrink-0',
  iconLeft: 'pl-2 pr-3 [&>svg:first-child]:mr-2 [&>svg:first-child]:size-4',
  iconRight: 'pr-2 pl-3 [&>svg:last-child]:ml-2 [&>svg:last-child]:size-4'
} as const

// ボタングループのスタイル
export const buttonGroupStyles = {
  container: 'inline-flex rounded-md shadow-sm',
  item: 'first:rounded-l-md last:rounded-r-md [&:not(:first-child)]:border-l-0 [&:not(:first-child)]:ml-0',
  vertical: 'flex flex-col first:rounded-t-md first:rounded-b-none last:rounded-b-md last:rounded-t-none [&:not(:first-child)]:border-t-0'
} as const