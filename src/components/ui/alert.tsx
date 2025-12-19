import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * アラートバリアント定義
 *
 * ## バリアント設計（Carbon Design System 参考）
 *
 * | variant     | 用途                                         | アイコン例                   |
 * |-------------|----------------------------------------------|------------------------------|
 * | default     | 一般的な通知                                 | Info                         |
 * | info        | 情報、ヒント                                 | Info, Lightbulb              |
 * | success     | 成功、完了                                   | CheckCircle                  |
 * | warning     | 警告、注意                                   | AlertTriangle                |
 * | destructive | エラー、危険                                 | XCircle, AlertOctagon        |
 */
const alertVariants = cva(
  'relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
  {
    variants: {
      variant: {
        // デフォルト - 一般的な通知
        default: 'bg-background text-foreground border-border [&>svg]:text-foreground',
        // 情報 - ヒント、追加情報
        info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
        // 成功 - 完了、成功
        success:
          'bg-green-50 text-green-900 border-green-200 dark:bg-green-950/50 dark:text-green-100 dark:border-green-800 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
        // 警告 - 注意
        warning:
          'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-100 dark:border-yellow-800 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400',
        // エラー - 危険、エラー
        destructive:
          'bg-destructive/10 text-destructive border-destructive/50 dark:border-destructive dark:bg-destructive/20 [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-1 leading-none font-medium tracking-tight', className)} {...props} />
  )
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  )
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription, AlertTitle }
