import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">ポップオーバーを開く</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>これはポップオーバーのコンテンツです。</p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">設定を変更</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">寸法</h4>
            <p className="text-sm text-muted-foreground">
              レイヤーの寸法を設定します。
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">幅</Label>
              <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">最大幅</Label>
              <Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">高さ</Label>
              <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">上</Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-40">
          <p className="text-sm">上に表示</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">下</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" className="w-40">
          <p className="text-sm">下に表示</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">左</Button>
        </PopoverTrigger>
        <PopoverContent side="left" className="w-40">
          <p className="text-sm">左に表示</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">右</Button>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-40">
          <p className="text-sm">右に表示</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">開始</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-40">
          <p className="text-sm">開始位置に揃える</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">中央</Button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-40">
          <p className="text-sm">中央に揃える</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">終了</Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40">
          <p className="text-sm">終了位置に揃える</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Popover - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">基本</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">ポップオーバー</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p>シンプルなポップオーバー</p>
            </PopoverContent>
          </Popover>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">フォーム付き</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button>設定</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-popover">名前</Label>
                  <Input id="name-popover" placeholder="名前を入力" />
                </div>
                <Button className="w-full">保存</Button>
              </div>
            </PopoverContent>
          </Popover>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">位置</h2>
          <div className="flex flex-wrap gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">上</Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-32">
                上
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">下</Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="w-32">
                下
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">左</Button>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-32">
                左
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">右</Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="w-32">
                右
              </PopoverContent>
            </Popover>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用場面</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>日付ピッカー</li>
            <li>カラーピッカー</li>
            <li>クイック設定フォーム</li>
            <li>追加情報の表示</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
