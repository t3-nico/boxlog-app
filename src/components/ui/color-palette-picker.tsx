'use client'

import { Check, Circle } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TAG_COLOR_PALETTE } from '@/config/ui/colors'
import { cn } from '@/lib/utils'

interface ColorPalettePickerProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  className?: string
}

// カラー名マッピング
const COLOR_NAMES: Record<string, string> = {
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

export function ColorPalettePicker({ selectedColor, onColorSelect, className }: ColorPalettePickerProps) {
  return (
    <TooltipProvider delayDuration={500}>
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
                  className={cn(
                    'group relative shrink-0 transition-all',
                    'hover:scale-110',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                    isSelected && 'scale-105'
                  )}
                  aria-label={`${colorName}を選択`}
                >
                  <Circle
                    className={cn('h-6 w-6 transition-all', isSelected ? 'stroke-muted-foreground' : 'stroke-border')}
                    fill={color}
                    strokeWidth={2}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="text-background h-3 w-3" strokeWidth={3} />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>{colorName}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
