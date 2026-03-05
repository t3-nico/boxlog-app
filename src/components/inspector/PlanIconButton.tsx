'use client';

/**
 * Plan紐付けアイコンボタン
 *
 * Record Inspector の Row 3 で使用。
 * RecordsIconButton と同じ Popover + 左インジケータパターンで Plan を選択。
 * Record→Plan は単一選択のため、ラジオ風（rounded-full）インジケータを使用。
 */

import { useCallback, useMemo, useState } from 'react';

import { Check, FolderOpen, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useEntries } from '@/hooks/useEntries';
import { useEntryMutations } from '@/hooks/useEntryMutations';
import { useTags } from '@/hooks/useTagsQuery';
import { cn } from '@/lib/utils';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';

/** コールバックに渡す Plan の最小型（タイトル・タグの自動プリセット用） */
interface PlanForCallback {
  title: string;
  tagIds?: string[];
}

interface PlanIconButtonProps {
  planId: string | null;
  onPlanChange: (planId: string | null, plan?: PlanForCallback) => void;
  /** Plan作成後に自動紐付けするRecord ID */
  recordId?: string | null;
  /** Plan Inspector を開く前の前処理（Record Inspector を閉じるなど） */
  onBeforeCreatePlan?: () => void;
  disabled?: boolean;
}

export function PlanIconButton({
  planId,
  onPlanChange,
  onBeforeCreatePlan,
  disabled = false,
}: PlanIconButtonProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const openInspector = useEntryInspectorStore((state) => state.openInspector);
  const { createEntry } = useEntryMutations();

  // Plan一覧（キャッシュ済み）
  const { data: plans } = useEntries({});

  // タグデータ取得
  const { data: allTags = [] } = useTags();

  // 選択中のPlan名
  const selectedPlanName = useMemo(() => {
    if (!planId || !plans) return null;
    const plan = plans.find((p) => p.id === planId);
    return plan?.title ?? null;
  }, [planId, plans]);

  const hasPlan = !!planId;

  // ソート: 選択中を先頭 → updated_at 降順 → 検索フィルタ
  const sortedPlans = useMemo(() => {
    if (!plans) return [];
    const filtered = searchQuery.trim()
      ? plans.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : plans;
    return [...filtered].sort((a, b) => {
      if (a.id === planId && b.id !== planId) return -1;
      if (a.id !== planId && b.id === planId) return 1;
      return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    });
  }, [plans, planId, searchQuery]);

  // Plan選択/解除
  const handleSelect = useCallback(
    (plan: (typeof sortedPlans)[number]) => {
      const newPlanId = plan.id === planId ? null : plan.id;
      onPlanChange(newPlanId, newPlanId ? plan : undefined);
      setIsOpen(false);
      setSearchQuery('');
    },
    [planId, onPlanChange],
  );

  // 解除ボタン
  const handleUnlink = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPlanChange(null);
    },
    [onPlanChange],
  );

  // 新しいPlanを作成（即DB保存 + Inspector edit mode）
  const handleCreatePlan = useCallback(async () => {
    setIsOpen(false);
    onBeforeCreatePlan?.();
    const result = await createEntry.mutateAsync({ title: '' });
    if (result?.id) {
      openInspector(result.id);
    }
  }, [onBeforeCreatePlan, createEntry, openInspector]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div
        className={cn(
          'hover:bg-state-hover flex h-8 items-center rounded-lg transition-colors',
          hasPlan ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <HoverTooltip
          content={selectedPlanName ?? t('plan.inspector.recordCreate.linkPlan')}
          side="top"
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="focus-visible:ring-ring flex items-center gap-1 px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              aria-label={t('plan.inspector.recordCreate.linkPlan')}
            >
              <FolderOpen className="size-4" />
              {hasPlan && selectedPlanName && (
                <span className="max-w-20 truncate text-xs">{selectedPlanName}</span>
              )}
            </button>
          </PopoverTrigger>
        </HoverTooltip>
        {hasPlan && !disabled && (
          <button
            type="button"
            onClick={handleUnlink}
            className="hover:bg-state-hover mr-1 rounded p-1 transition-colors"
            aria-label={t('plan.inspector.recordCreate.unlinkPlan')}
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <PopoverContent
        className="z-overlay-popover w-[400px] p-0"
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('plan.inspector.recordCreate.searchPlan')}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-[280px]">
            <CommandEmpty>{t('plan.inspector.recordCreate.noPlans')}</CommandEmpty>
            <CommandGroup>
              {sortedPlans.map((plan) => {
                const isSelected = plan.id === planId;
                const planTag = plan.tagId ? allTags.find((tag) => tag.id === plan.tagId) : null;
                return (
                  <CommandItem
                    key={plan.id}
                    value={plan.id}
                    onSelect={() => handleSelect(plan)}
                    className="cursor-pointer"
                  >
                    {/* ラジオインジケータ（単一選択: rounded-full） */}
                    <div
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-full border',
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30',
                      )}
                    >
                      {isSelected && <Check className="size-3 text-white" />}
                    </div>
                    <span className="shrink truncate">
                      {plan.title || (
                        <span className="text-muted-foreground">{t('plan.inspector.noTitle')}</span>
                      )}
                    </span>
                    {planTag && (
                      <div className="flex shrink-0 gap-1 pl-2">
                        <span
                          className="rounded px-1 py-1 text-xs"
                          style={{
                            backgroundColor: planTag.color ? `${planTag.color}20` : undefined,
                            color: planTag.color || undefined,
                          }}
                        >
                          {planTag.name}
                        </span>
                      </div>
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
              onClick={handleCreatePlan}
              className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors"
            >
              <Plus className="size-4" />
              <span>{t('plan.inspector.recordCreate.addNewPlan')}</span>
            </button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
