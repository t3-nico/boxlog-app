'use client';

/**
 * テンプレート一覧モーダル
 *
 * テンプレートの選択・管理を行うモーダル
 * CreateActionSheetの「テンプレートから作成」で開かれる
 */

import { memo, useCallback } from 'react';

import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TagBadge } from '@/features/tags';
import { useTags } from '@/features/tags/hooks';

import { useDeleteTemplate, useIncrementTemplateUseCount, useTemplates } from '../hooks';
import { useTemplateStore } from '../stores/useTemplateStore';
import type { PlanTemplate } from '../types';

interface TemplateListModalProps {
  onSelectTemplate: (template: PlanTemplate) => void;
}

export const TemplateListModal = memo(function TemplateListModal({
  onSelectTemplate,
}: TemplateListModalProps) {
  const t = useTranslations('templates');
  const tc = useTranslations('common');
  const isOpen = useTemplateStore((s) => s.isListModalOpen);
  const closeListModal = useTemplateStore((s) => s.closeListModal);
  const openFormModal = useTemplateStore((s) => s.openFormModal);

  const { data: templates, isLoading } = useTemplates();
  const { data: tags } = useTags();
  const deleteTemplate = useDeleteTemplate();
  const incrementUseCount = useIncrementTemplateUseCount();

  const handleSelect = useCallback(
    (template: PlanTemplate) => {
      incrementUseCount.mutate({ id: template.id });
      onSelectTemplate(template);
      closeListModal();
    },
    [onSelectTemplate, closeListModal, incrementUseCount],
  );

  const handleEdit = useCallback(
    (templateId: string) => {
      closeListModal();
      openFormModal(templateId);
    },
    [closeListModal, openFormModal],
  );

  const handleDelete = useCallback(
    (templateId: string) => {
      deleteTemplate.mutate({ id: templateId });
    },
    [deleteTemplate],
  );

  const handleCreateNew = useCallback(() => {
    closeListModal();
    openFormModal();
  }, [closeListModal, openFormModal]);

  const getTagsForTemplate = useCallback(
    (tagIds: string[]) => {
      if (!tags) return [];
      return tags.filter((tag) => tagIds.includes(tag.id));
    },
    [tags],
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeListModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('listModal.title')}</DialogTitle>
          <DialogDescription>{t('listModal.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {isLoading && (
            <p className="text-muted-foreground py-8 text-center text-sm">{tc('status.loading')}</p>
          )}

          {!isLoading && (!templates || templates.length === 0) && (
            <div className="flex flex-col items-center gap-3 py-8">
              <FileText className="text-muted-foreground size-8" />
              <p className="text-muted-foreground text-sm">{t('listModal.empty')}</p>
              <Button variant="outline" size="sm" onClick={handleCreateNew}>
                <Plus className="size-4" />
                {t('actions.create')}
              </Button>
            </div>
          )}

          {templates && templates.length > 0 && (
            <>
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="hover:bg-state-hover flex items-center gap-3 rounded-lg p-3 transition-colors"
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                      onClick={() => handleSelect(template)}
                    >
                      <span className="text-foreground truncate text-sm font-medium">
                        {template.name}
                      </span>
                      {template.description && (
                        <span className="text-muted-foreground truncate text-xs">
                          {template.description}
                        </span>
                      )}
                      {template.tag_ids.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {getTagsForTemplate(template.tag_ids).map((tag) => (
                            <TagBadge key={tag.id} tag={tag} />
                          ))}
                        </div>
                      )}
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" icon size="sm" aria-label={tc('aria.options')}>
                          <Pencil className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(template.id)}>
                          <Pencil className="size-4" />
                          {tc('actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="size-4" />
                          {tc('actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="mt-2" onClick={handleCreateNew}>
                <Plus className="size-4" />
                {t('actions.create')}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
