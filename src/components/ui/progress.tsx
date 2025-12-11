'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  /**
   * 不定（indeterminate）モード
   * 進捗が不明な場合に使用（ファイルアップロード開始時など）
   * @default false
   */
  indeterminate?: boolean
}

/**
 * Progress コンポーネント
 *
 * 使い分け:
 * - 進捗が分かる場合: value を指定（0-100）
 * - 進捗が不明な場合: indeterminate=true
 *
 * @example
 * ```tsx
 * // 進捗あり
 * <Progress value={65} />
 *
 * // 進捗不明（不定モード）
 * <Progress indeterminate />
 * ```
 *
 * @see https://www.nngroup.com/articles/skeleton-screens/
 * 10秒以上かかる処理にはProgress Barが推奨
 */
function Progress({ className, value, indeterminate = false, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'bg-primary h-full flex-1',
          indeterminate ? 'w-1/4 animate-indeterminate' : 'w-full transition-all'
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
export type { ProgressProps }
