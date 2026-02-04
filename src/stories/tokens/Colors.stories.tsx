import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Tokens/Colors',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// Tailwindクラスからトークン名を抽出（bg-background → background）
function extractToken(tailwindClass: string): string {
  const match = tailwindClass.match(/^(?:bg|text|border|ring)-(.+)$/);
  return match?.[1] ?? tailwindClass;
}

// カラースウォッチコンポーネント
function ColorSwatch({
  tailwindClass,
  description,
}: {
  tailwindClass: string;
  description?: string;
}) {
  const token = extractToken(tailwindClass);
  return (
    <div className="flex items-center gap-4 py-2">
      <div
        className="border-border size-12 shrink-0 rounded-lg border"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <div className="min-w-0 flex-1">
        <code className="text-sm font-bold">{tailwindClass}</code>
        {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
      </div>
    </div>
  );
}

// カラーグループコンポーネント
function ColorGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="border-border mb-4 border-b pb-2 text-lg font-bold">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

export const AllColors: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">カラートークン</h1>

      <ColorGroup title="Surface（背景色）">
        <ColorSwatch tailwindClass="bg-overlay" description="ポップオーバー" />
        <ColorSwatch tailwindClass="bg-background" description="ページ背景" />
        <ColorSwatch tailwindClass="bg-container" description="サイドバー、セクション" />
        <ColorSwatch tailwindClass="bg-card" description="カード、ダイアログ" />
      </ColorGroup>

      <ColorGroup title="テキスト">
        <ColorSwatch tailwindClass="text-foreground" description="通常テキスト" />
        <ColorSwatch tailwindClass="text-muted-foreground" description="控えめなテキスト" />
        <ColorSwatch
          tailwindClass="text-card-foreground"
          description="shadcn/ui互換エイリアス（foregroundと同値）"
        />
      </ColorGroup>

      <ColorGroup title="Primary">
        <ColorSwatch tailwindClass="bg-primary" description="主要アクションの背景" />
        <ColorSwatch tailwindClass="text-primary-foreground" description="Primary上のテキスト" />
      </ColorGroup>

      <ColorGroup title="State（状態）">
        <ColorSwatch tailwindClass="bg-state-active" description="選択中・アクティブ状態" />
        <ColorSwatch
          tailwindClass="text-state-active-foreground"
          description="アクティブ状態のテキスト"
        />
      </ColorGroup>

      <ColorGroup title="Semantic（意味）">
        <ColorSwatch tailwindClass="bg-success" description="成功、完了" />
        <ColorSwatch tailwindClass="bg-warning" description="警告、注意" />
        <ColorSwatch tailwindClass="bg-info" description="情報" />
        <ColorSwatch tailwindClass="bg-destructive" description="削除、エラー" />
      </ColorGroup>

      <ColorGroup title="Chronotype（生産性ゾーン）">
        <ColorSwatch tailwindClass="bg-chronotype-peak" description="ピーク（最集中）" />
        <ColorSwatch tailwindClass="bg-chronotype-good" description="集中" />
        <ColorSwatch tailwindClass="bg-chronotype-moderate" description="通常" />
        <ColorSwatch tailwindClass="bg-chronotype-low" description="低調" />
        <ColorSwatch tailwindClass="bg-chronotype-sleep" description="睡眠" />
      </ColorGroup>

      <ColorGroup title="Border & Input">
        <ColorSwatch
          tailwindClass="border-border"
          description="ボーダー（card上でも視認できるコントラスト比）"
        />
        <ColorSwatch tailwindClass="bg-input" description="入力フィールド背景" />
        <ColorSwatch tailwindClass="ring-ring" description="フォーカスリング" />
      </ColorGroup>

      <ColorGroup title="Chart（グラフ）">
        <ColorSwatch tailwindClass="bg-chart-1" />
        <ColorSwatch tailwindClass="bg-chart-2" />
        <ColorSwatch tailwindClass="bg-chart-3" />
        <ColorSwatch tailwindClass="bg-chart-4" />
        <ColorSwatch tailwindClass="bg-chart-5" />
      </ColorGroup>

      <ColorGroup title="Calendar（カレンダー専用）">
        <ColorSwatch tailwindClass="bg-plan-box" description="Plan（予定）の背景：グレー系" />
        <ColorSwatch
          tailwindClass="bg-record-box"
          description="Record（実績）の背景：暖色オレンジ系"
        />
      </ColorGroup>
    </div>
  ),
};

export const Surface: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h2 className="mb-6 text-xl font-bold">Surface体系（GAFA準拠・4段階）</h2>
      <p className="text-muted-foreground mb-8">
        Material Design 3 / Apple HIG の共通原則に基づく意味ベース設計。
        <br />
        ダークモードでは高elevation = 明るい（MD3原則）。明度差は3-6%で視認性を確保。
      </p>

      <div className="space-y-4">
        <div className="bg-overlay border-border rounded-lg border p-6">
          <div className="font-bold">Overlay</div>
          <div className="text-muted-foreground text-sm">
            ポップオーバー、ドロップダウン（MD3: 高elevation = ダークモードで最も明るい）
          </div>
        </div>

        <div className="bg-background border-border rounded-lg border p-6">
          <div className="font-bold">Background</div>
          <div className="text-muted-foreground text-sm">ページ背景（基準レベル）</div>
        </div>

        <div className="bg-container border-border rounded-lg border p-6">
          <div className="font-bold">Container</div>
          <div className="text-muted-foreground text-sm">
            サイドバー、セクション（backgroundより6%暗い）
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <div className="font-bold">Card</div>
          <div className="text-muted-foreground text-sm">
            カード、ダイアログ（containerより6%暗い = 最も沈んだレベル）
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Semantic: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h2 className="mb-6 text-xl font-bold">Semantic Colors（意味を持つ色）</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-success text-success-foreground rounded-lg p-4 text-center">
          <div className="font-bold">Success</div>
          <div className="text-sm opacity-80">成功、完了</div>
        </div>

        <div className="bg-warning text-warning-foreground rounded-lg p-4 text-center">
          <div className="font-bold">Warning</div>
          <div className="text-sm opacity-80">警告、注意</div>
        </div>

        <div className="bg-info text-info-foreground rounded-lg p-4 text-center">
          <div className="font-bold">Info</div>
          <div className="text-sm opacity-80">情報</div>
        </div>

        <div className="bg-destructive text-destructive-foreground rounded-lg p-4 text-center">
          <div className="font-bold">Destructive</div>
          <div className="text-sm opacity-80">削除、エラー</div>
        </div>
      </div>
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h2 className="mb-6 text-xl font-bold">インタラクション状態</h2>
      <p className="text-muted-foreground mb-8">
        ホバー、フォーカス、プレス時の色変化。実際に操作して確認できます。
      </p>

      {/* 汎用ホバー（Ghost/Outline用） */}
      <div className="mb-8">
        <h3 className="border-border mb-4 border-b pb-2 text-lg font-bold">
          汎用ホバー（Ghost/Outline用）
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="hover:bg-state-hover rounded-lg border border-transparent px-4 py-2 transition-colors"
          >
            <code className="text-sm">hover:bg-state-hover</code>
          </button>
          <button
            type="button"
            className="border-border hover:bg-state-hover rounded-lg border px-4 py-2 transition-colors"
          >
            <code className="text-sm">Outline + hover</code>
          </button>
        </div>
      </div>

      {/* 塗りボタン用ホバー */}
      <div className="mb-8">
        <h3 className="border-border mb-4 border-b pb-2 text-lg font-bold">塗りボタン用ホバー</h3>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 transition-colors"
          >
            <code className="text-sm">hover:bg-primary-hover</code>
          </button>
          <button
            type="button"
            className="bg-destructive text-destructive-foreground hover:bg-destructive-hover rounded-lg px-4 py-2 transition-colors"
          >
            <code className="text-sm">hover:bg-destructive-hover</code>
          </button>
          <button
            type="button"
            className="bg-secondary text-secondary-foreground hover:bg-secondary-hover rounded-lg px-4 py-2 transition-colors"
          >
            <code className="text-sm">hover:bg-secondary-hover</code>
          </button>
          <button
            type="button"
            className="bg-warning text-warning-foreground hover:bg-warning-hover rounded-lg px-4 py-2 transition-colors"
          >
            <code className="text-sm">hover:bg-warning-hover</code>
          </button>
          <button
            type="button"
            className="bg-success text-success-foreground hover:bg-success-hover rounded-lg px-4 py-2 transition-colors"
          >
            <code className="text-sm">hover:bg-success-hover</code>
          </button>
          <button
            type="button"
            className="bg-info text-info-foreground hover:bg-info-hover rounded-lg px-4 py-2 transition-colors"
          >
            <code className="text-sm">hover:bg-info-hover</code>
          </button>
        </div>
      </div>

      {/* セマンティックGhostホバー */}
      <div className="mb-8">
        <h3 className="border-border mb-4 border-b pb-2 text-lg font-bold">
          セマンティックGhostホバー
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          色付きのGhost/Outlineボタン用（MD3 state layer方式）
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="text-primary hover:bg-primary-state-hover rounded-lg px-4 py-2 transition-colors"
          >
            <code className="text-sm">hover:bg-primary-state-hover</code>
          </button>
          <button
            type="button"
            className="text-destructive hover:bg-destructive-state-hover rounded-lg px-4 py-2 transition-colors"
          >
            <code className="text-sm">hover:bg-destructive-state-hover</code>
          </button>
        </div>
      </div>

      {/* フォーカスリング */}
      <div className="mb-8">
        <h3 className="border-border mb-4 border-b pb-2 text-lg font-bold">
          フォーカスリング（MD3スタイル）
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Tabキーでフォーカスを移動して確認。ボーダーがリングに置き換わる。
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="border-border focus-visible:ring-ring rounded-lg border px-4 py-2 outline-none focus-visible:border-transparent focus-visible:ring-2"
          >
            <code className="text-sm">focus-visible:border-transparent + ring</code>
          </button>
          <input
            type="text"
            placeholder="入力フィールド"
            className="border-border bg-input focus-visible:ring-ring rounded-lg border px-4 py-2 outline-none focus-visible:border-transparent focus-visible:ring-2"
          />
        </div>
      </div>

      {/* アクティブ/選択状態 */}
      <div className="mb-8">
        <h3 className="border-border mb-4 border-b pb-2 text-lg font-bold">アクティブ/選択状態</h3>
        <div className="flex flex-wrap gap-4">
          <div className="bg-state-active text-state-active-foreground rounded-lg px-4 py-2">
            <code className="text-sm">bg-state-active（選択中）</code>
          </div>
          <button
            type="button"
            className="active:bg-state-hover rounded-lg border border-transparent px-4 py-2 transition-colors"
          >
            <code className="text-sm">active:bg-state-hover（クリック）</code>
          </button>
        </div>
      </div>

      {/* リンク/テキストホバー */}
      <div className="mb-8">
        <h3 className="border-border mb-4 border-b pb-2 text-lg font-bold">
          リンク/テキストホバー
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          テキストリンクのホバースタイル。下線の濃さが変化。
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-primary decoration-primary/30 hover:decoration-primary underline transition-colors"
          >
            下線リンク（hover:decoration-primary）
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-primary transition-colors hover:underline"
          >
            ホバーで下線（hover:underline）
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            色変化（hover:text-foreground）
          </a>
        </div>
      </div>

      {/* 使用例 */}
      <div className="bg-card border-border rounded-lg border p-6">
        <h3 className="mb-4 font-bold">コピペ用クラス</h3>
        <div className="space-y-4 font-mono text-sm">
          <div className="text-muted-foreground mb-2 text-xs">汎用</div>
          <div>
            <span className="text-muted-foreground">Ghost:</span> <code>hover:bg-state-hover</code>
          </div>
          <div>
            <span className="text-muted-foreground">Focus:</span>{' '}
            <code>
              focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring
            </code>
          </div>
          <div>
            <span className="text-muted-foreground">Selected:</span>{' '}
            <code>bg-state-active text-state-active-foreground</code>
          </div>

          <div className="text-muted-foreground mt-4 mb-2 text-xs">塗りボタン</div>
          <div>
            <span className="text-muted-foreground">Primary:</span>{' '}
            <code>bg-primary hover:bg-primary-hover</code>
          </div>
          <div>
            <span className="text-muted-foreground">Destructive:</span>{' '}
            <code>bg-destructive hover:bg-destructive-hover</code>
          </div>
          <div>
            <span className="text-muted-foreground">Secondary:</span>{' '}
            <code>bg-secondary hover:bg-secondary-hover</code>
          </div>
          <div>
            <span className="text-muted-foreground">Warning:</span>{' '}
            <code>bg-warning hover:bg-warning-hover</code>
          </div>
          <div>
            <span className="text-muted-foreground">Success:</span>{' '}
            <code>bg-success hover:bg-success-hover</code>
          </div>
          <div>
            <span className="text-muted-foreground">Info:</span>{' '}
            <code>bg-info hover:bg-info-hover</code>
          </div>

          <div className="text-muted-foreground mt-4 mb-2 text-xs">セマンティックGhost</div>
          <div>
            <span className="text-muted-foreground">Primary Ghost:</span>{' '}
            <code>text-primary hover:bg-primary-state-hover</code>
          </div>
          <div>
            <span className="text-muted-foreground">Destructive Ghost:</span>{' '}
            <code>text-destructive hover:bg-destructive-state-hover</code>
          </div>

          <div className="text-muted-foreground mt-4 mb-2 text-xs">リンク</div>
          <div>
            <span className="text-muted-foreground">下線リンク:</span>{' '}
            <code>text-primary underline decoration-primary/30 hover:decoration-primary</code>
          </div>
          <div>
            <span className="text-muted-foreground">ホバー下線:</span>{' '}
            <code>text-primary hover:underline</code>
          </div>
          <div>
            <span className="text-muted-foreground">色変化:</span>{' '}
            <code>text-muted-foreground hover:text-foreground</code>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Text: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-6 text-2xl font-bold">テキストカラー</h1>
      <p className="text-muted-foreground mb-8">色で情報の重要度を表現。</p>

      <div className="space-y-4">
        <div className="border-border flex items-center gap-4 border-b pb-4">
          <code className="bg-container w-48 rounded px-2 py-1 text-xs">text-foreground</code>
          <span className="text-foreground">主要テキスト（見出し、本文）</span>
        </div>

        <div className="border-border flex items-center gap-4 border-b pb-4">
          <code className="bg-container w-48 rounded px-2 py-1 text-xs">text-muted-foreground</code>
          <span className="text-muted-foreground">補助テキスト（説明、キャプション）</span>
        </div>

        <div className="border-border flex items-center gap-4 border-b pb-4">
          <code className="bg-container w-48 rounded px-2 py-1 text-xs">text-primary</code>
          <span className="text-primary">リンク、アクション</span>
        </div>

        <div className="border-border flex items-center gap-4 border-b pb-4">
          <code className="bg-container w-48 rounded px-2 py-1 text-xs">text-destructive</code>
          <span className="text-destructive">エラー、警告</span>
        </div>

        <div className="flex items-center gap-4">
          <code className="bg-container w-48 rounded px-2 py-1 text-xs">text-success</code>
          <span className="text-success">成功、完了</span>
        </div>
      </div>
    </div>
  ),
};
