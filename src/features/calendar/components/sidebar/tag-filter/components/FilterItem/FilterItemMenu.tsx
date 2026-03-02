'use client';

import { Eye, Merge, Palette, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ColorPaletteMenuItems } from '@/components/ui/color-palette-picker';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

interface FilterItemMenuProps {
  displayColor: string;

  // Handlers
  onOpenRenameDialog: () => void;
  onColorChange: (color: string) => void;
  onOpenMergeModal: () => void;
  onShowOnlyTag: () => void;
  onDeleteTag: (() => void) | undefined;
}

export function FilterItemMenu({
  displayColor,
  onOpenRenameDialog,
  onColorChange,
  onOpenMergeModal,
  onShowOnlyTag,
  onDeleteTag,
}: FilterItemMenuProps) {
  const t = useTranslations();

  return (
    <DropdownMenuContent align="start" side="right">
      {/* 名前を変更 */}
      <DropdownMenuItem onClick={onOpenRenameDialog}>
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
          <ColorPaletteMenuItems selectedColor={displayColor} onColorSelect={onColorChange} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>

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
            {t('common.actions.delete')}
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
