'use client';

/**
 * PlanInspector のメニューコンテンツ
 */

import { memo } from 'react';

import { Copy, Save, Trash2 } from 'lucide-react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface PlanInspectorMenuProps {
  onDuplicate: () => void;
  onSaveAsTemplate: () => void;
  onCopyId: () => void;
  onDelete: () => void;
}

export const PlanInspectorMenu = memo(function PlanInspectorMenu({
  onDuplicate,
  onSaveAsTemplate,
  onCopyId,
  onDelete,
}: PlanInspectorMenuProps) {
  return (
    <>
      <DropdownMenuItem onClick={onDuplicate}>
        <Copy className="size-4" />
        複製する
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onSaveAsTemplate} disabled>
        <Save className="size-4" />
        テンプレートとして保存
        <span className="text-muted-foreground ml-auto text-xs">Coming soon</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onCopyId}>
        <Copy className="size-4" />
        IDをコピー
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onDelete} variant="destructive">
        <Trash2 className="size-4" />
        削除
      </DropdownMenuItem>
    </>
  );
});
