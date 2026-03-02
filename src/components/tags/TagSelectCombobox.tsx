'use client';

import { useCallback, useMemo, useState } from 'react';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useTags } from '@/hooks/useTagsQuery';
import { cn } from '@/lib/utils';

import type { Tag } from '@/core/types/tag';
import { getTagDisplayLabel, groupTagsByPrefix } from '@/lib/tag-colon';

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
  /** 選択中のタグID（単一） */
  selectedTagId: string | null;
  /** タグ変更コールバック（単一） */
  onTagChange: (tagId: string | null) => void;
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
  onSelect,
}: {
  tag: { id: string; name: string; color: string | null };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const tagColor = tag.color || '#6B7280';

  return (
    <CommandItem value={tag.id} onSelect={onSelect} className="cursor-pointer">
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

      <span className="truncate">{getTagDisplayLabel(tag.name)}</span>
    </CommandItem>
  );
}

/**
 * タグ選択コンボボックス（単一選択）
 *
 * コロン記法のプレフィックスでグルーピング表示。
 * 選択するとポップオーバーを閉じる。再選択で解除。
 */
export function TagSelectCombobox({
  children,
  selectedTagId,
  onTagChange,
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

  // ソート済みタグ一覧
  const sortedTags = useMemo(() => {
    return [...activeTags].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [activeTags]);

  // 検索フィルタリング
  const filteredTags = useMemo(() => {
    if (!searchQuery) return sortedTags;
    const q = searchQuery.toLowerCase();
    return sortedTags.filter((tag) => tag.name.toLowerCase().includes(q));
  }, [sortedTags, searchQuery]);

  // コロン記法でグルーピング
  const { grouped, ungrouped } = useMemo(() => groupTagsByPrefix(filteredTags), [filteredTags]);
  const groupKeys = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);

  const handleSelect = useCallback(
    (tagId: string) => {
      if (selectedTagId === tagId) {
        // 再選択で解除
        onTagChange(null);
      } else {
        onTagChange(tagId);
      }
      setIsOpen(false);
      setSearchQuery('');
    },
    [selectedTagId, onTagChange],
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

            {/* グループ化されたタグ */}
            {groupKeys.map((prefix) => {
              const groupTags = grouped.get(prefix);
              if (!groupTags) return null;
              return (
                <CommandGroup key={prefix} heading={prefix}>
                  {groupTags.map((tag) => (
                    <TagItem
                      key={tag.id}
                      tag={tag}
                      isSelected={selectedTagId === tag.id}
                      onSelect={() => handleSelect(tag.id)}
                    />
                  ))}
                </CommandGroup>
              );
            })}

            {/* グループ化されないタグ */}
            {ungrouped.length > 0 && (
              <CommandGroup>
                {ungrouped.map((tag) => (
                  <TagItem
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedTagId === tag.id}
                    onSelect={() => handleSelect(tag.id)}
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
