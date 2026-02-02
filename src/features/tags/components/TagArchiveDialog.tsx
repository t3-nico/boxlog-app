'use client';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Tag } from '@/features/tags/types';
import { Archive } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TagArchiveDialogProps {
  tag: Tag | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * タグアーカイブ確認ダイアログ
 *
 * ConfirmDialog の warning バリアントをラップ。
 * アーカイブ時の注意事項をカスタムコンテンツとして表示。
 */
export function TagArchiveDialog({ tag, onClose, onConfirm }: TagArchiveDialogProps) {
  const t = useTranslations();

  if (!tag) return null;

  return (
    <ConfirmDialog
      open={!!tag}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('tags.archive.confirmTitle', { name: tag.name })}
      variant="warning"
      icon={Archive}
      confirmLabel={t('tags.archive.archiveButton')}
      cancelLabel={t('common.actions.cancel')}
      loadingLabel={t('tags.archive.archiving')}
      maxWidth={512}
    >
      <div className="space-y-4">
        {/* 警告 */}
        <div className="bg-warning/10 text-warning border-warning/20 flex items-center gap-2 rounded-xl border p-4">
          <Archive className="size-4 shrink-0" />
          <p className="text-sm font-normal">{t('tags.archive.warning')}</p>
        </div>

        {/* アーカイブ後の処理 */}
        <div className="space-y-2">
          <p className="text-sm font-normal">{t('tags.archive.afterArchive')}</p>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• {t('tags.archive.noNewTagging')}</li>
            <li>• {t('tags.archive.existingItemsStillShown')}</li>
            <li>• {t('tags.archive.statsStillIncluded')}</li>
            <li>• {t('tags.archive.canRestoreAnytime')}</li>
          </ul>
        </div>
      </div>
    </ConfirmDialog>
  );
}
