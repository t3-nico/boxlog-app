import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Tokens/Spacing',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// スペーシングサンプルコンポーネント
function SpacingSample({ size, label }: { size: string; label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-24 text-sm">
        <code className="bg-container px-2 py-1 rounded">{size}</code>
      </div>
      <div className="text-sm text-muted-foreground w-16">{label}</div>
      <div className="flex-1 bg-container rounded overflow-hidden">
        <div className={`h-4 bg-primary ${size}`} />
      </div>
    </div>
  );
}

export const AllSpacing: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">スペーシング</h1>
      <p className="text-muted-foreground mb-8">
        Tailwind CSS のデフォルトスペーシングスケール（4px単位）
      </p>

      <div className="space-y-2">
        <SpacingSample size="w-0" label="0px" />
        <SpacingSample size="w-0.5" label="2px" />
        <SpacingSample size="w-1" label="4px" />
        <SpacingSample size="w-1.5" label="6px" />
        <SpacingSample size="w-2" label="8px" />
        <SpacingSample size="w-3" label="12px" />
        <SpacingSample size="w-4" label="16px" />
        <SpacingSample size="w-5" label="20px" />
        <SpacingSample size="w-6" label="24px" />
        <SpacingSample size="w-8" label="32px" />
        <SpacingSample size="w-10" label="40px" />
        <SpacingSample size="w-12" label="48px" />
        <SpacingSample size="w-16" label="64px" />
        <SpacingSample size="w-20" label="80px" />
        <SpacingSample size="w-24" label="96px" />
      </div>
    </div>
  ),
};

export const Gap: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Gap（要素間の余白）</h1>

      <div className="space-y-8">
        <div>
          <code className="text-xs bg-container px-2 py-1 rounded mb-2 inline-block">gap-1</code>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="size-8 bg-primary rounded" />
            ))}
          </div>
        </div>

        <div>
          <code className="text-xs bg-container px-2 py-1 rounded mb-2 inline-block">gap-2</code>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="size-8 bg-primary rounded" />
            ))}
          </div>
        </div>

        <div>
          <code className="text-xs bg-container px-2 py-1 rounded mb-2 inline-block">gap-4</code>
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="size-8 bg-primary rounded" />
            ))}
          </div>
        </div>

        <div>
          <code className="text-xs bg-container px-2 py-1 rounded mb-2 inline-block">gap-6</code>
          <div className="flex gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="size-8 bg-primary rounded" />
            ))}
          </div>
        </div>

        <div>
          <code className="text-xs bg-container px-2 py-1 rounded mb-2 inline-block">gap-8</code>
          <div className="flex gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="size-8 bg-primary rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Padding: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Padding（内側の余白）</h1>

      <div className="space-y-6">
        <div>
          <code className="text-xs bg-container px-2 py-1 rounded mb-2 inline-block">p-2</code>
          <div className="p-2 bg-primary/20 border border-primary rounded inline-block">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded">コンテンツ</div>
          </div>
        </div>

        <div>
          <code className="text-xs bg-container px-2 py-1 rounded mb-2 inline-block">p-4</code>
          <div className="p-4 bg-primary/20 border border-primary rounded inline-block">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded">コンテンツ</div>
          </div>
        </div>

        <div>
          <code className="text-xs bg-container px-2 py-1 rounded mb-2 inline-block">p-6</code>
          <div className="p-6 bg-primary/20 border border-primary rounded inline-block">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded">コンテンツ</div>
          </div>
        </div>

        <div>
          <code className="text-xs bg-container px-2 py-1 rounded mb-2 inline-block">p-8</code>
          <div className="p-8 bg-primary/20 border border-primary rounded inline-block">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded">コンテンツ</div>
          </div>
        </div>
      </div>
    </div>
  ),
};
