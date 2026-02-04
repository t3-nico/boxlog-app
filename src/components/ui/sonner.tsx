'use client';

import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

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
  const { theme = 'system' } = useTheme();
  const validTheme = theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system';
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  return (
    <Sonner
      theme={validTheme}
      position={isMobile ? 'bottom-center' : 'bottom-right'}
      expand
      duration={6000}
      closeButton
      containerAriaLabel="通知"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group flex items-center gap-3 w-full p-4 rounded-lg border shadow-lg bg-card text-foreground border-border',
          title: 'text-sm font-medium',
          description:
            'text-sm text-muted-foreground group-data-[type=success]:text-success-foreground/80 group-data-[type=error]:text-destructive-foreground/80 group-data-[type=warning]:text-warning-foreground/80 group-data-[type=info]:text-info-foreground/80',
          actionButton:
            'ml-auto shrink-0 rounded-md px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-hover transition-colors',
          cancelButton:
            'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium bg-container text-muted-foreground',
          closeButton:
            'order-last ml-auto shrink-0 p-1 rounded-md text-inherit bg-transparent border-0 hover:bg-black/10 transition-colors [&_svg]:size-5',
          success: '!bg-success !text-success-foreground !border-success',
          error: '!bg-destructive !text-destructive-foreground !border-destructive',
          warning: '!bg-warning !text-warning-foreground !border-warning',
          info: '!bg-info !text-info-foreground !border-info',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
