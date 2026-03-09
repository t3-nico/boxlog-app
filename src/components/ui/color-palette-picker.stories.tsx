import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TAG_COLOR_MAP } from '@/config/ui/colors';
import { cn } from '@/lib/utils';

import type { TagColorName } from '@/config/ui/colors';

import { Button } from './button';
import { COLOR_DISPLAY_NAMES, ColorPaletteMenuItems } from './color-palette-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';

const meta = {
  title: 'Primitives/ColorPaletteMenuItems',
  component: ColorPaletteMenuItems,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ColorPaletteMenuItems>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  args: {
    selectedColor: 'blue',
    onColorSelect: () => {},
  },
  render: function ColorPaletteMenuItemsStory() {
    const [color1, setColor1] = useState<TagColorName>('blue');
    const [color2, setColor2] = useState<TagColorName>('green');

    return (
      <div className="flex flex-col items-start gap-6">
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <span
                  className={cn('size-4 rounded-full', TAG_COLOR_MAP[color1].dot)}
                  aria-hidden
                />
                {COLOR_DISPLAY_NAMES[color1]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <ColorPaletteMenuItems
                selectedColor={color1}
                onColorSelect={(c) => setColor1(c as TagColorName)}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" icon>
                <span
                  className={cn('size-4 rounded-full', TAG_COLOR_MAP[color2].dot)}
                  aria-hidden
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <ColorPaletteMenuItems
                selectedColor={color2}
                onColorSelect={(c) => setColor2(c as TagColorName)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  },
};
