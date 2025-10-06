# lib/ - 共通処理ライブラリ

BoxLog共通ライブラリ・ユーティリティ実装ガイドライン。

## 📁 ディレクトリ構成

```
lib/
├── accessibility/      # アクセシビリティ対応
├── analytics/          # Vercel Analytics統合
├── api/                # APIクライアント
├── breaking-changes/   # 破壊的変更管理
├── data/              # データ取得ヘルパー
├── i18n/              # 国際化（多言語対応）
├── local-storage/     # LocalStorage管理
├── logger/            # ログシステム
├── security/          # セキュリティ関連
├── sentry/            # Sentryエラートラッキング
├── supabase/          # Supabaseクライアント
├── toast/             # トースト通知
├── trpc/              # tRPCクライアント
├── utils.ts           # 汎用ユーティリティ
├── error-handler.ts   # エラーハンドリング
├── logger.ts          # ログ出力
└── performance.ts     # パフォーマンス計測
```

---

## 🎯 各モジュール説明

### accessibility/ - アクセシビリティ対応

**WCAG準拠のアクセシビリティ機能**。

```tsx
import { announceToScreenReader } from '@/lib/accessibility'

// スクリーンリーダーへのアナウンス
announceToScreenReader('タスクが作成されました')
```

### analytics/ - Vercel Analytics統合

**Vercel Analyticsによるイベントトラッキング**。

```tsx
import { trackEvent, trackError } from '@/lib/analytics/vercel-analytics'

// イベント追跡
trackEvent('task_created', {
  priority: 'high',
  hasDescription: true,
})

// エラー追跡
trackError({
  errorCode: 500,
  errorCategory: 'API',
  severity: 'high',
})
```

### api/ - APIクライアント

**統一されたAPI呼び出し**。

```tsx
import { api } from '@/lib/api'

// GET リクエスト
const tasks = await api.get<Task[]>('/tasks')

// POST リクエスト
const newTask = await api.post<Task>('/tasks', taskData)

// エラーハンドリング自動化
// - リトライ
// - エラーログ
// - 統一エラーコード変換
```

### breaking-changes/ - 破壊的変更管理

**API・スキーマの破壊的変更を追跡**。

```tsx
import { detectBreakingChanges } from '@/lib/breaking-changes'

// 破壊的変更の検出
const changes = await detectBreakingChanges(oldSchema, newSchema)
if (changes.length > 0) {
  console.warn('Breaking changes detected:', changes)
}
```

### data/ - データ取得ヘルパー

**データフェッチング用ユーティリティ**。

```tsx
import { getReview, getInvoices } from '@/lib/data'

// データ取得
const review = await getReview(reviewId)
const invoices = await getInvoices(userId)
```

### i18n/ - 国際化（多言語対応）

**next-intlによる多言語対応**。

```tsx
import { useTranslations } from 'next-intl'

// 翻訳の使用
const t = useTranslations('Common')
const title = t('title') // 言語に応じた文字列を取得

// サポート言語: ja, en
```

**詳細**: [docs/development/I18N_DEVELOPMENT_GUIDE.md](../../docs/development/I18N_DEVELOPMENT_GUIDE.md)

### local-storage/ - LocalStorage管理

**型安全なLocalStorage操作**。

```tsx
import { storage } from '@/lib/local-storage'

// データ保存
storage.set('user-settings', { theme: 'dark', locale: 'ja' })

// データ取得
const settings = storage.get('user-settings')

// データ削除
storage.remove('user-settings')
```

### logger/ - ログシステム

**構造化ログ出力**。

```tsx
import { logger } from '@/lib/logger'

// ログレベル別出力
logger.info('User logged in', { userId, timestamp })
logger.warn('Rate limit approaching', { remaining: 10 })
logger.error('Database connection failed', { error, retryCount })

// 開発環境: コンソール出力
// 本番環境: 外部ログサービス連携
```

### security/ - セキュリティ関連

**XSS対策、CSRF対策等**。

```tsx
import { sanitizeInput, validateCSRFToken } from '@/lib/security'

// XSS対策
const safeText = sanitizeInput(userInput)

// CSRFトークン検証
const isValid = validateCSRFToken(token)
```

### sentry/ - Sentryエラートラッキング

**Sentryによるエラー監視**。

```tsx
import { captureError, captureMessage } from '@/lib/sentry'

// エラー送信
try {
  await riskyOperation()
} catch (error) {
  captureError(error, {
    tags: { feature: 'tasks' },
    context: { userId, taskId },
  })
}

// メッセージ送信
captureMessage('Unusual activity detected', {
  level: 'warning',
})
```

**詳細**: [docs/integrations/SENTRY.md](../../docs/integrations/SENTRY.md)

### supabase/ - Supabaseクライアント

**Supabaseによるデータベースアクセス**。

```tsx
import { supabase } from '@/lib/supabase'

// データ取得
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'todo')

// データ挿入
const { data, error } = await supabase
  .from('tasks')
  .insert(taskData)

// 認証
const { user } = await supabase.auth.getUser()
```

### toast/ - トースト通知

**ユーザー通知システム**。

```tsx
import { toast } from '@/lib/toast'

// 成功通知
toast.success('タスクを作成しました')

// エラー通知
toast.error('タスクの作成に失敗しました')

// カスタム通知
toast.custom('処理中...', {
  duration: 3000,
  icon: '⏳',
})
```

### trpc/ - tRPCクライアント

**型安全なAPIクライアント**。

```tsx
import { trpc } from '@/lib/trpc/client'

// tRPCフック使用
const { data: tasks } = trpc.tasks.getAll.useQuery()
const createTask = trpc.tasks.create.useMutation()

// 型が自動推論される
createTask.mutate({
  title: 'New Task',
  priority: 'high', // 型チェックされる
})
```

**詳細**: [src/server/README.md](../server/README.md)

### utils.ts - 汎用ユーティリティ

**共通ヘルパー関数**。

```tsx
import { cn } from '@/lib/utils'

// className マージ（Tailwind CSS + clsx）
<div className={cn('base-class', condition && 'conditional-class')} />
```

### error-handler.ts - エラーハンドリング

**統一エラーハンドリング**。

```tsx
import { handleError } from '@/lib/error-handler'

try {
  await riskyOperation()
} catch (error) {
  handleError(error, {
    context: 'task-creation',
    userId,
  })
}
```

**注意**: エラーコードシステムは `src/config/error-patterns.ts` を参照してください。

### logger.ts - ログ出力

**シンプルなログ出力**。

```tsx
import { log } from '@/lib/logger'

log.info('Application started')
log.error('Failed to connect', { error })
```

### performance.ts - パフォーマンス計測

**パフォーマンスメトリクス計測**。

```tsx
import { measurePerformance } from '@/lib/performance'

// 処理時間計測
const result = await measurePerformance('task-creation', async () => {
  return await createTask(taskData)
})

console.log(`Duration: ${result.duration}ms`)
```

---

## 📋 実装ルール

### 1. 純粋関数の推奨

```tsx
// ✅ 推奨：純粋関数
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ❌ 避ける：副作用を持つ関数
let globalSum = 0
export const calculateTotal = (items: Item[]) => {
  globalSum = items.reduce((sum, item) => sum + item.price, 0)
}
```

### 2. TypeScript厳格型付け

```tsx
// ✅ 厳密な型定義
export const formatCurrency = (amount: number, currency: 'JPY' | 'USD'): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency
  }).format(amount)
}

// ❌ any型禁止
export const formatCurrency = (amount: any, currency: any): string => {}
```

### 3. エラーハンドリング

```tsx
import { handleError } from '@/lib/error-handler'

export const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await api.get<User>(`/users/${userId}`)
    return response
  } catch (error) {
    handleError(error, {
      context: { userId },
      operation: 'fetchUserData',
    })
    throw error
  }
}
```

---

## 🧪 テスト

### ユーティリティ関数のテスト

```tsx
// lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('should merge classnames correctly', () => {
    expect(cn('base', 'additional')).toBe('base additional')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible'))
      .toBe('base visible')
  })
})
```

---

## 🔗 関連ドキュメント

### プロジェクト全体
- [CLAUDE.md](../../CLAUDE.md) - プロジェクト開発指針
- [src/CLAUDE.md](../CLAUDE.md) - コーディング基本ルール

### エラーハンドリング・バリデーション
- [src/config/error-patterns.ts](../config/error-patterns.ts) - エラーコードシステム
- [src/schemas/README.md](../schemas/README.md) - バリデーションスキーマ（Zod）
- [docs/architecture/ERROR_HANDLING.md](../../docs/architecture/ERROR_HANDLING.md) - エラーハンドリング設計

### 統合・機能
- [docs/integrations/SENTRY.md](../../docs/integrations/SENTRY.md) - Sentry統合
- [docs/development/I18N_DEVELOPMENT_GUIDE.md](../../docs/development/I18N_DEVELOPMENT_GUIDE.md) - 国際化ガイド
- [src/server/README.md](../server/README.md) - tRPC APIサーバー

### テスト
- [docs/testing/CLAUDE.md](../../docs/testing/CLAUDE.md) - テスト戦略

---

## 🚨 重要な注意事項

### ❌ 禁止事項

```tsx
// ❌ any型の使用禁止
export const badFunction = (data: any) => {}

// ❌ 副作用のある関数
let globalState = {}
export const badFunction = (data: any) => {
  globalState = data // NG
}

// ❌ エラーハンドリングの省略
export const badFunction = async () => {
  return await riskyOperation() // エラーハンドリングなし
}
```

### ✅ ベストプラクティス

```tsx
// ✅ 厳密な型定義
export const goodFunction = (data: DataType): ReturnType => {
  return processData(data)
}

// ✅ 純粋関数
export const goodFunction = (input: string): string => {
  return input.toUpperCase()
}

// ✅ エラーハンドリング
export const goodFunction = async (): Promise<Result> => {
  try {
    return await riskyOperation()
  } catch (error) {
    handleError(error)
    throw error
  }
}
```

---

## 📊 使用統計

**使用箇所**: 278箇所（224ファイル）
- 最も使用されるモジュール: `utils.ts`, `analytics/`, `i18n/`, `toast/`
- 重要度が高いモジュール: `trpc/`, `supabase/`, `sentry/`

---

**📖 最終更新**: 2025-10-06 | Issue #434
