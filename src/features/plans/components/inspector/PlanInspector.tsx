'use client';

import { Copy, ExternalLink, Link, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useInspectorKeyboard } from './hooks';
import { InspectorContent, InspectorShell } from './shared';

import { usePlan } from '../../hooks/usePlan';
import { useDeleteConfirmStore } from '../../stores/useDeleteConfirmStore';
import { usePlanInspectorStore } from '../../stores/usePlanInspectorStore';
import { useRecurringEditConfirmStore } from '../../stores/useRecurringEditConfirmStore';
import type { Plan } from '../../types/plan';

import { useInspectorAutoSave, useInspectorNavigation } from './hooks';
import { PlanInspectorContent } from './PlanInspectorContent';

/**
 * Plan Inspector（全ページ共通）
 *
 * 共通Inspector基盤を使用
 * PC: Popover（フローティング）、モバイル: Drawer
 */
export function PlanInspector() {
  const t = useTranslations();
  const isOpen = usePlanInspectorStore((state) => state.isOpen);
  const planId = usePlanInspectorStore((state) => state.planId);
  const closeInspector = usePlanInspectorStore((state) => state.closeInspector);
  const draftPlan = usePlanInspectorStore((state) => state.draftPlan);
  const clearDraft = usePlanInspectorStore((state) => state.clearDraft);
  const clearPendingChanges = usePlanInspectorStore((state) => state.clearPendingChanges);

  // ドラフトモード判定
  const isDraftMode = draftPlan !== null && planId === null;

  const { data: planData, isLoading } = usePlan(planId!, {
    includeTags: true,
    enabled: !!planId && !isDraftMode,
  });
  // ドラフトモードの場合はdraftPlanを使用
  const plan = isDraftMode
    ? (draftPlan as unknown as Plan | null)
    : ((planData ?? null) as unknown as Plan | null);

  // 繰り返しダイアログが開いている間はInspectorを閉じない
  // ×ボタン/ESC/外側クリック = キャンセル（変更を破棄）
  const handleClose = useCallback(() => {
    const isRecurringDialogOpen = useRecurringEditConfirmStore.getState().isOpen;
    if (!isRecurringDialogOpen) {
      // ドラフトモードの場合はドラフトをクリア
      if (isDraftMode) {
        clearDraft();
      }
      // 未保存の変更を破棄
      clearPendingChanges();
      // closeInspector内でcalendar-drag-cancelイベントを発行
      closeInspector();
    }
  }, [closeInspector, isDraftMode, clearDraft, clearPendingChanges]);

  // ナビゲーション
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(planId);

  // 削除
  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);
  const { deletePlan } = useInspectorAutoSave({ planId, plan });

  // キーボードショートカット
  useInspectorKeyboard({
    isOpen,
    hasPrevious,
    hasNext,
    onClose: handleClose,
    onPrevious: goToPrevious,
    onNext: goToNext,
  });

  // モバイル用メニューアクション
  const handleCopyLink = useCallback(() => {
    if (planId) {
      const url = `${window.location.origin}/plans/${planId}`;
      navigator.clipboard.writeText(url);
    }
  }, [planId]);

  const handleOpenInNewTab = useCallback(() => {
    if (planId) window.open(`/plans/${planId}`, '_blank');
  }, [planId]);

  const handleDelete = useCallback(() => {
    if (!planId) return;
    openDeleteDialog(planId, plan?.title ?? null, async () => {
      await deletePlan.mutateAsync({ id: planId });
      closeInspector();
    });
  }, [planId, plan?.title, openDeleteDialog, deletePlan, closeInspector]);

  // モバイル用メニューコンテンツ（簡略版）
  const mobileMenuContent = (
    <>
      <DropdownMenuItem onClick={handleCopyLink}>
        <Link className="size-4" />
        {t('plan.inspector.menu.copyLink')}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleOpenInNewTab}>
        <ExternalLink className="size-4" />
        {t('plan.inspector.menu.openNewTab')}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => {
          if (planId) navigator.clipboard.writeText(planId);
        }}
      >
        <Copy className="size-4" />
        {t('plan.inspector.menu.copyId')}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} variant="destructive">
        <Trash2 className="size-4" />
        {t('common.actions.delete')}
      </DropdownMenuItem>
    </>
  );

  return (
    <InspectorShell
      isOpen={isOpen}
      onClose={handleClose}
      title={isDraftMode ? '' : plan?.title || t('plan.inspector.noTitle')}
      mobileMenuContent={isDraftMode ? undefined : mobileMenuContent}
    >
      <InspectorContent
        isLoading={isDraftMode ? false : isLoading}
        hasData={isDraftMode ? true : !!plan}
        emptyMessage={t('plan.inspector.notFound')}
      >
        <PlanInspectorContent />
      </InspectorContent>
    </InspectorShell>
  );
}
