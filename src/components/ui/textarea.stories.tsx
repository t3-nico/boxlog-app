import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Textarea } from './textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'メモを入力...',
    className: 'w-80',
  },
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const MAX_LENGTH = 200;
    const [value, setValue] = useState('');

    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">Textarea</h1>
        <p className="text-muted-foreground mb-8">複数行テキスト入力</p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
          {/* 基本（文字数カウンター付き） */}
          <section>
            <h2 className="mb-4 text-lg font-bold">基本</h2>
            <div>
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="メモを入力..."
                maxLength={MAX_LENGTH}
                className="min-h-[80px] resize-none"
              />
              <p className="text-muted-foreground mt-1 text-right text-sm">
                {value.length}/{MAX_LENGTH}
              </p>
            </div>
          </section>

          {/* 状態 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">状態</h2>
            <div className="space-y-4">
              <Textarea placeholder="通常" className="min-h-[80px] resize-none" />
              <Textarea placeholder="無効" disabled className="min-h-[80px] resize-none" />
              <Textarea
                placeholder="エラー状態"
                aria-invalid="true"
                className="min-h-[80px] resize-none"
              />
            </div>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
