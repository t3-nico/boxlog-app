'use client'

import { Check, Circle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TAG_COLOR_PALETTE } from '@/config/ui/colors'
import { cn } from '@/lib/utils'

interface ColorPalettePickerProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  className?: string
}

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
}

/**
 * カラーパレットピッカー（グリッド表示）
 * Popover内で使用するグリッド型のカラー選択UI
 */
export function ColorPalettePicker({ selectedColor, onColorSelect, className }: ColorPalettePickerProps) {
  const t = useTranslations('aria')
  return (
    <div className={cn('flex gap-2', className)}>
      {TAG_COLOR_PALETTE.map((color) => {
        const isSelected = selectedColor === color
        const colorName = COLOR_NAMES[color] || color

        return (
          <Tooltip key={color}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onColorSelect(color)}
                tabIndex={-1}
                className={cn(
                  'group relative shrink-0 transition-all',
                  'hover:scale-110',
                  'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  isSelected && 'scale-105'
                )}
                aria-label={t('selectColor', { color: colorName })}
              >
                <Circle className="stroke-border h-6 w-6 transition-all" fill={color} strokeWidth={2} />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="text-background h-3 w-3" strokeWidth={3} />
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{colorName}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

/**
 * カラーパレットピッカー（グリッド表示 - 5x2）
 * Inspector内で使用するグリッド型のカラー選択UI
 */
interface ColorPaletteGridProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  className?: string
}

export function ColorPaletteGrid({ selectedColor, onColorSelect, className }: ColorPaletteGridProps) {
  return (
    <div className={cn('grid grid-cols-5 gap-2', className)}>
      {TAG_COLOR_PALETTE.map((color) => {
        const isSelected = selectedColor === color
        return (
          <button
            key={color}
            type="button"
            onClick={() => onColorSelect(color)}
            className={cn(
              'size-5 rounded-full transition-transform hover:scale-110',
              isSelected && 'ring-primary ring-2 ring-offset-2'
            )}
            style={{ backgroundColor: color }}
            aria-label={`色を${COLOR_NAMES[color] || color}に変更`}
          />
        )
      })}
    </div>
  )
}

/**
 * カラーパレットメニューアイテム（DropdownMenu用）
 * DropdownMenuContent / DropdownMenuSubContent の中で使用
 */
interface ColorPaletteMenuItemsProps {
  selectedColor: string
  onColorSelect: (color: string) => void
}

export function ColorPaletteMenuItems({ selectedColor, onColorSelect }: ColorPaletteMenuItemsProps) {
  return (
    <>
      {TAG_COLOR_PALETTE.map((color) => {
        const isSelected = selectedColor === color
        const colorName = COLOR_NAMES[color] || color

        return (
          <DropdownMenuItem key={color} onClick={() => onColorSelect(color)} className="hover:bg-state-hover">
            <Circle className="mr-2 h-4 w-4" fill={color} strokeWidth={0} />
            <span className="flex-1">{colorName}</span>
            {isSelected && <Check className="text-primary ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        )
      })}
    </>
  )
}
