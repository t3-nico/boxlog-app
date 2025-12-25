'use client';

import { useCallback, useMemo, useState } from 'react';

import { CheckSquare, Search, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePlans } from '@/features/plans/hooks';
import { useTagStore } from '@/features/tags/stores/useTagStore';
import { cn } from '@/lib/utils';

import { useSearchHistory } from '../hooks/use-search';
import { FuzzySearch } from '../lib/search-engine';
import type { SearchResultType } from '../types';

// Helper function to get tags from plan_tags
type PlanFromAPI = {
  id: string;
  title: string;
  description: string | null;
  plan_tags?: Array<{
    tag_id: string;
    tags: { id: string; name: string; color: string } | null;
  }>;
  [key: string]: unknown;
};

function getTagsFromPlan(plan: PlanFromAPI): Array<{ id: string; name: string; color: string }> {
  if (!plan.plan_tags) return [];
  return plan.plan_tags
    .map((pt) => pt.tags)
    .filter((tag): tag is { id: string; name: string; color: string } => tag !== null);
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  types?: SearchResultType[];
  onResultSelect?: (id: string, type: SearchResultType) => void;
}

export function SearchBar({
  className,
  placeholder = 'プランやタグを検索...',
  types = ['plan', 'tag'],
  onResultSelect,
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { addToHistory } = useSearchHistory();

  // Get data from stores
  const { data: plans = [] } = usePlans();
  const tags = useTagStore((state) => state.tags);

  // Convert plans to searchable format
  const searchablePlans = useMemo(() => {
    return (plans as unknown as PlanFromAPI[]).map((plan) => {
      const planTags = getTagsFromPlan(plan);
      return {
        ...plan,
        title: plan.title,
        description: plan.description || '',
        keywords: planTags.map((t) => t.name),
        tags: planTags,
      };
    });
  }, [plans]);

  // Filter data by types and query
  const filteredPlans =
    types.includes('plan') && query
      ? FuzzySearch.search(searchablePlans, query, 5)
      : types.includes('plan')
        ? searchablePlans.slice(0, 5)
        : [];

  const filteredTags =
    types.includes('tag') && query
      ? FuzzySearch.search(
          tags.map((tag) => ({
            ...tag,
            title: tag.name,
            description: tag.description || '',
            keywords: [tag.name, tag.description].filter(Boolean) as string[],
          })),
          query,
          5,
        )
      : types.includes('tag')
        ? tags.slice(0, 5)
        : [];

  // Handle selection
  const handleSelect = useCallback(
    (id: string, type: SearchResultType) => {
      if (query) {
        addToHistory(query);
      }
      if (onResultSelect) {
        onResultSelect(id, type);
      }
      setOpen(false);
      setQuery('');
    },
    [query, addToHistory, onResultSelect],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-start text-left font-normal', className)}
        >
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <span className="text-muted-foreground truncate">{placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>結果が見つかりませんでした</CommandEmpty>

            {/* Plans */}
            {filteredPlans.length > 0 && (
              <CommandGroup heading="プラン">
                {filteredPlans.map((plan) => (
                  <CommandItem
                    key={plan.id}
                    value={plan.title}
                    keywords={[
                      plan.description || '',
                      ...plan.tags.map((t: { name: string }) => t.name),
                    ]}
                    onSelect={() => handleSelect(plan.id, 'plan')}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <span>{plan.title}</span>
                      {plan.description && (
                        <span className="text-muted-foreground text-xs">{plan.description}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Tags */}
            {filteredTags.length > 0 && (
              <CommandGroup heading="タグ">
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    keywords={[tag.description || '']}
                    onSelect={() => handleSelect(tag.id, 'tag')}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <span>{tag.name}</span>
                      {tag.description && (
                        <span className="text-muted-foreground text-xs">{tag.description}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Compact search bar for header/navbar
export function CompactSearchBar({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className={cn('h-8 w-8 p-0', className)}
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">検索</span>
      </Button>
    );
  }

  return <SearchBar className={cn('w-48 sm:w-64', className)} />;
}
