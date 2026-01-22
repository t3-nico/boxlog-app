'use client';

/**
 * PlanInspector のメニューコンテンツ
 */

import { memo } from 'react';

import {
  CheckIcon,
  Copy,
  ExternalLink,
  Link,
  PanelRight,
  Save,
  SquareMousePointer,
  Trash2,
} from 'lucide-react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { InspectorDisplayMode } from '@/features/inspector';

interface PlanInspectorMenuProps {
  displayMode: InspectorDisplayMode;
  onDuplicate: () => void;
  onCopyLink: () => void;
  onSaveAsTemplate: () => void;
  onCopyId: () => void;
  onOpenInNewTab: () => void;
  onDelete: () => void;
  onDisplayModeChange: (mode: InspectorDisplayMode) => void;
}

export const PlanInspectorMenu = memo(function PlanInspectorMenu({
  displayMode,
  onDuplicate,
  onCopyLink,
  onSaveAsTemplate,
  onCopyId,
  onOpenInNewTab,
  onDelete,
  onDisplayModeChange,
}: PlanInspectorMenuProps) {
  return (
    <>
      <DropdownMenuItem onClick={onDuplicate}>
        <Copy className="size-4" />
        複製する
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onCopyLink}>
        <Link className="size-4" />
        リンクをコピー
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onSaveAsTemplate}>
        <Save className="size-4" />
        テンプレートとして保存
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onCopyId}>
        <Copy className="size-4" />
        IDをコピー
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onOpenInNewTab}>
        <ExternalLink className="size-4" />
        新しいタブで開く
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <div className="text-muted-foreground px-2 py-2 text-xs font-normal">表示モード</div>
      <button
        type="button"
        onClick={() => onDisplayModeChange('sheet')}
        className="hover:bg-state-hover flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
      >
        <span className="flex items-center gap-2">
          <PanelRight className="size-4 shrink-0" />
          パネル
        </span>
        {displayMode === 'sheet' && <CheckIcon className="text-primary size-4" />}
      </button>
      <button
        type="button"
        onClick={() => onDisplayModeChange('popover')}
        className="hover:bg-state-hover flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
      >
        <span className="flex items-center gap-2">
          <SquareMousePointer className="size-4 shrink-0" />
          ポップアップ
        </span>
        {displayMode === 'popover' && <CheckIcon className="text-primary size-4" />}
      </button>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onDelete} variant="destructive">
        <Trash2 className="size-4" />
        削除
      </DropdownMenuItem>
    </>
  );
});
