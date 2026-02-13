import type { Meta, StoryObj } from '@storybook/react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const meta = {
  title: 'Docs/StyleGuide',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">スタイルガイド</h1>
      <p className="text-muted-foreground mb-8">BoxLog App のスタイリングルール統一リファレンス</p>

      <div className="grid max-w-5xl gap-8">
        {/* GAFA-First原則 */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">GAFA-First原則</h2>
          <p className="text-muted-foreground mb-4">
            UI/UXで迷ったら文脈に合うGoogle製品を開いて観察する。
          </p>
          <div className="bg-container rounded-lg p-4">
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <strong>UIパターン</strong>: Material Design、Apple HIG準拠
              </li>
              <li>
                <strong>コンポーネント</strong>: shadcn/ui を基本とする
              </li>
              <li>
                <strong>カラー</strong>: セマンティックトークンのみ使用
              </li>
            </ul>
          </div>
        </section>

        {/* クイックリファレンス */}
        <section>
          <h2 className="mb-4 text-lg font-bold">クイックリファレンス</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <LinkCard
              title="Colors"
              path="Tokens/Colors"
              description="カラートークン、背景色、テキスト色"
            />
            <LinkCard
              title="Typography"
              path="Tokens/Typography"
              description="フォントサイズ、行間、ウェイト"
            />
            <LinkCard title="Spacing" path="Tokens/Spacing" description="8pxグリッド、余白" />
            <LinkCard
              title="BorderRadius"
              path="Tokens/BorderRadius"
              description="角丸（8pxグリッド準拠）"
            />
            <LinkCard title="Elevation" path="Tokens/Elevation" description="シャドウ階層" />
            <LinkCard title="ZIndex" path="Tokens/ZIndex" description="スタッキング順序" />
            <LinkCard title="Icons" path="Tokens/Icons" description="アイコンサイズ" />
            <LinkCard
              title="Responsive"
              path="Tokens/Responsive"
              description="ブレークポイント、タッチターゲット"
            />
            <LinkCard
              title="Accessibility"
              path="Docs/Accessibility"
              description="a11yガイドライン"
            />
          </div>
        </section>

        {/* 関連ドキュメント */}
        <section>
          <h2 className="mb-4 text-lg font-bold">関連ドキュメント</h2>
          <div className="bg-container rounded-lg p-4">
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <code className="bg-background rounded px-2 py-1">src/styles/globals.css</code> -
                セマンティックトークン定義
              </li>
              <li>
                <code className="bg-background rounded px-2 py-1">CLAUDE.md</code> -
                プロジェクトルール
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  ),
};

function LinkCard({
  title,
  path,
  description,
}: {
  title: string;
  path: string;
  description: string;
}) {
  return (
    <div className="bg-card border-border hover:bg-state-hover rounded-xl border p-4 transition-colors">
      <h3 className="font-bold">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      <p className="text-primary mt-2 text-xs">→ {path}</p>
    </div>
  );
}

export const Rules: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">ルール一覧</h1>
      <p className="text-muted-foreground mb-8">必須ルールと禁止事項</p>

      <div className="grid max-w-5xl gap-8">
        {/* 8pxグリッド */}
        <RuleSection title="8pxグリッドシステム">
          <DoItem>gap-2 (8px), gap-4 (16px), gap-6 (24px), gap-8 (32px)</DoItem>
          <DoItem>p-2, p-4, p-6, p-8</DoItem>
          <DoItem>rounded-md (8px), rounded-xl (16px), rounded-2xl (24px)</DoItem>
          <DontItem>gap-3 (12px), gap-5 (20px) - 8の倍数でない</DontItem>
          <DontItem>rounded-lg (12px) - 削除済み</DontItem>
          <DontItem>任意値 gap-[13px], p-[15px]</DontItem>
        </RuleSection>

        {/* カラー */}
        <RuleSection title="カラー">
          <DoItem>bg-card, bg-container, bg-background</DoItem>
          <DoItem>text-foreground, text-muted-foreground</DoItem>
          <DoItem>bg-success, bg-warning, bg-info, bg-destructive</DoItem>
          <DontItem>bg-white, bg-gray-100 - 直接色指定</DontItem>
          <DontItem>text-blue-500 - Tailwindカラー直接使用</DontItem>
          <DontItem>bg-primary/10 - 不透明度ハードコード</DontItem>
        </RuleSection>

        {/* ホバー状態 */}
        <RuleSection title="ホバー状態（MD3準拠）">
          <DoItem>hover:bg-state-hover - Ghost/Outline用</DoItem>
          <DoItem>hover:bg-primary-hover - 塗りボタン用</DoItem>
          <DoItem>focus-visible:ring-ring - フォーカスリング</DoItem>
          <DontItem>hover:bg-accent - accent非推奨</DontItem>
          <DontItem>hover:bg-primary/90 - 不透明度ハードコード</DontItem>
          <DontItem>hover:brightness-75 - brightness調整</DontItem>
        </RuleSection>

        {/* タッチターゲット */}
        <RuleSection title="タッチターゲット（Apple HIG準拠）">
          <DoItem>最小 44x44px (h-11 w-11)</DoItem>
          <DoItem>推奨 48x48px (h-12 w-12)</DoItem>
          <DoItem>モバイルで常時表示、デスクトップでホバー表示</DoItem>
          <DontItem>h-6 w-6 (24px) - 小さすぎる</DontItem>
          <DontItem>ホバーのみでアクセスできるUI</DontItem>
        </RuleSection>

        {/* コンポーネント */}
        <RuleSection title="コンポーネント">
          <DoItem>export function ComponentName() - named export</DoItem>
          <DoItem>Storybookに記載されているパターンのみ使用</DoItem>
          <DontItem>export default - App Router例外除く</DontItem>
          <DontItem>React.FC - 暗黙のchildren</DontItem>
          <DontItem>Storybookにないパターン</DontItem>
        </RuleSection>
      </div>
    </div>
  ),
};

function RuleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border-border rounded-xl border p-6">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function DoItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <CheckCircle className="text-success mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function DontItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <XCircle className="text-destructive mt-0.5 size-4 shrink-0" />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

export const ColorGuide: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">カラーガイド</h1>
      <p className="text-muted-foreground mb-8">GAFA準拠のカラーデザイン方針</p>

      <div className="grid max-w-5xl gap-8">
        {/* デザイン方針 */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">デザイン方針（GAFA準拠）</h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-bold">Container系トークン廃止</h3>
              <p className="text-muted-foreground text-sm">
                MD3の <code className="bg-container rounded px-1">*-container</code> トークン（
                <code className="bg-container rounded px-1">bg-primary-container</code>,{' '}
                <code className="bg-container rounded px-1">bg-success-container</code> 等）は廃止。
                「薄い色付き背景」パターンはGAFA製品では使用されていないため。
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-bold">不透明度パターンの制限</h3>
              <p className="text-muted-foreground text-sm">
                <code className="bg-container rounded px-1">bg-primary/10</code>{' '}
                のような不透明度指定は、
                <strong>ホバー状態（bg-state-hover）のみ許可</strong>。
                静的な背景色としては使用禁止。
              </p>
            </div>
          </div>
        </section>

        {/* 2パターンに統一 */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">2パターンに統一</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            セマンティックな色表現は以下の2パターンのみ使用
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* アウトラインパターン */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold">アウトライン（推奨）</h3>
              <div className="space-y-2">
                <div className="border-primary text-primary rounded-lg border px-3 py-2 text-sm">
                  Primary
                </div>
                <div className="border-success text-success rounded-lg border px-3 py-2 text-sm">
                  Success
                </div>
                <div className="border-warning text-warning rounded-lg border px-3 py-2 text-sm">
                  Warning
                </div>
                <div className="border-destructive text-destructive rounded-lg border px-3 py-2 text-sm">
                  Destructive
                </div>
                <div className="border-info text-info rounded-lg border px-3 py-2 text-sm">
                  Info
                </div>
              </div>
              <pre className="bg-container overflow-x-auto rounded-lg p-3 text-xs">
                {`border-{color} text-{color}`}
              </pre>
            </div>

            {/* 塗りパターン */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold">塗り（アクション用）</h3>
              <div className="space-y-2">
                <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm">
                  Primary
                </div>
                <div className="bg-success text-success-foreground rounded-lg px-3 py-2 text-sm">
                  Success
                </div>
                <div className="bg-warning text-warning-foreground rounded-lg px-3 py-2 text-sm">
                  Warning
                </div>
                <div className="bg-destructive text-destructive-foreground rounded-lg px-3 py-2 text-sm">
                  Destructive
                </div>
                <div className="bg-info text-info-foreground rounded-lg px-3 py-2 text-sm">
                  Info
                </div>
              </div>
              <pre className="bg-container overflow-x-auto rounded-lg p-3 text-xs">
                {`bg-{color} text-{color}-foreground`}
              </pre>
            </div>
          </div>
        </section>

        {/* 置き換えルール */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">置き換えルール</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="px-3 py-2 text-left font-bold">用途</th>
                  <th className="text-destructive px-3 py-2 text-left font-bold">❌ 旧（廃止）</th>
                  <th className="text-success px-3 py-2 text-left font-bold">✅ 新（推奨）</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-border border-b">
                  <td className="text-foreground px-3 py-2">バッジ</td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">bg-*-container</code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">border-* text-*</code>
                  </td>
                </tr>
                <tr className="border-border border-b">
                  <td className="text-foreground px-3 py-2">警告ボックス</td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">
                      bg-destructive-container
                    </code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">
                      border-destructive text-destructive
                    </code>
                  </td>
                </tr>
                <tr className="border-border border-b">
                  <td className="text-foreground px-3 py-2">選択状態</td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">bg-primary-container</code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">bg-state-active</code>
                  </td>
                </tr>
                <tr className="border-border border-b">
                  <td className="text-foreground px-3 py-2">アイコン背景</td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">bg-primary-container</code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">bg-state-active</code> or{' '}
                    <code className="bg-container rounded px-1 text-xs">bg-muted</code>
                  </td>
                </tr>
                <tr className="border-border border-b">
                  <td className="text-foreground px-3 py-2">検索ハイライト</td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">bg-primary-container</code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">bg-state-active</code>
                  </td>
                </tr>
                <tr>
                  <td className="text-foreground px-3 py-2">不透明度背景</td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">bg-warning/10</code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="bg-container rounded px-1 text-xs">
                      border-warning text-warning
                    </code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 状態トークン */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">状態トークン</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            インタラクション状態には専用のstateトークンを使用
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="bg-state-hover rounded-lg p-3">
                <code className="text-sm">bg-state-hover</code>
                <p className="text-muted-foreground mt-1 text-xs">ホバー状態</p>
              </div>
              <div className="bg-state-active rounded-lg p-3">
                <code className="text-sm">bg-state-active</code>
                <p className="text-muted-foreground mt-1 text-xs">アクティブ/選択状態</p>
              </div>
              <div className="bg-state-selected rounded-lg p-3">
                <code className="text-sm">bg-state-selected</code>
                <p className="text-muted-foreground mt-1 text-xs">選択状態（代替）</p>
              </div>
            </div>
            <div className="bg-container rounded-lg p-4">
              <h4 className="mb-2 text-sm font-bold">使用例</h4>
              <pre className="overflow-x-auto text-xs">
                {`// ホバー
hover:bg-state-hover

// アクティブ/選択
bg-state-active text-state-active-foreground

// ナビゲーション選択
'data-[state=active]:bg-state-active'`}
              </pre>
            </div>
          </div>
        </section>

        {/* サーフェストークン */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">サーフェストークン</h2>
          <p className="text-muted-foreground mb-4 text-sm">背景のレイヤー階層</p>
          <div className="space-y-3">
            <div className="bg-background border-border rounded-lg border p-3">
              <code className="text-sm">bg-background</code>
              <p className="text-muted-foreground mt-1 text-xs">最下層（ページ全体）</p>
            </div>
            <div className="bg-card border-border rounded-lg border p-3">
              <code className="text-sm">bg-card</code>
              <p className="text-muted-foreground mt-1 text-xs">カード、ダイアログ</p>
            </div>
            <div className="bg-container rounded-lg p-3">
              <code className="text-sm">bg-container</code>
              <p className="text-muted-foreground mt-1 text-xs">コード、インフォボックス</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <code className="text-sm">bg-muted</code>
              <p className="text-muted-foreground mt-1 text-xs">ミュート背景、アイコン背景</p>
            </div>
          </div>
        </section>

        {/* セマンティックカラー */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">セマンティックカラー</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ColorSwatch
              name="Primary"
              bgClass="bg-primary"
              textClass="text-primary-foreground"
              description="主要アクション、リンク"
            />
            <ColorSwatch
              name="Success"
              bgClass="bg-success"
              textClass="text-success-foreground"
              description="完了、成功"
            />
            <ColorSwatch
              name="Warning"
              bgClass="bg-warning"
              textClass="text-warning-foreground"
              description="注意、警告"
            />
            <ColorSwatch
              name="Destructive"
              bgClass="bg-destructive"
              textClass="text-destructive-foreground"
              description="削除、危険な操作"
            />
            <ColorSwatch
              name="Info"
              bgClass="bg-info"
              textClass="text-info-foreground"
              description="情報、ヘルプ"
            />
            <ColorSwatch
              name="Accent"
              bgClass="bg-accent"
              textClass="text-accent-foreground"
              description="アクセント（限定使用）"
            />
          </div>
        </section>
      </div>
    </div>
  ),
};

function ColorSwatch({
  name,
  bgClass,
  textClass,
  description,
}: {
  name: string;
  bgClass: string;
  textClass: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`${bgClass} ${textClass} rounded-lg p-3 text-center text-sm font-bold`}>
        {name}
      </div>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  );
}

export const CommonPatterns: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">共通パターン</h1>
      <p className="text-muted-foreground mb-8">再利用可能なUIパターン</p>

      <div className="grid max-w-5xl gap-8">
        {/* WarningBox */}
        <section>
          <h2 className="mb-4 text-lg font-bold">WarningBox</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            破壊的操作の警告に使用（アウトラインパターン）
          </p>
          <div className="border-warning text-warning flex items-start gap-3 rounded-lg border p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <div className="text-sm">この操作は取り消せません</div>
          </div>
          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<div className="border-warning text-warning flex items-start gap-3 rounded-lg border p-4">
  <AlertTriangle className="size-5" />
  <div>この操作は取り消せません</div>
</div>`}
          </pre>
        </section>

        {/* InfoBox */}
        <section>
          <h2 className="mb-4 text-lg font-bold">InfoBox</h2>
          <p className="text-muted-foreground mb-4 text-sm">使用状況、説明、詳細情報に使用</p>
          <div className="bg-container rounded-lg p-4">
            <p className="mb-2 text-sm font-medium">使用状況:</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Plans: 10件</li>
              <li>• Events: 5件</li>
            </ul>
          </div>
          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<div className="bg-container rounded-lg p-4">
  <p className="mb-2 text-sm font-medium">使用状況:</p>
  <ul className="text-muted-foreground space-y-1 text-sm">
    <li>• Plans: 10件</li>
    <li>• Events: 5件</li>
  </ul>
</div>`}
          </pre>
        </section>

        {/* 余白設計 */}
        <section>
          <h2 className="mb-4 text-lg font-bold">関連性に基づく余白設計</h2>
          <p className="text-muted-foreground mb-4 text-sm">要素間の関連性が強いほど余白を小さく</p>
          <div className="bg-card border-border space-y-4 rounded-xl border p-4">
            <div className="space-y-1">
              <div className="text-xs font-bold">XS (8px) - 同一グループ</div>
              <div className="text-muted-foreground text-xs">
                gap-2: 日付とTime、Tagsと関連オプション
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold">S (16px) - 関連要素</div>
              <div className="text-muted-foreground text-xs">gap-4: フォーム項目間</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold">M (24px) - セクション境界</div>
              <div className="text-muted-foreground text-xs">gap-6: タイトルとメタデータ</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold">L (32px) - 大きなセクション</div>
              <div className="text-muted-foreground text-xs">gap-8: ナビとコンテンツ</div>
            </div>
          </div>
        </section>

        {/* AlertDialog */}
        <section>
          <h2 className="mb-4 text-lg font-bold">AlertDialogパターン</h2>
          <p className="text-muted-foreground mb-4 text-sm">確認ダイアログの標準レイアウト</p>
          <div className="bg-card border-border max-w-md rounded-xl border p-6">
            <div className="mb-4">
              <h3 className="font-bold">タイトル</h3>
            </div>
            <div className="space-y-3">
              <div className="border-warning text-warning flex items-start gap-3 rounded-lg border p-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div className="text-sm">警告メッセージ</div>
              </div>
              <div className="bg-container rounded-lg p-3">
                <p className="text-muted-foreground text-sm">詳細情報</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="border-border hover:bg-state-hover rounded-lg border px-4 py-2 text-sm"
              >
                キャンセル
              </button>
              <button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm"
              >
                実行
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};
