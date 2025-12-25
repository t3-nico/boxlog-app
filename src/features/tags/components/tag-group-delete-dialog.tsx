'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TagGroup } from '@/features/tags/types';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TagGroupDeleteDialogProps {
  group: TagGroup | null;
  tagCount?: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * タググループ削除確認ダイアログ
 *
 * ReactのcreatePortalを使用してdocument.bodyに直接レンダリング
 *
 * スタイルガイド準拠:
 * - 8pxグリッドシステム（p-6, gap-4, mb-6等）
 * - 角丸: rounded-xl（16px）for ダイアログ
 * - Surface: bg-surface（カード、ダイアログ用）
 * - セマンティックカラー: destructive系トークン使用
 */
export function TagGroupDeleteDialog({
  group,
  tagCount = 0,
  onClose,
  onConfirm,
}: TagGroupDeleteDialogProps) {
  const t = useTranslations();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true);
  }, []);

  // グループが変更されたら確認テキストをリセット
  useEffect(() => {
    if (!group) {
      setConfirmText('');
    }
  }, [group]);

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  }, [onConfirm]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isDeleting) {
        setConfirmText('');
        onClose();
      }
    },
    [isDeleting, onClose],
  );

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    if (!group) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        setConfirmText('');
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [group, isDeleting, onClose]);

  if (!mounted || !group) return null;

  const requiresConfirmation = tagCount > 10;
  const canDelete = !requiresConfirmation || confirmText === group.name;

  const dialog = (
    <div
      className="animate-in fade-in bg-overlay-heavy fixed inset-0 z-[250] flex items-center justify-center duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-group-delete-dialog-title"
    >
      <div
        className="animate-in zoom-in-95 fade-in bg-surface text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 512px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive size-5" />
          </div>
          <div className="flex-1">
            <h2 id="tag-group-delete-dialog-title" className="text-lg leading-tight font-semibold">
              {t('tag.groupDelete.confirmTitle', { name: group.name })}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* 警告 */}
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-xl border p-4">
            <AlertTriangle className="size-4 shrink-0" />
            <p className="text-sm font-medium">{t('tag.groupDelete.warningIrreversible')}</p>
          </div>

          {/* タグ数表示 */}
          <div className="bg-surface-container rounded-xl p-4">
            <p className="mb-2 text-sm font-medium">{t('tag.groupDelete.tagsInGroup')}:</p>
            <p className="text-muted-foreground text-sm">
              {t('tag.groupDelete.tagCount', { count: tagCount })}
            </p>
          </div>

          {/* 削除後の処理 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('tag.groupDelete.afterDeletion')}:</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• {t('tag.groupDelete.onlyGroupDeleted')}</li>
              <li>• {t('tag.groupDelete.tagsWillBeUngrouped')}</li>
              <li>• {t('tag.groupDelete.tagsStillUsable')}</li>
            </ul>
          </div>

          {/* 確認入力（タグ数が10件を超える場合） */}
          {requiresConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirm-input" className="text-sm font-medium">
                {t('tag.groupDelete.confirmInputLabel', { name: group.name })}
              </Label>
              <Input
                id="confirm-input"
                placeholder={group.name}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="font-mono"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setConfirmText('');
              onClose();
            }}
            disabled={isDeleting}
            className="hover:bg-state-hover"
          >
            {t('actions.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canDelete || isDeleting}
            className="hover:bg-destructive-hover"
          >
            {isDeleting ? t('tag.groupDelete.deleting') : t('actions.delete')}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
