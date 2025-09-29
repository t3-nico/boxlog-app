# tests/ - テスト実行方法

BoxLogアプリケーションのテスト実行ガイド。

## 🚀 クイックスタート

```bash
# 全テスト実行
npm run test

# 監視モード（開発中推奨）
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

---

## 📋 テストコマンド一覧

### 基本コマンド
```bash
# 全テスト実行
npm run test

# 特定ファイルのみ
npm run test TaskList.test.tsx

# 特定パターンにマッチ
npm run test -- --grep "TaskList"

# UIモード（Vitest UI）
npm run test:ui
```

### カバレッジ
```bash
# カバレッジレポート生成
npm run test:coverage

# カバレッジレポート表示（ブラウザ）
open coverage/index.html
```

### デバッグ
```bash
# デバッグモード
npm run test:debug

# 特定テストのみデバッグ
npm run test:debug TaskList.test.tsx
```

---

## 📊 カバレッジ要件

BoxLogでは**80%以上のカバレッジ**を必須としています。

### カバレッジ閾値
```javascript
// vitest.config.ts
coverage: {
  statements: 80,  // 最低80%
  branches: 80,
  functions: 80,
  lines: 80,
}
```

### カバレッジレポートの見方
```bash
# レポート生成
npm run test:coverage

# 出力例
---------------------------|---------|----------|---------|---------|
File                       | % Stmts | % Branch | % Funcs | % Lines |
---------------------------|---------|----------|---------|---------|
All files                  |   85.32 |    78.45 |   90.12 |   85.32 |
 src/components/TaskList   |   92.15 |    85.71 |   95.00 |   92.15 |
 src/hooks/useTaskStore    |   78.23 |    72.34 |   85.00 |   78.23 |
---------------------------|---------|----------|---------|---------|
```

---

## 🧪 テスト構造

### コロケーション方式
テストファイルは対象コードと同じディレクトリに配置。

```
src/features/tasks/
├── components/
│   ├── TaskList.tsx
│   └── TaskList.test.tsx  ← ここに配置
├── hooks/
│   ├── useTaskStore.ts
│   └── useTaskStore.test.ts
└── utils/
    ├── taskHelpers.ts
    └── taskHelpers.test.ts
```

### E2Eテスト（将来対応予定）
```
tests/e2e/
├── auth.spec.ts
├── tasks.spec.ts
└── ...
```

---

## 🔧 環境変数設定

テスト実行時の環境変数は `.env.test` で管理。

```bash
# .env.test
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key
```

---

## 🐛 トラブルシューティング

### テストが失敗する
```bash
# キャッシュクリア
npm run test -- --clearCache

# 全テスト再実行
npm run test -- --run
```

### カバレッジが表示されない
```bash
# coverage/ディレクトリを削除して再実行
rm -rf coverage
npm run test:coverage
```

### 監視モードが動作しない
```bash
# Vitest再起動
# Ctrl+C で終了 → 再度実行
npm run test:watch
```

---

## 📝 テスト作成ガイド

詳細なテスト作成ルールは [`CLAUDE.md`](./CLAUDE.md) を参照してください。

### 基本的なテストの書き方
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskList } from './TaskList'

describe('TaskList', () => {
  it('should render tasks', () => {
    const tasks = [{ id: '1', title: 'Task 1' }]
    render(<TaskList tasks={tasks} />)
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })
})
```

---

## 🔗 関連ドキュメント

- **テスト作成ルール**: [`CLAUDE.md`](./CLAUDE.md)
- **ESLint設定**: [`../docs/ESLINT_SETUP_COMPLETE.md`](../docs/ESLINT_SETUP_COMPLETE.md)
- **コーディングルール**: [`../src/CLAUDE.md`](../src/CLAUDE.md)

---

**📖 最終更新**: 2025-09-30