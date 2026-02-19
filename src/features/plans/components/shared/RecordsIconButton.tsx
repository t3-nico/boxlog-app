'use client';

/**
 * Records紐付けアイコンボタン
 *
 * Plan Inspector の Row 3 で使用。
 * Record Inspector の Plan紐付けと同じUIパターン（アイコン + 名前インライン表示）。
 */

import { useMemo, useState } from 'react';

import { ListChecks, Plus } from 'lucide-react';
import { useLocale } from 'next-intl';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
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

export function RecordsIconButton({ planId, disabled = false }: RecordsIconButtonProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);

  const { data: records, isPending } = api.records.listByPlan.useQuery({
    planId,
    sortOrder: 'desc',
  });

  // タグデータ取得
  const { data: allTags = [] } = useTags();

  const recordCount = records?.length ?? 0;
  const hasRecords = recordCount > 0;

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
  const handleCreateRecord = () => {
    setIsOpen(false);
    openInspectorWithDraft({ plan_id: planId }, 'record');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <HoverTooltip content={hasRecords ? `Records (${recordCount})` : 'Recordを追加'} side="top">
        <div
          className={cn(
            'hover:bg-state-hover flex h-8 items-center rounded-lg transition-colors',
            hasRecords ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="focus-visible:ring-ring flex items-center gap-1 px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              aria-label={hasRecords ? `Records (${recordCount})` : 'Recordを追加'}
            >
              <ListChecks className="size-4 shrink-0" />
              {hasRecords &&
                records?.map((record) => (
                  <span key={record.id} className="max-w-24 truncate text-xs">
                    {record.title || '(タイトルなし)'}
                  </span>
                ))}
            </button>
          </PopoverTrigger>
        </div>
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
            <Spinner size="sm" />
          </div>
        ) : (
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Recordを検索..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="max-h-[280px]">
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

                      {/* 日付 */}
                      <span className="text-muted-foreground ml-auto shrink-0 pl-2 text-xs">
                        {record.worked_at}
                      </span>
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
            </div>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
