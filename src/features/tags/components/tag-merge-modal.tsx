'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useMergeTag, useTags } from '@/features/tags/hooks/useTags';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

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

  const [selectedTarget, setSelectedTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true);
  }, []);

  // モーダルが開いたらリセット
  useEffect(() => {
    if (open) {
      setSelectedTarget(null);
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
  const mergeTargetTags =
    tags?.filter((tag) => tag.id !== sourceTag.id && tag.is_active !== false) ?? [];

  const handleSelect = useCallback((tag: { id: string; name: string }) => {
    setSelectedTarget(tag);
    setError('');
  }, []);

  const handleMerge = useCallback(async () => {
    if (!selectedTarget) {
      setError(t('calendar.filter.mergeTag.selectRequired'));
      return;
    }

    await mergeTagMutation.mutateAsync({
      sourceTagId: sourceTag.id,
      targetTagId: selectedTarget.id,
    });

    onMergeSuccess?.();
    setSelectedTarget(null);
    onClose();
  }, [selectedTarget, sourceTag.id, mergeTagMutation, onMergeSuccess, onClose, t]);

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
        <h2 id="tag-merge-dialog-title" className="mb-2 text-lg font-semibold">
          {t('calendar.filter.mergeTag.title')}
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {selectedTarget ? confirmationMessage : t('calendar.filter.mergeTag.selectTarget')}
        </p>

        {/* タグ検索・選択 */}
        <Command className="border-border rounded-md border">
          <CommandInput placeholder={t('calendar.filter.mergeTag.searchPlaceholder')} />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>{t('calendar.filter.mergeTag.noResults')}</CommandEmpty>
            <CommandGroup>
              {mergeTargetTags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={tag.name}
                  onSelect={() => handleSelect({ id: tag.id, name: tag.name })}
                  className={cn(
                    'cursor-pointer',
                    selectedTarget?.id === tag.id && 'bg-state-selected',
                  )}
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color || '#3B82F6' }}
                  />
                  <span className="flex-1">{tag.name}</span>
                  {selectedTarget?.id === tag.id && (
                    <Check className="text-primary ml-auto size-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

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
