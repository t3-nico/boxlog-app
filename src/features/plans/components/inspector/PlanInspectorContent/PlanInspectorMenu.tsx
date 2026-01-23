'use client';

/**
 * PlanInspector のメニューコンテンツ
 */

import { memo } from 'react';

import { Copy, ExternalLink, Link, Save, Trash2 } from 'lucide-react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface PlanInspectorMenuProps {
  onDuplicate: () => void;
  onCopyLink: () => void;
  onSaveAsTemplate: () => void;
  onCopyId: () => void;
  onOpenInNewTab: () => void;
  onDelete: () => void;
}

export const PlanInspectorMenu = memo(function PlanInspectorMenu({
  onDuplicate,
  onCopyLink,
  onSaveAsTemplate,
  onCopyId,
  onOpenInNewTab,
  onDelete,
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
      <DropdownMenuItem onClick={onDelete} variant="destructive">
        <Trash2 className="size-4" />
        削除
      </DropdownMenuItem>
    </>
  );
});
