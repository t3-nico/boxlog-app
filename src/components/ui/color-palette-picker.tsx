'use client';

import { Check } from 'lucide-react';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TAG_COLOR_MAP, TAG_COLOR_NAMES, resolveTagColor } from '@/config/ui/colors';
import { cn } from '@/lib/utils';

import type { TagColorName } from '@/config/ui/colors';

// カラー表示名マッピング
export const COLOR_DISPLAY_NAMES: Record<TagColorName, string> = {
  red: 'Red',
  orange: 'Orange',
  amber: 'Amber',
  green: 'Green',
  teal: 'Teal',
  blue: 'Blue',
  indigo: 'Indigo',
  violet: 'Violet',
  pink: 'Pink',
  gray: 'Gray',
};

/**
 * カラーパレットメニューアイテム（DropdownMenu用）
 * DropdownMenuContent / DropdownMenuSubContent の中で使用
 */
interface ColorPaletteMenuItemsProps {
  selectedColor: string;
  onColorSelect: (color: TagColorName) => void;
}

export function ColorPaletteMenuItems({
  selectedColor,
  onColorSelect,
}: ColorPaletteMenuItemsProps) {
  const resolvedSelected = resolveTagColor(selectedColor);

  return (
    <>
      {TAG_COLOR_NAMES.map((colorName) => {
        const isSelected = resolvedSelected === colorName;
        const displayName = COLOR_DISPLAY_NAMES[colorName];

        return (
          <DropdownMenuItem
            key={colorName}
            onClick={() => onColorSelect(colorName)}
            className="hover:bg-state-hover"
          >
            <span
              className={cn('mr-2 h-4 w-4 rounded-full', TAG_COLOR_MAP[colorName].dot)}
              aria-hidden
            />
            <span className="flex-1">{displayName}</span>
            {isSelected && <Check className="text-primary ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        );
      })}
    </>
  );
}
