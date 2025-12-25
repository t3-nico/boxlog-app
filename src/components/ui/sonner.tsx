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
      position={isMobile ? 'top-center' : 'bottom-right'}
      richColors
      expand
      duration={6000}
      closeButton
      containerAriaLabel="通知"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground hover:group-[.toast]:bg-primary/90 transition-colors',
          cancelButton: 'group-[.toast]:bg-surface-container group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
