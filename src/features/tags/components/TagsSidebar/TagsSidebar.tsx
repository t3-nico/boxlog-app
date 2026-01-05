'use client';

/**
 * タグページ用サイドバー
 *
 * すべてのタグとアーカイブビューを提供
 */

import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ArrowUpDown, Check, Folder, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { SidebarHeading } from '@/features/navigation/components/sidebar/SidebarHeading';
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell';
import {
  AllTagsDropZone,
  ArchiveDropZone,
  UncategorizedDropZone,
} from '@/features/tags/components/sidebar';
import { SortableGroupItem } from '@/features/tags/components/SortableGroupItem';
import { TagGroupDeleteDialog } from '@/features/tags/components/tag-group-delete-dialog';

import { SORT_OPTIONS, type TagsSidebarProps } from './types';
import { useTagsSidebarLogic } from './useTagsSidebarLogic';

export function TagsSidebar({
  onAllTagsClick,
  isLoading = false,
  activeTagsCount = 0,
  archivedTagsCount = 0,
  externalIsCreating = false,
}: TagsSidebarProps) {
  const {
    t,
    isLoading: isLoadingState,
    isCreating,
    isAllTagsActive,
    isArchivePage,
    isUncategorizedPage,
    currentGroupId,
    sortType,
    sortedGroups,
    deletingGroup,
    editingGroupId,
    editingGroupName,
    newGroupName,
    newGroupColor,
    uncategorizedTagsCount,
    sensors,
    setSortType,
    setDeletingGroup,
    setEditingGroupName,
    setNewGroupName,
    setNewGroupColor,
    inlineFormRef,
    handleStartCreating,
    handleCancelCreating,
    handleSaveNewGroup,
    handleConfirmDelete,
    handleStartEditing,
    handleCancelEditing,
    handleSaveEditing,
    handleUpdateColor,
    handleDeleteGroup,
    handleAllTagsClick,
    handleArchiveClick,
    handleUncategorizedClick,
    handleGroupClick,
    handleDragEnd,
    getGroupTagCount,
  } = useTagsSidebarLogic({
    onAllTagsClick,
    isLoading,
    externalIsCreating,
  });

  if (isLoadingState) {
    return (
      <SidebarShell title={t('sidebar.navigation.tags')}>
        <div className="flex flex-1 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </SidebarShell>
    );
  }

  return (
    <SidebarShell title={t('sidebar.navigation.tags')}>
      {/* コンテンツ */}
      <nav className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-2 py-2">
        <div>
          {/* すべてのタグ */}
          <AllTagsDropZone
            isActive={isAllTagsActive}
            activeTagsCount={activeTagsCount}
            onClick={handleAllTagsClick}
          />

          {/* 未分類 */}
          <UncategorizedDropZone
            isActive={isUncategorizedPage ?? false}
            uncategorizedTagsCount={uncategorizedTagsCount}
            onClick={handleUncategorizedClick}
          />

          {/* アーカイブ */}
          <ArchiveDropZone
            isActive={isArchivePage ?? false}
            archivedTagsCount={archivedTagsCount}
            onClick={handleArchiveClick}
          />

          {/* グループセクション */}
          <SidebarHeading
            className="mt-4"
            action={
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <HoverTooltip content={t('tags.sidebar.sortGroups')} side="top">
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <ArrowUpDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </HoverTooltip>
                  <DropdownMenuContent align="end">
                    {SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setSortType(option)}
                        className="flex items-center justify-between"
                      >
                        <span>{t(`tags.sidebar.sort.${option}`)}</span>
                        {sortType === option && <Check className="text-primary size-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <HoverTooltip content={t('tags.page.createGroup')} side="top">
                  <Button variant="ghost" size="icon-sm" onClick={handleStartCreating}>
                    <Plus className="size-4" />
                  </Button>
                </HoverTooltip>
              </div>
            }
          >
            {t('tags.sidebar.groups')}
          </SidebarHeading>

          {sortedGroups.length === 0 && !isCreating ? (
            <div className="text-muted-foreground px-2 py-2 text-xs">
              {t('tags.sidebar.noGroups')}
            </div>
          ) : (
            <>
              {/* グループリスト */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedGroups.map((g) => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedGroups.map((group) => (
                    <SortableGroupItem
                      key={group.id}
                      group={group}
                      isActive={currentGroupId === group.id}
                      tagCount={getGroupTagCount(group.id)}
                      onGroupClick={handleGroupClick}
                      onStartEdit={handleStartEditing}
                      onCancelEdit={handleCancelEditing}
                      onSaveEdit={handleSaveEditing}
                      onUpdateColor={handleUpdateColor}
                      onDelete={handleDeleteGroup}
                      isEditing={editingGroupId === group.id}
                      editingName={editingGroupName}
                      setEditingName={setEditingGroupName}
                      isDraggable={sortType === 'manual'}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* インライン作成フォーム */}
              {isCreating && (
                <div ref={inlineFormRef} className="w-full rounded-md px-2 py-2">
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0"
                          aria-label={t('tags.sidebar.changeColor')}
                        >
                          <Folder className="h-4 w-4 shrink-0" style={{ color: newGroupColor }} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <ColorPalettePicker
                          selectedColor={newGroupColor}
                          onColorSelect={setNewGroupColor}
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNewGroup();
                        } else if (e.key === 'Escape') {
                          handleCancelCreating();
                        }
                      }}
                      placeholder={t('tags.sidebar.groupNamePlaceholder')}
                      autoFocus
                      className="h-auto flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* 削除確認ダイアログ */}
      <TagGroupDeleteDialog
        group={deletingGroup}
        tagCount={deletingGroup ? getGroupTagCount(deletingGroup.id) : 0}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleConfirmDelete}
      />
    </SidebarShell>
  );
}
