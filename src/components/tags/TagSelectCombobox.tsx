'use client';

import { useCallback, useMemo, useState } from 'react';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useTags } from '@/hooks/useTagsQuery';
import { cn } from '@/lib/utils';

import type { Tag } from '@/core/types/tag';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TagSelectComboboxProps {
  children: React.ReactNode;
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  align?: 'start' | 'center' | 'end' | undefined;
  side?: 'top' | 'right' | 'bottom' | 'left' | undefined;
  alignOffset?: number | undefined;
  sideOffset?: number | undefined;
  /** Inspector内で使う場合にtrueを指定（z-overlay-popoverを適用） */
  isOverlay?: boolean | undefined;
  /** 外部からタグデータを注入（Storybook等で使用） */
  availableTags?: Tag[] | undefined;
}

/**
 * タグアイテムの表示コンポーネント
 */
function TagItem({
  tag,
  isSelected,
  onToggle,
  indent = false,
}: {
  tag: { id: string; name: string; color: string | null };
  isSelected: boolean;
  onToggle: () => void;
  indent?: boolean;
}) {
  const tagColor = tag.color || '#6B7280';

  return (
    <CommandItem
      value={tag.id}
      onSelect={onToggle}
      className={cn('cursor-pointer', indent && 'pl-6')}
    >
      <div
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded border',
          isSelected ? 'border-transparent' : 'border-current opacity-50',
        )}
        style={{
          backgroundColor: isSelected ? tagColor : 'transparent',
          borderColor: isSelected ? tagColor : undefined,
          color: tagColor,
        }}
      >
        {isSelected && <Check className="size-3 text-white" />}
      </div>

      <span className="truncate">{tag.name}</span>
    </CommandItem>
  );
}

export function TagSelectCombobox({
  children,
  selectedTagIds,
  onTagsChange,
  align = 'start',
  side = 'bottom',
  alignOffset = 0,
  sideOffset = 4,
  isOverlay = false,
  availableTags,
}: TagSelectComboboxProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: fetchedTags = [] } = useTags();
  const allTags = availableTags ?? fetchedTags;

  // アクティブなタグのみ
  const activeTags = useMemo(() => allTags.filter((tag) => tag.is_active !== false), [allTags]);

  // ソート済みタグ一覧（フラット構造）
  const sortedTags = useMemo(() => {
    return [...activeTags].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [activeTags]);

  // 検索フィルタリング
  const matchesSearch = useCallback(
    (tag: { name: string }) => {
      if (!searchQuery) return true;
      return tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    },
    [searchQuery],
  );

  const filteredTags = useMemo(() => {
    if (!searchQuery) return sortedTags;
    return sortedTags.filter(matchesSearch);
  }, [sortedTags, searchQuery, matchesSearch]);

  const toggleTag = useCallback(
    (tagId: string) => {
      if (selectedTagIds.includes(tagId)) {
        onTagsChange(selectedTagIds.filter((id) => id !== tagId));
      } else {
        // 新しいタグを先頭に追加（最新が左に表示される）
        onTagsChange([tagId, ...selectedTagIds]);
      }
    },
    [selectedTagIds, onTagsChange],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  }, []);

  const hasResults = filteredTags.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn('w-[280px] p-0', isOverlay && 'z-overlay-popover')}
        align={align}
        side={side}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('tags.page.searchPlaceholder')}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-[300px]">
            {!hasResults && <CommandEmpty>{t('tags.page.noTags')}</CommandEmpty>}

            {/* タグ一覧（フラット表示） */}
            {filteredTags.length > 0 && (
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <TagItem
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedTagIds.includes(tag.id)}
                    onToggle={() => toggleTag(tag.id)}
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
