'use client';

/**
 * Records紐付けアイコンボタン
 *
 * Plan Inspector の Row 3 で使用。
 * TagsIconButton と同じ Badge + X パターンで Record を表示。
 * Popover では未紐付き Record を検索・選択して紐付ける。
 */

import { useCallback, useMemo, useState } from 'react';

import { Check, ListChecks, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

interface RecordsIconButtonProps {
  planId: string;
  disabled?: boolean;
}

export function RecordsIconButton({ planId, disabled = false }: RecordsIconButtonProps) {
  const t = useTranslations();
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);

  // 紐付き Record（Badge 表示用）
  const { data: records, status: listByPlanStatus } = api.records.listByPlan.useQuery({
    planId,
    sortOrder: 'desc',
  });

  // DEBUG: listByPlan クエリ結果を確認
  logger.debug('[RecordsIconButton] listByPlan result', {
    planId,
    status: listByPlanStatus,
    recordCount: records?.length ?? 0,
    records: records?.map((r) => ({ id: r.id, title: r.title })),
  });

  // 全 Record（Popover 候補用）
  const { data: allRecords, isPending: isAllRecordsPending } = api.records.list.useQuery(
    {},
    { enabled: isOpen },
  );

  // タグデータ取得
  const { data: allTags = [] } = useTags();

  // 紐付き Record の ID セット
  const linkedRecordIds = useMemo(() => new Set(records?.map((r) => r.id) ?? []), [records]);

  // 検索フィルタ関数
  const matchesQuery = useCallback(
    (r: { title?: string | null; worked_at: string }) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (r.title?.toLowerCase() ?? '').includes(q) || r.worked_at.toLowerCase().includes(q);
    },
    [searchQuery],
  );

  // Popover 内: 全 Record（紐付き済みを先頭にソート + 検索フィルタ適用）
  const sortedRecords = useMemo(() => {
    if (!allRecords) return [];
    const filtered = allRecords.filter(matchesQuery);
    return [...filtered].sort((a, b) => {
      const aLinked = linkedRecordIds.has(a.id);
      const bLinked = linkedRecordIds.has(b.id);
      if (aLinked && !bLinked) return -1;
      if (!aLinked && bLinked) return 1;
      return 0;
    });
  }, [allRecords, linkedRecordIds, matchesQuery]);

  // Record を Plan に紐付け
  const linkRecord = api.records.update.useMutation({
    onSuccess: (data) => {
      logger.debug('[RecordsIconButton] linkRecord success', { data });
    },
    onError: (error) => {
      logger.error('[RecordsIconButton] linkRecord error', { error: error.message });
    },
    onSettled: () => {
      void utils.records.listByPlan.invalidate({ planId });
      void utils.records.list.invalidate(undefined, { refetchType: 'all' });
      void utils.plans.getCumulativeTime.invalidate();
    },
  });

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

  const handleLinkRecord = (recordId: string) => {
    logger.debug('[RecordsIconButton] handleLinkRecord called', { recordId, planId });
    linkRecord.mutate({ id: recordId, data: { plan_id: planId } });
  };

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
          <span className="max-w-20 truncate">{record.title || t('plan.inspector.noTitle')}</span>
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUnlinkRecord(record.id);
              }}
              className="hover:bg-state-hover text-muted-foreground hover:text-foreground -mr-1 rounded p-0.5 transition-colors"
              aria-label={t('plan.inspector.records.unlink')}
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}

      {/* Record 選択ボタン（Popover） */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <HoverTooltip content={t('plan.inspector.records.link')} side="top">
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg transition-colors',
                'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                'text-muted-foreground hover:text-foreground',
              )}
              aria-label={t('plan.inspector.records.link')}
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
          {isAllRecordsPending ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : (
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={t('plan.inspector.records.search')}
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList className="max-h-[280px]">
                <CommandEmpty>{t('plan.inspector.records.noMatch')}</CommandEmpty>
                <CommandGroup>
                  {sortedRecords.map((record) => {
                    const isLinked = linkedRecordIds.has(record.id);
                    const recordTags = record.tagIds
                      ?.map((id) => allTags.find((t) => t.id === id))
                      .filter(Boolean);
                    return (
                      <CommandItem
                        key={record.id}
                        value={record.id}
                        onSelect={() =>
                          isLinked ? handleUnlinkRecord(record.id) : handleLinkRecord(record.id)
                        }
                        className="cursor-pointer"
                      >
                        {/* チェックボックスインジケータ（TagSelectCombobox準拠） */}
                        <div
                          className={cn(
                            'flex size-4 shrink-0 items-center justify-center rounded border',
                            isLinked ? 'border-primary bg-primary' : 'border-muted-foreground/30',
                          )}
                        >
                          {isLinked && <Check className="size-3 text-white" />}
                        </div>
                        <span className="shrink truncate">
                          {record.title || (
                            <span className="text-muted-foreground">
                              {t('plan.inspector.noTitle')}
                            </span>
                          )}
                        </span>
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
                  <span>{t('plan.inspector.records.addNew')}</span>
                </button>
              </div>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
