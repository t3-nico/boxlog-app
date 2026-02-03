import type { Meta, StoryObj } from '@storybook/react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
      description: 'アバターのサイズ',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/invalid-url.png" alt="User" />
      <AvatarFallback>山田</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="xs">
        <AvatarFallback>XS</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarFallback>XL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithImages: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
        <AvatarFallback>VC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/github.png" alt="@github" />
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-background border-2">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2">
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2">
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2">
        <AvatarFallback>+3</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">Avatar - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold">サイズ</h2>
          <div className="flex items-end gap-4">
            <div className="text-center">
              <Avatar size="xs">
                <AvatarFallback>XS</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">xs (24px)</p>
            </div>
            <div className="text-center">
              <Avatar size="sm">
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">sm (32px)</p>
            </div>
            <div className="text-center">
              <Avatar size="default">
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">default (40px)</p>
            </div>
            <div className="text-center">
              <Avatar size="lg">
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">lg (48px)</p>
            </div>
            <div className="text-center">
              <Avatar size="xl">
                <AvatarFallback>XL</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">xl (64px)</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">画像 + フォールバック</h2>
          <div className="flex gap-4">
            <div className="text-center">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">画像あり</p>
            </div>
            <div className="text-center">
              <Avatar>
                <AvatarImage src="/invalid.png" alt="User" />
                <AvatarFallback>山田</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground mt-2 text-xs">フォールバック</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">グループ</h2>
          <div className="flex -space-x-4">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <Avatar key={letter} className="border-background border-2">
                <AvatarFallback>{letter}</AvatarFallback>
              </Avatar>
            ))}
            <Avatar className="border-background border-2">
              <AvatarFallback className="text-xs">+5</AvatarFallback>
            </Avatar>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">使用場面</h2>
          <ul className="text-muted-foreground list-inside list-disc text-sm">
            <li>ユーザープロフィール</li>
            <li>コメント投稿者</li>
            <li>チームメンバー一覧</li>
            <li>ナビゲーションのアカウントメニュー</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
