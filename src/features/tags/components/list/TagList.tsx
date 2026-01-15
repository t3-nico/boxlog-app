'use client';

import type { ReactNode } from 'react';

import type { GroupedData } from '@/features/table';
import type { Tag, TagGroup } from '@/features/tags/types';
import { TagListGroupHeader } from './TagListGroupHeader';
import { TagListItem } from './TagListItem';

interface TagListProps {
  /** 表示するタグ（フラット or グループ化前） */
  tags: Tag[];
  /** グループ化されたデータ（undefined の場合はフラット表示） */
  groupedData?: GroupedData<Tag>[] | undefined;
  /** グループ一覧 */
  groups: TagGroup[];
  /** プラン数マップ */
  planCounts: Record<string, number>;
  /** 折りたたまれたグループ */
  collapsedGroups: Set<string>;
  /** グループ折りたたみトグル */
  onToggleGroupCollapse: (groupKey: string) => void;
  /** 選択中のタグID */
  selectedIds: Set<string>;
  /** グループ移動コールバック */
  onMoveToGroup: (tag: Tag, groupId: string | null) => void;
  /** アーカイブ確認コールバック */
  onArchiveConfirm: (tag: Tag) => void;
  /** 削除確認コールバック */
  onDeleteConfirm: (tag: Tag) => void;
  /** グループ削除コールバック */
  onDeleteGroup?: ((group: TagGroup) => void) | undefined;
  /** 空状態の表示 */
  emptyState?: ReactNode | undefined;
}

/**
 * タグリストコンテナ
 *
 * グループ化表示またはフラット表示をサポート
 */
export function TagList({
  tags,
  groupedData,
  groups,
  planCounts,
  collapsedGroups,
  onToggleGroupCollapse,
  selectedIds,
  onMoveToGroup,
  onArchiveConfirm,
  onDeleteConfirm,
  onDeleteGroup,
  emptyState,
}: TagListProps) {
  // 空状態
  if (tags.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  // グループ化表示
  if (groupedData) {
    return (
      <div role="list" className="flex flex-col">
        {groupedData.map((group) => {
          const tagGroup = groups.find((g) => g.id === group.groupKey);
          const isCollapsed = collapsedGroups.has(group.groupKey);

          return (
            <div key={group.groupKey}>
              {/* グループヘッダー */}
              <TagListGroupHeader
                groupKey={group.groupKey}
                groupLabel={group.groupLabel}
                count={group.count}
                isCollapsed={isCollapsed}
                tagGroup={tagGroup}
                onToggleCollapse={onToggleGroupCollapse}
                onDeleteGroup={onDeleteGroup}
              />

              {/* グループ内のタグ（折りたたまれていない場合のみ表示） */}
              {!isCollapsed && (
                <div className="flex flex-col">
                  {group.items.map((tag) => (
                    <TagListItem
                      key={tag.id}
                      tag={tag}
                      planCount={planCounts[tag.id] || 0}
                      isSelected={selectedIds.has(tag.id)}
                      groups={groups}
                      onMoveToGroup={onMoveToGroup}
                      onArchiveConfirm={onArchiveConfirm}
                      onDeleteConfirm={onDeleteConfirm}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // フラット表示
  return (
    <div role="list" className="flex flex-col">
      {tags.map((tag) => (
        <TagListItem
          key={tag.id}
          tag={tag}
          planCount={planCounts[tag.id] || 0}
          isSelected={selectedIds.has(tag.id)}
          groups={groups}
          onMoveToGroup={onMoveToGroup}
          onArchiveConfirm={onArchiveConfirm}
          onDeleteConfirm={onDeleteConfirm}
        />
      ))}
    </div>
  );
}
