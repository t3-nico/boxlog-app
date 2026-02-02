import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Tokens/Shadows',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AllShadows: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Shadows（影）</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="size-24 bg-card rounded-lg shadow-none mx-auto mb-4" />
          <code className="text-xs bg-container px-2 py-1 rounded">shadow-none</code>
        </div>

        <div className="text-center">
          <div className="size-24 bg-card rounded-lg shadow-sm mx-auto mb-4" />
          <code className="text-xs bg-container px-2 py-1 rounded">shadow-sm</code>
        </div>

        <div className="text-center">
          <div className="size-24 bg-card rounded-lg shadow mx-auto mb-4" />
          <code className="text-xs bg-container px-2 py-1 rounded">shadow</code>
        </div>

        <div className="text-center">
          <div className="size-24 bg-card rounded-lg shadow-md mx-auto mb-4" />
          <code className="text-xs bg-container px-2 py-1 rounded">shadow-md</code>
        </div>

        <div className="text-center">
          <div className="size-24 bg-card rounded-lg shadow-lg mx-auto mb-4" />
          <code className="text-xs bg-container px-2 py-1 rounded">shadow-lg</code>
        </div>

        <div className="text-center">
          <div className="size-24 bg-card rounded-lg shadow-xl mx-auto mb-4" />
          <code className="text-xs bg-container px-2 py-1 rounded">shadow-xl</code>
        </div>

        <div className="text-center">
          <div className="size-24 bg-card rounded-lg shadow-2xl mx-auto mb-4" />
          <code className="text-xs bg-container px-2 py-1 rounded">shadow-2xl</code>
        </div>
      </div>
    </div>
  ),
};

export const UseCases: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">使用例</h1>

      <div className="space-y-8">
        <div>
          <h3 className="font-medium mb-4">カード（shadow-sm）</h3>
          <div className="p-4 bg-card border border-border rounded-lg shadow-sm w-64">
            <p className="font-medium">カードタイトル</p>
            <p className="text-sm text-muted-foreground">軽い影で浮き上がりを表現</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">ドロップダウン（shadow-lg）</h3>
          <div className="p-2 bg-card border border-border rounded-lg shadow-lg w-48">
            <div className="px-3 py-2 hover:bg-state-hover rounded">メニュー1</div>
            <div className="px-3 py-2 hover:bg-state-hover rounded">メニュー2</div>
            <div className="px-3 py-2 hover:bg-state-hover rounded">メニュー3</div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">モーダル（shadow-xl）</h3>
          <div className="p-6 bg-card border border-border rounded-xl shadow-xl w-80">
            <h4 className="text-lg font-semibold mb-2">モーダルタイトル</h4>
            <p className="text-sm text-muted-foreground mb-4">
              大きな影で前面に浮き出す印象を与えます。
            </p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 text-sm rounded-md hover:bg-state-hover">
                キャンセル
              </button>
              <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
