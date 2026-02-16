'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  BarChart3,
  Calendar,
  CheckSquare,
  Clock,
  Filter,
  Moon,
  Navigation,
  Plus,
  Settings,
  Sun,
  Tag,
  Zap,
} from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/contexts/theme-context';
import { usePlans } from '@/features/plans/hooks';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useSettingsModalStore } from '@/features/settings/stores/useSettingsModalStore';
import { useTagModalNavigation } from '@/features/tags/hooks/useTagModalNavigation';
import { useTagStore } from '@/features/tags/stores/useTagStore';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import type { PlanStatus } from '@/features/plans/types';
import { useRecentPlans } from '../hooks/useRecentPlans';
import { useSearchHistory } from '../hooks/useSearch';
import { commandRegistry, registerDefaultCommands } from '../lib/command-registry';
import { HighlightedText } from '../lib/highlight-text';
import { getFilterHints, parseSearchQuery } from '../lib/query-parser';

// APIレスポンスの型（tagIdsのみ）
type PlanFromAPI = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: PlanStatus;
  start_time: string | null;
  end_time: string | null;
  plan_number: string;
  recurrence_type: string | null;
  recurrence_end_date: string | null;
  recurrence_rule: string | null;
  reminder_minutes: number | null;
  created_at: string | null;
  updated_at: string | null;
  tagIds?: string[];
};

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Category icon mapping
const categoryIcons: Record<string, React.ElementType> = {
  navigation: Navigation,
  create: Plus,
  actions: Zap,
  plans: CheckSquare,
  tags: Tag,
};

// Icon name to component mapping
const iconNameMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  'bar-chart': BarChart3,
  tag: Tag,
  plus: Plus,
  settings: Settings,
  moon: Moon,
  sun: Sun,
  'check-square': CheckSquare,
};

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { history, addToHistory } = useSearchHistory();
  const { recentPlans, addRecentPlan } = useRecentPlans();
  const [query, setQuery] = useState('');

  // Parse query for active filters
  const parsedQuery = useMemo(() => parseSearchQuery(query), [query]);
  const filterHints = useMemo(() => getFilterHints(), []);

  // Get data from stores - only fetch when modal is open to prevent 401 errors on unauthenticated pages
  const { data: plans = [] } = usePlans(undefined, { enabled: isOpen });
  const tags = useTagStore((state) => state.tags);

  // Get actions from stores
  const openPlanInspector = usePlanInspectorStore((state) => state.openInspector);
  const { openTagCreateModal } = useTagModalNavigation();
  const { resolvedTheme, setTheme } = useTheme();
  const openSettingsModal = useSettingsModalStore((state) => state.openModal);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const navigateToSettings = useCallback(() => {
    openSettingsModal('general');
  }, [openSettingsModal]);

  // Register default commands on mount
  useEffect(() => {
    registerDefaultCommands({
      router,
      openPlanInspector,
      openTagCreateModal,
      navigateToSettings,
      toggleTheme,
    });
  }, [router, openPlanInspector, openTagCreateModal, navigateToSettings, toggleTheme]);

  // Reset query when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Get commands from registry
  const commands = useMemo(() => {
    return commandRegistry.getAvailable();
  }, []);

  // Group commands by category
  const commandsByCategory = useMemo(() => {
    const groups: Record<string, typeof commands> = {};
    commands.forEach((command) => {
      const category = command.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category]!.push(command);
    });
    return groups;
  }, [commands]);

  // Convert and filter plans
  const filteredPlans = useMemo(() => {
    // タグIDからタグ情報を解決してconvertedに含める
    const converted = (plans as unknown as PlanFromAPI[]).map((plan) => {
      const planTagIds = plan.tagIds ?? [];
      const resolvedTags = planTagIds
        .map((tagId) => tags.find((t) => t.id === tagId))
        .filter((tag): tag is (typeof tags)[0] => tag !== undefined);
      return {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        status: plan.status,
        plan_number: plan.plan_number,
        tags: resolvedTags,
      };
    });

    // Apply custom filters from parsed query
    let filtered = converted;

    if (parsedQuery.filters.status && parsedQuery.filters.status.length > 0) {
      filtered = filtered.filter((plan) => parsedQuery.filters.status!.includes(plan.status));
    }

    if (parsedQuery.filters.tags && parsedQuery.filters.tags.length > 0) {
      filtered = filtered.filter((plan) =>
        parsedQuery.filters.tags!.some((filterTag) =>
          plan.tags?.some((planTag) =>
            planTag.name.toLowerCase().includes(filterTag.toLowerCase()),
          ),
        ),
      );
    }

    return filtered;
  }, [plans, tags, parsedQuery.filters]);

  // Get group label
  const getGroupLabel = (key: string): string => {
    const labels: Record<string, string> = {
      navigation: 'ナビゲーション',
      create: '作成',
      actions: 'アクション',
    };
    return labels[key] || key;
  };

  // Handle command selection
  const handleCommandSelect = useCallback(
    async (commandId: string) => {
      if (query) {
        addToHistory(query);
      }
      onClose();

      const command = commandRegistry.get(commandId);
      if (command?.action) {
        await command.action();
      }
    },
    [query, addToHistory, onClose],
  );

  // Handle plan selection
  const handlePlanSelect = useCallback(
    (planId: string, title: string) => {
      if (query) {
        addToHistory(query);
      }
      addRecentPlan(planId, title);
      onClose();
      router.push(`/plan?plan=${planId}`);
    },
    [query, addToHistory, addRecentPlan, router, onClose],
  );

  // Handle tag selection
  const handleTagSelect = useCallback(
    (tagId: string) => {
      if (query) {
        addToHistory(query);
      }
      onClose();
      router.push(`/tags/${tagId}`);
    },
    [query, addToHistory, router, onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[42rem] overflow-hidden p-0" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>グローバル検索</DialogTitle>
        </VisuallyHidden>
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground !rounded-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2">
          <div className="relative">
            <CommandInput
              placeholder="検索... (コマンド、プラン、タグ)"
              value={query}
              onValueChange={setQuery}
            />
            {/* ESCバッジ（PCのみ表示） */}
            <div className="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-1 md:flex">
              <kbd className="bg-surface-container text-muted-foreground inline-flex h-6 items-center gap-1 rounded border px-2 font-mono text-xs font-normal opacity-100 select-none">
                ESC
              </kbd>
            </div>
          </div>
          <CommandList className="max-h-[30rem]">
            <CommandEmpty>結果が見つかりませんでした</CommandEmpty>

            {/* Active Filters Indicator */}
            {parsedQuery.hasFilters && (
              <div className="border-border flex items-center gap-2 border-b px-4 py-2">
                <Filter className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-xs">フィルター適用中:</span>
                {parsedQuery.filters.status && (
                  <span className="bg-state-active text-state-active-foreground rounded px-2 py-1 text-xs">
                    status: {parsedQuery.filters.status.join(', ')}
                  </span>
                )}
                {parsedQuery.filters.tags && (
                  <span className="bg-state-active text-state-active-foreground rounded px-2 py-1 text-xs">
                    #{parsedQuery.filters.tags.join(', #')}
                  </span>
                )}
              </div>
            )}

            {/* Filter Hints (shown on empty query) */}
            {query === '' && (
              <CommandGroup heading="クイックフィルター">
                {filterHints.slice(0, 4).map((hint) => (
                  <CommandItem
                    key={hint.syntax}
                    onSelect={() => setQuery(hint.syntax + ' ')}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4 shrink-0" />
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <code className="bg-surface-container rounded px-2 py-1 text-xs">
                        {hint.syntax}
                      </code>
                      <span className="text-muted-foreground text-xs">{hint.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Recent Searches */}
            {history.length > 0 && query === '' && (
              <>
                <CommandGroup heading="最近の検索">
                  {history.slice(0, 5).map((item) => (
                    <CommandItem key={`history-${item}`} onSelect={() => setQuery(item)}>
                      <Clock className="mr-2 h-4 w-4" />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Recent Plans */}
            {recentPlans.length > 0 && query === '' && (
              <>
                <CommandGroup heading="最近使ったプラン">
                  {recentPlans.map((plan) => (
                    <CommandItem
                      key={`recent-plan-${plan.id}`}
                      onSelect={() => handlePlanSelect(plan.id, plan.title)}
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      {plan.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Commands by Category */}
            {Object.entries(commandsByCategory).map(([category, categoryCommands]) => (
              <CommandGroup key={category} heading={getGroupLabel(category)}>
                {categoryCommands.map((command) => {
                  const IconComponent = command.icon
                    ? iconNameMap[command.icon] || categoryIcons[category] || Zap
                    : categoryIcons[category] || Zap;

                  return (
                    <CommandItem
                      key={command.id}
                      value={`${command.title} ${command.description || ''} ${command.keywords?.join(' ') || ''}`}
                      onSelect={() => handleCommandSelect(command.id)}
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="h-4 w-4 shrink-0" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">
                          <HighlightedText text={command.title} query={parsedQuery.text} />
                        </span>
                        {command.description && (
                          <span className="text-muted-foreground truncate text-xs">
                            <HighlightedText text={command.description} query={parsedQuery.text} />
                          </span>
                        )}
                      </div>
                      {command.shortcut && command.shortcut.length > 0 && (
                        <div className="hidden shrink-0 items-center gap-1 md:flex">
                          {command.shortcut.map((key, index) => (
                            <kbd
                              key={index}
                              className="bg-surface-container text-muted-foreground inline-flex h-6 min-w-6 items-center justify-center rounded border px-2 font-mono text-xs font-normal"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}

            {/* Plans */}
            {filteredPlans.length > 0 && (
              <CommandGroup heading="プラン">
                {filteredPlans.slice(0, 10).map((plan) => (
                  <CommandItem
                    key={`plan-${plan.id}`}
                    value={`${plan.title} ${plan.description || ''} ${plan.tags.map((t) => t.name).join(' ')}`}
                    onSelect={() => handlePlanSelect(plan.id, plan.title)}
                    className="flex items-center gap-2"
                  >
                    <CheckSquare className="h-4 w-4 shrink-0" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">
                        <HighlightedText text={plan.title} query={parsedQuery.text} />
                      </span>
                      {plan.description && (
                        <span className="text-muted-foreground truncate text-xs">
                          <HighlightedText text={plan.description} query={parsedQuery.text} />
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <CommandGroup heading="タグ">
                {tags.slice(0, 10).map((tag) => (
                  <CommandItem
                    key={`tag-${tag.id}`}
                    value={`${tag.name} ${tag.description || ''}`}
                    onSelect={() => handleTagSelect(tag.id)}
                    className="flex items-center gap-2"
                  >
                    <Tag className="h-4 w-4 shrink-0" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">
                        <HighlightedText text={tag.name} query={parsedQuery.text} />
                      </span>
                      {tag.description && (
                        <span className="text-muted-foreground truncate text-xs">
                          <HighlightedText text={tag.description} query={parsedQuery.text} />
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
