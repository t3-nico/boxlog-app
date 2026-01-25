'use client';

/**
 * タグマージページ - フルページ表示
 *
 * 直接 /tags/merge/[id] にアクセスした場合のフォールバック
 * Intercepting Route がない場合（直リンク、リロード）に表示される
 *
 * [id] はマージ元（消える側）のタグID
 * 完了後は /calendar へリダイレクト
 */

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useMergeTag, useTags } from '@/features/tags/hooks';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

export default function TagMergePage() {
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
    router.push('/calendar');
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-4 w-full" />
            <Skeleton className="mb-2 h-10 w-full" />
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sourceTag) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('common.error')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('tags.error.notFound')}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleClose}>{t('common.actions.goBack')}</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('calendar.filter.mergeTag.title')}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {selectedTarget ? confirmationMessage : t('calendar.filter.mergeTag.selectTarget')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 検索ボックス */}
          <Input
            type="text"
            placeholder={t('calendar.filter.mergeTag.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                    <span
                      className="shrink-0 font-normal"
                      style={{ color: tag.color || '#3B82F6' }}
                    >
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
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
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
        </CardFooter>
      </Card>
    </div>
  );
}
