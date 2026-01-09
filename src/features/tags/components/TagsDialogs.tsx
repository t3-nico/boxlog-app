/**
 * タグページのダイアログ群
 *
 * TagsPageClientから抽出してパフォーマンス最適化:
 * - TagCreateModal
 * - TagArchiveDialog
 * - DeleteConfirmDialog (タグ削除)
 * - TagMergeDialog
 * - DeleteConfirmDialog (一括削除)
 */
'use client';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { TagArchiveDialog } from '@/features/tags/components/TagArchiveDialog';
import { TagMergeDialog } from '@/features/tags/components/TagMergeDialog';
import { TagCreateModal } from '@/features/tags/components/tag-create-modal';
import type { TranslationValues } from 'next-intl';

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
  // Translations (useTranslationsの戻り値)
  t: (key: string, values?: TranslationValues) => string;
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
      <DeleteConfirmDialog
        open={!!deleteConfirmTag}
        onClose={onCloseDeleteConfirm}
        onConfirm={onConfirmDelete}
        title={t('tag.delete.confirmTitleWithName', { name: deleteConfirmTag?.name ?? '' })}
        description={t('tag.delete.description')}
      />

      {/* 単一タグマージダイアログ */}
      <TagMergeDialog tag={singleMergeTag} onClose={onCloseSingleMerge} />

      {/* 一括削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={onBulkDeleteConfirm}
        title={t('tags.page.bulkDeleteConfirmTitle', { count: selectedCount })}
        description={t('tags.page.bulkDeleteConfirmDescription', { count: selectedCount })}
      />
    </>
  );
}
