'use client';

import { MoreHorizontal, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';

/**
 * アクションボタンの設定
 */
export interface ActionButton {
  /** ツールチップテキスト */
  tooltip: string;
  /** アイコン */
  icon: ReactNode;
  /** クリック時のコールバック */
  onClick: () => void;
  /** ボタンのバリアント */
  variant?: 'default' | 'destructive';
  /** aria-label */
  ariaLabel?: string;
}

/**
 * メニュー項目の設定
 */
export interface MenuItem {
  /** ラベル */
  label: string;
  /** アイコン */
  icon: ReactNode;
  /** クリック時のコールバック */
  onClick: () => void;
  /** バリアント */
  variant?: 'default' | 'destructive';
}

interface SelectionActionsProps {
  /** 選択数 */
  selectedCount: number;
  /** アクションボタンの配列 */
  actions: ActionButton[];
  /** 削除アクション */
  onDelete?: () => void;
  /** 削除ツールチップ */
  deleteTooltip?: string;
  /** 単一選択時の追加メニュー項目 */
  singleSelectionMenuItems?: MenuItem[];
  /** 選択解除時のコールバック */
  onClearSelection: () => void;
}

/**
 * 汎用選択時アクションボタン群
 *
 * テーブルで複数アイテムを選択した時に表示するアクションボタン
 * - アクションボタン（アイコン+ツールチップ）
 * - 削除ボタン（destructiveスタイル）
 * - 単一選択時の追加メニュー（編集・複製など）
 *
 * @example
 * ```tsx
 * <SelectionActions
 *   selectedCount={selectedIds.size}
 *   actions={[
 *     {
 *       tooltip: 'タグを追加',
 *       icon: <Tag className="size-4" />,
 *       onClick: () => setShowTagDialog(true),
 *     },
 *     {
 *       tooltip: 'ステータス変更',
 *       icon: <CheckCircle2 className="size-4" />,
 *       onClick: handleStatusChange,
 *     },
 *   ]}
 *   onDelete={handleDelete}
 *   onClearSelection={clearSelection}
 * />
 * ```
 */
export function SelectionActions({
  selectedCount,
  actions,
  onDelete,
  deleteTooltip = '削除',
  singleSelectionMenuItems,
  onClearSelection,
}: SelectionActionsProps) {
  const isSingleSelection = selectedCount === 1;

  return (
    <>
      {/* アクションボタン */}
      {actions.map((action, index) => (
        <HoverTooltip key={index} content={action.tooltip} side="top">
          <Button
            variant="ghost"
            size="icon"
            onClick={action.onClick}
            aria-label={action.ariaLabel ?? action.tooltip}
            className={
              action.variant === 'destructive'
                ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
                : ''
            }
          >
            {action.icon}
          </Button>
        </HoverTooltip>
      ))}

      {/* 削除ボタン */}
      {onDelete && (
        <HoverTooltip content={deleteTooltip} side="top">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onDelete();
              onClearSelection();
            }}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            aria-label={deleteTooltip}
          >
            <Trash2 className="size-4" />
          </Button>
        </HoverTooltip>
      )}

      {/* 単一選択時の追加メニュー */}
      {isSingleSelection && singleSelectionMenuItems && singleSelectionMenuItems.length > 0 && (
        <DropdownMenu modal={false}>
          <HoverTooltip content="その他" side="top">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="その他">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </HoverTooltip>
          <DropdownMenuContent>
            {singleSelectionMenuItems.map((item, index) => (
              <div key={index}>
                {index > 0 &&
                  item.variant === 'destructive' &&
                  singleSelectionMenuItems[index - 1]?.variant !== 'destructive' && (
                    <DropdownMenuSeparator />
                  )}
                <DropdownMenuItem
                  onClick={item.onClick}
                  className={
                    item.variant === 'destructive'
                      ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
                      : ''
                  }
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
