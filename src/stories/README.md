# src/stories - Storybook ドキュメント専用

特定コンポーネントに属さないStorybook用ドキュメント・カタログ。

---

## 役割

```
src/stories/
├── docs/        ← ガイドライン、イントロダクション
├── patterns/    ← UIパターン集（Forms, Cards, Loading 等）
└── tokens/      ← デザイントークンカタログ（Colors, States, ZIndex 等）
```

**コンポーネントのStoryはここに置かない**（各コンポーネントと同じディレクトリに配置する）

---

## Story配置ルール

| Story種類               | 配置場所                         | 例                                                   |
| ----------------------- | -------------------------------- | ---------------------------------------------------- |
| **コンポーネントStory** | コンポーネントと同じディレクトリ | `src/components/ui/button.stories.tsx`               |
| **Feature Story**       | Feature内                        | `src/features/tags/components/tag-badge.stories.tsx` |
| **ドキュメント**        | `src/stories/docs/`              | `Introduction.mdx`                                   |
| **パターン集**          | `src/stories/patterns/`          | `Forms.stories.tsx`                                  |
| **トークンカタログ**    | `src/stories/tokens/`            | `Colors.stories.tsx`                                 |

---

## なぜ `src/stories/` ？

`.storybook/main.ts` のStory検出パターン:

```ts
stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'];
```

`src/` 配下のみスキャンするため、Story・MDXファイルは `src/` 内に配置する必要がある。

| ディレクトリ   | 役割                                                  |
| -------------- | ----------------------------------------------------- |
| `.storybook/`  | Storybookの**設定**（main.ts, preview.tsx, mocks）    |
| `src/stories/` | ドキュメント系Story（コンポーネントに紐づかないもの） |

---

## 新規追加ガイド

### トークンカタログを追加する場合

```tsx
// src/stories/tokens/NewToken.stories.tsx
const meta = {
  title: 'Tokens/NewToken',
  // ...
} satisfies Meta;
```

### UIパターンを追加する場合

```tsx
// src/stories/patterns/NewPattern.stories.tsx
const meta = {
  title: 'Patterns/NewPattern',
  // ...
} satisfies Meta;
```

### コンポーネントStoryを追加する場合

```tsx
// ✅ コンポーネントと同じディレクトリに配置
// src/components/ui/my-component.stories.tsx
const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {},
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;
```

---

## 命名規則（Storybook Sidebar）

| プレフィックス | 対象                      | 例                       |
| -------------- | ------------------------- | ------------------------ |
| `Docs/`        | ドキュメント              | `Docs/Introduction`      |
| `Tokens/`      | デザイントークン          | `Tokens/Colors`          |
| `Patterns/`    | UIパターン                | `Patterns/Forms`         |
| `Components/`  | UIコンポーネント          | `Components/Button`      |
| `Features/`    | Feature固有コンポーネント | `Features/Tags/TagBadge` |
