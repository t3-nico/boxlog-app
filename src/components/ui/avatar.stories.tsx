import type { Meta, StoryObj } from '@storybook/react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar className="h-8 w-8">
      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar className="h-8 w-8">
      <AvatarImage src="/invalid-url.png" alt="User" />
      <AvatarFallback>山田</AvatarFallback>
    </Avatar>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">Avatar - 実使用パターン</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold">サイズ（className指定）</h2>
          <div className="flex items-end gap-4">
            <div className="text-center">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">A</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">h-6 w-6</p>
            </div>
            <div className="text-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm">B</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">h-8 w-8</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">角丸バリエーション</h2>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Avatar className="h-6 w-6">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">デフォルト</p>
            </div>
            <div className="text-center">
              <Avatar className="h-6 w-6 rounded-2xl">
                <AvatarFallback className="rounded-2xl">B</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">rounded-2xl</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">画像 + フォールバック</h2>
          <div className="flex gap-4">
            <div className="text-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">画像あり</p>
            </div>
            <div className="text-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/invalid.png" alt="User" />
                <AvatarFallback>山田</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">フォールバック</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
