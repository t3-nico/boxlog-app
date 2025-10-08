# エラーパターン辞書システム - 完全ガイド

## 🎯 概要

BoxLogのエラーパターン辞書システムは、統一エラー管理・自動復旧・ユーザー通知を提供する企業級エラーハンドリングシステムです。

## 📋 主要機能

### 1. 統一エラーコード体系（7カテゴリ）
- **AUTH** (1xxx): 認証・認可エラー
- **VALIDATION** (2xxx): バリデーションエラー
- **DB** (3xxx): データベースエラー
- **BIZ** (4xxx): ビジネスロジックエラー
- **EXTERNAL** (5xxx): 外部サービス連携エラー
- **SYSTEM** (6xxx): システム・インフラエラー
- **RATE** (7xxx): レート制限エラー

### 2. 自動復旧システム
- エラーカテゴリ別のリトライ戦略
- 指数バックオフ・サーキットブレーカー
- フォールバック処理

### 3. Sentry統合
- 自動分類・構造化レポーティング
- チーム別アラート設定
- パフォーマンストラッキング

## 🚀 クイックスタート

### 基本的な使用方法

```typescript
import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { handleError } from '@/lib/error-handler'

// エラーを作成
const error = createAppError(
  'ユーザーが見つかりません',
  ERROR_CODES.NOT_FOUND,
  {
    source: 'user-service',
    userId: 'user-123',
    context: { searchId: 'invalid-id' }
  }
)

// エラーを処理
await handleError(error)
```

### React Hookでの使用

```typescript
import { useErrorHandler } from '@/hooks/use-error-handler'

function UserProfile() {
  const { handleWithRecovery, errorState, clearError } = useErrorHandler()

  const loadUser = async () => {
    const result = await handleWithRecovery(
      () => fetch('/api/user/123').then(res => res.json()),
      ERROR_CODES.API_UNAVAILABLE,
      { context: { component: 'UserProfile' } }
    )

    if (result.success) {
      setUser(result.data)
    }
  }

  return (
    <div>
      {errorState.hasError && (
        <ErrorNotification
          error={errorState.error}
          onDismiss={clearError}
        />
      )}
      <button onClick={loadUser}>ユーザーを読み込み</button>
    </div>
  )
}
```

### API Routes での使用

```typescript
import { withErrorHandling, withAuth } from '@/app/api/middleware'

export const GET = withAuth(async (req, context) => {
  // 認証済みAPIロジック
  const user = await getUserById(context.userId)

  if (!user) {
    throw createAppError(
      'User not found',
      ERROR_CODES.NOT_FOUND,
      { context: { userId: context.userId } }
    )
  }

  return user
})
```

## 📚 詳細ガイド

### エラーコード一覧

#### 認証・認可エラー (1xxx)
```typescript
ERROR_CODES.INVALID_TOKEN = 1001        // 無効なトークン
ERROR_CODES.EXPIRED_TOKEN = 1002        // 期限切れトークン
ERROR_CODES.NO_PERMISSION = 1003        // 権限不足
ERROR_CODES.INVALID_CREDENTIALS = 1004  // 認証情報エラー
ERROR_CODES.ACCOUNT_LOCKED = 1005       // アカウントロック
```

#### バリデーションエラー (2xxx)
```typescript
ERROR_CODES.REQUIRED_FIELD = 2001       // 必須フィールド未入力
ERROR_CODES.INVALID_FORMAT = 2002       // 形式エラー
ERROR_CODES.INVALID_EMAIL = 2004        // メールアドレス形式エラー
ERROR_CODES.PASSWORD_TOO_WEAK = 2006    // パスワード強度不足
ERROR_CODES.FILE_TOO_LARGE = 2009       // ファイルサイズ超過
```

#### データベースエラー (3xxx)
```typescript
ERROR_CODES.CONNECTION_FAILED = 3001    // 接続失敗
ERROR_CODES.QUERY_TIMEOUT = 3002        // クエリタイムアウト
ERROR_CODES.NOT_FOUND = 3004            // データ未発見
ERROR_CODES.DUPLICATE_KEY = 3005        // 重複キーエラー
```

### 自動復旧戦略

#### リトライ設定例
```typescript
// データベースエラー - 積極的リトライ
{
  enabled: true,
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true
}

// 認証エラー - リトライ無効
{
  enabled: false,
  maxAttempts: 1
}
```

#### サーキットブレーカー設定
```typescript
{
  enabled: true,
  failureThreshold: 5,      // 5回失敗でOPEN
  recoveryTimeout: 30000,   // 30秒後に HALF_OPEN
  successThreshold: 3       // 3回成功で CLOSED
}
```

### カスタムエラーハンドラー

```typescript
import { globalErrorHandler } from '@/lib/error-handler'

// 通知ハンドラーを登録
globalErrorHandler.registerNotificationHandler(
  'toast',
  (message, config) => {
    toast.error(message, {
      duration: config.duration,
      position: 'top-right'
    })
  }
)

// ログハンドラーを登録
globalErrorHandler.registerLogHandler(
  'custom-logger',
  (level, message, error) => {
    customLogger.log(level, message, {
      errorCode: error?.code,
      category: error?.category,
      metadata: error?.metadata
    })
  }
)
```

## 🧪 テスト

### 基本テスト
```typescript
import { createAppError, ERROR_CODES } from '@/config/error-patterns'

describe('エラーパターンテスト', () => {
  it('認証エラーが正しく処理される', () => {
    const error = createAppError(
      'Invalid token',
      ERROR_CODES.INVALID_TOKEN
    )

    expect(error.category).toBe('AUTH')
    expect(error.severity).toBe('high')
    expect(error.isRetryable()).toBe(false)
  })
})
```

### 統合テスト実行
```bash
npm run test:error-patterns
```

## 📊 統計・モニタリング

### エラー統計の取得
```typescript
import { getErrorStats, getHealthStatus } from '@/lib/error-handler'

// エラー統計
const stats = getErrorStats()
console.log('総エラー数:', stats.errors.size)
console.log('カテゴリ別:', stats.categories)

// ヘルスチェック
const health = getHealthStatus()
console.log('クリティカルエラー:', health.criticalErrors)
```

### Sentryダッシュボード

エラーは自動的にSentryに送信され、以下の情報で分類されます：

- **タグ**: errorCode, errorCategory, severity, domain, team
- **コンテキスト**: errorPattern, errorMetadata
- **フィンガープリント**: 自動グルーピング

## 🔧 設定

### 環境変数
```bash
# .env.local
SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

### Sentry設定
```typescript
import { initializeSentry } from '@/lib/sentry'

initializeSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sampleRate: 1.0,
  tracesSampleRate: 0.1,
  enablePerformanceMonitoring: true
})
```

## 🚀 パフォーマンス

### ベンチマーク結果
- **エラー作成**: 0.1ms/実行
- **パターン取得**: 0.01ms/実行
- **リトライ処理**: 平均2.5秒（3回リトライ）
- **大量処理**: 1000エラー/秒

### 最適化のコツ
```typescript
// 1. エラーコードを事前に定義
const COMMON_ERRORS = {
  USER_NOT_FOUND: ERROR_CODES.NOT_FOUND,
  INVALID_INPUT: ERROR_CODES.INVALID_FORMAT
}

// 2. コンテキストを最小限に
const error = createAppError(
  'Error',
  COMMON_ERRORS.USER_NOT_FOUND,
  { userId } // 必要最小限の情報のみ
)

// 3. 頻繁なエラーはキャッシュ
const errorPattern = errorPatternDictionary.getPattern(errorCode)
```

## 🎯 ベストプラクティス

### 1. エラーコードの選択
```typescript
// ✅ 適切 - 具体的なエラーコード
throw createAppError(
  'Email format is invalid',
  ERROR_CODES.INVALID_EMAIL
)

// ❌ 避ける - 汎用的すぎるエラーコード
throw createAppError(
  'Email format is invalid',
  ERROR_CODES.INVALID_FORMAT
)
```

### 2. コンテキスト情報
```typescript
// ✅ 適切 - 有用なコンテキスト
const error = createAppError(
  'User not found',
  ERROR_CODES.NOT_FOUND,
  {
    source: 'user-service',
    userId: requestedUserId,
    context: { searchCriteria: 'email' }
  }
)

// ❌ 避ける - 機密情報を含む
const error = createAppError(
  'Login failed',
  ERROR_CODES.INVALID_CREDENTIALS,
  {
    context: {
      password: 'user-password', // ❌ 機密情報
      email: 'user@example.com'
    }
  }
)
```

### 3. ユーザー向けメッセージ
```typescript
// ユーザー向けメッセージは自動的に適切なものが選択される
const error = createAppError(
  'Database connection timeout', // 技術的詳細
  ERROR_CODES.QUERY_TIMEOUT
)

// ユーザーには「処理がタイムアウトしました」と表示される
console.log(error.userMessage.description)
```

## 🔄 マイグレーション

### 既存コードからの移行

#### Before（従来のエラー処理）
```typescript
try {
  const user = await fetchUser(id)
} catch (error) {
  console.error('Error fetching user:', error)
  toast.error('ユーザーの取得に失敗しました')
}
```

#### After（エラーパターン辞書）
```typescript
try {
  const user = await fetchUser(id)
} catch (error) {
  await handleError(
    error,
    ERROR_CODES.API_UNAVAILABLE,
    { source: 'user-fetch', context: { userId: id } }
  )
}
```

## 📞 サポート

### よくある質問

**Q: 新しいエラーコードを追加するには？**
A: `src/config/error-patterns/categories.ts`にエラーコードを追加し、`messages.ts`にユーザー向けメッセージを定義してください。

**Q: カスタム復旧戦略を実装するには？**
A: `recovery-strategies.ts`に新しい戦略を追加し、カテゴリマップを更新してください。

**Q: Sentryでエラーが表示されない場合は？**
A: 環境変数`SENTRY_DSN`が正しく設定されているか確認してください。

### トラブルシューティング

#### 問題: エラーが自動復旧されない
```typescript
// 復旧戦略を確認
const pattern = errorPatternDictionary.getPattern(errorCode)
console.log('Recovery enabled:', pattern.recovery.retry.enabled)
```

#### 問題: 通知が表示されない
```typescript
// 通知ハンドラーが登録されているか確認
globalErrorHandler.registerNotificationHandler('debug', console.log)
```

## 📈 将来の拡張

### 計画中の機能
- [ ] ML によるエラーパターン自動分類
- [ ] リアルタイムエラーダッシュボード
- [ ] エラー予測・予防システム
- [ ] カスタムアラートルール

---

**最終更新**: 2024-09-29
**バージョン**: v1.0.0 - エラーパターン辞書システム初回リリース
**関連Issue**: #352 - エラーパターン辞書システム実装