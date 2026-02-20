'use client';

/**
 * PlanInspector のメニューコンテンツ
 */

import { memo } from 'react';

import { Copy, Save, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();

  return (
    <>
      <DropdownMenuItem onClick={onDuplicate}>
        <Copy className="size-4" />
        {t('plan.inspector.menu.duplicate')}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onSaveAsTemplate} disabled>
        <Save className="size-4" />
        {t('plan.inspector.menu.saveAsTemplate')}
        <span className="text-muted-foreground ml-auto text-xs">{t('common.comingSoon')}</span>
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
