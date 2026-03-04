'use client';

import { Copy, ExternalLink, Link, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Suspense, useCallback } from 'react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useInspectorKeyboard } from './hooks';
import { InspectorContent, InspectorShell } from './shared';

import type { EntryWithTags } from '@/core/types/entry';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';
import { openDeleteConfirm, useModalStore } from '@/stores/useModalStore';
import { usePlan } from '../../hooks/usePlan';

import { useInspectorURLSync } from '../../hooks/useInspectorURLSync';
import { useInspectorAutoSave, useInspectorNavigation } from './hooks';
import { PlanInspectorContent } from './PlanInspectorContent';

/**
 * URL同期を担当する内部コンポーネント
 * useSearchParams()はSuspenseが必要なため分離
 */
function InspectorURLSyncHandler() {
  useInspectorURLSync();
  return null;
}

/**
 * Plan Inspector（全ページ共通）
 *
 * 共通Inspector基盤を使用
 * PC: Popover（フローティング）、モバイル: Drawer
 */
export function PlanInspector() {
  const t = useTranslations();
  const isOpen = useEntryInspectorStore((state) => state.isOpen);
  const planId = useEntryInspectorStore((state) => state.entryId);
  const closeInspector = useEntryInspectorStore((state) => state.closeInspector);
  const clearPendingChanges = useEntryInspectorStore((state) => state.clearPendingChanges);

  const { data: planData, isLoading } = usePlan(planId!, {
    includeTags: true,
    enabled: !!planId,
  });
  const plan: EntryWithTags | null = (planData ?? null) as EntryWithTags | null;

  // 繰り返しダイアログが開いている間はInspectorを閉じない
  // ×ボタン/ESC/外側クリック = キャンセル（変更を破棄）
  const handleClose = useCallback(() => {
    const modal = useModalStore.getState().modal;
    const isRecurringDialogOpen = modal?.type === 'recurringEdit';
    if (!isRecurringDialogOpen) {
      clearPendingChanges();
      closeInspector();
    }
  }, [closeInspector, clearPendingChanges]);

  // ナビゲーション
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(planId);

  // 削除
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
    openDeleteConfirm(planId, plan?.title ?? null, async () => {
      await deletePlan.mutateAsync({ id: planId });
      closeInspector();
    });
  }, [planId, plan?.title, deletePlan, closeInspector]);

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
    <>
      {/* URL同期（Suspenseでラップ） */}
      <Suspense fallback={null}>
        <InspectorURLSyncHandler />
      </Suspense>

      <InspectorShell
        isOpen={isOpen}
        onClose={handleClose}
        title={plan?.title || t('plan.inspector.noTitle')}
        mobileMenuContent={mobileMenuContent}
      >
        <InspectorContent
          isLoading={isLoading}
          hasData={!!plan}
          emptyMessage={t('plan.inspector.notFound')}
        >
          <PlanInspectorContent />
        </InspectorContent>
      </InspectorShell>
    </>
  );
}
