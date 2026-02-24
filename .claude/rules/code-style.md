---
paths:
  - 'src/**/*.{ts,tsx}'
---

# コーディング規約

## 型定義

具体的な型を使い、型安全性を最大化する。

```typescript
// ✅ 具体的な型
const user: User = getUserData();
const onClick: (date: Date) => void = handleClick;

// ❌ 禁止
const user: any = getUserData();
const onClick: Function = handleClick;
```

- union型のvariance問題には `as never` を使う（`as any` は禁止）
- `unknown` は型ガードと組み合わせる場合のみ許可

## スタイリング

セマンティックトークンでダークモード対応を自動化する。

```tsx
// ✅ セマンティックトークン
<div className="bg-card text-foreground border-border" />

// ❌ 直接カラー、style属性
<div className="text-blue-500" />
<div style={{ color: 'blue' }} />
```

**詳細**: `.claude/skills/frontend-design/SKILL.md`

## コンポーネント

named export を使い、tree-shaking と IDE補完を最適化する。

```typescript
// ✅ named export
export function TaskCard() {}

// ✅ App Router re-export（error.tsx, loading.tsx, page.tsx）
export { CalendarError as default } from '../_helpers/CalendarError';

// ❌ 禁止
export default function TaskCard() {}
const TaskCard: React.FC = () => {};
```

## UIコンポーネント

Storybookに記載されているパターンのみ使用する。新パターンが必要な場合は先にStoryを追加する。

**詳細**: `.claude/skills/storybook/SKILL.md`

## ログ出力

```typescript
// ✅ loggerモジュール（Sentry連携、構造化ログ）
import { logger } from '@/lib/logger';
logger.info('Operation completed', { userId, action });

// ✅ 許可（警告・エラー）
console.warn('Deprecation warning');
console.error('Critical failure');

// ❌ 本番コード禁止
console.log('debug');
```

## ファイル命名

| 種類               | 規則                   | 例                     |
| ------------------ | ---------------------- | ---------------------- |
| **コンポーネント** | PascalCase             | `TaskCard.tsx`         |
| **フック**         | camelCase + use prefix | `useTagStore.ts`       |
| **ユーティリティ** | camelCase              | `formatDate.ts`        |
| **型定義**         | camelCase or types.ts  | `plan.types.ts`        |
| **テスト**         | 同名 + .test           | `TaskCard.test.tsx`    |
| **定数**           | UPPER_SNAKE_CASE       | `const MAX_TAGS = 100` |

## import順序

```typescript
// 1. React/Next.js
import { useState, useCallback } from 'react';
// 2. 外部ライブラリ
import { z } from 'zod';
// 3. 内部モジュール（@/ エイリアス）
import { api } from '@/lib/trpc';
// 4. 相対パス（同一feature内）
import { TagCard } from './TagCard';
// 5. 型（type import）
import type { Tag } from '@/types';
```

## Server Component vs Client Component

Server Component をデフォルトにする。以下のいずれかに該当する場合のみ Client Component にする：

- `useState` / `useEffect` が必要
- `onClick` 等のイベントハンドラが必要
- ブラウザAPI（`localStorage` 等）が必要

## セキュリティ

- 認証必須エンドポイントは `protectedProcedure` を使用
- `ctx.userId` でデータアクセスを制限
- `dangerouslySetInnerHTML` は禁止
- `.env` をコミットしない、`NEXT_PUBLIC_` 以外はクライアントに渡さない

**詳細**: `.claude/skills/security/SKILL.md`
