'use client';

import { useMemo } from 'react';

import type { Tag } from '@/core/types/tag';
import { getTagDisplayLabel, groupTagsByPrefix } from '@/lib/tag-colon';

import { FilterItem } from './FilterItem/FilterItem';
import { GroupHeader } from './GroupHeader';

interface TagFlatListProps {
  tags: Tag[];
  visibleTagIds: Set<string>;
  tagCounts: Record<string, number>;
  onToggleTag: (tagId: string) => void;
  onDeleteTag: (tagId: string, tagName: string) => void;
  onShowOnlyTag: (tagId: string) => void;
  onToggleGroupTags: (tagIds: string[]) => void;
  onShowOnlyGroupTags: (tagIds: string[]) => void;
  getGroupVisibility: (tagIds: string[]) => 'all' | 'none' | 'some';
}

/**
 * タグフラットリスト
 *
 * コロン記法のプレフィックスでグルーピング表示
 * - 同じプレフィックスのタグが2つ以上 → グループ化
 * - グループヘッダー + suffix表示
 * - それ以外はフラット表示
 */
export function TagFlatList({
  tags,
  visibleTagIds,
  tagCounts,
  onToggleTag,
  onDeleteTag,
  onShowOnlyTag,
  onToggleGroupTags,
  onShowOnlyGroupTags,
  getGroupVisibility,
}: TagFlatListProps) {
  const { grouped, ungrouped } = useMemo(() => groupTagsByPrefix(tags), [tags]);

  // グループキーをソート
  const groupKeys = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);

  return (
    <div className="space-y-0.5">
      {/* グループ化されたタグ */}
      {groupKeys.map((prefix) => {
        const groupTags = grouped.get(prefix);
        if (!groupTags) return null;

        const groupTagIds = groupTags.map((t) => t.id);
        const groupVisibility = getGroupVisibility(groupTagIds);
        const groupCount = groupTagIds.reduce((sum, id) => sum + (tagCounts[id] ?? 0), 0);

        return (
          <div key={prefix}>
            <GroupHeader
              label={prefix}
              checked={groupVisibility === 'all'}
              indeterminate={groupVisibility === 'some'}
              count={groupCount}
              onCheckedChange={() => onToggleGroupTags(groupTagIds)}
              onShowOnlyGroup={() => onShowOnlyGroupTags(groupTagIds)}
            />
            {groupTags.map((tag) => (
              <FilterItem
                key={tag.id}
                label={getTagDisplayLabel(tag.name, true)}
                tagId={tag.id}
                checkboxColor={tag.color ?? undefined}
                checked={visibleTagIds.has(tag.id)}
                onCheckedChange={() => onToggleTag(tag.id)}
                onDeleteTag={() => onDeleteTag(tag.id, tag.name)}
                onShowOnlyThis={() => onShowOnlyTag(tag.id)}
                count={tagCounts[tag.id] ?? 0}
              />
            ))}
          </div>
        );
      })}

      {/* グループ化されないタグ */}
      {ungrouped.map((tag) => (
        <FilterItem
          key={tag.id}
          label={getTagDisplayLabel(tag.name, false)}
          tagId={tag.id}
          checkboxColor={tag.color ?? undefined}
          checked={visibleTagIds.has(tag.id)}
          onCheckedChange={() => onToggleTag(tag.id)}
          onDeleteTag={() => onDeleteTag(tag.id, tag.name)}
          onShowOnlyThis={() => onShowOnlyTag(tag.id)}
          count={tagCounts[tag.id] ?? 0}
        />
      ))}
    </div>
  );
}
