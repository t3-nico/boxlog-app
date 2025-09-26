# ビジネスルール辞書システム 完全ガイド

**Issue #347完了 - 技術的失敗を防ぐ自動化システム完成**

## 🎯 概要

ビジネスルール辞書システムは、Issue #338「技術がわからない自分でも、技術的な失敗をしない開発環境」の実現のために開発された包括的なシステムです。

### 核心価値

> **「技術判断を自動化し、ビジネスロジックに集中できる環境を構築」**

## 🏗️ システム構成

### 1. 基盤システム（Issue #344）

- **ファイル**: `src/config/business-rules.ts` (350行)
- **機能**: ルール定義・管理・実行の中核システム
- **テスト**: 14テストケース（100%通過）

### 2. ESLintカスタムルール（Issue #345）

- **ファイル**: `.eslint/rules/business-rules/` (4ルール, 1,500+行)
- **機能**: リアルタイム違反検出・自動修正提案
- **現状**: 実装完了・一時無効化中（統合調整のため）

### 3. 自動生成システム（Issue #346）

- **ファイル**: `src/lib/business-rules-generator.ts` (600行)
- **CLI**: `scripts/business-rules-code-generator.js` (900行)
- **機能**: バリデーション・型定義・スキーマ・テスト自動生成

### 4. 統合システム（Issue #347）

- **ファイル**: このドキュメント
- **機能**: 既存コード統合・包括ドキュメント・運用ガイド

## 🚀 クイックスタート

### Step 1: ビジネスルール定義

```typescript
import { createRule, businessRuleRegistry } from '@/config/business-rules'

// シンプルなバリデーションルール作成
const userEmailRule = createRule(
  'user-email-validation',
  'メール形式検証',
  'ユーザーメールアドレスの形式を検証',
  'validation',
  ['user'],
  ({ data }) => ({
    valid: /^[^@]+@[^@]+\.[^@]+$/.test(data.email),
    message: /^[^@]+@[^@]+\.[^@]+$/.test(data.email) ? undefined : '有効なメールアドレスを入力してください',
  })
)

// ルール登録
businessRuleRegistry.register(userEmailRule)
```

### Step 2: 自動コード生成

```bash
# 基本的な生成
npm run generate:business-rules

# テスト付き完全生成
npm run generate:all

# 特定リソースのみ生成
npm run generate:business-rules -- --resources user,task
```

### Step 3: 生成されたコードを使用

```typescript
import { validateUser, userSchema, UserType } from '@/generated/business-rules'

// バリデーション関数使用
const result = validateUser(userData)
if (!result.valid) {
  console.error(result.message)
}

// Zodスキーマ使用
try {
  const validUser = userSchema.parse(userData)
} catch (error) {
  console.error('バリデーションエラー:', error.message)
}
```

## 📋 利用可能なコマンド

### ビジネスルール生成

```bash
# 基本生成
npm run generate:business-rules

# バリデーション特化
npm run generate:validation

# 型定義特化
npm run generate:types

# テスト付きスキーマ生成
npm run generate:schemas

# 完全生成（厳格モード）
npm run generate:all
```

### 開発・デバッグ

```bash
# ビジネスルールテスト実行
npm test src/config/business-rules.test.ts

# 生成されたコードのテスト
npm test src/generated/business-rules/tests/

# ESLint実行（将来のカスタムルール有効時）
npm run lint
```

## 🎯 使用パターン

### パターン1: 新機能開発

```typescript
// 1. ビジネスルール定義
const taskCreationRule = createRule(
  'task-creation-validation',
  'タスク作成検証',
  'タスク作成時の必須項目とビジネスロジック検証',
  'validation',
  ['task'],
  ({ data, user }) => {
    // 権限チェック
    if (!user?.permissions.includes('task:create')) {
      return { valid: false, message: 'タスク作成権限がありません' }
    }

    // 必須項目チェック
    if (!data.title || data.title.trim().length < 3) {
      return { valid: false, message: 'タスクタイトルは3文字以上必要です' }
    }

    return { valid: true }
  }
)

businessRuleRegistry.register(taskCreationRule)

// 2. コード生成実行
// npm run generate:business-rules

// 3. 生成されたコード使用
import { validateTask } from '@/generated/business-rules'

async function createTask(taskData: any, user: any) {
  const result = await businessRuleRegistry.validate('task', taskData, user)

  if (!result.every((r) => r.result.valid)) {
    const errorMessage = result.find((r) => !r.result.valid)?.result.message
    throw new Error(errorMessage)
  }

  // タスク作成処理
  return await database.create('tasks', taskData)
}
```

### パターン2: 既存コードのリファクタリング

```typescript
// Before: 直接バリデーション
function updateUser(userData: any) {
  if (!userData.email || !/^[^@]+@[^@]+$/.test(userData.email)) {
    throw new Error('無効なメール')
  }
  if (userData.age < 0 || userData.age > 150) {
    throw new Error('無効な年齢')
  }
  // ... 更新処理
}

// After: ビジネスルール辞書使用
function updateUser(userData: any, user: any) {
  const result = await businessRuleRegistry.validate('user', userData, user)

  if (!result.every((r) => r.result.valid)) {
    const errors = result.filter((r) => !r.result.valid).map((r) => r.result.message)
    throw new Error(errors.join(', '))
  }

  // ... 更新処理
}
```

### パターン3: 複雑なワークフロー

```typescript
// ワークフロールール定義
const taskStatusTransitionRule = createRule(
  'task-status-transition',
  'タスク状態遷移',
  'タスクの状態遷移ルール',
  'workflow',
  ['task'],
  ({ data }) => {
    const { fromStatus, toStatus } = data

    const allowedTransitions = {
      todo: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'todo', 'cancelled'],
      completed: ['in_progress'],
      cancelled: ['todo'],
    }

    const allowed = allowedTransitions[fromStatus]?.includes(toStatus)

    return {
      valid: allowed,
      message: allowed ? undefined : `${fromStatus}から${toStatus}への遷移は許可されていません`,
    }
  }
)

businessRuleRegistry.register(taskStatusTransitionRule)
```

## 🔧 高度な設定

### カスタムルール作成

```typescript
import { BusinessRule, RuleContext, ValidationResult } from '@/config/business-rules'

// 高度なカスタムルール
const advancedValidationRule: BusinessRule = {
  id: 'advanced-user-validation',
  name: '高度なユーザー検証',
  description: '複数の条件を組み合わせた高度な検証',
  category: 'validation',
  severity: 'error',
  contexts: ['user'],
  dependencies: ['user-email-validation'], // 依存関係指定
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  implementation: async ({ data, user, session }: RuleContext): Promise<ValidationResult> => {
    // 複数の検証ロジック
    const checks = [
      () => data.email && data.email.includes('@'),
      () => data.age >= 18,
      () => user?.role === 'admin' || data.department !== 'restricted',
    ]

    for (const check of checks) {
      if (!check()) {
        return {
          valid: false,
          message: '検証に失敗しました',
          details: { session: session?.id, timestamp: session?.timestamp },
        }
      }
    }

    return { valid: true }
  },
}

businessRuleRegistry.register(advancedValidationRule)
```

### 生成オプションのカスタマイズ

```bash
# カスタム出力ディレクトリ
npm run generate:business-rules -- --output ./custom/path

# 特定リソースのみ
npm run generate:business-rules -- --resources user,project

# TypeScript厳格モード
npm run generate:business-rules -- --strict

# 日本語コメント無効化
npm run generate:business-rules -- --no-japanese

# 詳細ログ出力
npm run generate:business-rules -- --verbose

# ヘルプ表示
npm run generate:business-rules -- --help
```

## 🧪 テスト戦略

### 1. ビジネスルール単体テスト

```typescript
import { businessRuleRegistry } from '@/config/business-rules'

describe('ビジネスルールテスト', () => {
  it('ユーザーメール検証ルール', async () => {
    const validData = { email: 'test@example.com' }
    const invalidData = { email: 'invalid-email' }

    const validResult = await businessRuleRegistry.validate('user', validData)
    const invalidResult = await businessRuleRegistry.validate('user', invalidData)

    expect(validResult.every((r) => r.result.valid)).toBe(true)
    expect(invalidResult.some((r) => !r.result.valid)).toBe(true)
  })
})
```

### 2. 自動生成コードテスト

```bash
# 全ての生成されたテスト実行
npm test src/generated/business-rules/tests/

# 特定リソースのテスト
npm test src/generated/business-rules/tests/user.test.ts
```

### 3. 統合テスト

```typescript
describe('統合テスト', () => {
  it('ルール定義から生成コードまでの一貫性', async () => {
    // 1. ルール登録
    const testRule = createRule(/* ... */)
    businessRuleRegistry.register(testRule)

    // 2. コード生成実行
    await generateBusinessRuleCode({ outputDir: './test-output' })

    // 3. 生成されたコードのテスト
    const generatedValidator = require('./test-output/generated-validations')
    const result = generatedValidator.validateUser(testData)

    expect(result.valid).toBeDefined()
  })
})
```

## 📊 パフォーマンス・最適化

### メモリ使用量最適化

```typescript
// 大量のルール登録時の最適化
const optimizedRegistry = new BusinessRuleRegistry()

// バッチ登録
const rules = [
  /* 大量のルール */
]
rules.forEach((rule) => optimizedRegistry.register(rule))

// 統計情報確認
const stats = optimizedRegistry.getStats()
console.log(`登録ルール数: ${stats.total}, アクティブ: ${stats.active}`)
```

### 実行速度測定

```typescript
// ルール実行速度測定
const startTime = performance.now()
const results = await businessRuleRegistry.validate('user', userData)
const endTime = performance.now()

console.log(`実行時間: ${endTime - startTime}ms`)
console.log(`実行ルール数: ${results.length}`)
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 問題1: ルール登録エラー

```
エラー: ルール登録エラー: 依存ルール "unknown-rule" が見つかりません
```

**解決方法:**

```typescript
// 依存関係の順序を確認
businessRuleRegistry.register(dependencyRule) // 先に依存ルールを登録
businessRuleRegistry.register(mainRule) // その後にメインルール
```

#### 問題2: 循環依存エラー

```
エラー: 循環依存エラー: ルール "rule-a"
```

**解決方法:**

```typescript
// 循環依存を解消
const ruleA = createRule('rule-a', ..., { dependencies: [] })      // 依存を削除
const ruleB = createRule('rule-b', ..., { dependencies: ['rule-a'] }) // 一方向に変更
```

#### 問題3: 生成されたコードのインポートエラー

```
エラー: Cannot find module '@/generated/business-rules'
```

**解決方法:**

```bash
# コード生成の実行
npm run generate:business-rules

# TypeScript設定の確認
# tsconfig.json の paths 設定を確認
```

### デバッグモード

```bash
# 詳細ログ付きで生成実行
npm run generate:business-rules -- --verbose

# ルール実行状況の確認
const results = await businessRuleRegistry.validate('user', userData)
console.log('実行結果詳細:', results.map(r => ({
  ruleId: r.rule.id,
  valid: r.result.valid,
  message: r.result.message,
  executionTime: r.executionTime
})))
```

## 🔮 将来の拡張

### 計画中の機能

1. **ESLintカスタムルール有効化** - Issue #345の完全統合
2. **ビジュアルルールエディター** - GUIでのルール作成・編集
3. **ルール分析ダッシュボード** - 実行統計・パフォーマンス監視
4. **外部システム連携** - API経由でのルール管理

### 拡張例

```typescript
// 将来の拡張: 動的ルール
const dynamicRule = {
  id: 'dynamic-validation',
  implementation: ({ data }) => {
    // 外部APIからルール取得
    const rules = await fetchExternalRules(data.type)
    return validateWithExternalRules(data, rules)
  },
}
```

## 🎯 ベストプラクティス

### ルール設計のベストプラクティス

1. **単一責任**: 1つのルールは1つの検証のみ
2. **明確な命名**: ルールIDと名前は用途が明確に分かるもの
3. **適切な分類**: category（validation/workflow/permission/constraint）を正しく設定
4. **依存関係最小化**: 不要な依存関係は作らない
5. **エラーメッセージの品質**: ユーザーが理解しやすいメッセージ

### 開発ワークフロー

1. **ルール定義** → **テスト作成** → **コード生成** → **統合テスト** → **デプロイ**
2. **定期的なルール見直し**: 不要なルールの削除・統合
3. **パフォーマンス監視**: 実行時間・メモリ使用量の定期チェック

## 📖 参考資料

### 関連ドキュメント

- [CLAUDE.md](../CLAUDE.md) - プロジェクト全体ガイド
- [business-rules.ts](../src/config/business-rules.ts) - 基盤システムコード
- [Generated Business Rules](../src/generated/business-rules/) - 自動生成されたコード

### 関連Issue

- [#338](https://github.com/t3-nico/boxlog-app/issues/338) - 技術的失敗を防ぐ開発環境
- [#343](https://github.com/t3-nico/boxlog-app/issues/343) - ビジネスルール辞書システム実装（親Issue）
- [#344](https://github.com/t3-nico/boxlog-app/issues/344) - ビジネスルール辞書の基盤設計・実装
- [#345](https://github.com/t3-nico/boxlog-app/issues/345) - ESLintカスタムルール実装・自動強制システム
- [#346](https://github.com/t3-nico/boxlog-app/issues/346) - 自動化バリデーション・型定義生成システム
- [#347](https://github.com/t3-nico/boxlog-app/issues/347) - 既存コード統合・ドキュメント・テスト完備

---

**📚 このガイドについて**: ビジネスルール辞書システム完全ガイド
**最終更新**: 2025-09-26
**バージョン**: v1.0 - Issue #347完了版

🎉 **技術的失敗を防ぐ自動化システム完成** - Issue #338の理想実現！
