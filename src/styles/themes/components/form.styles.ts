/**
 * Form コンポーネントの統一スタイル定義
 * Input, Select, Checkbox, Switch, Textarea等のフォーム要素を統合管理
 */

import { cva } from 'class-variance-authority'

// 共通のフォーカス・エラー状態定義
export const formElementStates = {
  focus: 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
  error: 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  disabled: 'disabled:cursor-not-allowed disabled:opacity-50',
  common: 'outline-none transition-[color,box-shadow,border-color]'
} as const

// Input フィールドのスタイル
export const inputVariants = cva(
  'flex min-w-0 w-full rounded-md border px-3 py-2 bg-background border-input text-foreground shadow-xs text-base md:text-sm placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow,border-color] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground file:inline-flex file:h-8',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 py-1 text-sm',
        default: 'h-10 px-3 py-2',
        lg: 'h-12 px-4 py-3 text-base'
      },
      variant: {
        default: '',
        ghost: 'border-transparent bg-transparent shadow-none',
        filled: 'bg-input/30 dark:bg-input/50 border-input'
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default'
    }
  }
)

// Select フィールドのスタイル
export const selectVariants = cva(
  'flex items-center justify-between gap-2 rounded-md border px-3 py-2 bg-transparent border-input text-sm whitespace-nowrap shadow-xs data-[placeholder]:text-muted-foreground [&_svg:not([class*="text-"])]:text-muted-foreground outline-none transition-[color,box-shadow,border-color] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      size: {
        sm: 'h-8 text-sm',
        default: 'h-10',
        lg: 'h-12 text-base'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

// Checkbox のスタイル
export const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-white dark:data-[state=checked]:text-white',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

// Radio のスタイル
export const radioVariants = cva(
  'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

// Switch のスタイル
export const switchVariants = cva(
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input'
)

// Textarea のスタイル
export const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border px-3 py-2 bg-background border-input text-foreground shadow-xs text-sm resize-vertical placeholder:text-muted-foreground outline-none transition-[color,box-shadow,border-color] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'min-h-[60px] px-2 py-1 text-sm',
        default: 'min-h-[80px] px-3 py-2',
        lg: 'min-h-[120px] px-4 py-3'
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize'
      }
    },
    defaultVariants: {
      size: 'default',
      resize: 'vertical'
    }
  }
)

// Label のスタイル
export const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      required: {
        true: 'after:content-["*"] after:ml-1 after:text-destructive'
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

// フォームグループ・フィールドセットのスタイル
export const formGroupStyles = {
  fieldset: 'space-y-4 border border-input rounded-lg p-4',
  legend: 'px-2 text-sm font-medium text-foreground',
  field: 'space-y-2',
  fieldWithError: 'space-y-2',
  helpText: 'text-sm text-muted-foreground',
  errorText: 'text-sm text-destructive font-medium'
} as const

// 特殊なフォーム要素
export const specialFormStyles = {
  // カラーピッカー
  colorInput: 'h-10 w-16 rounded-md border border-input bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
  // ファイルアップロード
  fileUpload: 'flex h-32 w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-input bg-transparent text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground',
  // スライダー
  slider: 'relative flex w-full touch-none select-none items-center data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2'
} as const

// エラー状態の統一表示
export const validationStyles = {
  fieldError: 'text-sm text-destructive font-medium mt-1',
  fieldSuccess: 'text-sm text-green-600 font-medium mt-1',
  fieldWarning: 'text-sm text-orange-600 font-medium mt-1',
  fieldInfo: 'text-sm text-blue-600 font-medium mt-1'
} as const