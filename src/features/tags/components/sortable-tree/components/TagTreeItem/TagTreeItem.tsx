'use client';

import {
  ChevronRight,
  Eye,
  FileText,
  FolderUp,
  Merge,
  MoreHorizontal,
  Palette,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { ColorPaletteMenuItems } from '@/components/ui/color-palette-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';
import { TagNoteDialog } from '@/features/tags/components/tag-note-dialog';
import { TagRenameDialog } from '@/features/tags/components/tag-rename-dialog';
import { cn } from '@/lib/utils';

export interface TagTreeItemData {
  id: string;
  name: string;
  color: string;
  description?: string | null;
}

export interface TagTreeItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'id' | 'color'> {
  /** タグデータ */
  tag: TagTreeItemData;
  /** ツリーの深さ（0: ルート, 1: 子タグ） */
  depth: number;
  /** インデント幅 */
  indentationWidth: number;
  /** チェック状態 */
  checked: boolean;
  /** カウント数 */
  count: number;
  /** 折りたたみ状態 */
  collapsed?: boolean;
  /** 子タグがあるか */
  hasChildren?: boolean;
  /** ドラッグ中のゴースト表示 */
  ghost?: boolean;
  /** ドラッグプレビュー（DragOverlay用） */
  clone?: boolean;
  /** インジケーター表示モード（ghost && indicatorの時に青線表示） */
  indicator?: boolean;
  /** 子タグの数（クローン表示用） */
  childCount?: number;
  /** 選択無効 */
  disableSelection?: boolean;
  /** インタラクション無効 */
  disableInteraction?: boolean;
  /** チェック切り替えハンドラー */
  onToggle?: (() => void) | undefined;
  /** 折りたたみハンドラー */
  onCollapse?: (() => void) | undefined;
  /** タグ更新ハンドラー */
  onUpdateTag?:
    | ((data: {
        name?: string;
        color?: string;
        description?: string | null;
        parentId?: string | null;
      }) => void)
    | undefined;
  /** 削除ハンドラー */
  onDeleteTag?: (() => void) | undefined;
  /** 子タグ追加ハンドラー */
  onAddChildTag?: (() => void) | undefined;
  /** このタグだけ表示 */
  onShowOnlyThis?: (() => void) | undefined;
  /** マージモーダルを開く */
  onOpenMergeModal?: (() => void) | undefined;
  /** 親タグ候補一覧 */
  parentTags?: Array<{ id: string; name: string; color?: string | null }> | undefined;
  /** liのrefを設定（droppable用） */
  wrapperRef?: ((node: HTMLLIElement) => void) | undefined;
  /** ドラッグハンドルのprops */
  handleProps?: React.HTMLAttributes<HTMLDivElement> | undefined;
}

export const TagTreeItem = forwardRef<HTMLDivElement, TagTreeItemProps>(
  (
    {
      tag,
      depth,
      indentationWidth,
      checked,
      count,
      collapsed,
      hasChildren,
      ghost,
      clone,
      indicator,
      childCount,
      disableSelection,
      disableInteraction,
      onToggle,
      onCollapse,
      onUpdateTag,
      onDeleteTag,
      onAddChildTag,
      onShowOnlyThis,
      onOpenMergeModal,
      parentTags,
      wrapperRef,
      handleProps,
      style,
      className,
      ...props
    },
    ref,
  ) => {
    const t = useTranslations();
    const [menuOpen, setMenuOpen] = useState(false);

    // ダイアログ states
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [showNoteDialog, setShowNoteDialog] = useState(false);

    // 楽観的更新用
    const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
    const displayColor = optimisticColor ?? tag.color;

    // サーバーからの色が更新されたら楽観的更新をクリア
    useEffect(() => {
      if (tag.color && optimisticColor && tag.color === optimisticColor) {
        setOptimisticColor(null);
      }
    }, [tag.color, optimisticColor]);

    // カラー変更
    const handleColorChange = useCallback(
      (color: string) => {
        setOptimisticColor(color);
        onUpdateTag?.({ color });
      },
      [onUpdateTag],
    );

    // 親タグ変更
    const handleChangeParent = useCallback(
      (newParentId: string | null) => {
        onUpdateTag?.({ parentId: newParentId });
      },
      [onUpdateTag],
    );

    // 名前保存（ダイアログから）
    const handleSaveRename = useCallback(
      async (newName: string) => {
        onUpdateTag?.({ name: newName });
      },
      [onUpdateTag],
    );

    // ノート保存（ダイアログから）
    const handleSaveNote = useCallback(
      async (newNote: string) => {
        onUpdateTag?.({ description: newNote || null });
      },
      [onUpdateTag],
    );

    // 右クリックでメニューを開く
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setMenuOpen(true);
    }, []);

    // チェックボックスのスタイル
    const checkboxStyle = {
      borderColor: displayColor,
      backgroundColor: checked ? displayColor : 'transparent',
    } as React.CSSProperties;

    // ghost && indicator の時は青いインジケーター線を表示
    if (ghost && indicator) {
      return (
        <li
          className={cn('mb-[-1px] box-border list-none', disableSelection && 'select-none')}
          ref={wrapperRef}
          style={{ paddingLeft: `${indentationWidth * depth}px` } as CSSProperties}
          {...props}
        >
          <div className="flex items-center" ref={ref} style={style}>
            <div className="bg-primary size-1.5 shrink-0 rounded-full" />
            <div className="bg-primary h-0.5 flex-1" />
          </div>
        </li>
      );
    }

    // クローン表示（DragOverlay用）
    if (clone) {
      return (
        <li
          className="pointer-events-none box-border inline-block list-none p-0 pt-2 pl-2"
          {...props}
        >
          <div
            className="bg-card border-border relative flex items-center rounded border py-2 pr-6 shadow-lg"
            ref={ref}
            style={style}
          >
            <div
              className="ml-2 h-3 w-3 shrink-0 rounded"
              style={{ backgroundColor: displayColor }}
            />
            <span className="ml-2 grow overflow-hidden text-sm text-ellipsis whitespace-nowrap">
              {tag.name}
            </span>
            {childCount && childCount > 1 && (
              <span className="bg-primary text-primary-foreground absolute -top-2 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                {childCount}
              </span>
            )}
          </div>
        </li>
      );
    }

    const content = (
      <li
        className={cn(
          'mb-[-1px] box-border list-none',
          ghost && 'opacity-40',
          disableSelection && 'select-none',
          disableInteraction && 'pointer-events-none',
        )}
        ref={wrapperRef}
        style={{ paddingLeft: `${indentationWidth * depth}px` } as CSSProperties}
        {...props}
      >
        <div
          className={cn(
            'group/item hover:bg-state-hover flex h-8 w-full min-w-0 items-center rounded text-sm',
            'cursor-grab active:cursor-grabbing',
            menuOpen && 'bg-state-selected',
            className,
          )}
          ref={ref}
          style={style}
          onContextMenu={handleContextMenu}
          onClick={(e) => {
            // 親タグの場合、行クリックで折りたたみを切り替え
            if (hasChildren && onCollapse) {
              e.stopPropagation();
              onCollapse();
            }
          }}
          {...handleProps}
        >
          <Checkbox
            checked={checked}
            onCheckedChange={() => onToggle?.()}
            onClick={(e) => e.stopPropagation()}
            className="ml-2 shrink-0 cursor-pointer"
            style={checkboxStyle}
          />

          <div className="ml-2 flex min-w-0 flex-1 items-center">
            <HoverTooltip
              content={tag.description}
              side="top"
              disabled={!tag.description || menuOpen}
              wrapperClassName="min-w-0"
            >
              <span className="text-foreground min-w-0 truncate">{tag.name}</span>
            </HoverTooltip>
            {/* 折りたたみアイコン（子タグがある場合のみ、タグ名の直後） */}
            {hasChildren && onCollapse && (
              <ChevronRight
                className={cn(
                  'ml-1 size-4 shrink-0 transition-transform',
                  !collapsed && 'rotate-90',
                )}
              />
            )}
          </div>

          {/* メニュー */}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t('calendar.filter.tagMenu')}
                className="text-muted-foreground hover:text-foreground hover:bg-state-hover relative flex size-6 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/item:opacity-100 before:absolute before:-inset-2 before:content-['']"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
              {/* 名前を変更 */}
              <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
                <Pencil className="mr-2 size-4" />
                {t('calendar.filter.rename')}
              </DropdownMenuItem>
              {/* カラーを変更 */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 size-4" />
                  {t('calendar.filter.changeColor')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent onClick={(e) => e.stopPropagation()}>
                  <ColorPaletteMenuItems
                    selectedColor={displayColor}
                    onColorSelect={handleColorChange}
                  />
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {/* ノートを編集 */}
              <DropdownMenuItem onClick={() => setShowNoteDialog(true)}>
                <FileText className="mr-2 size-4" />
                {t('calendar.filter.editNote')}
              </DropdownMenuItem>
              {/* 親タグを変更 */}
              {parentTags && parentTags.length > 0 && depth > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FolderUp className="mr-2 size-4" />
                    {t('calendar.filter.changeParent')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleChangeParent(null)}>
                      <span className="text-muted-foreground mr-2">—</span>
                      {t('calendar.filter.noParent')}
                    </DropdownMenuItem>
                    {parentTags
                      .filter((p) => p.id !== tag.id)
                      .map((parent) => (
                        <DropdownMenuItem
                          key={parent.id}
                          onClick={() => handleChangeParent(parent.id)}
                        >
                          <span
                            className="mr-1 font-normal"
                            style={{ color: parent.color || '#3B82F6' }}
                          >
                            #
                          </span>
                          {parent.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {/* マージ */}
              {onOpenMergeModal && (
                <DropdownMenuItem onClick={onOpenMergeModal}>
                  <Merge className="mr-2 size-4" />
                  {t('calendar.filter.merge')}
                </DropdownMenuItem>
              )}
              {/* このタグだけ表示 */}
              {onShowOnlyThis && (
                <DropdownMenuItem onClick={onShowOnlyThis}>
                  <Eye className="mr-2 size-4" />
                  {t('calendar.filter.showOnlyThis')}
                </DropdownMenuItem>
              )}
              {/* 子タグを追加（ルートレベルのみ） */}
              {depth === 0 && onAddChildTag && (
                <DropdownMenuItem onClick={onAddChildTag}>
                  <Plus className="mr-2 size-4" />
                  {t('calendar.filter.addChildTag')}
                </DropdownMenuItem>
              )}
              {/* 削除 */}
              {onDeleteTag && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onDeleteTag}>
                    <Trash2 className="mr-2 size-4" />
                    {t('common.actions.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* カウント */}
          <span className="text-muted-foreground ml-1 shrink-0 pr-2 text-xs tabular-nums">
            {count}
          </span>
        </div>
      </li>
    );

    return (
      <>
        {content}

        {/* Rename Dialog */}
        <TagRenameDialog
          isOpen={showRenameDialog}
          onClose={() => setShowRenameDialog(false)}
          onSave={handleSaveRename}
          currentName={tag.name}
          tagId={tag.id}
        />

        {/* Note Dialog */}
        <TagNoteDialog
          isOpen={showNoteDialog}
          onClose={() => setShowNoteDialog(false)}
          onSave={handleSaveNote}
          currentNote={tag.description ?? ''}
        />
      </>
    );
  },
);

TagTreeItem.displayName = 'TagTreeItem';
