'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTranslations } from 'next-intl';

import { DEFAULT_TAG_COLOR } from '@/features/tags/constants/colors';
import { useMergeTag, useTags } from '@/features/tags/hooks';
import { useHasMounted } from '@/hooks/useHasMounted';
import { logger } from '@/lib/logger';
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
  const { data: tags, refetch: refetchTags } = useTags();
  const mergeTagMutation = useMergeTag();

  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const mounted = useHasMounted();
  const [error, setError] = useState('');

  // モーダルが開いたらリセット（React推奨: レンダー中のstate調整）
  const [prevOpen, setPrevOpen] = useState(open);
  if (open && !prevOpen) {
    setPrevOpen(open);
    setSelectedTargetId('');
    setSearchQuery('');
    setError('');
  } else if (open !== prevOpen) {
    setPrevOpen(open);
  }

  // 最新のタグリストを取得（外部システム同期なのでeffect内が適切）
  useEffect(() => {
    if (open) {
      void refetchTags();
    }
  }, [open, refetchTags]);

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

  // 階層構造でグループ化（親タグ → 子タグの順）
  const groupedTags = useMemo(() => {
    // 親タグ（parent_id が null、またはソースタグが親の場合はルートに昇格）
    const parentTags = filteredTags
      .filter((tag) => tag.parent_id === null || tag.parent_id === sourceTag.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    // 親タグごとに子タグをグループ化
    const result: Array<{
      parent: (typeof filteredTags)[0] | null;
      children: typeof filteredTags;
    }> = [];

    for (const parent of parentTags) {
      const children = filteredTags
        .filter((tag) => tag.parent_id === parent.id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      result.push({ parent, children });
    }

    // 検索時は親が見つからない子タグも表示（フラットに）
    if (searchQuery.trim()) {
      const includedIds = new Set(
        result.flatMap((g) => [g.parent?.id, ...g.children.map((c) => c.id)]),
      );
      const orphanTags = filteredTags.filter((tag) => !includedIds.has(tag.id));
      if (orphanTags.length > 0) {
        for (const orphan of orphanTags) {
          result.push({ parent: orphan, children: [] });
        }
      }
    }

    return result;
  }, [filteredTags, sourceTag.id, searchQuery]);

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
      logger.error('Merge failed:', err);
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
      {/* ダイアログコンテンツ: bg-card, rounded-2xl, p-6 */}
      <div
        className="animate-in zoom-in-95 fade-in bg-card text-foreground border-border rounded-2xl border p-6 shadow-lg duration-150"
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

        {/* タグ選択（階層表示のラジオボタンリスト） */}
        <div className="border-border max-h-[200px] overflow-y-auto rounded-lg border">
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
              {groupedTags.map(({ parent, children }) => (
                <div key={parent?.id ?? 'orphan'}>
                  {/* 親タグ */}
                  {parent && (
                    <Label
                      htmlFor={`merge-target-${parent.id}`}
                      className={cn(
                        'flex cursor-pointer items-center gap-4 rounded-lg px-4 py-2 transition-colors',
                        'hover:bg-state-hover',
                        selectedTargetId === parent.id && 'bg-state-selected',
                      )}
                    >
                      <RadioGroupItem
                        value={parent.id}
                        id={`merge-target-${parent.id}`}
                        className="shrink-0"
                      />
                      <span
                        className="shrink-0 font-normal"
                        style={{ color: parent.color || DEFAULT_TAG_COLOR }}
                      >
                        #
                      </span>
                      <span className="flex-1 truncate text-sm">{parent.name}</span>
                    </Label>
                  )}
                  {/* 子タグ（インデント表示） */}
                  {children.map((child) => (
                    <Label
                      key={child.id}
                      htmlFor={`merge-target-${child.id}`}
                      className={cn(
                        'flex cursor-pointer items-center gap-4 rounded-lg py-2 pr-4 pl-8 transition-colors',
                        'hover:bg-state-hover',
                        selectedTargetId === child.id && 'bg-state-selected',
                      )}
                    >
                      <RadioGroupItem
                        value={child.id}
                        id={`merge-target-${child.id}`}
                        className="shrink-0"
                      />
                      <span
                        className="shrink-0 font-normal"
                        style={{ color: child.color || parent?.color || DEFAULT_TAG_COLOR }}
                      >
                        #
                      </span>
                      <span className="flex-1 truncate text-sm">{child.name}</span>
                    </Label>
                  ))}
                </div>
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
            {t('common.actions.cancel')}
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
