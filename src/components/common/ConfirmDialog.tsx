'use client';

import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { useDialogKeyboard } from '@/hooks/useDialogKeyboard';
import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ConfirmDialogVariant = 'destructive' | 'warning' | 'default';

interface ConfirmDialogProps {
  /** ダイアログが開いているかどうか */
  open: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
  /** 確認時のコールバック（非同期可） */
  onConfirm: () => void | Promise<void>;
  /** タイトル */
  title: string;
  /** 説明文（省略可、childrenがある場合） */
  description?: string;
  /** カスタムコンテンツ（description の代わりに使用） */
  children?: ReactNode;
  /** 確認ボタンのラベル（省略時は翻訳キーから取得） */
  confirmLabel?: string;
  /** キャンセルボタンのラベル（省略時は翻訳キーから取得） */
  cancelLabel?: string;
  /** バリアント: destructive（削除等）, warning（警告）, default */
  variant?: ConfirmDialogVariant;
  /** カスタムアイコン（省略時はバリアントに応じたデフォルト） */
  icon?: LucideIcon;
  /** ローディング中のラベル */
  loadingLabel?: string;
  /** ダイアログの最大幅（px単位、省略時は448px） */
  maxWidth?: number;
}

/**
 * 汎用確認ダイアログ
 *
 * Figma的な運用: このコンポーネントを大元として、オプション（variant, icon等）で
 * 削除確認、警告確認などの用途に対応する。
 *
 * スタイルガイド準拠:
 * - 8pxグリッドシステム（p-6, gap-4, mb-6等）
 * - 角丸: rounded-2xl（16px）for ダイアログ
 * - Card: bg-card（カード、ダイアログ用）
 * - セマンティックカラー: destructive系トークン使用
 *
 * @example
 * ```tsx
 * // 削除確認
 * <ConfirmDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   onConfirm={handleDelete}
 *   title="Delete item?"
 *   description="This action cannot be undone."
 *   variant="destructive"
 * />
 *
 * // カスタムアイコン
 * <ConfirmDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   onConfirm={handleConfirm}
 *   title="Archive item?"
 *   description="Item will be moved to archive."
 *   variant="warning"
 *   icon={Archive}
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  icon: Icon = AlertTriangle,
  loadingLabel,
  maxWidth = 448,
}: ConfirmDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true);
  }, []);

  // ESCキーでダイアログを閉じる
  useDialogKeyboard(open, isLoading, onClose);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) {
        onClose();
      }
    },
    [isLoading, onClose],
  );

  if (!mounted || !open) return null;

  // バリアントに応じたスタイル
  const iconContainerClass =
    variant === 'destructive'
      ? 'bg-destructive-container'
      : variant === 'warning'
        ? 'bg-warning-container'
        : 'bg-muted';

  const iconClass =
    variant === 'destructive'
      ? 'text-destructive'
      : variant === 'warning'
        ? 'text-warning'
        : 'text-foreground';

  const confirmButtonVariant = variant === 'destructive' ? 'destructive' : 'primary';
  const confirmButtonClass =
    variant === 'destructive'
      ? 'hover:bg-destructive-hover'
      : variant === 'warning'
        ? 'bg-warning text-warning-foreground hover:bg-warning-hover'
        : undefined;

  // ラベルの決定
  const resolvedConfirmLabel =
    confirmLabel ?? (variant === 'destructive' ? t('actions.delete') : t('common.confirm'));
  const resolvedCancelLabel = cancelLabel ?? t('actions.cancel');
  const resolvedLoadingLabel =
    loadingLabel ?? (variant === 'destructive' ? t('common.deleting') : t('common.loading'));

  const dialog = (
    <div
      className="animate-in fade-in bg-overlay-heavy fixed inset-0 z-[250] flex items-center justify-center duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* ダイアログコンテンツ: bg-card, rounded-2xl, p-6 */}
      <div
        className="animate-in zoom-in-95 fade-in bg-card text-foreground border-border rounded-2xl border p-6 shadow-lg duration-150"
        style={{ width: `min(calc(100vw - 32px), ${maxWidth}px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: gap-4準拠 */}
        <div className={children ? 'mb-6' : ''}>
          <div className="flex items-start gap-4">
            {/* アイコン */}
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${iconContainerClass}`}
            >
              <Icon className={`size-5 ${iconClass}`} />
            </div>
            <div className="flex-1">
              <h2 id="confirm-dialog-title" className="text-lg leading-tight font-bold">
                {title}
              </h2>
              {description && (
                <p id="confirm-dialog-description" className="text-muted-foreground mt-2 text-sm">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Custom content */}
        {children && <div className="mt-6">{children}</div>}

        {/* Footer: gap-2, justify-end */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="hover:bg-state-hover"
          >
            {resolvedCancelLabel}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className={confirmButtonClass}
          >
            {isLoading ? resolvedLoadingLabel : resolvedConfirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
