# テストデータシード管理システム

Issue #351: テスト用データシード管理システム実装

## 📋 概要

BoxLog Appでの開発・テスト環境において、一貫性のあるテストデータを自動生成・投入するシステムです。

## 🏗️ ディレクトリ構成

```
seeds/
├── README.md                    # このファイル
├── test-data.ts                 # テストデータ定義・設定
├── factories/                   # ファクトリーパターン実装
│   ├── user.factory.ts         # ユーザーファクトリー
│   ├── task.factory.ts         # タスクファクトリー
│   └── project.factory.ts      # プロジェクトファクトリー
└── scripts/                     # 実行スクリプト
    ├── seed.ts                 # メインシードスクリプト
    └── quick-seed.ts           # クイックシードスクリプト
```

## 🚀 使用方法

### 基本的な使用

```bash
# 開発環境用データシード
npm run seed:dev

# テスト環境用データシード
npm run seed:test

# 最小限のデータシード
npm run seed:minimal

# ステージング環境用データシード
npm run seed:staging

# 高速デバッグ用（最小データ）
npm run seed:quick
```

### 各コマンドの詳細

| コマンド          | 環境      | ユーザー | タスク | プロジェクト | クリア前 |
| ----------------- | --------- | -------- | ------ | ------------ | -------- |
| `seed:minimal`    | 開発      | 2件      | 3件    | なし         | ✅       |
| `seed:dev`        | 開発      | 5件      | 10件   | 3件          | ✅       |
| `seed:test`       | テスト    | 5件      | 15件   | 5件          | ✅       |
| `seed:staging`    | ステージ  | 10件     | 50件   | 10件         | ❌       |
| `seed:quick`      | デバッグ  | 2件      | 3件    | 1件          | ❌       |

## 🎯 特徴

### 1. ファクトリーパターン

統一されたインターフェースでテストデータを生成:

```typescript
// ユーザー作成例
const admin = UserFactory.createAdmin()
const users = UserFactory.createMany(10)
const premiumUser = UserFactory.createPremium({ name: 'カスタム名' })

// タスク作成例
const todoTask = TaskFactory.createTodo()
const urgentTask = TaskFactory.createWithDueDate(7) // 7日後期限
const taskSet = TaskFactory.createStatusSet() // 全ステータス

// プロジェクト作成例
const activeProject = ProjectFactory.createActive()
const projects = ProjectFactory.createMany(5)
```

### 2. 環境別設定

`test-data.ts` で環境別の設定を管理:

```typescript
export const SEED_CONFIGS = {
  minimal: { userCount: 2, taskCount: 3, cleanBefore: true },
  development: { userCount: 5, taskCount: 10, projectCount: 3 },
  test: { userCount: 5, taskCount: 15, projectCount: 5 },
  staging: { userCount: 10, taskCount: 50, projectCount: 10, cleanBefore: false }
}
```

### 3. 定義済みデータ

よく使用するテストデータを事前定義:

```typescript
export const TEST_USERS = {
  admin: { email: 'admin@test.local', role: 'admin' },
  user: { email: 'user@test.local', role: 'user' },
  premium: { email: 'premium@test.local', role: 'premium' }
}

export const TEST_TASKS = {
  todo_simple: { title: 'シンプルなTODOタスク', status: 'todo' },
  inProgress_urgent: { title: '緊急対応タスク', status: 'in_progress', priority: 'high' }
}
```

## 🔧 開発用途

### 新機能開発時

```bash
# 基本データで開発開始
npm run seed:minimal

# より多くのデータでテスト
npm run seed:dev
```

### テスト実行前

```bash
# テスト環境の準備
npm run seed:test
```

### デバッグ時

```bash
# 高速で最小データ生成
npm run seed:quick
```

## 📚 型定義

### TestUser

```typescript
interface TestUser {
  id?: string
  email: string
  password: string
  name: string
  role: 'admin' | 'user' | 'premium'
  permissions: string[]
  createdAt?: Date
  updatedAt?: Date
}
```

### TestTask

```typescript
interface TestTask {
  id?: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  assigneeId?: string
  dueDate?: Date
  createdAt?: Date
  updatedAt?: Date
}
```

### TestProject

```typescript
interface TestProject {
  id?: string
  name: string
  description?: string
  status: 'active' | 'archived' | 'completed'
  ownerId?: string
  createdAt?: Date
  updatedAt?: Date
}
```

## 🎯 実装時の注意点

1. **実際のDB操作**: 現在はログ出力でシミュレート。実際の実装時は適切なORM/クエリに置き換え
2. **ID管理**: `crypto.randomUUID()` でユニークID生成
3. **関係性**: ユーザー⇔タスク、ユーザー⇔プロジェクトの関係を考慮した生成
4. **環境変数**: 実際のDB接続情報は環境変数で管理

## 🔒 セキュリティ

- パスワードは開発・テスト用固定値（`test1234`）
- 本番環境では使用禁止
- 機密情報は含まない安全なテストデータのみ

## 🚨 重要

**このシステは開発・テスト環境専用です。本番環境での使用は絶対に避けてください。**

---

**作成**: Issue #351 - テスト用データシード管理システム実装
**最終更新**: 2025-09-29