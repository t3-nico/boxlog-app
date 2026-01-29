'use client';

import { Trash2 } from 'lucide-react';
import { useCallback } from 'react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { InspectorContent, InspectorShell, useInspectorKeyboard } from '@/features/inspector';
import { api } from '@/lib/trpc';

import { useRecordMutations } from '../hooks';
import { useRecordInspectorStore } from '../stores';
import { RecordInspectorContent } from './RecordInspectorContent';

/**
 * Record Inspector コンポーネント
 *
 * Record詳細表示・編集用パネル
 * - 既存Record編集モード: selectedRecordId が設定されている場合
 * - 新規作成モード（ドラフト）: draftRecord が設定されている場合
 * - PC: Popover（フローティング）、モバイル: Drawer
 */
export function RecordInspector() {
  const isOpen = useRecordInspectorStore((state) => state.isOpen);
  const selectedRecordId = useRecordInspectorStore((state) => state.selectedRecordId);
  const draftRecord = useRecordInspectorStore((state) => state.draftRecord);
  const closeInspector = useRecordInspectorStore((state) => state.closeInspector);

  // ドラフトモードかどうか
  const isDraftMode = draftRecord !== null && selectedRecordId === null;

  // Record取得（既存編集時のみ）
  const { data: record, isLoading } = api.records.getById.useQuery(
    { id: selectedRecordId!, include: { plan: true } },
    { enabled: !!selectedRecordId && !isDraftMode },
  );

  // Mutations
  const { deleteRecord } = useRecordMutations();

  // 閉じるハンドラー
  const handleClose = useCallback(() => {
    closeInspector();
  }, [closeInspector]);

  // 削除ハンドラー
  const handleDelete = useCallback(async () => {
    if (!selectedRecordId) return;
    if (!window.confirm('このRecordを削除しますか？')) return;

    await deleteRecord.mutateAsync({ id: selectedRecordId });
    closeInspector();
  }, [selectedRecordId, deleteRecord, closeInspector]);

  // キーボードショートカット
  useInspectorKeyboard({
    isOpen,
    onClose: handleClose,
  });

  // タイトル
  const title = isDraftMode ? 'Record作成' : record?.title || 'Record詳細';

  // モバイル用メニューコンテンツ（編集モードのみ）
  const mobileMenuContent = !isDraftMode ? (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} variant="destructive">
        <Trash2 className="size-4" />
        削除
      </DropdownMenuItem>
    </>
  ) : undefined;

  return (
    <InspectorShell
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      mobileMenuContent={mobileMenuContent}
    >
      <InspectorContent
        isLoading={isDraftMode ? false : isLoading}
        hasData={isDraftMode ? true : !!record}
        emptyMessage="Recordが見つかりません"
      >
        <RecordInspectorContent onClose={handleClose} />
      </InspectorContent>
    </InspectorShell>
  );
}
