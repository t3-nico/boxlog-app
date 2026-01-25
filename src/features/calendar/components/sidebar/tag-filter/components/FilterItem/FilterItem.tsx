'use client';

import { useCallback, useState } from 'react';

import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { useCalendarFilterStore } from '@/features/calendar/stores/useCalendarFilterStore';
import { TagNoteDialog } from '@/features/tags/components/tag-note-dialog';
import { TagRenameDialog } from '@/features/tags/components/tag-rename-dialog';
import { useUpdateTag } from '@/features/tags/hooks';
import { useTagModalNavigation } from '@/features/tags/hooks/useTagModalNavigation';

import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

  // Dialog states
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);

  // Edit hook (色変更のみ使用)
  const { displayColor, handleColorChange } = useFilterItemEdit({
    tagId,
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

  // Rename dialog save handler
  // Note: 重複チェックは TagRenameDialog 内で行われる
  const handleSaveRename = useCallback(
    async (newName: string) => {
      if (!tagId) return;

      // mutate で楽観的更新（await しない）
      updateTagMutation.mutate({
        id: tagId,
        data: { name: newName },
      });
    },
    [tagId, updateTagMutation],
  );

  // Note dialog save handler
  const handleSaveNote = useCallback(
    async (newNote: string) => {
      if (!tagId) return;
      await updateTagMutation.mutateAsync({
        id: tagId,
        data: { description: newNote || null },
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
      <HoverTooltip
        content={description}
        side="top"
        disabled={!description || menuOpen}
        wrapperClassName="ml-1 min-w-0 flex-1"
      >
        <span className={cn('min-w-0 truncate', labelClassName)}>{label}</span>
      </HoverTooltip>

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
              displayColor={displayColor}
              parentId={parentId}
              parentTags={parentTags}
              onOpenRenameDialog={() => setShowRenameDialog(true)}
              onColorChange={handleColorChange}
              onOpenNoteDialog={() => setShowNoteDialog(true)}
              onChangeParent={parentTags && parentTags.length > 0 ? handleChangeParent : undefined}
              onOpenMergeModal={() =>
                openTagMergeModal({ id: tagId, name: label, color: checkboxColor ?? null })
              }
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
        <span className="text-muted-foreground ml-1 shrink-0 pr-2 text-xs tabular-nums">
          {count}
        </span>
      )}
    </div>
  );

  return (
    <>
      {content}

      {/* Rename Dialog */}
      {tagId && (
        <TagRenameDialog
          isOpen={showRenameDialog}
          onClose={() => setShowRenameDialog(false)}
          onSave={handleSaveRename}
          currentName={label}
          tagId={tagId}
        />
      )}

      {/* Note Dialog */}
      {tagId && (
        <TagNoteDialog
          isOpen={showNoteDialog}
          onClose={() => setShowNoteDialog(false)}
          onSave={handleSaveNote}
          currentNote={description ?? ''}
        />
      )}
    </>
  );
}
