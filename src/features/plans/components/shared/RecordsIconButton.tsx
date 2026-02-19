'use client';

/**
 * Records紐付けアイコンボタン
 *
 * Plan Inspector の Row 3 で使用。
 * TagsIconButton と同じ Badge + X パターンで Record を表示。
 */

import { useMemo, useState } from 'react';

import { ListChecks, Plus, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);

  const { data: records, isPending } = api.records.listByPlan.useQuery({
    planId,
    sortOrder: 'desc',
  });

  // タグデータ取得
  const { data: allTags = [] } = useTags();

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

  // Record の plan_id を null にして紐付け解除
  const unlinkRecord = api.records.update.useMutation({
    onMutate: async ({ id }) => {
      await utils.records.listByPlan.cancel({ planId });
      const previous = utils.records.listByPlan.getData({ planId, sortOrder: 'desc' });

      utils.records.listByPlan.setData({ planId, sortOrder: 'desc' }, (old) => {
        if (!old) return old;
        return old.filter((r) => r.id !== id);
      });

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        utils.records.listByPlan.setData({ planId, sortOrder: 'desc' }, context.previous);
      }
    },
    onSettled: () => {
      void utils.records.listByPlan.invalidate({ planId });
      void utils.records.list.invalidate(undefined, { refetchType: 'all' });
      void utils.plans.getCumulativeTime.invalidate();
    },
  });

  const handleUnlinkRecord = (recordId: string) => {
    unlinkRecord.mutate({ id: recordId, data: { plan_id: null } });
  };

  // 新しいRecordを作成（このPlanに紐づけて）
  const handleCreateRecord = () => {
    setIsOpen(false);
    openInspectorWithDraft({ plan_id: planId }, 'record');
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* 紐付き Record（Badge 表示） */}
      {records?.map((record) => (
        <Badge
          key={record.id}
          variant="outline"
          className="h-7 gap-1 bg-transparent text-xs font-normal"
        >
          <span className="max-w-20 truncate">{record.title || '(タイトルなし)'}</span>
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUnlinkRecord(record.id);
              }}
              className="hover:bg-state-hover text-muted-foreground hover:text-foreground -mr-1 rounded p-0.5 transition-colors"
              aria-label="Record紐付けを解除"
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}

      {/* Record 追加ボタン（Popover） */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <HoverTooltip content="Recordを追加" side="top">
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg transition-colors',
                'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                'text-muted-foreground hover:text-foreground',
              )}
              aria-label="Recordを追加"
            >
              <ListChecks className="size-4" />
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
                <CommandEmpty>一致するRecordがありません</CommandEmpty>
                <CommandGroup>
                  {filteredRecords.map((record) => {
                    const recordTags = record.tagIds
                      ?.map((id) => allTags.find((t) => t.id === id))
                      .filter(Boolean);
                    return (
                      <CommandItem key={record.id} value={record.id}>
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

                        {/* 紐付け解除 */}
                        {!disabled && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlinkRecord(record.id);
                            }}
                            className="hover:bg-state-hover text-muted-foreground hover:text-foreground shrink-0 rounded p-1 transition-colors"
                            aria-label="Record紐付けを解除"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
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
    </div>
  );
}
