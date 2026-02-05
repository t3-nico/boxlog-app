import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from './popover';

/**
 * Popover - ポップオーバー
 *
 * ## 使用コンポーネント
 *
 * | コンポーネント | 用途 |
 * |----------------|------|
 * | Popover | ルートコンテナ |
 * | PopoverTrigger | トリガーボタン（asChild でラップ） |
 * | PopoverAnchor | カスタムアンカー（Input等をトリガーにする場合） |
 * | PopoverContent | コンテンツ本体 |
 *
 * ## Trigger vs Anchor
 *
 * | パターン | 使用コンポーネント | ユースケース |
 * |----------|-------------------|--------------|
 * | ボタンで開閉 | PopoverTrigger | 設定ボタン、アクションボタン |
 * | Input で開閉 | PopoverAnchor | 時刻選択、コンボボックス |
 *
 * ## z-index
 *
 * - 通常: `z-popover` (100)
 * - Inspector上: `z-overlay-popover` (1200) を className で上書き
 */
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
            <h4 className="leading-none font-bold">寸法</h4>
            <p className="text-muted-foreground text-sm">レイヤーの寸法を設定します。</p>
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
          <Button variant="outline" size="sm">
            上
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-40">
          <p className="text-sm">上に表示</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            下
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" className="w-40">
          <p className="text-sm">下に表示</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            左
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" className="w-40">
          <p className="text-sm">左に表示</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            右
          </Button>
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
          <Button variant="outline" size="sm">
            開始
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-40">
          <p className="text-sm">開始位置に揃える</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            中央
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-40">
          <p className="text-sm">中央に揃える</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            終了
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40">
          <p className="text-sm">終了位置に揃える</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

/**
 * PopoverAnchor を使った Combobox 風パターン
 * - Input をアンカーにしてドロップダウンを表示
 * - TimeSelect などで使用
 */
export const WithAnchor: Story = {
  render: function WithAnchorStory() {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState('10:00');

    const options = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-24"
            placeholder="--:--"
          />
        </PopoverAnchor>
        <PopoverContent className="w-24 p-1" align="start">
          <div className="space-y-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`hover:bg-state-hover w-full rounded px-2 py-1 text-left text-sm ${
                  option === value ? 'bg-state-selected' : ''
                }`}
                onClick={() => {
                  setValue(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

export const AllPatterns: Story = {
  render: () => (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Popover - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-bold">基本</h2>
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
          <h2 className="mb-4 text-lg font-bold">フォーム付き</h2>
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
          <h2 className="mb-4 text-lg font-bold">位置</h2>
          <div className="flex flex-wrap gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  上
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-32">
                上
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  下
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="w-32">
                下
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  左
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-32">
                左
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  右
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="w-32">
                右
              </PopoverContent>
            </Popover>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">使用場面</h2>
          <ul className="text-muted-foreground list-inside list-disc text-sm">
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
