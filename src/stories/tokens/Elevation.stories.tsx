import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Tokens/Elevation',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AllElevations: Story = {
  render: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Elevation（高さ）</h1>
      <p className="text-muted-foreground mb-8">
        UI要素のz軸上の位置を表現。高いほど前面に浮き出る。
      </p>

      <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-2 text-xs">Level 0</p>
          <div className="flex h-28 items-center justify-center">
            <div className="bg-card size-24 rounded-lg shadow-none" />
          </div>
          <code className="bg-container rounded px-2 py-1 text-xs">shadow-none</code>
          <p className="text-muted-foreground mt-2 text-xs">
            ベース面、
            <br />
            背景要素
          </p>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-2 text-xs">Level 1</p>
          <div className="flex h-28 items-center justify-center">
            <div className="bg-card size-24 rounded-lg shadow-xs" />
          </div>
          <code className="bg-container rounded px-2 py-1 text-xs">shadow-xs</code>
          <p className="text-muted-foreground mt-2 text-xs">
            入力フィールド、
            <br />
            微細な境界
          </p>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-2 text-xs">Level 2</p>
          <div className="flex h-28 items-center justify-center">
            <div className="bg-card size-24 rounded-lg shadow-sm" />
          </div>
          <code className="bg-container rounded px-2 py-1 text-xs">shadow-sm</code>
          <p className="text-muted-foreground mt-2 text-xs">
            カード、
            <br />
            軽い浮き上がり
          </p>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-2 text-xs">Level 3</p>
          <div className="flex h-28 items-center justify-center">
            <div className="bg-card size-24 rounded-lg shadow-md" />
          </div>
          <code className="bg-container rounded px-2 py-1 text-xs">shadow-md</code>
          <p className="text-muted-foreground mt-2 text-xs">
            ホバー状態、
            <br />
            アクティブカード
          </p>
        </div>

        <div className="text-center">
          <p className="mb-2 text-xs font-bold">Level 4</p>
          <div className="flex h-28 items-center justify-center">
            <div className="bg-card size-24 rounded-lg shadow-lg" />
          </div>
          <code className="bg-container rounded px-2 py-1 text-xs">shadow-lg</code>
          <p className="mt-2 text-xs font-bold">
            ドロップダウン、
            <br />
            ポップオーバー
          </p>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-2 text-xs">Level 5</p>
          <div className="flex h-28 items-center justify-center">
            <div className="bg-card size-24 rounded-lg shadow-xl" />
          </div>
          <code className="bg-container rounded px-2 py-1 text-xs">shadow-xl</code>
          <p className="text-muted-foreground mt-2 text-xs">
            モーダル、
            <br />
            最前面要素
          </p>
        </div>
      </div>
    </div>
  ),
};

export const UseCases: Story = {
  render: () => (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Elevationの使い分け</h1>
      <p className="text-muted-foreground mb-8">
        UIの階層構造に応じてElevationを選択。高いほどユーザーの注目を集める。
      </p>

      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-bold">
            Level 2: カード <code className="text-muted-foreground text-xs">shadow-sm</code>
          </h3>
          <div className="bg-card border-border w-64 rounded-lg border p-4 shadow-sm">
            <p className="font-bold">カードタイトル</p>
            <p className="text-muted-foreground text-sm">コンテンツをグループ化</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold">
            Level 4: ドロップダウン <code className="text-muted-foreground text-xs">shadow-lg</code>
          </h3>
          <div className="bg-card border-border w-48 rounded-lg border p-2 shadow-lg">
            <div className="hover:bg-state-hover rounded px-4 py-2">メニュー1</div>
            <div className="hover:bg-state-hover rounded px-4 py-2">メニュー2</div>
            <div className="hover:bg-state-hover rounded px-4 py-2">メニュー3</div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold">
            Level 5: モーダル <code className="text-muted-foreground text-xs">shadow-xl</code>
          </h3>
          <div className="bg-card border-border w-80 rounded-2xl border p-6 shadow-xl">
            <h4 className="mb-2 text-lg font-bold">モーダルタイトル</h4>
            <p className="text-muted-foreground mb-4 text-sm">最前面でユーザーの操作を待つ</p>
            <div className="flex justify-end gap-2">
              <button className="hover:bg-state-hover rounded-lg px-4 py-2 text-sm">
                キャンセル
              </button>
              <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
