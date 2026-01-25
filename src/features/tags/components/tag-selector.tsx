'use client';

import { useState } from 'react';

import { ChevronDown as ChevronDownIcon, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useCreateTag, useTags } from '@/features/tags/hooks';
import type { Tag } from '@/features/tags/types';
import { logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';

import { QuickTagCreateModal } from './quick-tag-create-modal';
import { TagBadge } from './tag-badge';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  enableCreate?: boolean;
}

export const TagSelector = ({
  selectedTagIds,
  onTagsChange,
  maxTags,
  placeholder,
  enableCreate = true,
}: TagSelectorProps) => {
  const t = useTranslations();
  const effectivePlaceholder = placeholder ?? t('tags.selector.placeholder');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const createTagMutation = useCreateTag();

  // データベースからタグを取得
  const { data: allTags = [] } = useTags();
  // アクティブなタグのみを使用（アーカイブ済みタグを除外）
  const activeTags = allTags.filter((tag) => tag.is_active);
  const selectedTags = activeTags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = activeTags.filter((tag) => !selectedTagIds.includes(tag.id));

  const filteredTags = searchQuery
    ? availableTags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableTags;

  const handleTagAdd = (tag: Tag) => {
    if (maxTags && selectedTagIds.length >= maxTags) return;
    onTagsChange([...selectedTagIds, tag.id]);
    setSearchQuery('');
  };

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleCreateTag = async (newTag: { name: string; color: string }) => {
    try {
      const createdTag = await createTagMutation.mutateAsync({
        name: newTag.name,
        color: newTag.color,
        description: undefined,
      });

      // 作成されたタグを自動的に選択
      if (createdTag && createdTag.id) {
        onTagsChange([...selectedTagIds, createdTag.id]);
      }

      setShowCreateModal(false);
    } catch (error) {
      logger.error('Failed to create tag:', error);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} onRemove={() => handleTagRemove(tag.id)} />
            ))}
          </div>
        )}

        {/* Tag Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={maxTags ? selectedTagIds.length >= maxTags : false}
            >
              <span className="text-left">
                {selectedTags.length > 0
                  ? t('tags.selector.tagsSelected', { count: selectedTags.length })
                  : effectivePlaceholder}
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-0">
            <div className="p-2">
              <Input
                placeholder={t('tags.selector.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag.id}
                    onClick={() => handleTagAdd(tag)}
                    className="flex items-center space-x-2 p-2"
                  >
                    <TagBadge tag={tag} showIcon={true} />
                    {tag.description != null && (
                      <span className="text-muted-foreground truncate text-xs">
                        {tag.description}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="text-muted-foreground p-2 text-center text-sm">
                  {searchQuery ? t('tags.search.noTags') : t('tags.search.noMoreTags')}
                </div>
              )}
            </div>
            {enableCreate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowCreateModal(true)} className="p-2">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('common.actions.createNew')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {maxTags != null && (
          <div className="text-muted-foreground text-xs">
            {t('tags.selector.tagsCount', { current: selectedTagIds.length, max: maxTags })}
          </div>
        )}
      </div>

      {/* QuickTagCreateModal */}
      <QuickTagCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTag={handleCreateTag}
      />
    </>
  );
};
