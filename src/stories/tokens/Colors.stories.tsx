import type { Meta, StoryObj } from '@storybook/react-vite';

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
    <div>
      <h1 className="mb-8 text-2xl font-bold">カラートークン</h1>

      <ColorGroup title="Surface（背景色）">
        <ColorSwatch tailwindClass="bg-background" description="ページ背景" />
        <ColorSwatch tailwindClass="bg-container" description="サイドバー、セクション" />
        <ColorSwatch tailwindClass="bg-card" description="カード、ダイアログ、ポップオーバー" />
        <ColorSwatch tailwindClass="bg-overlay" description="モーダル背景（半透明・MD3 scrim）" />
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
        <ColorSwatch tailwindClass="bg-chronotype-low" description="低調（軽作業向き）" />
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
        <ColorSwatch tailwindClass="bg-plan-box" description="Plan（予定）の背景：sky blue" />
        <ColorSwatch tailwindClass="bg-record-box" description="Record（実績）の背景：green" />
      </ColorGroup>

      <ColorGroup title="Tag Colors（ダークモードで明度調整）">
        <ColorSwatch tailwindClass="bg-tag-blue" description="Blue（デフォルト）" />
        <ColorSwatch tailwindClass="bg-tag-green" description="Green" />
        <ColorSwatch tailwindClass="bg-tag-red" description="Red" />
        <ColorSwatch tailwindClass="bg-tag-amber" description="Amber" />
        <ColorSwatch tailwindClass="bg-tag-violet" description="Violet" />
        <ColorSwatch tailwindClass="bg-tag-pink" description="Pink" />
        <ColorSwatch tailwindClass="bg-tag-cyan" description="Cyan" />
        <ColorSwatch tailwindClass="bg-tag-orange" description="Orange" />
        <ColorSwatch tailwindClass="bg-tag-gray" description="Gray" />
        <ColorSwatch tailwindClass="bg-tag-indigo" description="Indigo" />
      </ColorGroup>

      <ColorGroup title="shadcn/ui互換エイリアス">
        <ColorSwatch
          tailwindClass="bg-secondary"
          description="= bg-container のエイリアス（shadcn/ui互換）"
        />
        <ColorSwatch
          tailwindClass="bg-muted"
          description="= bg-container のエイリアス（shadcn/ui互換）"
        />
        <ColorSwatch
          tailwindClass="bg-accent"
          description="= bg-state-active のエイリアス（shadcn/ui互換）"
        />
      </ColorGroup>
    </div>
  ),
};

export const Surface: Story = {
  render: () => (
    <div>
      <h2 className="mb-6 text-xl font-bold">Surface体系（GAFA準拠・3段階）</h2>
      <p className="text-muted-foreground mb-8">
        Material Design 3 / Apple HIG の共通原則に基づく意味ベース設計。
        <br />
        ダークモードでは高elevation = 明るい（MD3原則）。明度差は3-6%で視認性を確保。
      </p>

      <div className="space-y-4">
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
            カード、ダイアログ、ポップオーバー（containerより3%暗い = 最も沈んだレベル）
          </div>
        </div>

        <div className="bg-overlay border-border rounded-lg border p-6">
          <div className="font-bold text-white">Overlay</div>
          <div className="text-sm text-white/70">
            モーダル背景（半透明・MD3 scrim）。Dialog/Sheetの後ろに敷く背景幕。
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Semantic: Story = {
  render: () => (
    <div>
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
    <div>
      <h2 className="mb-6 text-xl font-bold">インタラクション状態</h2>
      <p className="text-muted-foreground mb-8">
        ホバー、フォーカス、プレス時の色変化。実際に操作して確認できます。
      </p>

      {/* State Layer一覧（MD3準拠） */}
      <div className="bg-card border-border mb-8 rounded-xl border p-6">
        <h3 className="mb-4 text-lg font-bold">State Layer一覧（MD3準拠）</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          foregroundベースの半透明オーバーレイ。ライト/ダークモードで自動調整される。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="py-3 text-left font-bold">状態</th>
                <th className="py-3 text-left font-bold">トークン</th>
                <th className="py-3 text-left font-bold">不透明度</th>
                <th className="py-3 text-left font-bold">用途</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-border border-b">
                <td className="py-3">Hover</td>
                <td className="py-3">
                  <code>bg-state-hover</code>
                </td>
                <td className="py-3">10%</td>
                <td className="py-3">マウスオーバー時</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3">Focus</td>
                <td className="py-3">
                  <code>bg-state-focus</code>
                </td>
                <td className="py-3">12%</td>
                <td className="py-3">キーボードフォーカス時</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3">Pressed</td>
                <td className="py-3">
                  <code>bg-state-pressed</code>
                </td>
                <td className="py-3">12%</td>
                <td className="py-3">クリック中</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3">Selected</td>
                <td className="py-3">
                  <code>bg-state-selected</code>
                </td>
                <td className="py-3">12%</td>
                <td className="py-3">選択状態</td>
              </tr>
              <tr className="border-border border-b">
                <td className="py-3">Dragged</td>
                <td className="py-3">
                  <code>bg-state-dragged</code>
                </td>
                <td className="py-3">16%</td>
                <td className="py-3">ドラッグ中</td>
              </tr>
              <tr>
                <td className="py-3">Active</td>
                <td className="py-3">
                  <code>bg-state-active</code>
                </td>
                <td className="py-3">塗り</td>
                <td className="py-3">選択中（塗りつぶし）</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
    <div>
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

export const Tags: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">タグカラー</h1>
      <p className="text-muted-foreground mb-8">
        ユーザーがタグに設定できる10色のパレット。
        <br />
        ダークモードでは明度を上げ、彩度を下げてアクセシビリティを確保。
      </p>

      <div className="space-y-4">
        {[
          { token: 'tag-blue', name: 'Blue', description: 'デフォルト' },
          { token: 'tag-green', name: 'Green', description: '' },
          { token: 'tag-red', name: 'Red', description: '' },
          { token: 'tag-amber', name: 'Amber', description: '' },
          { token: 'tag-violet', name: 'Violet', description: '' },
          { token: 'tag-pink', name: 'Pink', description: '' },
          { token: 'tag-cyan', name: 'Cyan', description: '' },
          { token: 'tag-orange', name: 'Orange', description: '' },
          { token: 'tag-gray', name: 'Gray', description: 'グループのデフォルト' },
          { token: 'tag-indigo', name: 'Indigo', description: '' },
        ].map(({ token, name, description }) => (
          <div key={token} className="border-border flex items-center gap-4 border-b pb-4">
            <div
              className="size-10 shrink-0 rounded-lg"
              style={{ backgroundColor: `var(--${token})` }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="bg-container rounded px-2 py-1 text-xs">bg-{token}</code>
                <span className="font-medium">{name}</span>
              </div>
              {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border-border mt-8 rounded-lg border p-6">
        <h2 className="mb-4 font-bold">使用例</h2>
        <div className="flex flex-wrap gap-2">
          <span className="border-tag-blue rounded-full border px-3 py-1 text-sm">タグ例</span>
          <span className="border-tag-green rounded-full border px-3 py-1 text-sm">タグ例</span>
          <span className="border-tag-red rounded-full border px-3 py-1 text-sm">タグ例</span>
          <span className="border-tag-amber rounded-full border px-3 py-1 text-sm">タグ例</span>
          <span className="border-tag-violet rounded-full border px-3 py-1 text-sm">タグ例</span>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          タグバッジでは <code>border-tag-*</code> でボーダー色を設定
        </p>
      </div>
    </div>
  ),
};

export const DosDonts: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Do&apos;s & Don&apos;ts</h1>
      <p className="text-muted-foreground mb-8">カラー使用のベストプラクティス。</p>

      <div className="grid max-w-5xl gap-8">
        {/* セマンティックトークン */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">セマンティックトークンを使用</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-success space-y-3 border-l-4 pl-4">
              <h3 className="font-bold text-green-600">Do</h3>
              <div className="bg-destructive text-destructive-foreground rounded-lg p-3 text-sm">
                エラー: bg-destructive
              </div>
              <div className="bg-success text-success-foreground rounded-lg p-3 text-sm">
                成功: bg-success
              </div>
              <code className="text-muted-foreground block text-xs">
                className=&quot;bg-destructive text-destructive-foreground&quot;
              </code>
            </div>
            <div className="border-destructive space-y-3 border-l-4 pl-4">
              <h3 className="font-bold text-red-600">Don&apos;t</h3>
              <div className="rounded-lg bg-red-500 p-3 text-sm text-white">エラー: bg-red-500</div>
              <div className="rounded-lg bg-green-500 p-3 text-sm text-white">
                成功: bg-green-500
              </div>
              <code className="text-muted-foreground block text-xs">
                className=&quot;bg-red-500 text-white&quot;
              </code>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            理由:
            セマンティックトークンはダークモード対応を自動化し、デザイン変更時の一括修正を可能にする。
          </p>
        </section>

        {/* テキストコントラスト */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">適切なテキストコントラスト</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-success space-y-3 border-l-4 pl-4">
              <h3 className="font-bold text-green-600">Do</h3>
              <div className="bg-primary text-primary-foreground rounded-lg p-3 text-sm">
                text-primary-foreground on bg-primary
              </div>
              <div className="bg-container text-foreground rounded-lg p-3 text-sm">
                text-foreground on bg-container
              </div>
            </div>
            <div className="border-destructive space-y-3 border-l-4 pl-4">
              <h3 className="font-bold text-red-600">Don&apos;t</h3>
              <div className="bg-primary text-muted-foreground rounded-lg p-3 text-sm">
                text-muted-foreground on bg-primary（低コントラスト）
              </div>
              <div className="bg-container text-muted-foreground/50 rounded-lg p-3 text-sm">
                opacity-50 text（読みにくい）
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            理由: WCAG 2.1 AA基準（コントラスト比4.5:1以上）を満たすため。
          </p>
        </section>

        {/* Surface階層 */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">Surface階層を守る</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-success space-y-3 border-l-4 pl-4">
              <h3 className="font-bold text-green-600">Do</h3>
              <div className="bg-background rounded-lg p-3">
                <div className="bg-container rounded p-2">
                  <div className="bg-card rounded p-2 text-sm">background → container → card</div>
                </div>
              </div>
            </div>
            <div className="border-destructive space-y-3 border-l-4 pl-4">
              <h3 className="font-bold text-red-600">Don&apos;t</h3>
              <div className="bg-card rounded-lg p-3">
                <div className="bg-background rounded p-2">
                  <div className="bg-container rounded p-2 text-sm">
                    card → background → container
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            理由: MD3原則に基づく視覚的階層。親→子で暗くなる一貫した構造。
          </p>
        </section>

        {/* 状態色 */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">状態を色で表現</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-success space-y-3 border-l-4 pl-4">
              <h3 className="font-bold text-green-600">Do</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  成功 → <span className="text-success">text-success</span>
                </li>
                <li>
                  エラー → <span className="text-destructive">text-destructive</span>
                </li>
                <li>
                  警告 → <span className="text-warning">text-warning</span>
                </li>
                <li>
                  情報 → <span className="text-info">text-info</span>
                </li>
              </ul>
            </div>
            <div className="border-destructive space-y-3 border-l-4 pl-4">
              <h3 className="font-bold text-red-600">Don&apos;t</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>成功を青で表示</li>
                <li>エラーを黄色で表示</li>
                <li>色だけで状態を伝える（アイコンなし）</li>
              </ul>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            理由: 色の意味を統一することでユーザーの認知負荷を軽減。
          </p>
        </section>
      </div>
    </div>
  ),
};
