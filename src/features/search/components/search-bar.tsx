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
import { useTags } from '@/features/tags/hooks';
import { cn } from '@/lib/utils';

import { useSearchHistory } from '../hooks/useSearch';
import type { SearchResultType } from '../types';

// APIレスポンスの型（tagIdsのみ）
type PlanFromAPI = {
  id: string;
  title: string;
  description: string | null;
  tagIds?: string[];
  [key: string]: unknown;
};

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
  const { data: tags = [] } = useTags();

  // Convert plans to displayable format
  const searchablePlans = useMemo(() => {
    if (!types.includes('plan')) return [];
    return (plans as unknown as PlanFromAPI[]).map((plan) => {
      // tagIdsからタグ情報を解決
      const planTagIds = plan.tagIds ?? [];
      const resolvedTags = planTagIds
        .map((tagId) => tags.find((t) => t.id === tagId))
        .filter((tag): tag is (typeof tags)[0] => tag !== undefined);
      return {
        id: plan.id,
        title: plan.title,
        description: plan.description || '',
        tags: resolvedTags,
      };
    });
  }, [plans, tags, types]);

  // Convert tags to displayable format
  const searchableTags = useMemo(() => {
    if (!types.includes('tag')) return [];
    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      description: tag.description || '',
    }));
  }, [tags, types]);

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
            {searchablePlans.length > 0 && (
              <CommandGroup heading="プラン">
                {searchablePlans.slice(0, 10).map((plan) => (
                  <CommandItem
                    key={plan.id}
                    value={`${plan.title} ${plan.description} ${plan.tags.map((t) => t.name).join(' ')}`}
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
            {searchableTags.length > 0 && (
              <CommandGroup heading="タグ">
                {searchableTags.slice(0, 10).map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={`${tag.name} ${tag.description}`}
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
