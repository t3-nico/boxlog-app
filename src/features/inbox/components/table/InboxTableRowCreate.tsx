'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { Plus } from 'lucide-react';
import { forwardRef, useImperativeHandle } from 'react';
import { useInboxColumnStore } from '../../stores/useInboxColumnStore';

/**
 * InboxTableRowCreate コンポーネントの外部から呼び出せるメソッド
 */
export interface InboxTableRowCreateHandle {
  /** 新規作成モードを開始 */
  startCreate: () => void;
}

/**
 * 新規プラン作成行
 *
 * クリックでInspectorをドラフトモードで開く
 * - DB保存は入力時に遅延実行（Lazy Create）
 * - 空のまま閉じると何も保存されない
 *
 * @example
 * ```tsx
 * const createRef = useRef<InboxTableRowCreateHandle>(null)
 * <InboxTableRowCreate ref={createRef} />
 * // 外部から作成モードを開始
 * createRef.current?.startCreate()
 * ```
 */
export const InboxTableRowCreate = forwardRef<InboxTableRowCreateHandle>((_props, ref) => {
  const { getVisibleColumns } = useInboxColumnStore();
  const { openInspectorWithDraft } = usePlanInspectorStore();
  const visibleColumns = getVisibleColumns();

  // ドラフトモードでInspectorを開く
  const handleStartCreate = () => {
    openInspectorWithDraft({
      title: '',
    });
  };

  // 外部から呼び出し可能なメソッドを公開
  useImperativeHandle(ref, () => ({
    startCreate: handleStartCreate,
  }));

  return (
    <TableRow
      className="hover:bg-state-hover cursor-pointer border-none transition-colors"
      onClick={handleStartCreate}
    >
      <TableCell colSpan={visibleColumns.length} className="h-10" style={{ paddingLeft: '64px' }}>
        <div className="text-muted-foreground flex items-center gap-2">
          <Plus className="size-4" />
          <span className="text-sm">新しいプラン</span>
        </div>
      </TableCell>
    </TableRow>
  );
});

InboxTableRowCreate.displayName = 'InboxTableRowCreate';
