'use client';

import { useCallback, useState } from 'react';

import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { useCalendarFilterStore } from '@/features/calendar/stores/useCalendarFilterStore';
import { TAG_NAME_MAX_LENGTH } from '@/features/tags/constants/colors';
import { useTagModalNavigation } from '@/features/tags/hooks/useTagModalNavigation';
import { useUpdateTag } from '@/features/tags/hooks/useTags';

import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { HoverTooltip } from '@/components/ui/tooltip';

import { FilterItemMenu, UntaggedItemMenu } from './FilterItemMenu';
import { useFilterItemEdit } from './useFilterItemEdit';

export interface FilterItemProps {
  label: string;
  tagId?: string;
  description?: string | null;
  checkboxColor?: string;
  labelClassName?: string;
  icon?: React.ReactNode;
  checked: boolean;
  onCheckedChange: () => void;
  disabled?: boolean;
  disabledReason?: string;
  count?: number;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
  parentId?: string | null;
  parentTags?: Array<{ id: string; name: string; color?: string | null }>;
  onDeleteTag?: (tagId: string) => void;
  onShowOnlyThis?: () => void;
}

export function FilterItem({
  label,
  tagId,
  description,
  checkboxColor,
  labelClassName,
  icon,
  checked,
  onCheckedChange,
  disabled = false,
  disabledReason,
  count,
  dragHandleProps,
  parentId,
  parentTags,
  onDeleteTag,
  onShowOnlyThis,
}: FilterItemProps) {
  const t = useTranslations();
  const updateTagMutation = useUpdateTag();
  const { showOnlyTag } = useCalendarFilterStore();
  const { openTagMergeModal } = useTagModalNavigation();

  // Menu open state
  const [menuOpen, setMenuOpen] = useState(false);

  // Edit hook
  const {
    isEditing,
    editName,
    editDescription,
    displayColor,
    inputRef,
    textareaRef,
    setEditName,
    handleStartRename,
    handleSaveName,
    handleKeyDown,
    setEditDescription,
    handleSaveDescription,
    handleColorChange,
  } = useFilterItemEdit({
    tagId,
    initialName: label,
    initialDescription: description,
    initialColor: checkboxColor,
  });

  // Parent change handler
  const handleChangeParent = useCallback(
    async (newParentId: string | null) => {
      if (!tagId) return;
      await updateTagMutation.mutateAsync({
        id: tagId,
        data: { parentId: newParentId },
      });
    },
    [tagId, updateTagMutation],
  );

  // Context menu handler
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if ((!tagId && !onShowOnlyThis) || disabled) return;
      e.preventDefault();
      setMenuOpen(true);
    },
    [tagId, onShowOnlyThis, disabled],
  );

  // Checkbox style
  const checkboxStyle = {
    borderColor: displayColor,
    backgroundColor: checked ? displayColor : 'transparent',
  } as React.CSSProperties;

  const content = (
    <div
      className={cn(
        'group/item hover:bg-state-hover flex h-8 w-full min-w-0 items-center rounded text-sm',
        disabled && 'cursor-not-allowed opacity-50',
        dragHandleProps && 'cursor-grab active:cursor-grabbing',
        menuOpen && 'bg-state-selected',
      )}
      title={disabled ? disabledReason : undefined}
      onContextMenu={handleContextMenu}
      {...(dragHandleProps || {})}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="ml-2 shrink-0 cursor-pointer"
        style={checkboxStyle}
      />
      {icon && <span className="text-muted-foreground ml-2 shrink-0">{icon}</span>}
      {isEditing ? (
        <div className="ml-2 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              maxLength={TAG_NAME_MAX_LENGTH}
              className="border-border bg-background focus-visible:ring-ring h-auto flex-1 rounded px-2 py-0.5 text-sm shadow-none focus-visible:ring-1"
            />
            <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">
              {editName.length}/{TAG_NAME_MAX_LENGTH}
            </span>
          </div>
          {editName.length >= TAG_NAME_MAX_LENGTH && (
            <span className="text-destructive text-[10px]">
              {t('common.validation.limitReached')}
            </span>
          )}
        </div>
      ) : (
        <span className={cn('ml-1 min-w-0 flex-1 truncate', labelClassName)}>{label}</span>
      )}

      {/* Menu trigger */}
      {(tagId || onShowOnlyThis) && !disabled && (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t('calendar.filter.tagMenu')}
              className="text-muted-foreground hover:text-foreground hover:bg-state-hover relative flex size-6 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/item:opacity-100 before:absolute before:-inset-2 before:content-['']"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          {tagId ? (
            <FilterItemMenu
              tagId={tagId}
              displayColor={displayColor}
              editDescription={editDescription}
              parentId={parentId}
              parentTags={parentTags}
              textareaRef={textareaRef}
              onStartRename={handleStartRename}
              onColorChange={handleColorChange}
              onDescriptionChange={setEditDescription}
              onSaveDescription={handleSaveDescription}
              onChangeParent={parentTags && parentTags.length > 0 ? handleChangeParent : undefined}
              onOpenMergeModal={() => openTagMergeModal(tagId)}
              onShowOnlyTag={() => showOnlyTag(tagId)}
              onDeleteTag={onDeleteTag ? () => onDeleteTag(tagId) : undefined}
            />
          ) : onShowOnlyThis ? (
            <UntaggedItemMenu onShowOnlyThis={onShowOnlyThis} />
          ) : null}
        </DropdownMenu>
      )}

      {/* Count */}
      {count !== undefined && (
        <span className="text-muted-foreground flex size-6 shrink-0 items-center justify-center text-xs tabular-nums">
          {count}
        </span>
      )}
    </div>
  );

  return (
    <HoverTooltip
      content={description}
      side="top"
      disabled={!description || menuOpen}
      wrapperClassName="w-full"
    >
      {content}
    </HoverTooltip>
  );
}
