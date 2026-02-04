import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Tokens/Typography',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Principles: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-6 text-2xl font-bold">Typography原則</h1>

      <div className="space-y-6">
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4 font-bold">Tailwindデフォルトを使用</h3>
          <p className="text-muted-foreground text-sm">
            フォントサイズはTailwindのデフォルトスケールをそのまま使用。
            業界標準で学習コストゼロ、ドキュメントも豊富。
          </p>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4 font-bold">視覚的階層を作る</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>• サイズの差で重要度を表現（大きい = 重要）</li>
            <li>• ウェイトで強調（bold = 見出し、normal = 本文）</li>
            <li>• 色で階層（foreground = 主要、muted = 補助）</li>
          </ul>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4 font-bold">フォント</h3>
          <p className="text-muted-foreground text-sm">
            Inter（英語）+ Noto Sans JP（日本語）。 next/fontで最適化済み。
          </p>
        </div>
      </div>
    </div>
  ),
};

export const Scale: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-6 text-2xl font-bold">フォントサイズスケール</h1>
      <p className="text-muted-foreground mb-8">Tailwindデフォルト。よく使うサイズをハイライト。</p>

      <div className="space-y-1">
        {[
          { class: 'text-xs', px: '12px', usage: 'タイムスタンプ、注釈', highlight: true },
          { class: 'text-sm', px: '14px', usage: 'UIテキスト、ボタン、ラベル', highlight: true },
          { class: 'text-base', px: '16px', usage: '本文（デフォルト）', highlight: true },
          { class: 'text-lg', px: '18px', usage: '小見出し' },
          { class: 'text-xl', px: '20px', usage: 'カード見出し' },
          { class: 'text-2xl', px: '24px', usage: 'セクション見出し', highlight: true },
          { class: 'text-3xl', px: '30px', usage: 'ページタイトル' },
          { class: 'text-4xl', px: '36px', usage: 'ヒーロー' },
        ].map(({ class: cls, px, usage, highlight }) => (
          <div
            key={cls}
            className={`flex items-center gap-4 rounded-lg p-2 ${highlight ? 'bg-state-active' : ''}`}
          >
            <code className="bg-container w-24 rounded px-2 py-1 text-center text-xs">{cls}</code>
            <div className="text-muted-foreground w-16 text-xs">{px}</div>
            <div className={`flex-1 ${cls}`}>あいうえお ABC</div>
            <div className="text-muted-foreground w-48 text-xs">{usage}</div>
          </div>
        ))}
      </div>

      <div className="border-info text-info mt-8 rounded-lg border p-4">
        <p className="text-sm">
          <strong>よく使う:</strong> <code className="bg-container rounded px-1">text-xs</code>,{' '}
          <code className="bg-container rounded px-1">text-sm</code>,{' '}
          <code className="bg-container rounded px-1">text-base</code>,{' '}
          <code className="bg-container rounded px-1">text-2xl</code>
        </p>
      </div>
    </div>
  ),
};

export const Hierarchy: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-6 text-2xl font-bold">タイポグラフィ階層</h1>
      <p className="text-muted-foreground mb-8">UIで使う典型的なパターン。</p>

      <div className="space-y-8">
        {/* ページレベル */}
        <div className="border-border border-b pb-6">
          <div className="text-muted-foreground mb-2 text-xs">ページタイトル</div>
          <h1 className="text-2xl font-bold">設定</h1>
          <p className="text-muted-foreground mt-1 text-sm">アカウントとアプリの設定を管理</p>
          <code className="bg-container mt-2 inline-block rounded px-2 py-1 text-xs">
            text-2xl font-bold + text-sm text-muted-foreground
          </code>
        </div>

        {/* セクション */}
        <div className="border-border border-b pb-6">
          <div className="text-muted-foreground mb-2 text-xs">セクション見出し</div>
          <h2 className="text-lg font-bold">プロフィール</h2>
          <code className="bg-container mt-2 inline-block rounded px-2 py-1 text-xs">
            text-lg font-bold
          </code>
        </div>

        {/* カード */}
        <div className="border-border border-b pb-6">
          <div className="text-muted-foreground mb-2 text-xs">カード見出し</div>
          <h3 className="font-bold">メール通知</h3>
          <p className="text-muted-foreground mt-1 text-sm">重要な更新をメールで受け取る</p>
          <code className="bg-container mt-2 inline-block rounded px-2 py-1 text-xs">
            font-bold + text-sm text-muted-foreground
          </code>
        </div>

        {/* ラベル */}
        <div className="border-border border-b pb-6">
          <div className="text-muted-foreground mb-2 text-xs">フォームラベル</div>
          <label className="text-sm font-bold">メールアドレス</label>
          <code className="bg-container mt-2 inline-block rounded px-2 py-1 text-xs">
            text-sm font-bold
          </code>
        </div>

        {/* 補助テキスト */}
        <div>
          <div className="text-muted-foreground mb-2 text-xs">補助テキスト</div>
          <p className="text-muted-foreground text-xs">最終更新: 2024年1月1日</p>
          <code className="bg-container mt-2 inline-block rounded px-2 py-1 text-xs">
            text-xs text-muted-foreground
          </code>
        </div>
      </div>
    </div>
  ),
};

export const Weight: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-6 text-2xl font-bold">フォントウェイト</h1>
      <p className="text-muted-foreground mb-8">2つだけ。シンプルに保つ。</p>

      <div className="space-y-6">
        <div className="bg-card border-border rounded-lg border p-6">
          <div className="mb-4">
            <code className="bg-container rounded px-2 py-1 text-xs">font-bold</code>
          </div>
          <p className="text-xl font-bold">見出し、強調</p>
          <p className="text-muted-foreground mt-2 text-sm">
            ページタイトル、セクション見出し、ラベル、重要な情報
          </p>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <div className="mb-4">
            <code className="bg-container rounded px-2 py-1 text-xs">font-normal</code>
          </div>
          <p className="font-normal">本文テキスト（デフォルト）</p>
          <p className="text-muted-foreground mt-2 text-sm">段落、説明文、UIテキスト全般</p>
        </div>
      </div>
    </div>
  ),
};

export const QuickReference: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-6 text-2xl font-bold">クイックリファレンス</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border-border rounded-lg border p-4">
          <h3 className="mb-4 font-bold">見出し</h3>
          <table className="w-full text-sm">
            <tbody className="divide-border divide-y">
              <tr>
                <td className="py-2">ページタイトル</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">text-2xl font-bold</code>
                </td>
              </tr>
              <tr>
                <td className="py-2">セクション</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">text-lg font-bold</code>
                </td>
              </tr>
              <tr>
                <td className="py-2">カード見出し</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">font-bold</code>
                </td>
              </tr>
              <tr>
                <td className="py-2">ラベル</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">text-sm font-bold</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-card border-border rounded-lg border p-4">
          <h3 className="mb-4 font-bold">本文</h3>
          <table className="w-full text-sm">
            <tbody className="divide-border divide-y">
              <tr>
                <td className="py-2">標準</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">text-base</code>（16px）
                </td>
              </tr>
              <tr>
                <td className="py-2">UI・ボタン</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">text-sm</code>（14px）
                </td>
              </tr>
              <tr>
                <td className="py-2">補助</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">text-xs text-muted-foreground</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-card border-border rounded-lg border p-4">
          <h3 className="mb-4 font-bold">行間</h3>
          <table className="w-full text-sm">
            <tbody className="divide-border divide-y">
              <tr>
                <td className="py-2">見出し</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">leading-tight</code>（1.25）
                </td>
              </tr>
              <tr>
                <td className="py-2">本文</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">leading-normal</code>（1.5）
                </td>
              </tr>
              <tr>
                <td className="py-2">長文</td>
                <td className="text-muted-foreground py-2">
                  <code className="text-xs">leading-relaxed</code>（1.625）
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-card border-border rounded-lg border p-4">
          <h3 className="mb-4 font-bold">避けるべきパターン</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <span>ウェイトの多用（3種類以上）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <span>サイズの飛びすぎ（xs→2xl）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <span>
                任意値 <code className="text-xs">text-[17px]</code>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  ),
};
