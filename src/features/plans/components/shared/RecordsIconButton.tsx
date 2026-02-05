'use client';

/**
 * Records紐付けアイコンボタン
 *
 * Plan Inspector の Row 3 で使用。
 * Record画面のPlan紐付けと同じUIパターン（Command/CommandList）。
 */

import { useMemo, useState } from 'react';

import { Clock, ExternalLink, Plus, Smile } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useTags } from '@/features/tags/hooks';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

interface RecordsIconButtonProps {
  planId: string;
  disabled?: boolean;
}

/**
 * 時間をフォーマット（分 → 時間:分）
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * 充実度スコアの色を取得
 */
function getScoreColor(score: number): string {
  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-lime-500',
    'text-green-500',
  ];
  return colors[score - 1] ?? 'text-muted-foreground';
}

export function RecordsIconButton({ planId, disabled = false }: RecordsIconButtonProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);

  const { data: records, isPending } = api.records.listByPlan.useQuery(
    { planId, sortOrder: 'desc' },
    { enabled: isOpen }, // Popoverが開いた時のみ取得
  );

  // タグデータ取得
  const { data: allTags = [] } = useTags();

  const recordCount = records?.length ?? 0;
  const hasRecords = recordCount > 0;

  // 合計時間を計算
  const totalMinutes = records?.reduce((sum, r) => sum + r.duration_minutes, 0) ?? 0;

  // 検索フィルタリング
  const filteredRecords = useMemo(() => {
    if (!records) return [];
    if (!searchQuery.trim()) return records;

    const query = searchQuery.toLowerCase();
    return records.filter((record) => {
      const title = record.title?.toLowerCase() ?? '';
      const note = record.note?.toLowerCase() ?? '';
      const date = record.worked_at.toLowerCase();
      return title.includes(query) || note.includes(query) || date.includes(query);
    });
  }, [records, searchQuery]);

  // 新しいRecordを作成（このPlanに紐づけて）
  // TODO: PlanInspectorのRecord作成モードでplanIdを事前選択できるようにする
  const handleCreateRecord = () => {
    setIsOpen(false);
    openInspectorWithDraft(undefined, 'record');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <HoverTooltip content={hasRecords ? `Records (${recordCount})` : 'Recordを追加'} side="top">
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'relative flex h-8 items-center gap-1 rounded-lg px-2 transition-colors',
              'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              hasRecords ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label={hasRecords ? `Records (${recordCount})` : 'Recordを追加'}
          >
            <Clock className="size-4" />
            {hasRecords && (
              <span className="text-sm tabular-nums">{formatDuration(totalMinutes)}</span>
            )}
          </button>
        </PopoverTrigger>
      </HoverTooltip>
      <PopoverContent
        className="w-[400px] p-0"
        align="start"
        side="bottom"
        sideOffset={8}
        style={{ zIndex: zIndex.overlayDropdown }}
      >
        {isPending ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Recordを検索..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="max-h-[280px]">
              {/* 合計時間サマリー */}
              {hasRecords && (
                <div className="bg-surface-container mx-2 my-2 flex items-center justify-between rounded-lg px-4 py-2">
                  <span className="text-muted-foreground text-xs">合計</span>
                  <span className="text-sm font-bold tabular-nums">
                    {formatDuration(totalMinutes)}
                  </span>
                </div>
              )}

              <CommandEmpty>Recordがありません</CommandEmpty>
              <CommandGroup>
                {filteredRecords.map((record) => {
                  const recordTags = record.tagIds
                    ?.map((id) => allTags.find((t) => t.id === id))
                    .filter(Boolean);
                  return (
                    <CommandItem
                      key={record.id}
                      value={record.id}
                      onSelect={() => {
                        setIsOpen(false);
                        window.location.href = `/${locale}/record?selected=${record.id}`;
                      }}
                      className="cursor-pointer"
                    >
                      {/* タイトル or (タイトルなし) */}
                      <span className="shrink truncate">
                        {record.title || (
                          <span className="text-muted-foreground">(タイトルなし)</span>
                        )}
                      </span>

                      {/* タグ */}
                      {recordTags && recordTags.length > 0 && (
                        <div className="flex shrink-0 gap-1 pl-2">
                          {recordTags.slice(0, 2).map((tag) => (
                            <span
                              key={tag!.id}
                              className="rounded px-1 py-1 text-xs"
                              style={{
                                backgroundColor: tag!.color ? `${tag!.color}20` : undefined,
                                color: tag!.color || undefined,
                              }}
                            >
                              {tag!.name}
                            </span>
                          ))}
                          {recordTags.length > 2 && (
                            <span className="text-muted-foreground text-xs">
                              +{recordTags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* メタ情報: 日付 + 時間 + 充実度 */}
                      <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
                        <span className="text-muted-foreground text-xs">{record.worked_at}</span>
                        <span className="text-xs tabular-nums">
                          {formatDuration(record.duration_minutes)}
                        </span>
                        {record.fulfillment_score && (
                          <Smile
                            className={cn('size-4', getScoreColor(record.fulfillment_score))}
                          />
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>

            {/* 新規作成ボタン */}
            <div className="border-border border-t p-2">
              <button
                type="button"
                onClick={handleCreateRecord}
                className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors"
              >
                <Plus className="size-4" />
                <span>作業ログを追加</span>
              </button>

              {/* Record一覧ページへのナビゲーション */}
              {hasRecords && (
                <Link
                  href={`/${locale}/record`}
                  className="text-muted-foreground hover:text-foreground hover:bg-state-hover mt-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors"
                >
                  <ExternalLink className="size-4" />
                  <span>Record一覧を開く</span>
                </Link>
              )}
            </div>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
