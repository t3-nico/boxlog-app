import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Foundations/Primitives',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['docs-only'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* ============================================
 * Hue定数
 * ============================================ */

const hueConstants = [
  { name: '--hue-brand', value: 259.8145, label: '青紫', usage: 'Primary, Ring, Charts' },
  { name: '--hue-destructive', value: 25.33, label: '赤', usage: 'Destructive' },
  { name: '--hue-warning', value: 68.04, label: 'アンバー', usage: 'Warning' },
  { name: '--hue-success', value: 149.2, label: '緑', usage: 'Success' },
  { name: '--hue-info', value: 250, label: '青', usage: 'Info' },
  { name: '--hue-neutral', value: 264.54, label: '青み灰', usage: 'Border, Muted text' },
] as const;

/* ============================================
 * Neutralスケール
 * ============================================ */

const neutralScale = [
  { name: '--neutral-99', lightness: 0.99, usage: 'background (light)' },
  { name: '--neutral-95', lightness: 0.95, usage: 'secondary-foreground (dark)' },
  { name: '--neutral-93', lightness: 0.93, usage: 'container (light)' },
  { name: '--neutral-92', lightness: 0.92, usage: 'foreground (dark)' },
  { name: '--neutral-90', lightness: 0.9, usage: 'card (light)' },
  { name: '--neutral-78', lightness: 0.78, usage: 'muted-foreground (dark)' },
  { name: '--neutral-37', lightness: 0.37, usage: 'border (dark)' },
  { name: '--neutral-25', lightness: 0.25, usage: 'foreground (light)' },
  { name: '--neutral-24', lightness: 0.24, usage: 'background (dark)' },
  { name: '--neutral-18', lightness: 0.18, usage: 'container (dark)' },
  { name: '--neutral-15', lightness: 0.15, usage: 'semantic fg (dark)' },
  { name: '--neutral-12', lightness: 0.12, usage: 'card (dark)' },
] as const;

/* ============================================
 * White & Black
 * ============================================ */

const specialValues = [
  { name: '--white', value: 'oklch(1 0 0)', usage: 'primary-foreground' },
  { name: '--black-32', value: 'oklch(0 0 0 / 0.32)', usage: 'overlay (light)' },
  { name: '--black-50', value: 'oklch(0 0 0 / 0.50)', usage: 'overlay (dark)' },
  { name: '--black-06', value: 'oklch(0 0 0 / 0.06)', usage: 'input bg (light)' },
  { name: '--white-08', value: 'oklch(1 0 0 / 0.08)', usage: 'input bg (dark)' },
] as const;

export const Overview: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">プリミティブトークン</h1>
      <p className="text-muted-foreground mb-8">
        色体系の「原液」。セマンティックトークン（colors.css）がこれを参照する。
        <br />
        <code className="bg-container rounded px-1 text-xs">tokens/primitives.css</code> で定義。
      </p>

      {/* Architecture diagram */}
      <div className="bg-card border-border mb-10 rounded-xl border p-6">
        <h2 className="mb-4 text-lg font-bold">2層アーキテクチャ</h2>
        <div className="flex flex-col items-center gap-3 text-sm">
          <div className="bg-container w-full max-w-md rounded-lg p-4 text-center">
            <div className="font-bold">Primitives（原液）</div>
            <div className="text-muted-foreground text-xs">
              Hue定数、Neutralスケール、White/Black
            </div>
            <code className="text-muted-foreground text-xs">tokens/primitives.css</code>
          </div>
          <div className="text-muted-foreground text-lg">↓ var() で参照</div>
          <div className="bg-container w-full max-w-md rounded-lg p-4 text-center">
            <div className="font-bold">Semantic（役割）</div>
            <div className="text-muted-foreground text-xs">
              --primary, --background, --destructive ...
            </div>
            <code className="text-muted-foreground text-xs">tokens/colors.css</code>
          </div>
          <div className="text-muted-foreground text-lg">↓ var() で参照</div>
          <div className="bg-container w-full max-w-md rounded-lg p-4 text-center">
            <div className="font-bold">Tailwind マッピング</div>
            <div className="text-muted-foreground text-xs">
              bg-primary, text-foreground, border-border ...
            </div>
            <code className="text-muted-foreground text-xs">tailwind-theme.css</code>
          </div>
        </div>
      </div>

      {/* Hue Constants */}
      <section className="mb-10">
        <h2 className="border-border mb-2 border-b pb-2 text-lg font-bold">Hue定数（色相）</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          色体系のDNA。<code className="bg-container rounded px-1">--hue-brand</code>{' '}
          を変えるだけでブランドカラーが全て連動する。
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hueConstants.map(({ name, value, label, usage }) => (
            <div key={name} className="border-border flex items-center gap-4 rounded-lg border p-4">
              <div
                className="size-14 shrink-0 rounded-full"
                style={{ backgroundColor: `oklch(0.6 0.18 ${value})` }}
              />
              <div className="min-w-0">
                <code className="text-sm font-bold">{name}</code>
                <div className="text-muted-foreground text-xs">
                  hue: {value} — {label}
                </div>
                <div className="text-muted-foreground text-xs">→ {usage}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Neutral Scale */}
      <section className="mb-10">
        <h2 className="border-border mb-2 border-b pb-2 text-lg font-bold">
          Neutralスケール（無彩色）
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          明度のみで差を表現（chroma = 0）。Surface階層、テキスト階層の基盤。
        </p>
        <div className="space-y-2">
          {neutralScale.map(({ name, lightness, usage }) => (
            <div key={name} className="flex items-center gap-4">
              <div
                className="border-border h-10 w-24 shrink-0 rounded border"
                style={{ backgroundColor: `oklch(${lightness} 0 0)` }}
              />
              <div className="flex min-w-0 flex-1 items-baseline gap-3">
                <code className="shrink-0 text-sm font-bold">{name}</code>
                <span className="text-muted-foreground text-xs">L: {lightness}</span>
                <span className="text-muted-foreground text-xs">→ {usage}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* White & Black */}
      <section className="mb-10">
        <h2 className="border-border mb-2 border-b pb-2 text-lg font-bold">
          White & Black（端点・透過）
        </h2>
        <div className="space-y-2">
          {specialValues.map(({ name, value, usage }) => (
            <div key={name} className="flex items-center gap-4">
              <div
                className="border-border h-10 w-24 shrink-0 rounded border"
                style={{ backgroundColor: `var(${name})` }}
              />
              <div className="flex min-w-0 flex-1 items-baseline gap-3">
                <code className="shrink-0 text-sm font-bold">{name}</code>
                <span className="text-muted-foreground text-xs">{value}</span>
                <span className="text-muted-foreground text-xs">→ {usage}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};

export const HueDemo: Story = {
  name: 'Hue変更デモ',
  render: () => (
    <div>
      <h2 className="mb-2 text-xl font-bold">Hue変更のインパクト</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        <code className="bg-container rounded px-1">--hue-brand</code>{' '}
        を変えると、Primary・Ring・Chartsが全て連動して変わる。
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { hue: 259.8, label: '現在のブランド（青紫）' },
          { hue: 220, label: '仮に hue=220（青）' },
          { hue: 160, label: '仮に hue=160（緑）' },
        ].map(({ hue, label }) => (
          <div key={hue} className="border-border rounded-xl border p-4">
            <div className="mb-3 font-bold">{label}</div>
            <div className="space-y-2">
              {[
                { l: 0.45, c: 0.14, name: 'primary' },
                { l: 0.5, c: 0.188, name: 'primary (dark)' },
                { l: 0.6231, c: 0.14, name: 'ring / chart-1' },
              ].map(({ l, c, name }) => (
                <div key={name} className="flex items-center gap-3">
                  <div
                    className="h-8 w-16 shrink-0 rounded"
                    style={{ backgroundColor: `oklch(${l} ${c} ${hue})` }}
                  />
                  <span className="text-muted-foreground text-xs">{name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const NeutralMapping: Story = {
  name: 'Neutral → Semantic マッピング',
  render: () => {
    const mappings = [
      {
        mode: 'Light',
        items: [
          { primitive: '--neutral-99', semantic: '--background', role: 'ページ背景' },
          { primitive: '--neutral-93', semantic: '--container', role: 'サイドバー' },
          { primitive: '--neutral-90', semantic: '--card', role: 'カード' },
          { primitive: '--neutral-25', semantic: '--foreground', role: 'テキスト' },
        ],
      },
      {
        mode: 'Dark',
        items: [
          { primitive: '--neutral-24', semantic: '--background', role: 'ページ背景' },
          { primitive: '--neutral-18', semantic: '--container', role: 'サイドバー' },
          { primitive: '--neutral-12', semantic: '--card', role: 'カード' },
          { primitive: '--neutral-92', semantic: '--foreground', role: 'テキスト' },
        ],
      },
    ] as const;

    return (
      <div>
        <h2 className="mb-2 text-xl font-bold">Neutral → Semantic マッピング</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          同じセマンティック名が、ライト/ダークで異なるプリミティブを参照する。
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {mappings.map(({ mode, items }) => (
            <div key={mode}>
              <h3 className="mb-4 text-lg font-bold">{mode} Mode</h3>
              <div className="space-y-3">
                {items.map(({ primitive, semantic, role }) => {
                  const lightness = Number.parseFloat(primitive.replace('--neutral-', '')) / 100;
                  return (
                    <div key={primitive + mode} className="flex items-center gap-3">
                      <div
                        className="border-border h-10 w-14 shrink-0 rounded border"
                        style={{ backgroundColor: `oklch(${lightness} 0 0)` }}
                      />
                      <div className="text-xs">
                        <div>
                          <code className="text-muted-foreground">{primitive}</code>
                          {' → '}
                          <code className="font-bold">{semantic}</code>
                        </div>
                        <div className="text-muted-foreground">{role}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
