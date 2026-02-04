import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from './button';
import { ColorPaletteMenuItems, ColorPalettePicker } from './color-palette-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';

const meta = {
  title: 'Components/ColorPalettePicker',
  component: ColorPalettePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ColorPalettePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  args: {
    selectedColor: '#3B82F6',
    onColorSelect: () => {},
  },
  render: function ColorPalettePickerStory() {
    const [color1, setColor1] = useState('#3B82F6');
    const [color2, setColor2] = useState('#10B981');

    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">ColorPalettePicker</h1>
        <p className="text-muted-foreground mb-8">
          タグのカラー選択。グリッド表示とドロップダウンメニュー形式の2種類。
        </p>

        <div className="grid gap-8" style={{ maxWidth: '48rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">グリッド表示（主要用途）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              タグ作成・編集モーダルで使用。10色のパレットから選択。
            </p>
            <div className="bg-card border-border rounded-lg border p-4">
              <label className="text-foreground mb-2 block text-sm font-normal">タグの色</label>
              <ColorPalettePicker selectedColor={color1} onColorSelect={setColor1} />
              <p className="text-muted-foreground mt-2 text-sm">選択中: {color1}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">ドロップダウンメニュー形式</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              FilterItemMenuで使用。DropdownMenuContent内にColorPaletteMenuItemsを配置。
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <span className="size-4 rounded-full" style={{ backgroundColor: color2 }} />
                  色を変更
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <ColorPaletteMenuItems selectedColor={color2} onColorSelect={setColor2} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">カラーパレット（10色）</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <div className="grid grid-cols-5 gap-4">
                {[
                  { name: 'Blue', color: '#3B82F6' },
                  { name: 'Green', color: '#10B981' },
                  { name: 'Red', color: '#EF4444' },
                  { name: 'Amber', color: '#F59E0B' },
                  { name: 'Violet', color: '#8B5CF6' },
                  { name: 'Pink', color: '#EC4899' },
                  { name: 'Cyan', color: '#06B6D4' },
                  { name: 'Orange', color: '#F97316' },
                  { name: 'Gray', color: '#6B7280' },
                  { name: 'Indigo', color: '#6366F1' },
                ].map((item) => (
                  <div key={item.color} className="flex flex-col items-center gap-1">
                    <div className="size-8 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground text-xs">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>ColorPalettePicker - グリッド表示（Popover内で使用）</li>
                <li>ColorPaletteMenuItems - DropdownMenu用リスト形式</li>
                <li>TAG_COLOR_PALETTE - 10色のカラー定義（config/ui/colors）</li>
                <li>COLOR_NAMES - カラー名マッピング（ツールチップ用）</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>TagCreateModal - タグ作成時の色選択</li>
              <li>TagTreeItem - サイドバーのタグ色変更</li>
              <li>FilterItemMenu - フィルターアイテムの色変更</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
