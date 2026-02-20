'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useInspectorKeyboard } from '@/features/plans/components/inspector/hooks';
import { InspectorContent, InspectorShell } from '@/features/plans/components/inspector/shared';

import { useRecord, useRecordMutations } from '../hooks';
import { useRecordInspectorStore } from '../stores';
import { RecordInspectorContent } from './RecordInspectorContent';

/**
 * Record Inspector コンポーネント
 *
 * Record詳細表示・編集用パネル（既存Record編集専用）
 * 新規作成は PlanInspector を使用
 * - PC: Popover（フローティング）、モバイル: Drawer
 */
export function RecordInspector() {
  const t = useTranslations();
  const isOpen = useRecordInspectorStore((state) => state.isOpen);
  const selectedRecordId = useRecordInspectorStore((state) => state.selectedRecordId);
  const closeInspector = useRecordInspectorStore((state) => state.closeInspector);

  // Record取得
  const { data: record, isLoading } = useRecord(selectedRecordId!, {
    includePlan: true,
    enabled: !!selectedRecordId,
  });

  // Mutations
  const { deleteRecord } = useRecordMutations();

  // 閉じるハンドラー
  const handleClose = useCallback(() => {
    closeInspector();
  }, [closeInspector]);

  // 削除ハンドラー
  const handleDelete = useCallback(async () => {
    if (!selectedRecordId) return;
    if (!window.confirm(t('record.inspector.deleteConfirm'))) return;

    await deleteRecord.mutateAsync({ id: selectedRecordId });
    closeInspector();
  }, [selectedRecordId, deleteRecord, closeInspector, t]);

  // キーボードショートカット
  useInspectorKeyboard({
    isOpen,
    onClose: handleClose,
  });

  // タイトル
  const title = record?.title || t('record.inspector.title');

  // モバイル用メニューコンテンツ
  const mobileMenuContent = (
    <>
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
      title={title}
      mobileMenuContent={mobileMenuContent}
    >
      <InspectorContent
        isLoading={isLoading}
        hasData={!!record}
        emptyMessage={t('record.inspector.notFound')}
      >
        <RecordInspectorContent onClose={handleClose} />
      </InspectorContent>
    </InspectorShell>
  );
}
