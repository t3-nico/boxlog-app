'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
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
 * ReactのcreatePortalを使用してdocument.bodyに直接レンダリング
 *
 * スタイルガイド準拠:
 * - 8pxグリッドシステム（p-6, gap-4, mb-6等）
 * - 角丸: rounded-xl（16px）for ダイアログ
 * - Surface: bg-surface（カード、ダイアログ用）
 * - セマンティックカラー: warning系トークン使用
 */
export function TagArchiveDialog({ tag, onClose, onConfirm }: TagArchiveDialogProps) {
  const t = useTranslations();
  const [isArchiving, setIsArchiving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsArchiving(true);
    try {
      await onConfirm();
    } finally {
      setIsArchiving(false);
    }
  }, [onConfirm]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isArchiving) {
        onClose();
      }
    },
    [isArchiving, onClose],
  );

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    if (!tag) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isArchiving) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tag, isArchiving, onClose]);

  if (!mounted || !tag) return null;

  const dialog = (
    <div
      className="animate-in fade-in bg-overlay-heavy fixed inset-0 z-[250] flex items-center justify-center duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-archive-dialog-title"
    >
      <div
        className="animate-in zoom-in-95 fade-in bg-surface text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 512px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="bg-warning/10 flex size-10 shrink-0 items-center justify-center rounded-full">
            <Archive className="text-warning size-5" />
          </div>
          <div className="flex-1">
            <h2 id="tag-archive-dialog-title" className="text-lg leading-tight font-semibold">
              {t('tags.archive.confirmTitle', { name: tag.name })}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* 警告 */}
          <div className="bg-warning/10 text-warning border-warning/20 flex items-center gap-2 rounded-xl border p-4">
            <Archive className="size-4 shrink-0" />
            <p className="text-sm font-medium">{t('tags.archive.warning')}</p>
          </div>

          {/* アーカイブ後の処理 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('tags.archive.afterArchive')}</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• {t('tags.archive.noNewTagging')}</li>
              <li>• {t('tags.archive.existingItemsStillShown')}</li>
              <li>• {t('tags.archive.statsStillIncluded')}</li>
              <li>• {t('tags.archive.canRestoreAnytime')}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isArchiving}
            className="hover:bg-state-hover"
          >
            {t('common.actions.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isArchiving}
            className="bg-warning text-warning-foreground hover:bg-warning-hover"
          >
            {isArchiving ? t('tags.archive.archiving') : t('tags.archive.archiveButton')}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
