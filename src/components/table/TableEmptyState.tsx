'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/common';
import { TableCell, TableRow } from '@/components/ui/table';

interface TableEmptyStateProps {
  /** 列数（colSpan用） */
  columnCount: number;
  /** アイコン */
  icon: LucideIcon;
  /** タイトル */
  title: string;
  /** 説明文 */
  description: string;
  /** アクションボタン */
  actions?: ReactNode;
  /** セルの高さ（デフォルト: h-[28rem]） */
  cellHeight?: string;
}

/**
 * 汎用テーブル空状態コンポーネント
 *
 * テーブル内にデータがない場合に表示する空状態
 *
 * @example
 * ```tsx
 * <TableEmptyState
 *   columnCount={5}
 *   icon={Inbox}
 *   title="アイテムがありません"
 *   description="新しいアイテムを作成してください"
 *   actions={
 *     <Button onClick={handleCreate}>
 *       <Plus className="mr-2 size-4" />
 *       作成
 *     </Button>
 *   }
 * />
 * ```
 */
export function TableEmptyState({
  columnCount,
  icon,
  title,
  description,
  actions,
  cellHeight = 'h-[28rem]',
}: TableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className={cellHeight}>
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          actions={actions}
          size="sm"
          centered
        />
      </TableCell>
    </TableRow>
  );
}
