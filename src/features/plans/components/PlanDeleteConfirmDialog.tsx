'use client';

import { useCallback } from 'react';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTranslations } from 'next-intl';

import { useDeleteConfirmStore } from '../stores/useDeleteConfirmStore';

/**
 * プラン削除確認ダイアログ
 *
 * Zustand ストアと連携する ConfirmDialog のラッパー。
 * グローバルに配置し、ストア経由で開閉を制御する。
 */
export function PlanDeleteConfirmDialog() {
  const t = useTranslations();

  const isOpen = useDeleteConfirmStore((state) => state.isOpen);
  const planTitle = useDeleteConfirmStore((state) => state.planTitle);
  const onConfirm = useDeleteConfirmStore((state) => state.onConfirm);
  const closeDialog = useDeleteConfirmStore((state) => state.closeDialog);

  const title = planTitle
    ? t('plan.delete.confirmTitleWithName', { name: planTitle })
    : t('plan.delete.confirmTitle');

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) return;
    await onConfirm();
    closeDialog();
  }, [onConfirm, closeDialog]);

  return (
    <ConfirmDialog
      open={isOpen}
      onClose={closeDialog}
      onConfirm={handleConfirm}
      title={title}
      description={t('plan.delete.description')}
      variant="destructive"
      confirmLabel={t('plan.delete.confirm')}
      loadingLabel={t('plan.delete.deleting')}
    />
  );
}
