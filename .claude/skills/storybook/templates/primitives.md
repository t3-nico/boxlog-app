# Primitives テンプレート

shadcn/ui ベースの単体UIコンポーネント用。`src/components/ui/` が対象。

## 基本テンプレート

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MyComponent } from './my-component';

const meta = {
  title: 'Primitives/MyComponent',
  component: MyComponent,
  tags: [], // MDX Docs を使う場合
  parameters: {
    layout: 'centered', // centered | fullscreen | padded
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパーコンポーネント（状態を持つ例はここに定義）
// ---------------------------------------------------------------------------

function VariantAExample() {
  /* ... */
}

// ---------------------------------------------------------------------------
// Stories — Canvas は純粋なコンポーネント描画のみ
// ---------------------------------------------------------------------------

/** 基本的な使用例。最小構成。 */
export const Default: Story = {
  args: {
    /* デフォルトのprops */
  },
};

/** バリアントAの説明。1行で簡潔に。実装例: XxxComponent */
export const VariantA: Story = {
  render: () => <VariantAExample />,
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
    </div>
  ),
};
```

## tags の選び方

| 条件                             | tags           | 理由                         |
| -------------------------------- | -------------- | ---------------------------- |
| テーブルが必要 → MDX Docs を作成 | `[]`           | MDX と autodocs の競合を回避 |
| テーブル不要 → JSDoc だけで十分  | `['autodocs']` | JSDoc から Docs を自動生成   |

## layout パラメータ

| 値           | 用途                                     |
| ------------ | ---------------------------------------- |
| `centered`   | 小さいコンポーネント（Button, Badge 等） |
| `padded`     | 中サイズ（Card, Form 等）                |
| `fullscreen` | 全幅コンポーネント（Header, Sidebar 等） |

## 複合コンポーネント（Tabs, Dialog 等）

親コンポーネントを `component` に指定。render 関数で子を組み合わせる。

```tsx
const meta = {
  title: 'Primitives/Tabs',
  component: Tabs, // 親を指定（Autodocsで親のpropsが表示される）
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">タブ1</TabsTrigger>
        <TabsTrigger value="tab2">タブ2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">タブ1の内容</TabsContent>
      <TabsContent value="tab2">タブ2の内容</TabsContent>
    </Tabs>
  ),
};
```

## MDX Docs テンプレート（テーブルが必要な場合）

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

## Default

<Primary />

<Controls />

<Stories includePrimary={false} />

</div>
</Unstyled>
```

## argTypes 設計

```tsx
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline'],
    description: 'ボタンのスタイルバリアント',     // 日本語で記述
  },
  disabled: {
    control: 'boolean',
    description: '無効状態',
  },
  className: {
    table: { disable: true },                       // 内部用propsは非表示
  },
}
```

## 避けるべきパターン

```tsx
// ❌ 単純なprops渡しに render は不要
export const Bad: Story = {
  render: () => <Button variant="primary">Click</Button>,
};
// ✅ args を使う
export const Good: Story = {
  args: { variant: 'primary', children: 'Click' },
};

// ❌ 組み合わせ爆発
export const PrimarySmall: Story = { ... };
export const PrimaryMedium: Story = { ... };
export const SecondarySmall: Story = { ... };
// ✅ AllPatterns で一覧 + Controls で操作
```

## 参考実装

- `src/components/ui/alert-dialog.stories.tsx` — 公式テンプレートの実物
- `src/components/ui/alert-dialog.docs.mdx` — MDX Docs の実物
