# BoxLog テストガイド

このディレクトリはBoxLogアプリケーションの**共通テストリソース**を管理します。

## 📁 ディレクトリ構造

```
tests/                              # 🔧 共通テスト用
├── setup/
│   ├── vitest.setup.ts            # グローバル設定
│   └── test-utils.tsx             # カスタムrender関数
├── mocks/
│   ├── supabase.ts                # Supabaseモック
│   └── next-router.ts             # Next.jsモック
├── fixtures/
│   └── user.ts                    # テストデータ
├── e2e/                           # E2Eテスト専用
│   └── auth-flow.test.ts          # 認証フローE2E
└── README.md                      # このファイル

src/                               # 👥 コロケーション方式
└── features/
    └── auth/
        ├── components/
        │   ├── LoginForm.tsx
        │   └── LoginForm.test.tsx  # 同じディレクトリ
        └── hooks/
            ├── useAuth.ts
            └── useAuth.test.ts     # 同じディレクトリ
```

## 🎯 テストファイルの配置ルール

### **コロケーション方式（推奨）**

機能コードと同じディレクトリにテストファイルを配置

```typescript
// src/features/tasks/components/TaskItem.test.tsx
import { render, screen, mockTask } from '@/tests/setup/test-utils'
import { TaskItem } from './TaskItem'

describe('TaskItem', () => {
  it('renders task correctly', () => {
    render(<TaskItem task={mockTask} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })
})
```

### **tests/ディレクトリ（共通リソース）**

- E2Eテスト
- 統合テスト
- 複数機能にまたがるテスト

## 🚀 テスト実行コマンド

```bash
# 基本的な実行
npm test                    # 全テスト実行
npm run test:watch         # 監視モード
npm run test:ui            # UI付きで実行
npm run test:coverage      # カバレッジ付き実行

# 直接実行（1Password不要）
npx vitest run             # 1回のみ実行
npx vitest                 # 監視モード

# 特定ファイルのみ実行
npx vitest TaskItem.test.tsx
npx vitest tests/e2e/
```

## 📝 テストの書き方ルール

### **命名規則**

- `.test.tsx` - コンポーネント・React Hooks
- `.test.ts` - ユーティリティ関数・純粋関数
- `.e2e.ts` - E2Eテスト

### **構造化ルール**

```typescript
describe('コンポーネント/機能名', () => {
  // 正常系
  describe('正常な動作', () => {
    it('期待する動作を説明', () => {
      // AAA パターン
      // Arrange: セットアップ
      const mockData = { ... }

      // Act: 実行
      render(<Component data={mockData} />)

      // Assert: 検証
      expect(screen.getByText('期待する文字')).toBeInTheDocument()
    })
  })

  // 異常系
  describe('エラーケース', () => {
    it('エラー時の動作を説明', () => {
      // ...
    })
  })
})
```

## 🎭 モックの使い方

### **既存モックの使用**

```typescript
// Supabaseモック
import { mockSupabaseClient } from '@/tests/mocks/supabase'

// フィクスチャデータ
import { mockUser, mockTask } from '@/tests/setup/test-utils'
```

### **カスタムモックの作成**

```typescript
// tests/mocks/新しいサービス.ts
import { vi } from 'vitest'

export const mockNewService = {
  getData: vi.fn(),
  postData: vi.fn(),
}

vi.mock('@/lib/new-service', () => ({
  newService: mockNewService,
}))
```

## 💡 よく使うテストパターン

### **非同期処理のテスト**

```typescript
it('データを非同期で取得する', async () => {
  const mockData = { id: 1, name: 'Test' }
  mockSupabaseClient.from().select.mockResolvedValue({ data: mockData })

  render(<DataComponent />)

  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### **ユーザーインタラクションのテスト**

```typescript
it('ボタンクリックで関数が呼ばれる', async () => {
  const mockOnClick = vi.fn()
  const user = userEvent.setup()

  render(<Button onClick={mockOnClick}>Click me</Button>)

  await user.click(screen.getByRole('button'))
  expect(mockOnClick).toHaveBeenCalledTimes(1)
})
```

### **エラーケースのテスト**

```typescript
it('エラー時にエラーメッセージを表示する', async () => {
  mockSupabaseClient.from().select.mockRejectedValue(
    new Error('Network error')
  )

  render(<DataComponent />)

  await waitFor(() => {
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
  })
})
```

## 🐛 デバッグ方法

### **VS Codeでのデバッグ**

1. `.vscode/launch.json` に設定追加
2. ブレークポイントを設定
3. F5でデバッグ開始

### **特定のテストのみ実行**

```typescript
// 一時的に.onlyを追加
describe.only('デバッグしたいテスト', () => {
  it.only('特定のテストケース', () => {
    // ...
  })
})
```

### **デバッグ用のログ出力**

```typescript
it('デバッグ例', () => {
  render(<Component />)

  // DOMの構造を確認
  screen.debug()

  // 特定の要素を確認
  const element = screen.getByTestId('test-element')
  console.log(element)
})
```

## 📊 カバレッジ目標

- **全体目標**: 40-50%
- **重要機能**: 80%以上（認証、決済、データ保存）
- **UI系**: 20%程度で可（見た目の変更が多いため）

```bash
# カバレッジレポートの確認
npm run test:coverage
open coverage/index.html
```

## 🔧 新しいテストを追加する時のチェックリスト

- [ ] **配置**: 適切な場所に配置したか（コロケーション vs tests/）
- [ ] **網羅性**: 正常系・異常系をカバーしたか
- [ ] **モック**: 共通化できるモックはないか
- [ ] **速度**: 実行時間は1秒以内か
- [ ] **独立性**: 他のテストに依存していないか
- [ ] **可読性**: テスト内容が説明的か

## 🛠️ トラブルシューティング

### **よくあるエラー**

#### `ReferenceError: expect is not defined`

```typescript
// 解決: vitestのglobalsを有効にする
// vitest.config.ts で globals: true が設定済み
```

#### `Cannot resolve module '@/...'`

```typescript
// 解決: aliasの確認
// vitest.config.ts のresolve.aliasを確認
```

#### `TypeError: vi.fn() is not a function`

```typescript
// 解決: vitestからviをインポート
import { vi } from 'vitest'
```

### **モックが効かない場合**

1. **インポート順序を確認**

   ```typescript
   // ❌ 間違い
   import { Component } from './Component'
   import { vi } from 'vitest'

   // ✅ 正しい
   import { vi } from 'vitest'
   import { Component } from './Component'
   ```

2. **モックの配置を確認**
   - `tests/setup/vitest.setup.ts` で全体適用
   - テストファイル内で個別適用

## 📚 参考リンク

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Testing Library公式ドキュメント](https://testing-library.com/)
- [React Testing Library のベストプラクティス](https://kentcdodds.com/blog/react-testing-library-vs-enzyme)
- [BoxLog開発ガイド](../CLAUDE.md)

## 💬 サポート

質問や問題がある場合：

1. このREADMEで解決方法を確認
2. [トラブルシューティング](#-トラブルシューティング)を確認
3. 開発チームに相談

---

**更新日**: 2024-01-01  
**バージョン**: v1.0  
**担当**: BoxLog開発チーム
