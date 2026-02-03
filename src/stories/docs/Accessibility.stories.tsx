import type { Meta, StoryObj } from '@storybook/react';
import { Settings, X, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Docs/Accessibility',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * セクションコンポーネント
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="border-border mb-6 border-b pb-2 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

/**
 * コード例コンポーネント
 */
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-container overflow-x-auto rounded-lg p-4">
      <code className="text-sm">{children}</code>
    </pre>
  );
}

/**
 * 比較コンポーネント
 */
function Comparison({
  good,
  bad,
  goodLabel = '✅ 良い例',
  badLabel = '❌ 悪い例',
}: {
  good: React.ReactNode;
  bad: React.ReactNode;
  goodLabel?: string;
  badLabel?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-success/10 border-success rounded-lg border p-4">
        <div className="text-success mb-2 font-bold">{goodLabel}</div>
        {good}
      </div>
      <div className="bg-destructive/10 border-destructive rounded-lg border p-4">
        <div className="text-destructive mb-2 font-bold">{badLabel}</div>
        {bad}
      </div>
    </div>
  );
}

export const Overview: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-4 text-2xl font-bold">アクセシビリティガイド</h1>
      <p className="text-muted-foreground mb-8">
        BoxLogのアクセシビリティ対応に関する基準と実装パターン
      </p>

      <Section title="基準スコア">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="bg-card border-border rounded-lg border p-4">
            <div className="text-muted-foreground mb-1 text-sm">Lighthouse CI</div>
            <div className="text-2xl font-bold">95点以上</div>
            <div className="text-muted-foreground text-xs">mainマージ時にチェック</div>
          </div>
          <div className="bg-card border-border rounded-lg border p-4">
            <div className="text-muted-foreground mb-1 text-sm">eslint-plugin-jsx-a11y</div>
            <div className="text-2xl font-bold">エラー0件</div>
            <div className="text-muted-foreground text-xs">コミット時にチェック</div>
          </div>
          <div className="bg-card border-border rounded-lg border p-4">
            <div className="text-muted-foreground mb-1 text-sm">axe-core</div>
            <div className="text-2xl font-bold">警告確認</div>
            <div className="text-muted-foreground text-xs">開発時にコンソール表示</div>
          </div>
        </div>
      </Section>

      <Section title="WCAG AA コントラスト基準">
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="pb-2 font-medium">テキストサイズ</th>
                <th className="pb-2 font-medium">最小コントラスト比</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-border border-b">
                <td className="py-2">通常テキスト（&lt;18pt）</td>
                <td className="py-2">4.5:1</td>
              </tr>
              <tr>
                <td className="py-2">大きなテキスト（≥18pt）</td>
                <td className="py-2">3:1</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground text-sm">
          セマンティックトークン（<code>text-foreground</code>, <code>text-muted-foreground</code>
          ）を使用すれば自動的に基準を満たします。
        </p>
      </Section>
    </div>
  ),
};

export const ScreenReaderText: Story = {
  name: 'スクリーンリーダー用テキスト',
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-4 text-2xl font-bold">スクリーンリーダー用テキスト</h1>
      <p className="text-muted-foreground mb-8">
        視覚的には見えないが、スクリーンリーダーには読み上げられるテキストの実装パターン
      </p>

      <Section title="アイコンボタン">
        <p className="text-muted-foreground mb-4">
          アイコンのみのボタンには必ず <code>aria-label</code> を設定する
        </p>

        <Comparison
          good={
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" aria-label="設定を開く">
                  <Settings className="size-4" />
                </Button>
                <code className="text-xs">aria-label=&quot;設定を開く&quot;</code>
              </div>
              <CodeBlock>{`<Button variant="ghost" size="icon" aria-label="設定を開く">
  <Settings />
</Button>`}</CodeBlock>
            </div>
          }
          bad={
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Settings className="size-4" />
                </Button>
                <code className="text-xs">aria-label なし</code>
              </div>
              <CodeBlock>{`<Button variant="ghost" size="icon">
  <Settings />
</Button>`}</CodeBlock>
            </div>
          }
        />
      </Section>

      <Section title="sr-only クラス">
        <p className="text-muted-foreground mb-4">
          視覚的に隠すが、スクリーンリーダーには読み上げられる
        </p>

        <div className="bg-card border-border mb-4 rounded-lg border p-4">
          <div className="mb-4 flex items-center gap-4">
            <button
              type="button"
              className="hover:bg-state-hover rounded-lg p-2 transition-colors"
            >
              <X className="size-4" />
              <span className="sr-only">閉じる</span>
            </button>
            <span className="text-muted-foreground text-sm">
              ← 視覚的にはアイコンのみ、スクリーンリーダーは「閉じる」と読み上げる
            </span>
          </div>
          <CodeBlock>{`<button>
  <XIcon />
  <span className="sr-only">閉じる</span>
</button>`}</CodeBlock>
        </div>

        <div className="bg-info/10 border-info rounded-lg border p-4">
          <p className="text-sm">
            <strong>sr-only の CSS:</strong>
          </p>
          <CodeBlock>{`.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}`}</CodeBlock>
        </div>
      </Section>
    </div>
  ),
};

export const FocusManagement: Story = {
  name: 'フォーカス管理',
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-4 text-2xl font-bold">フォーカス管理</h1>
      <p className="text-muted-foreground mb-8">
        キーボード操作時のフォーカス状態を明確に表示する
      </p>

      <Section title="フォーカスリング（MD3スタイル）">
        <p className="text-muted-foreground mb-4">
          Tabキーでフォーカスを移動して確認してください
        </p>

        <div className="mb-6 flex flex-wrap gap-4">
          <button
            type="button"
            className="border-border focus-visible:ring-ring rounded-lg border px-4 py-2 outline-none focus-visible:border-transparent focus-visible:ring-2"
          >
            フォーカス可能なボタン
          </button>
          <input
            type="text"
            placeholder="入力フィールド"
            className="border-border bg-input focus-visible:ring-ring rounded-lg border px-4 py-2 outline-none focus-visible:border-transparent focus-visible:ring-2"
          />
        </div>

        <CodeBlock>{`// 推奨パターン
className="outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring"

// shadcn/ui では focus-visible:outline-ring/50 も使用
className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"`}</CodeBlock>
      </Section>

      <Section title="aria-disabled 対応">
        <p className="text-muted-foreground mb-4">
          disabled属性の代わりにaria-disabledを使う場合のスタイル
        </p>

        <div className="mb-6 flex flex-wrap gap-4">
          <button
            type="button"
            disabled
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
          >
            disabled属性
          </button>
          <button
            type="button"
            aria-disabled="true"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            aria-disabled属性
          </button>
        </div>

        <CodeBlock>{`// aria-disabled 対応
className="aria-disabled:pointer-events-none aria-disabled:opacity-50"`}</CodeBlock>
      </Section>
    </div>
  ),
};

export const LiveRegions: Story = {
  name: 'ライブリージョン',
  render: () => {
    return (
      <div className="bg-background text-foreground p-8">
        <h1 className="mb-4 text-2xl font-bold">ライブリージョン</h1>
        <p className="text-muted-foreground mb-8">
          動的に変化するコンテンツをスクリーンリーダーに通知する
        </p>

        <Section title="ステータス更新（polite）">
          <p className="text-muted-foreground mb-4">
            ユーザーの操作を中断せず、適切なタイミングで読み上げる
          </p>

          <div className="bg-card border-border mb-4 rounded-lg border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Check className="text-success size-5" />
              <span>保存しました</span>
              {/* 実際のライブリージョン（視覚的に隠す） */}
              <div aria-live="polite" role="status" className="sr-only">
                保存しました
              </div>
            </div>
            <CodeBlock>{`<div aria-live="polite" role="status" className="sr-only">
  {message}
</div>`}</CodeBlock>
          </div>

          <p className="text-muted-foreground text-sm">
            用途: 保存完了、データ更新、非緊急の通知
          </p>
        </Section>

        <Section title="緊急通知（assertive）">
          <p className="text-muted-foreground mb-4">
            即座にユーザーに通知する（現在の読み上げを中断）
          </p>

          <div className="bg-card border-border mb-4 rounded-lg border p-4">
            <div className="bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-lg p-3">
              <Bell className="size-5" />
              <span>エラーが発生しました</span>
              {/* 実際のライブリージョン（視覚的に隠す） */}
              <div aria-live="assertive" role="alert" className="sr-only">
                エラーが発生しました
              </div>
            </div>
            <CodeBlock>{`<div aria-live="assertive" role="alert" className="sr-only">
  {errorMessage}
</div>`}</CodeBlock>
          </div>

          <p className="text-muted-foreground text-sm">
            用途: エラー、警告、緊急の通知（多用禁止）
          </p>
        </Section>

        <Section title="使い分け">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="pb-2 font-medium">属性</th>
                  <th className="pb-2 font-medium">読み上げタイミング</th>
                  <th className="pb-2 font-medium">用途</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-border border-b">
                  <td className="py-2">
                    <code>aria-live=&quot;polite&quot;</code>
                  </td>
                  <td className="py-2">現在の読み上げ完了後</td>
                  <td className="py-2">ステータス、保存完了</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-2">
                    <code>aria-live=&quot;assertive&quot;</code>
                  </td>
                  <td className="py-2">即座（中断あり）</td>
                  <td className="py-2">エラー、緊急通知</td>
                </tr>
                <tr>
                  <td className="py-2">
                    <code>aria-live=&quot;off&quot;</code>
                  </td>
                  <td className="py-2">通知しない</td>
                  <td className="py-2">デフォルト</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    );
  },
};

export const SkipLink: Story = {
  name: 'スキップリンク',
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-4 text-2xl font-bold">スキップリンク</h1>
      <p className="text-muted-foreground mb-8">
        キーボードユーザーがナビゲーションをスキップしてメインコンテンツに移動できるようにする
      </p>

      <Section title="実装パターン">
        <p className="text-muted-foreground mb-4">
          Tabキーを押すとスキップリンクが表示されます（下のデモエリアでお試しください）
        </p>

        <div className="bg-card border-border relative mb-6 overflow-hidden rounded-lg border">
          {/* スキップリンク */}
          <a
            href="#demo-main-content"
            className="bg-primary text-primary-foreground absolute left-4 top-4 z-50 -translate-y-16 rounded-lg px-4 py-2 transition-transform focus:translate-y-0"
          >
            メインコンテンツへスキップ
          </a>

          {/* ナビゲーション */}
          <nav className="border-border border-b p-4">
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                ホーム
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                設定
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                ヘルプ
              </a>
            </div>
          </nav>

          {/* メインコンテンツ */}
          <main id="demo-main-content" className="p-4">
            <h2 className="mb-2 font-bold">メインコンテンツ</h2>
            <p className="text-muted-foreground text-sm">
              スキップリンクを使うとここに直接フォーカスが移動します
            </p>
          </main>
        </div>

        <CodeBlock>{`// スキップリンク
<a
  href="#main-content"
  className="sr-only focus:not-sr-only ..."
>
  メインコンテンツへスキップ
</a>

// ターゲット
<main id="main-content" role="main">
  ...
</main>`}</CodeBlock>
      </Section>

      <Section title="実装場所">
        <p className="text-muted-foreground">
          BoxLogでは <code>src/components/layout/base-layout-content.tsx</code> で実装済みです。
        </p>
      </Section>
    </div>
  ),
};

export const Checklist: Story = {
  name: 'チェックリスト',
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-4 text-2xl font-bold">アクセシビリティチェックリスト</h1>
      <p className="text-muted-foreground mb-8">
        新規コンポーネント作成時・PR作成前に確認すること
      </p>

      <Section title="新規コンポーネント作成時">
        <div className="space-y-3">
          {[
            'インタラクティブ要素に aria-label または可視ラベルがある',
            'フォーカス状態が視覚的に明確',
            'キーボードで操作可能（Tab, Enter, Space, Escape）',
            'カラーコントラストがWCAG AA準拠（4.5:1以上）',
            'npm run a11y:check がパス',
          ].map((item, i) => (
            <label key={i} className="bg-card border-border flex items-center gap-3 rounded-lg border p-3">
              <input type="checkbox" className="size-4" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="PR作成前">
        <div className="space-y-3">
          {[
            'npm run lint がパス',
            '開発サーバーでaxe-coreの警告を確認',
            'Tabキーで全要素にアクセス可能',
            'スクリーンリーダーでテスト（VoiceOver / NVDA）',
          ].map((item, i) => (
            <label key={i} className="bg-card border-border flex items-center gap-3 rounded-lg border p-3">
              <input type="checkbox" className="size-4" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="コマンド">
        <div className="space-y-4">
          <div className="bg-card border-border rounded-lg border p-4">
            <code className="text-sm font-bold">npm run a11y:check</code>
            <p className="text-muted-foreground mt-1 text-sm">ESLint jsx-a11yルールでチェック</p>
          </div>
          <div className="bg-card border-border rounded-lg border p-4">
            <code className="text-sm font-bold">npm run a11y:full</code>
            <p className="text-muted-foreground mt-1 text-sm">自動修正付きチェック</p>
          </div>
        </div>
      </Section>

      <Section title="参考リンク">
        <ul className="text-primary space-y-2">
          <li>
            <a
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              WCAG 2.1 Guidelines
            </a>
          </li>
          <li>
            <a
              href="https://www.radix-ui.com/docs/primitives/overview/accessibility"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Radix UI Accessibility
            </a>
          </li>
          <li>
            <a
              href="https://dequeuniversity.com/rules/axe/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              axe-core Rules
            </a>
          </li>
        </ul>
      </Section>
    </div>
  ),
};
