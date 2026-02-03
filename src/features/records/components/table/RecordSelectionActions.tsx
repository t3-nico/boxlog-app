'use client';

import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';

import type { RecordItem } from '../../hooks/useRecordData';

interface RecordSelectionActionsProps {
  selectedCount: number;
  selectedIds: string[];
  items: RecordItem[];
  onDelete: () => void;
  onEdit?: (item: RecordItem) => void;
  onDuplicate?: (item: RecordItem) => void;
  onClearSelection: () => void;
}

/**
 * Record選択時のアクションボタン群
 *
 * 構成:
 * - 削除（常時表示）
 * - その他メニュー（単一選択時のみ: 編集・複製）
 */
export function RecordSelectionActions({
  selectedCount,
  selectedIds,
  items,
  onDelete,
  onEdit,
  onDuplicate,
  onClearSelection,
}: RecordSelectionActionsProps) {
  const isSingleSelection = selectedCount === 1;
  const selectedItem = isSingleSelection ? items.find((item) => item.id === selectedIds[0]) : null;

  const handleSingleItemAction = (action: (item: RecordItem) => void) => {
    if (selectedItem) {
      action(selectedItem);
    }
  };

  return (
    <>
      {/* 削除 */}
      <HoverTooltip content="削除" side="top">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            onDelete();
            onClearSelection();
          }}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          aria-label="削除"
        >
          <Trash2 className="size-4" />
        </Button>
      </HoverTooltip>

      {/* その他メニュー（単一選択時のみ） */}
      {isSingleSelection && selectedItem && (
        <DropdownMenu modal={false}>
          <HoverTooltip content="その他" side="top">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="その他">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </HoverTooltip>
          <DropdownMenuContent>
            {onEdit && (
              <DropdownMenuItem onClick={() => handleSingleItemAction(onEdit)}>
                <Pencil className="mr-2 size-4" />
                編集
              </DropdownMenuItem>
            )}
            {onDuplicate && (
              <DropdownMenuItem onClick={() => handleSingleItemAction(onDuplicate)}>
                <Copy className="mr-2 size-4" />
                今日の日付で複製
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                onDelete();
                onClearSelection();
              }}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="mr-2 size-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
