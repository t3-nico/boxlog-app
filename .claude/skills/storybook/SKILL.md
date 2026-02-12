# Storybook Story作成スキル

Storybookの公式ベストプラクティスに基づいたStory作成ガイド。

## このスキルを使用するタイミング

以下のキーワードが含まれる場合に自動的に起動：

- 「Storybook」「Story作成」「Story追加」
- 「stories.tsx」「.stories.」
- 「UIコンポーネントを追加」「コンポーネント作成」
- 「バリアント追加」「新しいパターン」

また、UIコンポーネント（`src/components/ui/`、`src/features/*/components/`）の作成・変更時にも参照すること。

---

## ⚠️ 最重要ルール：Storybookが正（Single Source of Truth）

> **Storybookに記載されているパターンのみを使用する**

### 原則

| ルール                                     | 説明                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------- |
| **Storybookにある = 使ってOK**             | 各コンポーネントのStoryに記載されているprops/パターンのみ使用可能    |
| **Storybookにない = 使わない**             | 記載されていない機能は、たとえコンポーネントが対応していても使わない |
| **新しいパターンが必要 = 先にStoryを追加** | 新しい使い方をする前に、まずStoryを追加する                          |

### AI向けガイドライン

1. **UIコンポーネント使用前に確認**: `src/components/ui/[component].stories.tsx` を読んで使用可能なパターンを確認
2. **Storyにないパターンは提案しない**: コンポーネントが技術的に対応していても、Storyにないものは使わない
3. **新パターンが必要な場合**: 先にStoryを追加してからコードで使用する
4. **デザイントークン確認**: `src/stories/tokens/` のStoryで色・タイポグラフィ・余白の使用パターンを確認

### 例

```tsx
// Storybookで確認
// button.stories.tsx に variant="ghost", size="icon" がある → OK
<Button variant="ghost" size="icon">
  <Settings className="size-4" />
</Button>

// button.stories.tsx に size="xl" がない → NG（使わない）
<Button size="xl">ボタン</Button>
```

---

## 公式テンプレート（AlertDialog を基盤とする）

新規 Story を作成するときは、この構成に従うこと。
実物: `src/components/ui/alert-dialog.stories.tsx` + `alert-dialog.docs.mdx`

### 全体構成（3ファイル）

```
src/components/ui/
├── my-component.tsx              # コンポーネント本体
├── my-component.stories.tsx      # Story（Canvas用）
└── my-component.docs.mdx         # Docs（テキスト・テーブル・Controls）← テーブルが必要な場合のみ
```

### 1. stories.tsx テンプレート

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './my-component';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: [],                        // autodocs は使わない（MDX Docs を使用）
  parameters: {
    layout: 'fullscreen',          // centered | fullscreen | padded
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパーコンポーネント（状態を持つ例はここに定義）
// ---------------------------------------------------------------------------

function VariantAExample() { ... }
function VariantBExample() { ... }

// ---------------------------------------------------------------------------
// Stories — Canvas は純粋なコンポーネント描画のみ
// ---------------------------------------------------------------------------

/** 基本的な使用例。最小構成。 */
export const Default: Story = {
  args: { /* デフォルトのprops */ },
};

/** バリアントAの説明。1行で簡潔に。実装例: XxxComponent */
export const VariantA: Story = {
  render: () => <VariantAExample />,
};

/** バリアントBの説明。1行で簡潔に。実装例: YyyComponent */
export const VariantB: Story = {
  render: () => <VariantBExample />,
};

// ---------------------------------------------------------------------------
// AllPatterns — Canvas用の全パターンカタログ
// ---------------------------------------------------------------------------

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <MyComponent />
      <VariantAExample />
      <VariantBExample />
    </div>
  ),
};
```

**ポイント:**

- `tags: []` — MDX Docs を使う場合は autodocs を無効化（競合エラー回避）
- JSDoc は **1行** — 改行すると Docs で段落間が空く
- Canvas に `<h1>`, `<p>` 等の説明テキストは **絶対に入れない**
- AllPatterns は `flex-col items-start gap-6` で縦並び

### 2. docs.mdx テンプレート（テーブルが必要な場合）

```mdx
import { Canvas, Controls, Meta, Primary, Stories, Unstyled } from '@storybook/blocks';
import * as MyComponentStories from './my-component.stories';

<Meta of={MyComponentStories} />

<Unstyled>
<div className="sb-docs-prose">

# MyComponent

コンポーネントの概要説明。1〜2行。

## 比較や分類（テーブル）

| 項目 | 説明 |
| ---- | ---- |
| ...  | ...  |

## コンポーネント構成

| コンポーネント    | 役割   |
| ----------------- | ------ |
| `MyComponent`     | ルート |
| `MyComponentItem` | 子要素 |

## Default

<Primary />

<Controls />

<Stories includePrimary={false} />

</div>
</Unstyled>
```

**ポイント:**

- `<Unstyled>` + `.sb-docs-prose` で Storybook のデフォルトスタイルを回避
- Markdown テーブルは MDX でのみ正常に描画される（JSDoc の `description.component` では不可）
- `<Stories includePrimary={false} />` で Default の重複を防ぐ

### 3. テーブル不要な場合（autodocs で十分）

MDX を作らず `tags: ['autodocs']` + JSDoc だけで完結できる:

```tsx
const meta = {
  title: 'Components/SimpleComponent',
  component: SimpleComponent,
  tags: ['autodocs'],              // autodocs 有効
} satisfies Meta<typeof SimpleComponent>;

/** コンポーネントの説明。Docs に自動表示される。 */
export const Default: Story = { args: { ... } };
```

### Canvas と Docs の役割分離

| タブ       | 役割               | 内容                                        |
| ---------- | ------------------ | ------------------------------------------- |
| **Canvas** | コンポーネント描画 | render のみ。見出し・説明テキストは入れない |
| **Docs**   | ドキュメント       | テキスト説明 + テーブル + Controls          |

**Canvas:**

- 純粋なコンポーネント描画のみ — テキスト禁止
- padding: 16px（`.sb-show-main` で設定済み）
- グリッド: 16px セル、5マスごと（80px）に強調線、offset 16px

**Docs:**

- テキスト・テーブル・比較は MDX または JSDoc で記述
- margin: 32px（`.sbdocs-wrapper` で設定済み）
- prose スタイルは `.sb-docs-prose`（`prose.css`）で管理

---

## 対象範囲

| ディレクトリ                 | 対象                              | 優先度                 |
| ---------------------------- | --------------------------------- | ---------------------- |
| `src/components/ui/`         | shadcn/uiベースのUIコンポーネント | 高                     |
| `src/components/common/`     | プロジェクト共通コンポーネント    | 高                     |
| `src/features/*/components/` | 機能固有コンポーネント            | 低（データ依存が多い） |

## ファイル配置

```
src/components/ui/
├── button.tsx           # コンポーネント本体
└── button.stories.tsx   # Story（同じディレクトリに配置）
```

## CSF3 基本テンプレート

上記「公式テンプレート」を参照。以下は最小構成:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './my-component';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: [], // MDX Docs を使う場合。不要なら ['autodocs']
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    /* デフォルトのprops */
  },
};
```

## カテゴリ命名規則（title）

Storybookのサイドバー構成：

```
Docs/           ← Storybookの使い方・説明
├── はじめに
└── ...

Components/     ← UIコンポーネント
├── Button
├── Badge
└── ...

Tokens/         ← デザイントークン
├── Colors
└── Typography
```

| ディレクトリ / 用途  | title prefix  | 例                                               |
| -------------------- | ------------- | ------------------------------------------------ |
| `components/ui/`     | `Components/` | `Components/Button`, `Components/Badge`          |
| `components/common/` | `Components/` | `Components/EmptyState`, `Components/PageHeader` |
| デザイントークン     | `Tokens/`     | `Tokens/Colors`, `Tokens/Typography`             |
| ドキュメント         | `Docs/`       | `Docs/はじめに`                                  |

## argTypes 設計

### 基本パターン

```tsx
argTypes: {
  // select: 選択肢がある場合
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline'],
    description: 'ボタンのスタイルバリアント',
  },
  // boolean: ON/OFF
  disabled: {
    control: 'boolean',
    description: '無効状態',
  },
  // text: 文字列入力
  label: {
    control: 'text',
    description: 'ボタンのラベル',
  },
  // number: 数値
  count: {
    control: { type: 'number', min: 0, max: 100 },
    description: 'カウント数',
  },
  // 非表示（内部用props）
  className: {
    table: { disable: true },
  },
}
```

### 日本語で description を書く

このプロジェクトはドキュメントを日本語で書くため、`description` も日本語で記述する。

## 必須Story

各コンポーネントに以下のStoryを必ず含める：

### 1. 基本バリアント（個別）

```tsx
export const Primary: Story = {
  args: { variant: 'primary', children: 'ボタン' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'ボタン' },
};
```

### 2. AllVariants（一覧表示）

全バリアントを一目で確認できるStory。**必須**。

```tsx
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </div>
  ),
};
```

### 3. 状態バリエーション（該当する場合）

```tsx
export const Loading: Story = {
  args: { isLoading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Icon className="size-4" />
        ラベル
      </>
    ),
  },
};
```

## アイコンの扱い

lucide-react を使用：

```tsx
import { Mail, Plus, Settings } from 'lucide-react';

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="size-4" />
        メールを送信
      </>
    ),
  },
};
```

## インタラクションテスト（play関数）

ユーザー操作をテストする場合：

```tsx
import { expect, userEvent, within } from '@storybook/test';

export const ClickTest: Story = {
  args: { children: 'クリック' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);

    // アサーション
    await expect(button).toHaveAttribute('data-clicked', 'true');
  },
};
```

## layout パラメータ

| 値           | 用途                                    |
| ------------ | --------------------------------------- |
| `centered`   | 小さいコンポーネント（Button, Badge等） |
| `padded`     | 中サイズ（Card, Form等）                |
| `fullscreen` | 全幅コンポーネント（Header, Sidebar等） |

## ダークモード対応

preview.ts でダークモード切り替えを設定済み。Story側での対応は不要。
ツールバーの Theme 切り替えで確認可能。

## レスポンシブ確認

Storybookのツールバーでviewportを切り替えて確認可能。

### 特定のviewportでStoryを表示

```tsx
export const Mobile: Story = {
  args: { children: 'ボタン' },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1', // 320px
    },
  },
};

export const Tablet: Story = {
  args: { children: 'ボタン' },
  parameters: {
    viewport: {
      defaultViewport: 'tablet', // 768px
    },
  },
};
```

### レスポンシブ一覧Story

全サイズを一度に確認したい場合：

```tsx
export const Responsive: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Mobile (320px)</p>
        <div className="border-border w-[320px] border p-4">
          <MyComponent />
        </div>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Tablet (768px)</p>
        <div className="border-border w-[768px] border p-4">
          <MyComponent />
        </div>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Desktop (1024px)</p>
        <div className="border-border w-[1024px] border p-4">
          <MyComponent />
        </div>
      </div>
    </div>
  ),
};
```

### viewport設定が必要なコンポーネント

| コンポーネント  | 理由                 |
| --------------- | -------------------- |
| Header, Sidebar | レイアウト変化       |
| Card, Table     | 幅による折り返し     |
| Modal, Drawer   | モバイルでの全画面化 |

小さいコンポーネント（Button, Badge等）は不要。

## 複合コンポーネント

Tabs, Accordion, Dialog など親子関係があるコンポーネントの書き方。

### 基本パターン

```tsx
import type { Meta, StoryObj } from '@storybook/nextjs';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

// 親コンポーネントをメインにする
const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// 子コンポーネントを組み合わせて表示
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">タブ1</TabsTrigger>
        <TabsTrigger value="tab2">タブ2</TabsTrigger>
        <TabsTrigger value="tab3">タブ3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">タブ1の内容</TabsContent>
      <TabsContent value="tab2">タブ2の内容</TabsContent>
      <TabsContent value="tab3">タブ3の内容</TabsContent>
    </Tabs>
  ),
};
```

### バリエーション例

```tsx
export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">
          <Settings className="mr-2 size-4" />
          設定
        </TabsTrigger>
        <TabsTrigger value="tab2">
          <User className="mr-2 size-4" />
          プロフィール
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">設定画面</TabsContent>
      <TabsContent value="tab2">プロフィール画面</TabsContent>
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">有効</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          無効
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">内容</TabsContent>
    </Tabs>
  ),
};
```

### 複合コンポーネントの注意点

1. **親コンポーネントを `component` に指定** - Autodocsで親のpropsが表示される
2. **render関数を使う** - 子コンポーネントを組み合わせる必要があるため
3. **幅を固定する** - `className="w-[400px]"` 等で見やすいサイズに
4. **状態を持つ場合は `defaultValue` を指定** - 初期状態を明示

### 該当コンポーネント

| コンポーネント | 構成                                                         |
| -------------- | ------------------------------------------------------------ |
| Tabs           | Tabs, TabsList, TabsTrigger, TabsContent                     |
| Accordion      | Accordion, AccordionItem, AccordionTrigger, AccordionContent |
| Dialog         | Dialog, DialogTrigger, DialogContent, DialogHeader, ...      |
| DropdownMenu   | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, ...  |
| Select         | Select, SelectTrigger, SelectContent, SelectItem, ...        |
| ContextMenu    | ContextMenu, ContextMenuTrigger, ContextMenuContent, ...     |

## `.stories.tsx` に書いてはいけないもの

### ❌ `'use client'` ディレクティブ

Storybook はブラウザ環境で実行されるため、Next.js RSC の `'use client'` は不要。

```tsx
// ❌ 不要
'use client';
import type { Meta, StoryObj } from '@storybook/react-vite';

// ✅ そのまま import から始める
import type { Meta, StoryObj } from '@storybook/react-vite';
```

### ❌ heading-order 違反（見出しレベルのスキップ）

WCAG 2.1 AA の `heading-order` ルールにより、見出しレベルを飛ばしてはいけない。

```tsx
// ❌ h1 → h3（h2をスキップ）
<h1>タイトル</h1>
<h3>サブセクション</h3>

// ❌ ダイアログ・ポップオーバー内で孤立した h4
<PopoverContent>
  <h4>見出し</h4>
</PopoverContent>

// ✅ 正しい見出し階層
<h1>タイトル</h1>
<h2>セクション</h2>
<h3>サブセクション</h3>

// ✅ コンテナ内のラベルは <p> + font-bold で代用
<PopoverContent>
  <p className="font-bold">見出し</p>
</PopoverContent>
```

**判定フロー:**

- Story のルート見出しは `h1` または `h2`
- 子セクションは親の +1 レベル（h1 → h2 → h3）
- ダイアログ・ポップオーバー等の小さいコンテナ内では `<p className="font-bold">` を使用

---

## 避けるべきパターン

### ❌ render関数の乱用

```tsx
// ❌ 単純なprops渡しに render は不要
export const Bad: Story = {
  render: () => <Button variant="primary">Click</Button>,
};

// ✅ args を使う
export const Good: Story = {
  args: { variant: 'primary', children: 'Click' },
};
```

### ❌ 過剰なStory

```tsx
// ❌ 同じバリアントの微妙な違いを大量に作らない
export const PrimarySmall: Story = { args: { variant: 'primary', size: 'sm' } };
export const PrimaryMedium: Story = { args: { variant: 'primary', size: 'md' } };
export const PrimaryLarge: Story = { args: { variant: 'primary', size: 'lg' } };
export const SecondarySmall: Story = { args: { variant: 'secondary', size: 'sm' } };
// ... 組み合わせ爆発

// ✅ AllVariants で一覧表示 + Controls で操作
export const AllVariants: Story = {
  render: () => (/* 全パターン一覧 */),
};
```

### ❌ データ依存コンポーネントの無理な再現

```tsx
// ❌ tRPC/Zustand依存をモックで無理に再現
// → コストに見合わない

// ✅ 純粋なUIコンポーネントに分離するか、Storybookに含めない
```

## 運用ルール（Storyとコンポーネントの同期）

### 新規コンポーネント追加時

コンポーネントを作成したら、**同時にStoryも作成する**。

```bash
# コンポーネント作成
src/components/ui/new-component.tsx

# 同時にStoryも作成（必須）
src/components/ui/new-component.stories.tsx
```

### コンポーネント変更時

以下の変更をしたら、**Storyも更新する**：

| 変更内容    | Story側の対応                       |
| ----------- | ----------------------------------- |
| props追加   | argTypesに追加、Storyで使用例を追加 |
| props削除   | argTypesから削除、該当Storyを削除   |
| variant追加 | AllVariantsに追加                   |
| 見た目変更  | Storyで確認（更新不要なことが多い） |

### コンポーネント削除時

コンポーネントを削除したら、**Storyも削除する**。

```bash
# 両方削除
rm src/components/ui/old-component.tsx
rm src/components/ui/old-component.stories.tsx
```

孤児Storyが残るとStorybookがビルドエラーになる。

## `component` フィールドのルール

### 必須：単一コンポーネントの Story

`meta` に `component` を指定し、`args` でpropsを渡す。Controls が自動生成される。

```tsx
const meta = {
  title: 'Components/Button',
  component: Button, // ← 必須
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export const Default: Story = {
  args: { variant: 'primary', children: 'ボタン' }, // ← args で渡す
};

// children が複雑な場合は render + args スプレッド
export const WithSelect: Story = {
  args: { label: '言語' },
  render: (
    args, // ← args を受け取って展開
  ) => (
    <SettingRow {...args}>
      <Select>...</Select>
    </SettingRow>
  ),
};
```

### 不要：以下のケースは `component` なしでOK

| ケース                               | 理由                                         |
| ------------------------------------ | -------------------------------------------- |
| Patterns/Tokens (ドキュメント)       | 複数コンポーネントの組み合わせ               |
| Store/tRPC依存の複合コンポーネント   | args で制御不可（Inspector, View, Modal 等） |
| 内部state で動くインタラクティブデモ | render + ヘルパーコンポーネントが適切        |

### 判定フロー

```
新規 Story 作成時
│
├─ 単一コンポーネントの Story？
│  ├─ YES → component 必須 + args で props 渡し
│  └─ NO（複数コンポーネント組み合わせ）→ component 不要
│
├─ props が args で制御可能？
│  ├─ YES → args + render((args) => <Comp {...args}>...)
│  └─ NO（Store/tRPC依存）→ render のみ
```

## チェックリスト

Story作成時の確認項目：

- [ ] **`'use client'` を書いていない**（Storybook はブラウザ環境）
- [ ] 公式テンプレート（AlertDialog）の構成に従っている
- [ ] **単一コンポーネントの Story には `component` を指定した**
- [ ] **制御可能な props は `args` で渡し、Controls が機能する**
- [ ] Canvas にテキスト（`<h1>`, `<p>` 等）を入れていない
- [ ] JSDoc は1行で簡潔に記述した
- [ ] `AllPatterns` Story を作成した（`flex-col items-start gap-6`）
- [ ] テーブルが必要な場合は MDX Docs を作成した（`tags: []` に変更）
- [ ] テーブル不要なら `tags: ['autodocs']` で JSDoc のみ
- [ ] アイコンボタンには `aria-label` を設定した
- [ ] セマンティックトークン（`bg-background` 等）を使用している
- [ ] 直接カラー（`text-blue-500` 等）を使っていない
- [ ] フォントウェイトは `font-bold` / `font-normal` のみ使用
- [ ] 複合コンポーネントは親を `component` に指定した

## デザイントークンの確認

Story作成時、以下のTokens Storiesを参照してデザイン一貫性を確保する：

| Story               | 確認内容                     |
| ------------------- | ---------------------------- |
| `Tokens/Colors`     | セマンティックカラー、状態色 |
| `Tokens/Typography` | フォントサイズ・ウェイト階層 |
| `Tokens/Spacing`    | 余白パターン                 |

## 関連スキル（Story作成時に参照）

Story対象のコンポーネントが以下に依存する場合、対応するスキルも参照すること：

| コンポーネントの依存 | 参照スキル              | 理由                                   |
| -------------------- | ----------------------- | -------------------------------------- |
| Zustand store        | `/store-creating`       | ストアのパターン・命名規則・モック方法 |
| tRPC API             | `/trpc-router-creating` | API入出力の型、モックデータの構造      |
| i18n（翻訳キー）     | `/i18n`                 | キー命名規則、namespace構造            |
| エラーハンドリング   | `/error-handling`       | ErrorBoundary配置、エラー状態のStory   |
| a11y要件             | `/a11y`                 | aria属性、キーボード操作のテスト       |

## 参考リンク

- [How to write stories | Storybook](https://storybook.js.org/docs/writing-stories)
- [Component Story Format 3.0](https://storybook.js.org/blog/storybook-csf3-is-here/)
- [ArgTypes API](https://storybook.js.org/docs/api/arg-types)
- [Autodocs](https://storybook.js.org/docs/writing-docs/autodocs)
