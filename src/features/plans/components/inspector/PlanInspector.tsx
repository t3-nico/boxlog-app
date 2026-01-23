'use client';

import { Copy, ExternalLink, Link, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  InspectorContent,
  InspectorShell,
  useInspectorKeyboard,
  type InspectorDisplayMode,
} from '@/features/inspector';

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
 * displayModeに応じてSheet（サイドパネル）またはDialog（ポップアップ）で表示
 */
export function PlanInspector() {
  const isOpen = usePlanInspectorStore((state) => state.isOpen);
  const planId = usePlanInspectorStore((state) => state.planId);
  const displayMode = usePlanInspectorStore((state) => state.displayMode) as InspectorDisplayMode;
  const closeInspector = usePlanInspectorStore((state) => state.closeInspector);
  const popoverPosition = usePlanInspectorStore((state) => state.popoverPosition);
  const setPopoverPosition = usePlanInspectorStore((state) => state.setPopoverPosition);

  const { data: planData, isLoading } = usePlan(planId!, { includeTags: true, enabled: !!planId });
  const plan = (planData ?? null) as unknown as Plan | null;

  // 繰り返しダイアログが開いている間はInspectorを閉じない
  const handleClose = useCallback(() => {
    const isRecurringDialogOpen = useRecurringEditConfirmStore.getState().isOpen;
    if (!isRecurringDialogOpen) {
      closeInspector();
    }
  }, [closeInspector]);

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
        リンクをコピー
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleOpenInNewTab}>
        <ExternalLink className="size-4" />
        新しいタブで開く
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => {
          if (planId) navigator.clipboard.writeText(planId);
        }}
      >
        <Copy className="size-4" />
        IDをコピー
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} variant="destructive">
        <Trash2 className="size-4" />
        削除
      </DropdownMenuItem>
    </>
  );

  return (
    <InspectorShell
      isOpen={isOpen}
      onClose={handleClose}
      displayMode={displayMode}
      title={plan?.title || '予定の詳細'}
      resizable={displayMode === 'sheet'}
      modal={false}
      mobileMenuContent={mobileMenuContent}
      popoverPosition={popoverPosition}
      onPopoverPositionChange={setPopoverPosition}
    >
      <InspectorContent
        isLoading={isLoading}
        hasData={!!plan}
        emptyMessage="プランが見つかりません"
      >
        <PlanInspectorContent />
      </InspectorContent>
    </InspectorShell>
  );
}
