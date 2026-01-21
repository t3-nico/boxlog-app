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
  useRef,
  useState,
} from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
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
import { Field, FieldError, FieldLabel, FieldSupportText } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HoverTooltip } from '@/components/ui/tooltip';
import { TAG_NAME_MAX_LENGTH } from '@/features/tags/constants/colors';
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

    // インライン編集
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(tag.name);
    const inputRef = useRef<HTMLInputElement>(null);

    // 楽観的更新用
    const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
    const displayColor = optimisticColor ?? tag.color;

    // 説明編集
    const [editDescription, setEditDescription] = useState(tag.description ?? '');

    // description prop と editDescription を同期
    useEffect(() => {
      setEditDescription(tag.description ?? '');
    }, [tag.description]);

    // 編集開始時にフォーカス
    useEffect(() => {
      if (!isEditing) return;
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(0, 0);
        }
      }, 50);
      return () => clearTimeout(timer);
    }, [isEditing]);

    // サーバーからの色が更新されたら楽観的更新をクリア
    useEffect(() => {
      if (tag.color && optimisticColor && tag.color === optimisticColor) {
        setOptimisticColor(null);
      }
    }, [tag.color, optimisticColor]);

    // 名前変更開始
    const handleStartRename = useCallback(() => {
      setMenuOpen(false);
      setEditName(tag.name);
      setTimeout(() => {
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 50);
    }, [tag.name]);

    // 名前保存
    const handleSaveName = useCallback(() => {
      setIsEditing(false);
      const trimmed = editName.trim();
      if (!trimmed || trimmed === tag.name) {
        setEditName(tag.name);
        return;
      }
      onUpdateTag?.({ name: trimmed });
    }, [editName, tag.name, onUpdateTag]);

    // キーボード操作
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveName();
        } else if (e.key === 'Escape') {
          setIsEditing(false);
          setEditName(tag.name);
        }
      },
      [handleSaveName, tag.name],
    );

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

    // 説明保存
    const handleSaveDescription = useCallback(() => {
      const trimmed = editDescription.trim();
      if (trimmed === (tag.description ?? '')) return;
      onUpdateTag?.({ description: trimmed || null });
    }, [editDescription, tag.description, onUpdateTag]);

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
          className="pointer-events-none box-border inline-block list-none p-0 pt-1.5 pl-2.5"
          {...props}
        >
          <div
            className="bg-card border-border relative flex items-center rounded border py-1.5 pr-6 shadow-lg"
            ref={ref}
            style={style}
          >
            <div
              className="ml-2 h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: displayColor }}
            />
            <span className="ml-2 grow overflow-hidden text-sm text-ellipsis whitespace-nowrap">
              {tag.name}
            </span>
            {childCount && childCount > 1 && (
              <span className="bg-primary text-primary-foreground absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
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
          {...handleProps}
        >
          <Checkbox
            checked={checked}
            onCheckedChange={() => onToggle?.()}
            onClick={(e) => e.stopPropagation()}
            className="ml-2 shrink-0 cursor-pointer"
            style={checkboxStyle}
          />

          {isEditing ? (
            <div className="ml-2 flex flex-1 flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
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
            <>
              <span className="text-foreground ml-2 min-w-0 flex-1 truncate">{tag.name}</span>
              {/* 折りたたみボタン（子タグがある場合のみ） */}
              {hasChildren && onCollapse && (
                <button
                  type="button"
                  aria-expanded={!collapsed}
                  aria-label={
                    collapsed ? t('calendar.filter.expand') : t('calendar.filter.collapse')
                  }
                  className="relative flex size-6 shrink-0 items-center justify-center before:absolute before:-inset-2 before:content-['']"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollapse();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <ChevronRight
                    className={cn('size-4 transition-transform', !collapsed && 'rotate-90')}
                  />
                </button>
              )}
            </>
          )}

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
              <DropdownMenuItem onClick={handleStartRename}>
                <Pencil className="mr-2 size-4" />
                {t('calendar.filter.rename')}
              </DropdownMenuItem>
              {/* カラーを変更 */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 size-4" />
                  {t('calendar.filter.changeColor')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-2">
                  <ColorPalettePicker
                    selectedColor={displayColor}
                    onColorSelect={handleColorChange}
                  />
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {/* ノートを編集 */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileText className="mr-2 size-4" />
                  {t('calendar.filter.editNote')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-[280px] p-3">
                  <Field>
                    <FieldLabel htmlFor={`tag-note-${tag.id}`}>
                      {t('calendar.filter.noteLabel')}
                    </FieldLabel>
                    <div className="flex items-center justify-between">
                      <FieldSupportText id={`tag-note-support-${tag.id}`}>
                        {t('calendar.filter.noteHint')}
                      </FieldSupportText>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {editDescription.length}/100
                      </span>
                    </div>
                    <Textarea
                      id={`tag-note-${tag.id}`}
                      value={editDescription}
                      placeholder={t('calendar.filter.notePlaceholder')}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 100) {
                          setEditDescription(value);
                          const textarea = e.target;
                          textarea.style.height = 'auto';
                          textarea.style.height = `${textarea.scrollHeight}px`;
                        }
                      }}
                      onBlur={handleSaveDescription}
                      maxLength={100}
                      aria-describedby={`tag-note-support-${tag.id}`}
                      className="border-border min-h-[60px] w-full resize-none border text-sm"
                    />
                    {editDescription.length >= 100 && (
                      <FieldError noPrefix>{t('common.validation.limitReached')}</FieldError>
                    )}
                  </Field>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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
                            className="mr-1 font-medium"
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
                    {t('actions.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* カウント */}
          <span className="text-muted-foreground flex size-6 shrink-0 items-center justify-center text-xs tabular-nums">
            {count}
          </span>
        </div>
      </li>
    );

    // 説明がある場合はツールチップで表示
    return (
      <HoverTooltip
        content={tag.description}
        side="top"
        disabled={!tag.description || menuOpen}
        wrapperClassName="w-full"
      >
        {content}
      </HoverTooltip>
    );
  },
);

TagTreeItem.displayName = 'TagTreeItem';
