'use client';

import { Eye, FileText, FolderUp, Merge, Palette, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldError, FieldLabel, FieldSupportText } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

interface FilterItemMenuProps {
  tagId: string;
  displayColor: string;
  editDescription: string;
  parentId: string | null | undefined;
  parentTags: Array<{ id: string; name: string; color?: string | null }> | undefined;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;

  // Handlers
  onStartRename: () => void;
  onColorChange: (color: string) => void;
  onDescriptionChange: (description: string) => void;
  onSaveDescription: () => void;
  onChangeParent: ((newParentId: string | null) => void) | undefined;
  onOpenMergeModal: () => void;
  onShowOnlyTag: () => void;
  onDeleteTag: (() => void) | undefined;
}

export function FilterItemMenu({
  tagId,
  displayColor,
  editDescription,
  parentId,
  parentTags,
  textareaRef,
  onStartRename,
  onColorChange,
  onDescriptionChange,
  onSaveDescription,
  onChangeParent,
  onOpenMergeModal,
  onShowOnlyTag,
  onDeleteTag,
}: FilterItemMenuProps) {
  const t = useTranslations();

  return (
    <DropdownMenuContent align="start" side="right">
      {/* 名前を変更 */}
      <DropdownMenuItem onClick={onStartRename}>
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
          <ColorPalettePicker selectedColor={displayColor} onColorSelect={onColorChange} />
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
            <FieldLabel htmlFor={`tag-note-${tagId}`}>{t('calendar.filter.noteLabel')}</FieldLabel>
            <div className="flex items-center justify-between">
              <FieldSupportText id={`tag-note-support-${tagId}`}>
                {t('calendar.filter.noteHint')}
              </FieldSupportText>
              <span className="text-muted-foreground text-xs tabular-nums">
                {editDescription.length}/100
              </span>
            </div>
            <Textarea
              id={`tag-note-${tagId}`}
              ref={textareaRef}
              value={editDescription}
              placeholder={t('calendar.filter.notePlaceholder')}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 100) {
                  onDescriptionChange(value);
                  // Auto height adjustment
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  textarea.style.height = `${textarea.scrollHeight}px`;
                }
              }}
              onBlur={onSaveDescription}
              maxLength={100}
              aria-describedby={`tag-note-support-${tagId}`}
              className="border-border min-h-[60px] w-full resize-none border text-sm"
            />
            {editDescription.length >= 100 && (
              <FieldError noPrefix>{t('common.validation.limitReached')}</FieldError>
            )}
          </Field>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      {/* 親タグを変更 */}
      {parentTags && parentTags.length > 0 && onChangeParent && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderUp className="mr-2 size-4" />
            {t('calendar.filter.changeParent')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => onChangeParent(null)}
              className={cn(!parentId && 'bg-state-selected')}
            >
              {t('calendar.filter.noParent')}
            </DropdownMenuItem>
            {parentTags.map((parent) => (
              <DropdownMenuItem
                key={parent.id}
                onClick={() => onChangeParent(parent.id)}
                className={cn(parentId === parent.id && 'bg-state-selected')}
              >
                <span className="mr-1 font-normal" style={{ color: parent.color || '#3B82F6' }}>
                  #
                </span>
                {parent.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}

      {/* マージ */}
      <DropdownMenuItem onClick={onOpenMergeModal}>
        <Merge className="mr-2 size-4" />
        {t('calendar.filter.merge')}
      </DropdownMenuItem>

      {/* このタグだけ表示 */}
      <DropdownMenuItem onClick={onShowOnlyTag}>
        <Eye className="mr-2 size-4" />
        {t('calendar.filter.showOnlyThis')}
      </DropdownMenuItem>

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
  );
}

/** タグなし用のシンプルなメニュー */
export function UntaggedItemMenu({ onShowOnlyThis }: { onShowOnlyThis: () => void }) {
  const t = useTranslations();

  return (
    <DropdownMenuContent align="start" side="right">
      <DropdownMenuItem onClick={onShowOnlyThis}>
        <Eye className="mr-2 size-4" />
        {t('calendar.filter.showOnlyThis')}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
