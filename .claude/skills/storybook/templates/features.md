# Features テンプレート

ドメインロジックを含む Feature コンポーネント。`src/features/*/components/` が対象。

## Storybook に入れるべきか

| 条件                                         | 判断                      |
| -------------------------------------------- | ------------------------- |
| props 駆動の純粋UI                           | 入れる                    |
| tRPC/Zustand に直接依存                      | 入れない（コスト > 価値） |
| Feature の barrel export (`index.ts`) にある | 入れる候補                |
| barrel export にない（内部コンポーネント）   | 入れない                  |

**原則**: データ依存コンポーネントは無理に Storybook に入れない。
純粋UIに分離できるなら `src/core/components/` に移動して Recipes にする。

## 基本テンプレート

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import { PlanDeleteConfirmDialog } from './PlanDeleteConfirmDialog';

const meta = {
  title: 'Features/Plans/PlanDeleteConfirmDialog',
  component: PlanDeleteConfirmDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof PlanDeleteConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 削除確認ダイアログ。プラン名を表示し、確認後に onConfirm を呼ぶ。 */
export const Default: Story = {
  args: {
    open: true,
    planName: 'Weekly Meeting',
    onConfirm: fn(),
    onCancel: fn(),
  },
};
```

## title 命名

```
Features/{FeatureName}/{ComponentName}
```

| Feature  | 例                                 |
| -------- | ---------------------------------- |
| Plans    | `Features/Plans/PlanInspector`     |
| Records  | `Features/Records/RecordInspector` |
| Tags     | `Features/Tags/TagSelectCombobox`  |
| Calendar | `Features/Calendar/DayView`        |

## Feature Boundaries との関係

- Feature Story は同一 Feature 内のコンポーネントのみ import 可能
- 他 Feature のコンポーネントが必要 → Mock で差し替え
- 共有コンポーネント（`@/core/components/`, `@/components/ui/`）は import OK

## tRPC 依存コンポーネントの扱い

`.storybook/mocks/trpc.tsx` に `TRPCMockProvider` が存在する。
ただし、tRPC モックは**メンテナンスコストが高い**ため、以下を推奨:

1. UI部分を props 駆動コンポーネントに分離
2. 分離したUIコンポーネントの Story を作成
3. tRPC 接続は Feature 内のコンテナコンポーネントに閉じ込める

## 参考実装

- `src/features/plans/components/inspector/` — Feature Inspector の構成例
- `src/core/components/inspector/` — Feature から分離された共通UI
