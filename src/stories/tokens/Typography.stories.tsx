import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Tokens/Typography',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// タイポグラフィサンプルコンポーネント
function TypeSample({
  className,
  label,
  tailwindClass,
}: {
  className: string;
  label: string;
  tailwindClass: string;
}) {
  return (
    <div className="border-border border-b py-4">
      <div className="mb-2 flex items-baseline gap-4">
        <code className="bg-container rounded px-2 py-1 text-xs">{tailwindClass}</code>
        <span className="text-muted-foreground text-xs">{label}</span>
      </div>
      <p className={className}>あいうえお ABCDEFG 0123456789</p>
    </div>
  );
}

export const FontSizes: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">フォントサイズ</h1>

      <div className="space-y-2">
        <TypeSample className="text-xs" label="12px" tailwindClass="text-xs" />
        <TypeSample className="text-sm" label="14px" tailwindClass="text-sm" />
        <TypeSample className="text-base" label="16px（デフォルト）" tailwindClass="text-base" />
        <TypeSample className="text-lg" label="18px" tailwindClass="text-lg" />
        <TypeSample className="text-xl" label="20px" tailwindClass="text-xl" />
        <TypeSample className="text-2xl" label="24px" tailwindClass="text-2xl" />
        <TypeSample className="text-3xl" label="30px" tailwindClass="text-3xl" />
        <TypeSample className="text-4xl" label="36px" tailwindClass="text-4xl" />
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">フォントウェイト</h1>

      <div className="space-y-4 text-xl">
        <div className="border-border border-b py-2">
          <code className="bg-container mr-4 rounded px-2 py-1 text-xs">font-normal</code>
          <span className="font-normal">通常のテキスト（400）</span>
        </div>
        <div className="border-border border-b py-2">
          <code className="bg-container mr-4 rounded px-2 py-1 text-xs">font-medium</code>
          <span className="font-medium">ミディアム（500）</span>
        </div>
        <div className="border-border border-b py-2">
          <code className="bg-container mr-4 rounded px-2 py-1 text-xs">font-semibold</code>
          <span className="font-semibold">セミボールド（600）</span>
        </div>
        <div className="border-border border-b py-2">
          <code className="bg-container mr-4 rounded px-2 py-1 text-xs">font-bold</code>
          <span className="font-bold">ボールド（700）</span>
        </div>
      </div>
    </div>
  ),
};

export const TextColors: Story = {
  render: () => (
    <div className="bg-background p-8">
      <h1 className="text-foreground mb-8 text-2xl font-bold">テキストカラー</h1>

      <div className="space-y-4 text-lg">
        <div className="border-border border-b py-2">
          <code className="bg-container text-foreground mr-4 rounded px-2 py-1 text-xs">
            text-foreground
          </code>
          <span className="text-foreground">通常のテキスト</span>
        </div>
        <div className="border-border border-b py-2">
          <code className="bg-container text-foreground mr-4 rounded px-2 py-1 text-xs">
            text-muted-foreground
          </code>
          <span className="text-muted-foreground">控えめなテキスト（補足情報など）</span>
        </div>
        <div className="border-border border-b py-2">
          <code className="bg-container text-foreground mr-4 rounded px-2 py-1 text-xs">
            text-primary
          </code>
          <span className="text-primary">強調テキスト（リンクなど）</span>
        </div>
        <div className="border-border border-b py-2">
          <code className="bg-container text-foreground mr-4 rounded px-2 py-1 text-xs">
            text-destructive
          </code>
          <span className="text-destructive">エラー・警告テキスト</span>
        </div>
        <div className="border-border border-b py-2">
          <code className="bg-container text-foreground mr-4 rounded px-2 py-1 text-xs">
            text-success
          </code>
          <span className="text-success">成功テキスト</span>
        </div>
      </div>
    </div>
  ),
};

export const Headings: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">見出しスタイル</h1>

      <div className="space-y-6">
        <div className="border-border border-b pb-4">
          <code className="bg-container mb-2 inline-block rounded px-2 py-1 text-xs">
            text-4xl font-bold
          </code>
          <h1 className="text-4xl font-bold">ページタイトル（H1）</h1>
        </div>

        <div className="border-border border-b pb-4">
          <code className="bg-container mb-2 inline-block rounded px-2 py-1 text-xs">
            text-2xl font-bold
          </code>
          <h2 className="text-2xl font-bold">セクション見出し（H2）</h2>
        </div>

        <div className="border-border border-b pb-4">
          <code className="bg-container mb-2 inline-block rounded px-2 py-1 text-xs">
            text-xl font-semibold
          </code>
          <h3 className="text-xl font-semibold">サブセクション（H3）</h3>
        </div>

        <div className="border-border border-b pb-4">
          <code className="bg-container mb-2 inline-block rounded px-2 py-1 text-xs">
            text-lg font-medium
          </code>
          <h4 className="text-lg font-medium">小見出し（H4）</h4>
        </div>

        <div className="border-border border-b pb-4">
          <code className="bg-container mb-2 inline-block rounded px-2 py-1 text-xs">
            text-base font-medium
          </code>
          <h5 className="text-base font-medium">ラベル（H5）</h5>
        </div>
      </div>
    </div>
  ),
};

export const BodyText: Story = {
  render: () => (
    <div className="bg-background text-foreground max-w-2xl p-8">
      <h1 className="mb-8 text-2xl font-bold">本文スタイル</h1>

      <div className="space-y-8">
        <div>
          <code className="bg-container mb-2 inline-block rounded px-2 py-1 text-xs">
            text-base leading-relaxed
          </code>
          <p className="text-base leading-relaxed">
            これは標準の本文テキストです。適切な行間（leading-relaxed）を使用することで、
            長文でも読みやすさを確保しています。日本語と英語が混在する場合でも、
            自然な読み心地を提供します。The quick brown fox jumps over the lazy dog.
          </p>
        </div>

        <div>
          <code className="bg-container mb-2 inline-block rounded px-2 py-1 text-xs">
            text-sm text-muted-foreground
          </code>
          <p className="text-muted-foreground text-sm">
            これは補足情報やキャプション用の小さめのテキストです。
            muted-foregroundを使用することで、メインコンテンツとの視覚的な階層を作ります。
          </p>
        </div>

        <div>
          <code className="bg-container mb-2 inline-block rounded px-2 py-1 text-xs">
            text-xs text-muted-foreground
          </code>
          <p className="text-muted-foreground text-xs">
            最小サイズのテキスト。タイムスタンプや細かい注釈に使用します。
          </p>
        </div>
      </div>
    </div>
  ),
};
