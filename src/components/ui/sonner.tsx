'use client';

import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toast通知コンポーネント
 *
 * デザイン仕様:
 * - 背景: overlay（ライト/ダークモード対応）
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
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            // レイアウト
            'group toast gap-2 p-4',
            // 背景・角丸・影
            'bg-overlay rounded-md shadow-lg',
            // 左ボーダー（タイプ別カラー）
            'border-l-2 border-transparent',
            'data-[type=success]:border-l-success',
            'data-[type=error]:border-l-destructive',
            'data-[type=warning]:border-l-warning',
            'data-[type=info]:border-l-info',
          ),
          title: 'text-sm font-medium text-foreground',
          description: 'text-sm text-muted-foreground',
          actionButton: cn(
            'bg-primary text-primary-foreground',
            'hover:bg-primary-hover',
            'text-sm font-medium',
            'transition-colors',
          ),
          cancelButton: 'bg-container text-muted-foreground text-sm',
          closeButton: cn('text-muted-foreground hover:text-foreground', 'transition-colors'),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
