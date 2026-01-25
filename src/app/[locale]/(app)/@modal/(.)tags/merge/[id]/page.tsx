'use client';

/**
 * タグマージモーダル - Intercepting Route
 *
 * /tags/merge/[id] への遷移をインターセプトし、モーダルとして表示
 * - ブラウザバックでモーダルが閉じる
 * - 現在のページの上にオーバーレイ表示
 *
 * [id] はマージ元（消える側）のタグID
 */

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useMergeTag, useTags } from '@/features/tags/hooks';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

export default function TagMergeInterceptedModal() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const sourceTagId = params?.id as string | undefined;

  // ソースタグの詳細を取得
  const { data: sourceTag, isLoading: isLoadingSource } = api.tags.getById.useQuery(
    { id: sourceTagId! },
    { enabled: !!sourceTagId },
  );

  // 全タグ一覧を取得
  const { data: allTags } = useTags();
  const mergeTagMutation = useMergeTag();

  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // 子タグがあるか確認
  const hasChildren = useMemo(
    () => allTags?.some((tag) => tag.parent_id === sourceTagId) ?? false,
    [allTags, sourceTagId],
  );

  // マージ対象のタグ一覧（自分を除外、アクティブなもののみ）
  const mergeTargetTags = useMemo(
    () => allTags?.filter((tag) => tag.id !== sourceTagId && tag.is_active !== false) ?? [],
    [allTags, sourceTagId],
  );

  // 検索でフィルタリング
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return mergeTargetTags;
    const query = searchQuery.toLowerCase();
    return mergeTargetTags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [mergeTargetTags, searchQuery]);

  // 選択されたタグを取得
  const selectedTarget = mergeTargetTags.find((tag) => tag.id === selectedTargetId);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !mergeTagMutation.isPending) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mergeTagMutation.isPending, handleClose]);

  const handleMerge = useCallback(async () => {
    if (!selectedTargetId || !sourceTagId) {
      setError(t('calendar.filter.mergeTag.selectRequired'));
      return;
    }

    try {
      await mergeTagMutation.mutateAsync({
        sourceTagId,
        targetTagId: selectedTargetId,
      });

      setSelectedTargetId('');
      handleClose();
    } catch (err) {
      console.error('Merge failed:', err);
      setError(t('tags.merge.failed'));
    }
  }, [selectedTargetId, sourceTagId, mergeTagMutation, handleClose, t]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !mergeTagMutation.isPending) {
        handleClose();
      }
    },
    [mergeTagMutation.isPending, handleClose],
  );

  // 確認メッセージ（選択後に表示）
  const confirmationMessage =
    selectedTarget && sourceTag
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

  if (isLoadingSource) {
    return (
      <div
        className="fixed inset-0 z-[250] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="bg-card text-foreground border-border rounded-xl border p-6 shadow-lg"
          style={{ width: 'min(calc(100vw - 32px), 400px)' }}
        >
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="mb-4 h-4 w-full" />
          <Skeleton className="mb-2 h-10 w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (!sourceTag) {
    return (
      <div
        className="fixed inset-0 z-[250] flex items-center justify-center"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="bg-card text-foreground border-border rounded-xl border p-6 shadow-lg"
          style={{ width: 'min(calc(100vw - 32px), 400px)' }}
        >
          <h2 className="mb-2 text-lg font-bold">{t('common.error')}</h2>
          <p className="text-muted-foreground mb-4 text-sm">{t('tags.error.notFound')}</p>
          <div className="flex justify-end">
            <Button onClick={handleClose}>{t('common.actions.close')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-merge-dialog-title"
    >
      {/* ダイアログコンテンツ */}
      <div
        className="animate-in zoom-in-95 fade-in bg-card text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
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
            onClick={handleClose}
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
}
