# error-patterns/ - エラーハンドリング辞書システム

統一エラー管理・自動復旧システムのコアエンジンです。エラーの分類・メッセージ・復旧戦略を一元管理します。

## 📁 ファイル構成

```
src/config/error-patterns/
├── index.ts              # ErrorPatternDictionary（メインエンジン）
├── categories.ts         # エラー分類・重要度定義
├── messages.ts           # ユーザー向けメッセージ
└── recovery-strategies.ts# リトライ・フォールバック戦略
```

## 🎯 基本コンセプト

### エラーパターン辞書の3要素

1. **カテゴリ分類** (`categories.ts`)
   - NETWORK, DATABASE, VALIDATION, AUTHENTICATION, BUSINESS_LOGIC
   - 重要度（critical, high, medium, low）
   - リトライ可能性

2. **ユーザーメッセージ** (`messages.ts`)
   - タイトル・説明・対処方法
   - 重要度別のスタイル定義

3. **復旧戦略** (`recovery-strategies.ts`)
   - リトライ設定（回数・間隔・バックオフ）
   - サーキットブレーカー
   - フォールバック処理

## 🚀 基本的な使い方

### 1. エラーを作成する

```typescript
import { createAppError } from '@/config'

const error = createAppError(
  'Database connection timeout', // 内部メッセージ
  'DB_CONNECTION_TIMEOUT', // エラーコード
  {
    // メタデータ（オプション）
    source: 'api',
    userId: 'user123',
    context: { query: 'SELECT * FROM tasks' },
  }
)

// エラー情報の取得
console.log(error.code) // 'DB_CONNECTION_TIMEOUT'
console.log(error.category) // 'DATABASE'
console.log(error.severity) // 'high'
console.log(error.userMessage.title) // '接続エラー'
console.log(error.isRetryable()) // true
```

### 2. 既存のエラーをラップする

```typescript
import { wrapError } from '@/config'

try {
  await fetch('/api/tasks')
} catch (error) {
  const appError = wrapError(error as Error, 'API_NETWORK_ERROR', { source: 'api', endpoint: '/api/tasks' })

  throw appError
}
```

### 3. 自動復旧付きで実行する（推奨）

```typescript
import { executeWithAutoRecovery } from '@/config'

async function fetchTasks() {
  const result = await executeWithAutoRecovery(
    async () => {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error('API Error')
      return await res.json()
    },
    'API_NETWORK_ERROR', // エラーコード
    { endpoint: '/api/tasks' } // コンテキスト
  )

  if (result.success) {
    console.log('Data:', result.data)
    console.log('Retry count:', result.retryCount)
    console.log('Fallback used:', result.fallbackUsed)
  } else {
    console.error('Error:', result.error?.userMessage)
    toast.error(result.error?.userMessage.title)
  }

  return result.data
}
```

## 📋 利用可能なエラーコード

### NETWORK関連

```typescript
'API_NETWORK_ERROR' // ネットワークエラー
'API_TIMEOUT' // タイムアウト
'API_RATE_LIMIT' // レート制限
'API_SERVER_ERROR' // サーバーエラー
```

### DATABASE関連

```typescript
'DB_CONNECTION_TIMEOUT' // 接続タイムアウト
'DB_QUERY_ERROR' // クエリエラー
'DB_CONSTRAINT_VIOLATION' // 制約違反
'DB_TRANSACTION_FAILED' // トランザクション失敗
```

### VALIDATION関連

```typescript
'VALIDATION_REQUIRED_FIELD' // 必須フィールド
'VALIDATION_INVALID_FORMAT' // 不正なフォーマット
'VALIDATION_OUT_OF_RANGE' // 範囲外
```

### AUTHENTICATION関連

```typescript
'AUTH_INVALID_CREDENTIALS' // 認証情報が不正
'AUTH_TOKEN_EXPIRED' // トークン期限切れ
'AUTH_PERMISSION_DENIED' // 権限不足
```

### BUSINESS_LOGIC関連

```typescript
'BUSINESS_INVALID_STATE' // 不正な状態
'BUSINESS_DUPLICATE_ENTRY' // 重複エラー
'BUSINESS_RESOURCE_NOT_FOUND' // リソース未検出
```

## 🔄 復旧戦略の詳細

### リトライ戦略

```typescript
import { executeWithRetry } from '@/config'

const data = await executeWithRetry(
  async () => await fetchData(),
  {
    enabled: true,
    maxAttempts: 3, // 最大3回リトライ
    delayMs: 1000, // 初回1秒待機
    backoffMultiplier: 2, // 指数バックオフ（1s, 2s, 4s）
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
  'API_NETWORK_ERROR'
)
```

### サーキットブレーカー

```typescript
import { CircuitBreaker } from '@/config'

const breaker = new CircuitBreaker({
  failureThreshold: 5, // 5回失敗でOPEN
  resetTimeoutMs: 60000, // 60秒後にHALF_OPEN
  halfOpenMaxAttempts: 3, // HALF_OPENで3回成功でCLOSED
})

const result = await breaker.execute(async () => {
  return await fetch('/api/tasks')
})

// 状態確認
console.log(breaker.getState()) // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
console.log(breaker.getMetrics()) // 成功/失敗カウント
```

### フォールバック処理

```typescript
import { executeWithFallback } from '@/config'

const data = await executeWithFallback(async () => await fetchFromAPI(), {
  enabled: true,
  handler: async () => {
    // キャッシュから取得
    return await getFromCache()
  },
  timeout: 5000,
})
```

## 📊 統計情報の取得

```typescript
import { errorPatternDictionary } from '@/config'

// エラーコード別統計
const stats = errorPatternDictionary.getErrorStats()
console.log(stats.get('API_NETWORK_ERROR')) // 発生回数

// カテゴリ別統計
const categoryStats = errorPatternDictionary.getCategoryStats()
console.log(categoryStats.NETWORK) // NETWORK系エラーの合計

// サーキットブレーカーの状態
const breakerStatus = errorPatternDictionary.getCircuitBreakerStatus()

// 健全性チェック
const health = errorPatternDictionary.healthCheck()
console.log(health.totalErrors)
console.log(health.criticalErrors)
```

## 💡 実践例

### API呼び出しの完全なエラーハンドリング

```typescript
import { executeWithAutoRecovery } from '@/config'
import { toast } from '@/components/ui/toast'

async function updateTask(taskId: string, data: TaskData) {
  const result = await executeWithAutoRecovery(
    async () => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Task not found')
        }
        throw new Error(`HTTP ${res.status}`)
      }

      return await res.json()
    },
    'API_NETWORK_ERROR',
    { taskId, operation: 'update' }
  )

  if (result.success) {
    toast.success('タスクを更新しました')
    return result.data
  } else {
    // ユーザー向けメッセージを表示
    toast.error(result.error?.userMessage.title)

    // Sentryに送信（本番環境）
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(result.error, result.error?.getSentryContext())
    }

    throw result.error
  }
}
```

### カスタムエラーカテゴリの追加

新しいエラーコードが必要な場合は、`categories.ts` と `messages.ts` を更新：

```typescript
// categories.ts
export const ERROR_CODES = {
  // ... 既存のコード
  CUSTOM_NEW_ERROR: 'CUSTOM_NEW_ERROR',
} as const

// messages.ts
const USER_MESSAGES: Record<ErrorCode, UserMessage> = {
  // ... 既存のメッセージ
  CUSTOM_NEW_ERROR: {
    title: 'カスタムエラー',
    description: '新しいエラーが発生しました',
    action: '再度お試しください',
  },
}
```

## 🔗 関連ドキュメント

- [ERROR_HANDLING.md](../../../docs/architecture/ERROR_HANDLING.md) - エラーハンドリング全体像
- [SENTRY.md](../../../docs/integrations/SENTRY.md) - Sentry統合
- [index.ts](index.ts) - ErrorPatternDictionaryの実装

## ❓ よくある質問

### Q1: いつ `createAppError` を使い、いつ `executeWithAutoRecovery` を使うべきか？

**A**:

- **`createAppError`**: エラーを作成するだけ（throw時）
- **`executeWithAutoRecovery`**: 自動リトライ・フォールバックが必要な場合（推奨）

### Q2: リトライ回数はどう決めるべきか？

**A**: デフォルトは3回です。API側の制限や処理時間に応じて調整してください。

### Q3: すべてのエラーでこのシステムを使うべきか？

**A**: 推奨です。特にAPI呼び出し・DB操作・外部サービス連携では必須です。

---

**最終更新**: 2025-10-06
