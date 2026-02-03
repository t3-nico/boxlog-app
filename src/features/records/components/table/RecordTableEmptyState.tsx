'use client';

import { Clock, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';

interface RecordTableEmptyStateProps {
  /** テーブルの列数（colspan用） */
  columnCount: number;
  /** フィルター適用前の総件数 */
  totalItems: number;
}

/**
 * Record テーブル空状態コンポーネント
 */
export function RecordTableEmptyState({ columnCount, totalItems }: RecordTableEmptyStateProps) {
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);

  // フィルターで絞り込んだ結果が0件の場合
  if (totalItems > 0) {
    return (
      <TableRow>
        <TableCell colSpan={columnCount} className="h-32 text-center">
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground">条件に一致するRecordがありません</p>
            <p className="text-muted-foreground text-sm">フィルターを変更してください</p>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // 本当にデータが0件の場合
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-48 text-center">
        <div className="flex flex-col items-center gap-4">
          <Clock className="text-muted-foreground size-12" />
          <div className="text-center">
            <p className="text-muted-foreground">まだRecordがありません</p>
            <p className="text-muted-foreground text-sm">作業ログを記録しましょう</p>
          </div>
          <Button onClick={() => openInspectorWithDraft(undefined, 'record')}>
            <Plus className="mr-2 size-4" />
            Record作成
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
