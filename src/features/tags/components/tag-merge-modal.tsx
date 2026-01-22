'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTranslations } from 'next-intl';

import { useMergeTag, useTags } from '@/features/tags/hooks/useTags';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TagMergeModalProps {
  open: boolean;
  onClose: () => void;
  sourceTag: { id: string; name: string; color?: string | null };
  /** 子タグがあるか（確認メッセージ用） */
  hasChildren: boolean;
  /** マージ成功時のコールバック */
  onMergeSuccess?: () => void;
}

/**
 * タグマージモーダル
 *
 * ReactのcreatePortalを使用してdocument.bodyに直接レンダリング
 * TagCreateModalと同じパターンで統一
 */
export function TagMergeModal({
  open,
  onClose,
  sourceTag,
  hasChildren,
  onMergeSuccess,
}: TagMergeModalProps) {
  const t = useTranslations();
  const { data: tags } = useTags();
  const mergeTagMutation = useMergeTag();

  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true);
  }, []);

  // モーダルが開いたらリセット
  useEffect(() => {
    if (open) {
      setSelectedTargetId('');
      setSearchQuery('');
      setError('');
    }
  }, [open]);

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !mergeTagMutation.isPending) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, mergeTagMutation.isPending, onClose]);

  // マージ対象のタグ一覧（自分を除外、アクティブなもののみ）
  const mergeTargetTags = useMemo(
    () => tags?.filter((tag) => tag.id !== sourceTag.id && tag.is_active !== false) ?? [],
    [tags, sourceTag.id],
  );

  // 検索でフィルタリング
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return mergeTargetTags;
    const query = searchQuery.toLowerCase();
    return mergeTargetTags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [mergeTargetTags, searchQuery]);

  // 選択されたタグを取得
  const selectedTarget = mergeTargetTags.find((tag) => tag.id === selectedTargetId);

  const handleMerge = useCallback(async () => {
    if (!selectedTargetId) {
      setError(t('calendar.filter.mergeTag.selectRequired'));
      return;
    }

    try {
      await mergeTagMutation.mutateAsync({
        sourceTagId: sourceTag.id,
        targetTagId: selectedTargetId,
      });

      onMergeSuccess?.();
      setSelectedTargetId('');
      onClose();
    } catch (err) {
      console.error('Merge failed:', err);
      setError(t('tags.merge.failed'));
    }
  }, [selectedTargetId, sourceTag.id, mergeTagMutation, onMergeSuccess, onClose, t]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !mergeTagMutation.isPending) {
        onClose();
      }
    },
    [mergeTagMutation.isPending, onClose],
  );

  // 確認メッセージ（選択後に表示）
  const confirmationMessage = selectedTarget
    ? hasChildren
      ? t('calendar.filter.mergeTag.descriptionWithChildren', {
          sourceName: sourceTag.name,
          targetName: selectedTarget.name,
        })
      : t('calendar.filter.mergeTag.description', {
          sourceName: sourceTag.name,
          targetName: selectedTarget.name,
        })
    : null;

  if (!mounted || !open) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-merge-dialog-title"
    >
      {/* ダイアログコンテンツ: bg-surface, rounded-xl, p-6 */}
      <div
        className="animate-in zoom-in-95 fade-in bg-surface text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 400px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 id="tag-merge-dialog-title" className="mb-2 text-lg font-bold">
          {t('calendar.filter.mergeTag.title')}
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {selectedTarget ? confirmationMessage : t('calendar.filter.mergeTag.selectTarget')}
        </p>

        {/* 検索ボックス */}
        <Input
          type="text"
          placeholder={t('calendar.filter.mergeTag.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />

        {/* タグ選択（ラジオボタンリスト） */}
        <div className="border-border max-h-[200px] overflow-y-auto rounded-md border">
          {filteredTags.length === 0 ? (
            <p className="text-muted-foreground p-4 text-center text-sm">
              {t('calendar.filter.mergeTag.noResults')}
            </p>
          ) : (
            <RadioGroup
              value={selectedTargetId}
              onValueChange={(value) => {
                setSelectedTargetId(value);
                setError('');
              }}
              className="p-1"
            >
              {filteredTags.map((tag) => (
                <Label
                  key={tag.id}
                  htmlFor={`merge-target-${tag.id}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors',
                    'hover:bg-state-hover',
                    selectedTargetId === tag.id && 'bg-state-selected',
                  )}
                >
                  <RadioGroupItem
                    value={tag.id}
                    id={`merge-target-${tag.id}`}
                    className="shrink-0"
                  />
                  <span className="shrink-0 font-normal" style={{ color: tag.color || '#3B82F6' }}>
                    #
                  </span>
                  <span className="flex-1 truncate text-sm">{tag.name}</span>
                </Label>
              ))}
            </RadioGroup>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <p className="text-destructive mt-2 text-sm" role="alert">
            {error}
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mergeTagMutation.isPending}
            className="hover:bg-state-hover"
          >
            {t('actions.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleMerge} disabled={mergeTagMutation.isPending}>
            {mergeTagMutation.isPending
              ? t('calendar.toast.saving')
              : t('calendar.filter.mergeTag.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
