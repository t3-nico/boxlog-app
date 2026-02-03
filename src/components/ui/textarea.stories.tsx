import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';

import { Textarea } from './textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
    maxLength: {
      control: 'number',
      description: '最大文字数',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
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

export const WithMaxLength: Story = {
  render: function TextareaWithMaxLength() {
    const MAX_LENGTH = 200;
    const [value, setValue] = useState('');

    return (
      <div className="w-80">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="メモを入力..."
          maxLength={MAX_LENGTH}
          className="border-border min-h-[80px] w-full resize-none border text-sm"
        />
        <p className="text-muted-foreground mt-1 text-right text-sm">
          {value.length}/{MAX_LENGTH}
        </p>
      </div>
    );
  },
};

export const SingleLineMode: Story = {
  render: function SingleLineTextarea() {
    const MAX_LENGTH = 100;
    const [value, setValue] = useState('');

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value.replace(/[\r\n]/g, '');
      if (newValue.length <= MAX_LENGTH) {
        setValue(newValue);
      }
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    }, []);

    return (
      <div className="w-80">
        <p className="text-muted-foreground mb-2 text-sm">
          改行を無効化したTextarea（タグのメモなど）
        </p>
        <Textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="メモを入力（改行不可）..."
          maxLength={MAX_LENGTH}
          className="border-border min-h-[80px] w-full resize-none border text-sm"
        />
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const MAX_LENGTH = 200;
    const [value, setValue] = useState('');

    return (
      <div className="bg-background text-foreground p-8">
        <h1 className="mb-8 text-2xl font-bold">Textarea - 実際の使用パターン</h1>

        <div className="max-w-md space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">基本</h2>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="メモを入力..."
              maxLength={MAX_LENGTH}
              className="border-border min-h-[80px] w-full resize-none border text-sm"
            />
            <p className="text-muted-foreground mt-1 text-right text-sm">
              {value.length}/{MAX_LENGTH}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">無効状態</h2>
            <Textarea
              placeholder="無効"
              disabled
              className="border-border min-h-[80px] w-full resize-none border text-sm"
            />
          </section>
        </div>

        <div className="bg-muted mt-8 max-w-md rounded-lg p-4">
          <p className="text-muted-foreground text-sm">
            <strong>Note:</strong> rows属性は使用せず、min-h-[80px]とresize-noneをclassNameで指定
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
