import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  title: 'Tokens/Colors',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// カラースウォッチコンポーネント
function ColorSwatch({
  name,
  variable,
  description,
}: {
  name: string;
  variable: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div
        className="size-12 rounded-md border border-border shrink-0"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{name}</div>
        <code className="text-xs text-muted-foreground">{variable}</code>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}

// カラーグループコンポーネント
function ColorGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-border">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

export const AllColors: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">カラートークン</h1>

      <ColorGroup title="Surface（背景色）">
        <ColorSwatch name="Background" variable="--background" description="ページ背景" />
        <ColorSwatch name="Card" variable="--card" description="カード、ダイアログ" />
        <ColorSwatch name="Container" variable="--container" description="サイドバー、セクション" />
        <ColorSwatch name="Overlay" variable="--overlay" description="ポップオーバー" />
      </ColorGroup>

      <ColorGroup title="テキスト">
        <ColorSwatch name="Foreground" variable="--foreground" description="通常テキスト" />
        <ColorSwatch
          name="Muted Foreground"
          variable="--muted-foreground"
          description="控えめなテキスト"
        />
        <ColorSwatch
          name="Card Foreground"
          variable="--card-foreground"
          description="カード内テキスト"
        />
      </ColorGroup>

      <ColorGroup title="Primary">
        <ColorSwatch name="Primary" variable="--primary" description="主要アクション" />
        <ColorSwatch
          name="Primary Foreground"
          variable="--primary-foreground"
          description="Primary上のテキスト"
        />
      </ColorGroup>

      <ColorGroup title="State（状態）">
        <ColorSwatch
          name="State Active"
          variable="--state-active"
          description="選択中・アクティブ状態"
        />
        <ColorSwatch
          name="State Active Foreground"
          variable="--state-active-foreground"
          description="アクティブ状態のテキスト"
        />
      </ColorGroup>

      <ColorGroup title="Semantic（意味）">
        <ColorSwatch name="Success" variable="--success" description="成功、完了" />
        <ColorSwatch name="Warning" variable="--warning" description="警告、注意" />
        <ColorSwatch name="Info" variable="--info" description="情報" />
        <ColorSwatch name="Destructive" variable="--destructive" description="削除、エラー" />
      </ColorGroup>

      <ColorGroup title="Chronotype（生産性ゾーン）">
        <ColorSwatch name="Peak" variable="--chronotype-peak" description="ピーク（最集中）" />
        <ColorSwatch name="Good" variable="--chronotype-good" description="集中" />
        <ColorSwatch name="Moderate" variable="--chronotype-moderate" description="通常" />
        <ColorSwatch name="Low" variable="--chronotype-low" description="低調" />
        <ColorSwatch name="Sleep" variable="--chronotype-sleep" description="睡眠" />
      </ColorGroup>

      <ColorGroup title="Border & Input">
        <ColorSwatch name="Border" variable="--border" description="ボーダー" />
        <ColorSwatch name="Input" variable="--input" description="入力フィールド背景" />
        <ColorSwatch name="Ring" variable="--ring" description="フォーカスリング" />
      </ColorGroup>

      <ColorGroup title="Chart（グラフ）">
        <ColorSwatch name="Chart 1" variable="--chart-1" />
        <ColorSwatch name="Chart 2" variable="--chart-2" />
        <ColorSwatch name="Chart 3" variable="--chart-3" />
        <ColorSwatch name="Chart 4" variable="--chart-4" />
        <ColorSwatch name="Chart 5" variable="--chart-5" />
      </ColorGroup>
    </div>
  ),
};

export const Surface: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h2 className="text-xl font-bold mb-6">Surface体系（GAFA準拠・4段階）</h2>
      <p className="text-muted-foreground mb-8">
        Material Design 3 / Apple HIG の共通原則に基づく意味ベース設計
      </p>

      <div className="space-y-4">
        <div className="p-6 bg-background border border-border rounded-lg">
          <div className="font-medium">Background</div>
          <div className="text-sm text-muted-foreground">ページ背景（最明）</div>
        </div>

        <div className="p-6 bg-overlay border border-border rounded-lg">
          <div className="font-medium">Overlay</div>
          <div className="text-sm text-muted-foreground">ポップオーバー</div>
        </div>

        <div className="p-6 bg-card border border-border rounded-lg">
          <div className="font-medium">Card</div>
          <div className="text-sm text-muted-foreground">カード、ダイアログ</div>
        </div>

        <div className="p-6 bg-container border border-border rounded-lg">
          <div className="font-medium">Container</div>
          <div className="text-sm text-muted-foreground">サイドバー、セクション</div>
        </div>
      </div>
    </div>
  ),
};

export const Semantic: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h2 className="text-xl font-bold mb-6">Semantic Colors（意味を持つ色）</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-success text-success-foreground rounded-lg text-center">
          <div className="font-medium">Success</div>
          <div className="text-sm opacity-80">成功、完了</div>
        </div>

        <div className="p-4 bg-warning text-warning-foreground rounded-lg text-center">
          <div className="font-medium">Warning</div>
          <div className="text-sm opacity-80">警告、注意</div>
        </div>

        <div className="p-4 bg-info text-info-foreground rounded-lg text-center">
          <div className="font-medium">Info</div>
          <div className="text-sm opacity-80">情報</div>
        </div>

        <div className="p-4 bg-destructive text-destructive-foreground rounded-lg text-center">
          <div className="font-medium">Destructive</div>
          <div className="text-sm opacity-80">削除、エラー</div>
        </div>
      </div>
    </div>
  ),
};
