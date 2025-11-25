'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Toast通知コンポーネント（shadcn/ui公式準拠）
 *
 * @see https://ui.shadcn.com/docs/components/sonner
 *
 * 使用方法:
 * ```tsx
 * import { toast } from 'sonner'
 *
 * toast.success('保存しました')
 * toast.error('エラーが発生しました')
 * toast.info('情報メッセージ')
 * toast.warning('警告メッセージ')
 * toast.loading('処理中...')
 *
 * // Promise統合
 * toast.promise(asyncFn(), {
 *   loading: '処理中...',
 *   success: '完了しました',
 *   error: 'エラーが発生しました',
 * })
 * ```
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="bottom-right"
      richColors
      duration={5000}
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
