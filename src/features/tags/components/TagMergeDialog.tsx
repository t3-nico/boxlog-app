'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors';
import { useMergeTag, useTags } from '@/features/tags/hooks';
import type { Tag } from '@/features/tags/types';
import { useDialogKeyboard } from '@/hooks/useDialogKeyboard';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { AlertCircle, GitMerge } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface TagMergeDialogProps {
  tag: Tag | null;
  onClose: (targetTagId?: string) => void;
}

/**
 * タグマージダイアログ
 *
 * タグを別のタグに統合するダイアログ。
 * ラジオボタンでターゲットタグを選択し、統合を実行する。
 */
export function TagMergeDialog({ tag, onClose }: TagMergeDialogProps) {
  const t = useTranslations();
  const [targetTagId, setTargetTagId] = useState<string>('');
  const [isMerging, setIsMerging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: tags = [] } = useTags();
  const mergeTagMutation = useMergeTag();

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true);
  }, []);

  // タグが変更されたらリセット
  useEffect(() => {
    if (!tag) {
      setTargetTagId('');
      setError(null);
    }
  }, [tag]);

  // ESCキーでダイアログを閉じる
  useDialogKeyboard(!!tag, isMerging, () => onClose());

  // ソースタグを除外（フラット構造なので自分自身のみ除外）
  const availableTags = tags.filter((t) => {
    if (!tag) return false;
    // 自分自身は除外
    if (t.id === tag.id) return false;
    // アクティブなタグのみ
    if (!t.is_active) return false;
    return true;
  });

  const handleMerge = useCallback(async () => {
    // エラーをクリア
    setError(null);

    if (!tag || !targetTagId) {
      setError(t('tags.merge.noTargetSelected'));
      return;
    }

    setIsMerging(true);
    try {
      // 常にプラン紐付けを移行し、統合元タグを削除
      const result = await mergeTagMutation.mutateAsync({
        sourceTagId: tag.id,
        targetTagId,
        mergeAssociations: true,
        deleteSource: true,
      });

      toast.success(t('tags.merge.success', { count: result.mergedAssociations || 0 }));
      // 統合先タグIDを渡して閉じる（インスペクターで統合先を開くため）
      onClose(targetTagId);
    } catch (err) {
      logger.error('Merge failed:', err);
      setError(t('tags.merge.failed'));
    } finally {
      setIsMerging(false);
    }
  }, [tag, targetTagId, mergeTagMutation, onClose, t]);

  const handleBackdropMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isMerging) {
        onClose();
      }
    },
    [isMerging, onClose],
  );

  if (!mounted || !tag) return null;

  const dialog = (
    <div
      className="animate-in fade-in bg-overlay-heavy fixed inset-0 z-[250] flex items-center justify-center duration-150"
      onMouseDown={handleBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-merge-dialog-title"
    >
      <div
        className="animate-in zoom-in-95 fade-in bg-card text-foreground border-border rounded-2xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 448px)' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="bg-primary-container flex size-10 shrink-0 items-center justify-center rounded-full">
            <GitMerge className="text-primary size-5" />
          </div>
          <div className="flex-1">
            <h2 id="tag-merge-dialog-title" className="text-lg leading-tight font-bold">
              {t('tags.merge.title')}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('tags.merge.description', { source: tag.name })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* 説明 */}
          <p className="text-muted-foreground text-sm">{t('tags.merge.autoMergeDescription')}</p>

          {/* ターゲットタグ選択（ラジオボタンリスト） */}
          <div className="border-border max-h-60 overflow-y-auto rounded-2xl border">
            {availableTags.length === 0 ? (
              <p className="text-muted-foreground p-4 text-center text-sm">
                {t('tags.search.noTags')}
              </p>
            ) : (
              <RadioGroup
                value={targetTagId}
                onValueChange={(value) => {
                  setTargetTagId(value);
                  setError(null);
                }}
                className="p-2"
              >
                {availableTags.map((tagItem) => (
                  <Label
                    key={tagItem.id}
                    htmlFor={`merge-target-${tagItem.id}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                      'hover:bg-state-hover',
                      targetTagId === tagItem.id && 'bg-state-selected',
                    )}
                  >
                    <RadioGroupItem
                      value={tagItem.id}
                      id={`merge-target-${tagItem.id}`}
                      className="shrink-0"
                    />
                    <span
                      className="shrink-0 font-normal"
                      style={{ color: tagItem.color || DEFAULT_TAG_COLOR }}
                    >
                      #
                    </span>
                    <span className="flex-1 truncate text-sm">{tagItem.name}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="text-destructive flex items-center gap-2 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            disabled={isMerging}
            className="hover:bg-state-hover"
          >
            {t('common.actions.cancel')}
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMerge();
            }}
            disabled={isMerging}
          >
            {isMerging ? t('tags.merge.merging') : t('tags.merge.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
