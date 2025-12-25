/**
 * タグページのダイアログ群
 *
 * TagsPageClientから抽出してパフォーマンス最適化:
 * - TagCreateModal
 * - TagArchiveDialog
 * - TagDeleteDialog
 * - TagMergeDialog
 * - 一括削除確認ダイアログ
 */
'use client';

import { AlertDialogConfirm } from '@/components/ui/alert-dialog-confirm';
import { TagArchiveDialog } from '@/features/tags/components/TagArchiveDialog';
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog';
import { TagMergeDialog } from '@/features/tags/components/TagMergeDialog';
import { TagCreateModal } from '@/features/tags/components/tag-create-modal';
import type { CreateTagInput, Tag } from '@/features/tags/types';

interface TagsDialogsProps {
  // Create Modal
  showCreateModal: boolean;
  onCloseCreateModal: () => void;
  onSaveNewTag: (data: CreateTagInput) => Promise<void>;
  // Archive Dialog
  archiveConfirmTag: Tag | null;
  onCloseArchiveConfirm: () => void;
  onConfirmArchive: () => Promise<void>;
  // Delete Dialog
  deleteConfirmTag: Tag | null;
  onCloseDeleteConfirm: () => void;
  onConfirmDelete: () => Promise<void>;
  // Merge Dialog
  singleMergeTag: Tag | null;
  onCloseSingleMerge: () => void;
  // Bulk Delete Dialog
  bulkDeleteDialogOpen: boolean;
  setBulkDeleteDialogOpen: (open: boolean) => void;
  onBulkDeleteConfirm: () => Promise<void>;
  selectedCount: number;
  isBulkDeleting: boolean;
  // Translations (useTranslationsの戻り値)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, values?: Record<string, any>) => string;
}

export function TagsDialogs({
  showCreateModal,
  onCloseCreateModal,
  onSaveNewTag,
  archiveConfirmTag,
  onCloseArchiveConfirm,
  onConfirmArchive,
  deleteConfirmTag,
  onCloseDeleteConfirm,
  onConfirmDelete,
  singleMergeTag,
  onCloseSingleMerge,
  bulkDeleteDialogOpen,
  setBulkDeleteDialogOpen,
  onBulkDeleteConfirm,
  selectedCount,
  isBulkDeleting,
  t,
}: TagsDialogsProps) {
  return (
    <>
      {/* 作成モーダル */}
      <TagCreateModal isOpen={showCreateModal} onClose={onCloseCreateModal} onSave={onSaveNewTag} />

      {/* アーカイブ確認ダイアログ */}
      <TagArchiveDialog
        tag={archiveConfirmTag}
        onClose={onCloseArchiveConfirm}
        onConfirm={onConfirmArchive}
      />

      {/* 削除確認ダイアログ */}
      <TagDeleteDialog
        tag={deleteConfirmTag}
        onClose={onCloseDeleteConfirm}
        onConfirm={onConfirmDelete}
      />

      {/* 単一タグマージダイアログ */}
      <TagMergeDialog tag={singleMergeTag} onClose={onCloseSingleMerge} />

      {/* 一括削除確認ダイアログ */}
      <AlertDialogConfirm
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={onBulkDeleteConfirm}
        title={t('tags.page.bulkDeleteConfirmTitle', { count: selectedCount })}
        description={t('tags.page.bulkDeleteConfirmDescription', { count: selectedCount })}
        confirmText={
          isBulkDeleting ? t('common.plan.delete.deleting') : t('common.plan.delete.confirm')
        }
        cancelText={t('actions.cancel')}
        isLoading={isBulkDeleting}
        variant="destructive"
      />
    </>
  );
}
