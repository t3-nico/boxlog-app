'use client';

import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';

import { buttonVariants } from './button';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const LoadingIcon = () => <Loader2 className="size-5 animate-spin" />;

/**
 * Toast通知コンポーネント
 *
 * デザイン仕様:
 * - 背景: popover（ライト/ダークモード対応）
 * - 枠線: 左2px、タイプ別カラー（success/error/warning/info）
 * - 角丸: 8px（radius-md）
 * - 影: shadow-lg
 * - パディング: 16px
 * - ギャップ: 8px
 * - タイトル: 14px、foreground
 * - 説明: 14px、muted-foreground
 * - 閉じるボタン: 常時表示
 * - Undoボタン: 右配置
 *
 * @see {@link @/lib/toast} 推奨API
 *
 * @example
 * ```tsx
 * import { showToast } from '@/lib/toast';
 *
 * showToast.error('エラーが発生しました');
 * showToast.withUndo({
 *   title: '削除しました',
 *   onUndo: () => restoreItem(),
 * });
 * ```
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  return (
    <Sonner
      position={isMobile ? 'bottom-center' : 'bottom-right'}
      expand
      duration={6000}
      closeButton
      containerAriaLabel="通知"
      icons={{ loading: <LoadingIcon /> }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'grid grid-cols-[auto_1fr_auto] gap-4 items-center w-full p-4 rounded-lg border shadow-lg bg-popover text-foreground border-border',
          icon: 'row-start-1 col-start-1',
          loader: '!static !inset-auto !transform-none',
          content:
            'row-start-1 col-start-2 min-w-0 [[data-sonner-toast]:not(:has([data-icon]))_&]:col-start-1',
          title: 'text-sm font-medium',
          description: 'text-sm text-muted-foreground',
          actionButton: cn(
            'row-start-2 col-start-3 justify-self-end',
            buttonVariants({ variant: 'primary', size: 'sm' }),
          ),
          cancelButton: buttonVariants({ variant: 'outline', size: 'sm' }),
          closeButton:
            'row-start-1 col-start-3 justify-self-end p-1 rounded-md text-muted-foreground bg-transparent border-0 hover:bg-state-hover transition-colors [&_svg]:size-5',
          success:
            '!bg-success !text-success-foreground !border-success [&_[data-close-button]]:text-success-foreground',
          error:
            '!bg-destructive !text-destructive-foreground !border-destructive [&_[data-close-button]]:text-destructive-foreground',
          warning:
            '!bg-warning !text-warning-foreground !border-warning [&_[data-close-button]]:text-warning-foreground',
          info: '!bg-info !text-info-foreground !border-info [&_[data-close-button]]:text-info-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
