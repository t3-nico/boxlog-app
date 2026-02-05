import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const meta = {
  title: 'Tokens/States',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-2 text-2xl font-bold">Interaction States</h1>
      <p className="text-muted-foreground mb-8">
        Material Design 3準拠。全コンポーネントで統一された状態表現。
      </p>

      <div className="grid gap-8" style={{ maxWidth: '64rem' }}>
        {/* 状態トークン一覧 */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">状態トークン</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="py-3 text-left font-bold">状態</th>
                  <th className="py-3 text-left font-bold">トークン</th>
                  <th className="py-3 text-left font-bold">用途</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-border border-b">
                  <td className="py-3">Default</td>
                  <td className="py-3">
                    <code>-</code>
                  </td>
                  <td className="py-3">初期状態</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3">Hover</td>
                  <td className="py-3">
                    <code>bg-state-hover</code>
                  </td>
                  <td className="py-3">マウスオーバー時（10%）</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3">Focus</td>
                  <td className="py-3">
                    <code>ring-2 ring-ring</code>
                  </td>
                  <td className="py-3">キーボードフォーカス時</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3">Pressed</td>
                  <td className="py-3">
                    <code>bg-state-pressed</code>
                  </td>
                  <td className="py-3">クリック中（12%）</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3">Selected</td>
                  <td className="py-3">
                    <code>bg-state-selected</code>
                  </td>
                  <td className="py-3">選択状態（12%）</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3">Dragged</td>
                  <td className="py-3">
                    <code>bg-state-dragged</code>
                  </td>
                  <td className="py-3">ドラッグ中（16%）</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3">Active</td>
                  <td className="py-3">
                    <code>bg-state-active</code>
                  </td>
                  <td className="py-3">選択中（塗りつぶし）</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3">Disabled</td>
                  <td className="py-3">
                    <code>opacity-50 pointer-events-none</code>
                  </td>
                  <td className="py-3">操作不可</td>
                </tr>
                <tr>
                  <td className="py-3">Loading</td>
                  <td className="py-3">
                    <code>animate-pulse</code>
                  </td>
                  <td className="py-3">処理中</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Button States */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">Button States</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            ボタンの全状態。Hoverはマウスを載せて確認。
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Primary */}
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">
                variant=&quot;default&quot;
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="space-y-1 text-center">
                  <Button>Default</Button>
                  <p className="text-muted-foreground text-xs">通常</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button className="bg-primary/90">Hover</Button>
                  <p className="text-muted-foreground text-xs">ホバー</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button className="ring-ring ring-2 ring-inset">Focus</Button>
                  <p className="text-muted-foreground text-xs">フォーカス</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button disabled>Disabled</Button>
                  <p className="text-muted-foreground text-xs">無効</p>
                </div>
              </div>
            </div>

            {/* Outline */}
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">
                variant=&quot;outline&quot;
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="space-y-1 text-center">
                  <Button variant="outline">Default</Button>
                  <p className="text-muted-foreground text-xs">通常</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button variant="outline" className="bg-state-hover">
                    Hover
                  </Button>
                  <p className="text-muted-foreground text-xs">ホバー</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button variant="outline" className="ring-ring ring-2 ring-inset">
                    Focus
                  </Button>
                  <p className="text-muted-foreground text-xs">フォーカス</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button variant="outline" disabled>
                    Disabled
                  </Button>
                  <p className="text-muted-foreground text-xs">無効</p>
                </div>
              </div>
            </div>

            {/* Ghost */}
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">
                variant=&quot;ghost&quot;
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="space-y-1 text-center">
                  <Button variant="ghost">Default</Button>
                  <p className="text-muted-foreground text-xs">通常</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button variant="ghost" className="bg-state-hover">
                    Hover
                  </Button>
                  <p className="text-muted-foreground text-xs">ホバー</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button variant="ghost" className="ring-ring ring-2 ring-inset">
                    Focus
                  </Button>
                  <p className="text-muted-foreground text-xs">フォーカス</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button variant="ghost" disabled>
                    Disabled
                  </Button>
                  <p className="text-muted-foreground text-xs">無効</p>
                </div>
              </div>
            </div>

            {/* Destructive */}
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">
                variant=&quot;destructive&quot;
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="space-y-1 text-center">
                  <Button variant="destructive">Default</Button>
                  <p className="text-muted-foreground text-xs">通常</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button variant="destructive" className="bg-destructive/90">
                    Hover
                  </Button>
                  <p className="text-muted-foreground text-xs">ホバー</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button variant="destructive" className="ring-ring ring-2 ring-inset">
                    Focus
                  </Button>
                  <p className="text-muted-foreground text-xs">フォーカス</p>
                </div>
                <div className="space-y-1 text-center">
                  <Button variant="destructive" disabled>
                    Disabled
                  </Button>
                  <p className="text-muted-foreground text-xs">無効</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Input States */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">Input States</h2>
          <p className="text-muted-foreground mb-4 text-sm">入力フィールドの全状態。</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-bold">Default</p>
              <Input placeholder="入力してください" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-bold">Focus</p>
              <Input placeholder="フォーカス中" className="ring-ring ring-2 ring-inset" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-bold">Error</p>
              <Input placeholder="エラー" className="border-destructive" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-bold">Disabled</p>
              <Input placeholder="無効" disabled />
            </div>
          </div>
        </section>

        {/* Interactive States */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">Interactive States（触って確認）</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            実際にホバー、クリック、フォーカスして状態変化を確認。
          </p>
          <div className="flex flex-wrap gap-4">
            <Button>ホバーしてみて</Button>
            <Button variant="outline">ホバーしてみて</Button>
            <Button variant="ghost">ホバーしてみて</Button>
            <Input placeholder="フォーカスしてみて" className="w-48" />
          </div>
        </section>

        {/* 実装ガイド */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">実装ガイド</h2>
          <pre className="bg-container overflow-x-auto rounded-lg p-4 text-xs">
            {`// ホバー状態（10%オーバーレイ）
className="hover:bg-state-hover"

// フォーカス状態（キーボード操作時のみ）
className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"

// プレス状態（12%オーバーレイ）
className="active:bg-state-pressed"

// 選択状態（12%オーバーレイ）
className="bg-state-selected"  // または data-[state=selected]:bg-state-selected

// ドラッグ中状態（16%オーバーレイ）
className="bg-state-dragged"

// アクティブ状態（塗りつぶし）
className="bg-state-active text-state-active-foreground"

// 無効状態
disabled={true}  // または className="opacity-50 pointer-events-none"

// エラー状態
className="border-destructive"

// ローディング状態
className="animate-pulse"
// または Spinner コンポーネントを使用`}
          </pre>
        </section>
      </div>
    </div>
  ),
};
