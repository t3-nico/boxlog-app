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
        classNames: {
          toast: 'bg-card text-foreground border-border shadow-lg',
          description: 'text-muted-foreground',
          actionButton:
            'bg-primary text-primary-foreground hover:bg-primary-hover transition-colors',
          cancelButton: 'bg-container text-muted-foreground',
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
