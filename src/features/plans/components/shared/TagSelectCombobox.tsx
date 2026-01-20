'use client';

import { useCallback, useMemo, useState } from 'react';

import { Check, ChevronRight, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useTags } from '@/features/tags/hooks/useTags';
import { useTagCreateModalStore } from '@/features/tags/stores/useTagCreateModalStore';
import { cn } from '@/lib/utils';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
          'flex size-4 shrink-0 items-center justify-center rounded-sm border',
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

/**
 * 親タグヘッダー（展開/折りたたみ + 選択可能）
 * CalendarFilterListのFlatGroupHeaderと同じレイアウト・動作:
 * - 行全体クリック → 展開/折りたたみ
 * - チェックボックス（stopPropagation）→ 選択トグル
 *
 * 注意: cmdk の onSelect は内部イベント処理のため stopPropagation が効かない。
 * そのため onSelect は空にし、内側の div で onClick を処理する。
 */
function ParentTagHeader({
  tag,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
}: {
  tag: { id: string; name: string; color: string | null };
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
}) {
  const tagColor = tag.color || '#6B7280';

  return (
    <CommandItem value={tag.id} className="cursor-pointer p-0" onSelect={() => {}}>
      <div className="flex w-full items-center gap-2 py-1.5 pr-2 pl-2" onClick={onToggleExpand}>
        {/* チェックボックス（選択トグル、展開には影響しない） */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className="flex shrink-0 items-center"
        >
          <div
            className={cn(
              'flex size-4 shrink-0 items-center justify-center rounded-sm border',
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
        </button>

        {/* 名前（行クリックで展開/折りたたみ） */}
        <span className="flex-1 truncate font-medium">{tag.name}</span>

        {/* 展開/折りたたみアイコン（右端） */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="hover:bg-state-hover flex size-6 shrink-0 items-center justify-center rounded"
        >
          <ChevronRight
            className={cn(
              'text-muted-foreground size-4 transition-transform',
              isExpanded && 'rotate-90',
            )}
          />
        </button>
      </div>
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
}: TagSelectComboboxProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { data: allTags = [] } = useTags();
  const openTagCreateModal = useTagCreateModalStore((s) => s.openModal);

  const toggleExpand = useCallback((parentId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  }, []);

  // アクティブなタグのみ
  const activeTags = useMemo(() => allTags.filter((tag) => tag.is_active !== false), [allTags]);

  // 親タグ（parent_id = null で子を持つもの）
  const parentTags = useMemo(() => {
    const childParentIds = new Set(activeTags.filter((t) => t.parent_id).map((t) => t.parent_id));
    return activeTags
      .filter((tag) => tag.parent_id === null && childParentIds.has(tag.id))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [activeTags]);

  // 未分類タグ（parent_id = null で子を持たないもの）
  const ungroupedTags = useMemo(() => {
    const parentIds = new Set(parentTags.map((t) => t.id));
    return activeTags
      .filter((tag) => tag.parent_id === null && !parentIds.has(tag.id))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [activeTags, parentTags]);

  // 子タグ取得
  const getChildren = useCallback(
    (parentId: string) => {
      return activeTags
        .filter((t) => t.parent_id === parentId)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    },
    [activeTags],
  );

  // 検索フィルタリング
  const matchesSearch = useCallback(
    (tag: { name: string }) => {
      if (!searchQuery) return true;
      return tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    },
    [searchQuery],
  );

  const filteredParentTags = useMemo(() => {
    if (!searchQuery) return parentTags;
    return parentTags.filter((tag) => {
      // 親タグ名にマッチ
      if (matchesSearch(tag)) return true;
      // 子タグにマッチするものがあるか
      const children = getChildren(tag.id);
      return children.some((child) => matchesSearch(child));
    });
  }, [parentTags, searchQuery, matchesSearch, getChildren]);

  const filteredUngroupedTags = useMemo(() => {
    if (!searchQuery) return ungroupedTags;
    return ungroupedTags.filter(matchesSearch);
  }, [ungroupedTags, searchQuery, matchesSearch]);

  const toggleTag = useCallback(
    (tagId: string) => {
      if (selectedTagIds.includes(tagId)) {
        onTagsChange(selectedTagIds.filter((id) => id !== tagId));
      } else {
        onTagsChange([...selectedTagIds, tagId]);
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

  const handleCreateTag = useCallback(() => {
    openTagCreateModal();
    setIsOpen(false);
  }, [openTagCreateModal]);

  const hasResults = filteredParentTags.length > 0 || filteredUngroupedTags.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0"
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

            {/* 親タグ + 子タグ（CalendarFilterList形式） */}
            {filteredParentTags.length > 0 && (
              <CommandGroup>
                {filteredParentTags.map((parentTag) => {
                  const children = getChildren(parentTag.id).filter(
                    (child) => !searchQuery || matchesSearch(child) || matchesSearch(parentTag),
                  );
                  // 検索中は常に展開、それ以外は展開状態に従う
                  const isExpanded = searchQuery ? true : expandedGroups.has(parentTag.id);

                  return (
                    <div key={parentTag.id}>
                      {/* 親タグヘッダー（展開/折りたたみ + 選択可能） */}
                      <ParentTagHeader
                        tag={parentTag}
                        isSelected={selectedTagIds.includes(parentTag.id)}
                        isExpanded={isExpanded}
                        onToggleSelect={() => toggleTag(parentTag.id)}
                        onToggleExpand={() => toggleExpand(parentTag.id)}
                      />
                      {/* 子タグ（展開時のみ表示、インデント付き） */}
                      {isExpanded &&
                        children.map((child) => (
                          <TagItem
                            key={child.id}
                            tag={child}
                            isSelected={selectedTagIds.includes(child.id)}
                            onToggle={() => toggleTag(child.id)}
                            indent
                          />
                        ))}
                    </div>
                  );
                })}
              </CommandGroup>
            )}

            {/* 未分類タグ（最後に表示） */}
            {filteredUngroupedTags.length > 0 && (
              <CommandGroup heading={t('calendar.filter.ungrouped')}>
                {filteredUngroupedTags.map((tag) => (
                  <TagItem
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedTagIds.includes(tag.id)}
                    onToggle={() => toggleTag(tag.id)}
                  />
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />

            {/* 新規作成ボタン */}
            <CommandGroup>
              <CommandItem onSelect={handleCreateTag} className="cursor-pointer">
                <Plus className="text-muted-foreground size-4" />
                <span>{t('tags.page.createTag')}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
