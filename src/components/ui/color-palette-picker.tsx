'use client';

import { Check, Circle } from 'lucide-react';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TAG_COLOR_PALETTE } from '@/config/ui/colors';

// カラー名マッピング
export const COLOR_NAMES: Record<string, string> = {
  '#3B82F6': 'Blue',
  '#10B981': 'Green',
  '#EF4444': 'Red',
  '#F59E0B': 'Amber',
  '#8B5CF6': 'Violet',
  '#EC4899': 'Pink',
  '#06B6D4': 'Cyan',
  '#F97316': 'Orange',
  '#6B7280': 'Gray',
  '#6366F1': 'Indigo',
};

/**
 * カラーパレットメニューアイテム（DropdownMenu用）
 * DropdownMenuContent / DropdownMenuSubContent の中で使用
 */
interface ColorPaletteMenuItemsProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPaletteMenuItems({
  selectedColor,
  onColorSelect,
}: ColorPaletteMenuItemsProps) {
  return (
    <>
      {TAG_COLOR_PALETTE.map((color) => {
        const isSelected = selectedColor === color;
        const colorName = COLOR_NAMES[color] || color;

        return (
          <DropdownMenuItem
            key={color}
            onClick={() => onColorSelect(color)}
            className="hover:bg-state-hover"
          >
            <Circle className="mr-2 h-4 w-4" fill={color} strokeWidth={0} />
            <span className="flex-1">{colorName}</span>
            {isSelected && <Check className="text-primary ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        );
      })}
    </>
  );
}
