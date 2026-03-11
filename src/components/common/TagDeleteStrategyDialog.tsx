'use client';

/**
 * タグ削除ストラテジーダイアログ
 *
 * タグに紐づくエントリがある場合に表示。
 * - エントリも一緒に削除する
 * - 別のタグに付け替える
 * の2択をユーザーに選ばせる。
 */

import { useCallback, useMemo, useState } from 'react';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { Tag } from '@/core/types/tag';
import { getTagColorClasses } from '@/lib/tag-colors';
import { cn } from '@/lib/utils';
import type { TagDeleteStrategy } from '@/server/services/tags/tag-service';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TagDeleteStrategyDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (strategy: TagDeleteStrategy, targetTagId?: string) => Promise<void>;
  tagName: string;
  entryCount: number;
  availableTags: Tag[];
}

export function TagDeleteStrategyDialog({
  open,
  onClose,
  onConfirm,
  tagName,
  entryCount,
  availableTags,
}: TagDeleteStrategyDialogProps) {
  const t = useTranslations('tags');

  const [strategy, setStrategy] = useState<TagDeleteStrategy>('delete_entries');
  const [targetTagId, setTargetTagId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ダイアログが開くたびにリセット（React推奨: レンダー中のstate調整）
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStrategy('delete_entries');
      setTargetTagId(null);
      setSearchQuery('');
    }
  }

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return availableTags;
    const query = searchQuery.toLowerCase();
    return availableTags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [availableTags, searchQuery]);

  const handleConfirm = useCallback(async () => {
    await onConfirm(strategy, targetTagId ?? undefined);
  }, [onConfirm, strategy, targetTagId]);

  const isConfirmDisabled = strategy === 'reassign' && !targetTagId;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={t('delete.confirmTitleWithName', { name: tagName })}
      variant="destructive"
      confirmDisabled={isConfirmDisabled}
    >
      <div className="space-y-4">
        {/* エントリ件数 */}
        <p className="text-muted-foreground text-sm">
          {t('deleteStrategy.usedByEntries', { count: entryCount })}
        </p>

        {/* ストラテジー選択 */}
        <RadioGroup
          value={strategy}
          onValueChange={(value) => setStrategy(value as TagDeleteStrategy)}
          className="space-y-2"
        >
          <label htmlFor="strategy-delete" className="flex cursor-pointer items-center gap-4">
            <RadioGroupItem value="delete_entries" id="strategy-delete" />
            <span className="text-sm">{t('deleteStrategy.deleteEntries')}</span>
          </label>
          <label htmlFor="strategy-reassign" className="flex cursor-pointer items-center gap-4">
            <RadioGroupItem value="reassign" id="strategy-reassign" />
            <span className="text-sm">{t('deleteStrategy.reassign')}</span>
          </label>
        </RadioGroup>

        {/* 付け替え先タグ選択（reassign 時のみ） */}
        {strategy === 'reassign' && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              {t('deleteStrategy.selectTarget')}
            </p>

            {/* 検索 */}
            {availableTags.length > 5 && (
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('deleteStrategy.searchTags')}
                  className="pl-9"
                />
              </div>
            )}

            {/* タグリスト */}
            <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-lg border p-1">
              {filteredTags.map((tag) => {
                const colorClasses = getTagColorClasses(tag.color);
                const isSelected = targetTagId === tag.id;

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setTargetTagId(tag.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                      isSelected
                        ? 'bg-state-selected text-foreground'
                        : 'hover:bg-state-hover text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block size-3 flex-shrink-0 rounded-full',
                        colorClasses.dot,
                      )}
                    />
                    <span className="truncate">{tag.name}</span>
                  </button>
                );
              })}
              {filteredTags.length === 0 && (
                <p className="text-muted-foreground px-3 py-2 text-center text-xs">
                  {t('page.noTags')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}
