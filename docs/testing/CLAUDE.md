# tests/ - テスト作成ルール

BoxLogアプリケーションのテスト作成ガイドライン。

## 🧪 テスト戦略

### コロケーション方式（必須）
**テストファイルは対象コードと同じディレクトリに配置**

```
src/features/tasks/
├── components/
│   ├── TaskList.tsx
│   └── TaskList.test.tsx  ← コンポーネントテスト
├── stores/
│   ├── useTaskStore.ts
│   └── useTaskStore.test.ts  ← ストアテスト
└── utils/
    ├── taskHelpers.ts
    └── taskHelpers.test.ts  ← ユーティリティテスト
```

---

## 🎯 テストフレームワーク

### 使用技術
- **Vitest** - テストランナー（Jest互換）
- **@testing-library/react** - コンポーネントテスト
- **@testing-library/jest-dom** - DOMマッチャー
- **@testing-library/user-event** - ユーザーインタラクション

---

## 📋 テスト作成ルール

### 1. テストファイル命名規則
```bash
# ✅ 正しい命名
TaskList.test.tsx
useTaskStore.test.ts
taskHelpers.test.ts

# ❌ 禁止
TaskList.spec.tsx
TaskList.test.js  # .tsxまたは.ts必須
```

### 2. テスト構造
```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskList } from './TaskList'

describe('TaskList', () => {
  beforeEach(() => {
    // セットアップ
  })

  it('should render task list correctly', () => {
    // Arrange
    const tasks = [{ id: '1', title: 'Task 1' }]

    // Act
    render(<TaskList tasks={tasks} />)

    // Assert
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })

  it('should handle empty state', () => {
    // ...
  })
})
```

### 3. テストカバレッジ要件
- **最低カバレッジ**: 80%必須
- **重要機能**: 90%推奨
- **クリティカルパス**: 100%必須

### 4. テスト対象の優先度
**High Priority**:
- ビジネスロジック
- ユーザー認証・認可
- データ保存・取得
- フォームバリデーション

**Medium Priority**:
- UIコンポーネント
- カスタムフック
- ユーティリティ関数

**Low Priority**:
- 定数定義
- 型定義
- スタイリング

---

## 🔧 テスト実行コマンド

```bash
# 全テスト実行
npm run test

# 監視モード
npm run test:watch

# カバレッジレポート
npm run test:coverage

# 特定ファイルのみ
npm run test TaskList.test.tsx
```

---

## 📝 コンポーネントテストのベストプラクティス

### ユーザー視点でテスト
```tsx
// ✅ 推奨：ユーザーが見るテキストで検索
expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()

// ❌ 避ける：実装詳細に依存
expect(container.querySelector('.save-button')).toBeInTheDocument()
```

### 非同期処理のテスト
```tsx
it('should load tasks asynchronously', async () => {
  render(<TaskList />)

  // waitFor を使用
  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })
})
```

### モック・スタブの使用
```tsx
import { vi } from 'vitest'

// APIモック
vi.mock('@/lib/api', () => ({
  fetchTasks: vi.fn(() => Promise.resolve([{ id: '1', title: 'Task 1' }]))
}))

// 環境変数モック
vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000')
```

---

## 🎨 テーマシステムのテスト

```tsx
import { colors } from '@/config/theme'

it('should apply correct theme colors', () => {
  render(<TaskCard />)

  const card = screen.getByTestId('task-card')
  expect(card).toHaveClass(colors.background.base)
})
```

---

## 🔗 関連ドキュメント

- **テスト実行方法**: [`README.md`](./README.md)
- **ESLint設定**: [`../development/ESLINT_HYBRID_APPROACH.md`](../development/ESLINT_HYBRID_APPROACH.md)
- **コーディングルール**: [`../../src/CLAUDE.md`](../../src/CLAUDE.md)

---

**📖 最終更新**: 2025-09-30