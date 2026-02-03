'use client';

import { Hash, Loader2, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * タグアイテムの型定義
 */
export interface TagItem {
  id: string;
  name: string;
  color?: string | null;
}

interface BulkTagSelectDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean;
  /** 開閉状態を変更するコールバック */
  onOpenChange: (open: boolean) => void;
  /** 選択されたアイテム数 */
  selectedItemCount: number;
  /** 利用可能なタグ一覧 */
  tags: TagItem[];
  /** タグ追加時のコールバック */
  onAddTags: (tagIds: string[]) => Promise<void>;
  /** タイトル */
  title?: string;
  /** 説明文（{count}プレースホルダーを含む） */
  description?: string;
}

/**
 * 汎用タグ一括追加ダイアログ
 *
 * 選択された複数のアイテムに対してタグを一括で追加
 * - タグ検索機能
 * - 複数タグ選択
 *
 * @example
 * ```tsx
 * <BulkTagSelectDialog
 *   open={showTagDialog}
 *   onOpenChange={setShowTagDialog}
 *   selectedItemCount={selectedIds.length}
 *   tags={tagsData ?? []}
 *   onAddTags={async (tagIds) => {
 *     await bulkAddTags.mutateAsync({
 *       planIds: selectedIds,
 *       tagIds,
 *     });
 *   }}
 * />
 * ```
 */
export function BulkTagSelectDialog({
  open,
  onOpenChange,
  selectedItemCount,
  tags,
  onAddTags,
  title,
  description,
}: BulkTagSelectDialogProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogTitle = title ?? t('common.plan.bulkAddTags');
  const dialogDescription =
    description ?? t('common.plan.bulkAddTagsDescription', { count: selectedItemCount });

  // 検索フィルタリング
  const filteredTags = useMemo(() => {
    if (!searchQuery) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tags, searchQuery]);

  // タグの選択/解除
  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  // 送信ハンドラー
  const handleSubmit = async () => {
    if (selectedTagIds.length === 0) return;

    setIsSubmitting(true);
    try {
      await onAddTags(selectedTagIds);
      handleClose();
    } catch (error) {
      console.error('Bulk tag add error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ダイアログを閉じる際にリセット
  const handleClose = () => {
    setSearchQuery('');
    setSelectedTagIds([]);
    onOpenChange(false);
  };

  // ダイアログが閉じた時にリセット
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSelectedTagIds([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 検索バー */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t('common.plan.searchTags')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 選択されたタグのプレビュー */}
          {selectedTagIds.length > 0 && (
            <div className="bg-surface-container rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {selectedTagIds.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <div
                      key={tagId}
                      className="bg-background flex items-center gap-1 rounded-lg border px-2 py-1 text-sm"
                    >
                      <Hash className="h-3 w-3" style={{ color: tag.color || '#3B82F6' }} />
                      <span>{tag.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleTag(tagId)}
                        className="text-muted-foreground hover:text-foreground ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* タグリスト */}
          <ScrollArea className="h-64">
            {filteredTags.length === 0 ? (
              <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
                {searchQuery ? t('common.plan.noTagsFound') : t('common.plan.noTags')}
              </div>
            ) : (
              <div className="space-y-1 pr-4">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.id)}
                      className={`flex w-full items-center gap-4 rounded-lg px-4 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary-state-selected text-foreground'
                          : 'hover:bg-state-hover text-muted-foreground'
                      }`}
                    >
                      <Checkbox checked={isSelected} className="pointer-events-none" />
                      <Hash
                        className="h-4 w-4 shrink-0"
                        style={{ color: tag.color || '#3B82F6' }}
                      />
                      <span className="flex-1 truncate">{tag.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t('common.plan.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedTagIds.length === 0}
            className="w-full sm:w-auto sm:flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t('common.plan.processing')}
              </>
            ) : (
              t('common.plan.addTags')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
