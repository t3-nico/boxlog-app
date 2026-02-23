'use client';

/**
 * PlanInspector のメニューコンテンツ
 */

import { memo } from 'react';

import { Copy, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface PlanInspectorMenuProps {
  onDuplicate: () => void;
  onCopyId: () => void;
  onDelete: () => void;
}

export const PlanInspectorMenu = memo(function PlanInspectorMenu({
  onDuplicate,
  onCopyId,
  onDelete,
}: PlanInspectorMenuProps) {
  const t = useTranslations();

  return (
    <>
      <DropdownMenuItem onClick={onDuplicate}>
        <Copy className="size-4" />
        {t('plan.inspector.menu.duplicate')}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onCopyId}>
        <Copy className="size-4" />
        {t('plan.inspector.menu.copyId')}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onDelete} variant="destructive">
        <Trash2 className="size-4" />
        {t('common.actions.delete')}
      </DropdownMenuItem>
    </>
  );
});
