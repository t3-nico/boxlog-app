import type { Meta, StoryObj } from '@storybook/react';
import { Circle } from 'lucide-react';
import { useState } from 'react';

import { Button } from './button';
import { COLOR_NAMES, ColorPaletteMenuItems } from './color-palette-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';

const meta = {
  title: 'Components/ColorPaletteMenuItems',
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
    selectedColor: '#3B82F6',
    onColorSelect: () => {},
  },
  render: function ColorPaletteMenuItemsStory() {
    const [color1, setColor1] = useState('#3B82F6');
    const [color2, setColor2] = useState('#10B981');

    return (
      <div className="flex flex-col items-start gap-6">
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Circle className="size-4" fill={color1} strokeWidth={0} />
                {COLOR_NAMES[color1]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <ColorPaletteMenuItems selectedColor={color1} onColorSelect={setColor1} />
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Circle className="size-4" fill={color2} strokeWidth={0} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <ColorPaletteMenuItems selectedColor={color2} onColorSelect={setColor2} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  },
};
