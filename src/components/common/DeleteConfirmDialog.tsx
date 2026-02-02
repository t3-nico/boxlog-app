'use client';

import { ConfirmDialog } from './ConfirmDialog';

interface DeleteConfirmDialogProps {
  /** ダイアログが開いているかどうか */
  open: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
  /** 削除確認時のコールバック */
  onConfirm: () => Promise<void>;
  /** タイトル */
  title: string;
  /** 説明文 */
  description: string;
}

/**
 * 汎用削除確認ダイアログ
 *
 * ConfirmDialog の destructive バリアントをラップした薄いコンポーネント。
 * 後方互換性のために維持。新規実装では ConfirmDialog を直接使用することを推奨。
 *
 * @example
 * ```tsx
 * <DeleteConfirmDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   onConfirm={handleDelete}
 *   title="Delete item?"
 *   description="This action cannot be undone."
 * />
 * ```
 */
export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      variant="destructive"
    />
  );
}
