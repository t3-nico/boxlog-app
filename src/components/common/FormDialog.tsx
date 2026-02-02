'use client';

import { type ReactNode, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

interface FormDialogProps {
  /** ダイアログが開いているかどうか */
  open: boolean;
  /** ダイアログの開閉状態が変わった時のコールバック */
  onOpenChange: (open: boolean) => void;
  /** フォーム送信時のコールバック（非同期可） */
  onSubmit: () => void | Promise<void>;
  /** タイトル */
  title: string;
  /** 説明文（省略可） */
  description?: string;
  /** フォーム内容（children） */
  children: ReactNode;
  /** 送信ボタンのラベル（省略時は翻訳キーから取得） */
  submitLabel?: string;
  /** キャンセルボタンのラベル（省略時は翻訳キーから取得） */
  cancelLabel?: string;
  /** 送信ボタンを無効化するかどうか */
  submitDisabled?: boolean;
  /** ダイアログの最大幅（省略時は 'md'） */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  /** 閉じるボタン（×）を表示するかどうか */
  showCloseButton?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const;

/**
 * フォーム付きダイアログの共通基盤
 *
 * Figma的な運用: このコンポーネントを大元として、children でフォーム内容を
 * カスタマイズする。ローディング状態、キャンセル/保存ボタンは共通化。
 *
 * 基盤: shadcn/ui Dialog（Radix UI）
 * - アクセシビリティ完備（フォーカストラップ、ESCで閉じる等）
 * - アニメーション対応
 *
 * @example
 * ```tsx
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSubmit={handleSubmit}
 *   title="Edit Name"
 *   description="Enter your new display name."
 * >
 *   <div className="space-y-4 py-4">
 *     <Input value={name} onChange={(e) => setName(e.target.value)} />
 *   </div>
 * </FormDialog>
 * ```
 */
export function FormDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  children,
  submitLabel,
  cancelLabel,
  submitDisabled = false,
  maxWidth = 'md',
  showCloseButton = true,
}: FormDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        await onSubmit();
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmit],
  );

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onOpenChange(false);
    }
  }, [isLoading, onOpenChange]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isLoading) {
        onOpenChange(isOpen);
      }
    },
    [isLoading, onOpenChange],
  );

  const resolvedSubmitLabel = submitLabel ?? t('common.confirm');
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={maxWidthClasses[maxWidth]} showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {children}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {resolvedCancelLabel}
            </Button>
            <Button type="submit" disabled={isLoading || submitDisabled}>
              {isLoading ? t('common.loading') : resolvedSubmitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
