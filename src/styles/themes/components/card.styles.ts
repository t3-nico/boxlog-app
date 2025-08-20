/**
 * Card コンポーネントの統一スタイル定義
 * shadcn/ui Card コンポーネントファミリーの中央管理
 */

import { cva } from 'class-variance-authority'

// Card コンテナのスタイル
export const cardVariants = cva(
  'bg-card text-card-foreground border-border flex flex-col rounded-xl border shadow-sm',
  {
    variants: {
      variant: {
        default: 'gap-6 py-6',
        compact: 'gap-4 py-4',
        spacious: 'gap-8 py-8'
      },
      size: {
        sm: 'text-sm',
        default: '',
        lg: 'text-base'
      },
      elevation: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg'
      },
      interactive: {
        true: 'cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      elevation: 'sm',
      interactive: false
    }
  }
)

// Card Header のスタイル
export const cardHeaderVariants = cva(
  '@container/card-header grid auto-rows-min items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
  {
    variants: {
      layout: {
        default: 'grid-rows-[auto_auto]',
        single: 'grid-rows-[auto]',
        stacked: 'grid-rows-[auto_auto_auto]'
      }
    },
    defaultVariants: {
      layout: 'default'
    }
  }
)

// Card Title のスタイル
export const cardTitleVariants = cva(
  'leading-none font-semibold',
  {
    variants: {
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
      },
      truncate: {
        true: 'truncate',
        false: ''
      }
    },
    defaultVariants: {
      size: 'default',
      truncate: false
    }
  }
)

// Card Description のスタイル
export const cardDescriptionVariants = cva(
  'text-muted-foreground',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        default: 'text-sm'
      },
      lines: {
        1: 'line-clamp-1',
        2: 'line-clamp-2',
        3: 'line-clamp-3',
        none: ''
      }
    },
    defaultVariants: {
      size: 'default',
      lines: 'none'
    }
  }
)

// Card Action のスタイル
export const cardActionVariants = cva(
  'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
  {
    variants: {
      position: {
        default: '',
        top: 'self-start',
        center: 'self-center',
        bottom: 'self-end'
      }
    },
    defaultVariants: {
      position: 'default'
    }
  }
)

// Card Content のスタイル
export const cardContentVariants = cva(
  'px-6',
  {
    variants: {
      padding: {
        none: 'px-0',
        sm: 'px-3',
        default: 'px-6',
        lg: 'px-8'
      },
      scroll: {
        true: 'overflow-y-auto',
        false: ''
      }
    },
    defaultVariants: {
      padding: 'default',
      scroll: false
    }
  }
)

// Card Footer のスタイル
export const cardFooterVariants = cva(
  'flex items-center px-6 [.border-t]:pt-6',
  {
    variants: {
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around'
      },
      padding: {
        none: 'px-0',
        sm: 'px-3',
        default: 'px-6',
        lg: 'px-8'
      }
    },
    defaultVariants: {
      justify: 'start',
      padding: 'default'
    }
  }
)

// 特殊なCardバリアント
export const specialCardStyles = {
  // サイドバー用のカード
  sidebar: 'bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-colors',
  
  // 統計表示用のカード
  stat: 'bg-gradient-to-br from-card to-card/80 border-primary/20 shadow-sm hover:shadow-md transition-all',
  
  // エラー表示用のカード
  error: 'bg-destructive/5 border-destructive/20 text-destructive dark:bg-destructive/10 dark:border-destructive/30',
  
  // 警告表示用のカード
  warning: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/50 dark:border-orange-800/50 dark:text-orange-200',
  
  // 成功表示用のカード
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/50 dark:border-green-800/50 dark:text-green-200',
  
  // 情報表示用のカード
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800/50 dark:text-blue-200'
} as const

// カード内の共通レイアウト
export const cardLayoutStyles = {
  // 横並びレイアウト
  horizontal: 'flex-row items-center gap-4',
  
  // 縦並びレイアウト（デフォルト）
  vertical: 'flex-col gap-4',
  
  // グリッドレイアウト
  grid2: 'grid grid-cols-2 gap-4',
  grid3: 'grid grid-cols-3 gap-4',
  
  // リストレイアウト
  list: 'divide-y divide-border',
  
  // センタリング
  centered: 'items-center justify-center text-center'
} as const

// カード間のスペーシング
export const cardSpacing = {
  container: 'space-y-6',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  list: 'space-y-4',
  compact: 'space-y-3'
} as const