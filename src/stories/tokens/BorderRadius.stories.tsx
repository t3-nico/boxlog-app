import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Tokens/BorderRadius',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AllRadius: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Border Radius（角丸）</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="size-24 bg-primary rounded-none mx-auto mb-2" />
          <code className="text-xs bg-container px-2 py-1 rounded">rounded-none</code>
          <p className="text-xs text-muted-foreground mt-1">0px</p>
        </div>

        <div className="text-center">
          <div className="size-24 bg-primary rounded-sm mx-auto mb-2" />
          <code className="text-xs bg-container px-2 py-1 rounded">rounded-sm</code>
          <p className="text-xs text-muted-foreground mt-1">2px</p>
        </div>

        <div className="text-center">
          <div className="size-24 bg-primary rounded mx-auto mb-2" />
          <code className="text-xs bg-container px-2 py-1 rounded">rounded</code>
          <p className="text-xs text-muted-foreground mt-1">4px</p>
        </div>

        <div className="text-center">
          <div className="size-24 bg-primary rounded-md mx-auto mb-2" />
          <code className="text-xs bg-container px-2 py-1 rounded">rounded-md</code>
          <p className="text-xs text-muted-foreground mt-1">6px</p>
        </div>

        <div className="text-center">
          <div className="size-24 bg-primary rounded-lg mx-auto mb-2" />
          <code className="text-xs bg-container px-2 py-1 rounded">rounded-lg</code>
          <p className="text-xs text-muted-foreground mt-1">8px</p>
        </div>

        <div className="text-center">
          <div className="size-24 bg-primary rounded-xl mx-auto mb-2" />
          <code className="text-xs bg-container px-2 py-1 rounded">rounded-xl</code>
          <p className="text-xs text-muted-foreground mt-1">12px</p>
        </div>

        <div className="text-center">
          <div className="size-24 bg-primary rounded-2xl mx-auto mb-2" />
          <code className="text-xs bg-container px-2 py-1 rounded">rounded-2xl</code>
          <p className="text-xs text-muted-foreground mt-1">16px</p>
        </div>

        <div className="text-center">
          <div className="size-24 bg-primary rounded-full mx-auto mb-2" />
          <code className="text-xs bg-container px-2 py-1 rounded">rounded-full</code>
          <p className="text-xs text-muted-foreground mt-1">9999px</p>
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
          <h3 className="font-medium mb-4">ボタン</h3>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              rounded-md
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full">
              rounded-full
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">カード</h3>
          <div className="flex gap-4">
            <div className="p-4 bg-card border border-border rounded-lg w-48">
              <p className="font-medium">rounded-lg</p>
              <p className="text-sm text-muted-foreground">カードの標準</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl w-48">
              <p className="font-medium">rounded-xl</p>
              <p className="text-sm text-muted-foreground">モダンな印象</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">アバター</h3>
          <div className="flex gap-4 items-center">
            <div className="size-12 bg-primary rounded-md" />
            <div className="size-12 bg-primary rounded-lg" />
            <div className="size-12 bg-primary rounded-full" />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">入力フィールド</h3>
          <input
            type="text"
            placeholder="rounded-md（標準）"
            className="px-3 py-2 bg-input border border-border rounded-md w-64"
          />
        </div>
      </div>
    </div>
  ),
};
