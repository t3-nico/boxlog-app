'use client';

import { Calendar, CheckCircle2, Circle, MoreHorizontal, Tag, Trash2 } from 'lucide-react';

import type { PlanStatus } from '@/features/plans/types/plan';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';

import type { InboxItem } from '../../hooks/useInboxData';
import { InboxActionMenuItems } from './InboxActionMenuItems';

interface InboxSelectionActionsProps {
  selectedCount: number;
  selectedIds: string[];
  items: InboxItem[];
  onStatusChange: (status: PlanStatus) => void;
  onDelete: () => void;
  onEdit?: (item: InboxItem) => void;
  onDuplicate?: (item: InboxItem) => void;
  onAddTags?: () => void;
  onChangeDueDate?: () => void;
  onClearSelection: () => void;
}

/**
 * Inbox選択時のアクションボタン群
 *
 * 構成:
 * - タグ一括追加
 * - 期限一括変更
 * - ステータス変更（Open/Closed）
 * - 削除
 * - その他メニュー（単一選択時のみ: 編集・複製）
 */
export function InboxSelectionActions({
  selectedCount,
  selectedIds,
  items,
  onStatusChange,
  onDelete,
  onEdit,
  onDuplicate,
  onAddTags,
  onChangeDueDate,
  onClearSelection,
}: InboxSelectionActionsProps) {
  const isSingleSelection = selectedCount === 1;
  const selectedItem = isSingleSelection ? items.find((item) => item.id === selectedIds[0]) : null;

  const handleSingleItemAction = (action: (item: InboxItem) => void) => {
    if (selectedItem) {
      action(selectedItem);
    }
  };

  return (
    <>
      {/* タグ一括追加 */}
      {onAddTags && (
        <HoverTooltip content="タグを追加" side="top">
          <Button variant="ghost" size="icon" onClick={onAddTags} aria-label="タグを追加">
            <Tag className="size-4" />
          </Button>
        </HoverTooltip>
      )}

      {/* 期限一括変更 */}
      {onChangeDueDate && (
        <HoverTooltip content="期限を設定" side="top">
          <Button variant="ghost" size="icon" onClick={onChangeDueDate} aria-label="期限を設定">
            <Calendar className="size-4" />
          </Button>
        </HoverTooltip>
      )}

      {/* ステータス変更（選択中のアイテムに応じてトグル） */}
      {(() => {
        // 選択中のアイテムのステータスを確認
        const selectedItems = items.filter((item) => selectedIds.includes(item.id));
        const hasOpenItems = selectedItems.some((item) => item.status === 'open');
        // openがあればclosedに、全部closedならopenに戻す
        const targetStatus = hasOpenItems ? 'closed' : 'open';
        const tooltipText = hasOpenItems ? 'Closed にする' : 'Open に戻す';

        return (
          <HoverTooltip content={tooltipText} side="top">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onStatusChange(targetStatus);
                onClearSelection();
              }}
              aria-label={tooltipText}
            >
              {hasOpenItems ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
            </Button>
          </HoverTooltip>
        );
      })()}

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
            <InboxActionMenuItems
              item={selectedItem}
              onEdit={onEdit ? () => handleSingleItemAction(onEdit) : undefined}
              onDuplicate={onDuplicate ? () => handleSingleItemAction(onDuplicate) : undefined}
              onAddTags={onAddTags ? () => onAddTags() : undefined}
              onChangeDueDate={onChangeDueDate ? () => onChangeDueDate() : undefined}
              onDelete={() => {
                onDelete();
                onClearSelection();
              }}
              renderMenuItem={({ icon, label, onClick, variant }) => (
                <DropdownMenuItem
                  onClick={onClick}
                  className={
                    variant === 'destructive'
                      ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
                      : ''
                  }
                >
                  {icon}
                  {label}
                </DropdownMenuItem>
              )}
              renderSeparator={() => <DropdownMenuSeparator />}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
