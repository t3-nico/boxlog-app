# エラーハンドリングシステム アーキテクチャ

**最終更新**: 2025-10-06
**バージョン**: 2.0 (整理完了版)

## 📋 概要

BoxLogアプリケーションの統一エラーハンドリングシステムのアーキテクチャドキュメント。
重複ファイルを整理し、明確な役割分担を実現した構成。

---

## 🏗️ アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                  エラーハンドリング層                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Error Pattern│  │Error Boundary│  │Error Handler │ │
│  │   Dictionary │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         ↓                 ↓                  ↓         │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Unified Error Management System          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 ディレクトリ構造

### **1. エラーパターン辞書**

```
src/config/
├── error-patterns.ts          # メインの辞書システム (使用中)
│   ├── ErrorPattern interface
│   ├── ERROR_PATTERNS mapping
│   ├── getUserFriendlyMessage()
│   ├── createErrorToast()
│   └── AppError class
│
└── error-patterns/            # 高機能版 (将来の拡張用)
    ├── index.ts               # ErrorPatternDictionary
    ├── categories.ts          # 7カテゴリ定義
    ├── messages.ts            # ユーザー向けメッセージ
    └── recovery-strategies.ts # リトライ・サーキットブレーカー
```

**使用箇所:** 10ファイル

- GlobalErrorBoundary.tsx
- error-analysis.ts
- sentry/integration.ts
- error-handler.ts
- use-error-handler.ts
- api/error-handler.ts
- api/middleware.ts
- server/api/routers/tasks.ts
- server/api/trpc.ts

### **2. エラーバウンダリー**

```
src/components/
├── error-boundary.tsx              # 機能別エラーバウンダリー
│   ├── ErrorBoundary (汎用)
│   ├── DetailedErrorBoundary (詳細表示)
│   └── FeatureErrorBoundary (機能別)
│
└── common/
    ├── GlobalErrorBoundary.tsx     # グローバルエラーハンドラー
    │   ├── 自動復旧システム
    │   ├── リトライ機能
    │   └── エラー分析統合
    │
    └── ErrorFallbacks.tsx          # エラーUIコンポーネント
        ├── NetworkErrorFallback
        ├── DatabaseErrorFallback
        ├── APIErrorFallback
        └── UIErrorFallback
```

**使用箇所:**

- `error-boundary.tsx`: 5箇所 (カレンダー、AI Chat、設定)
- `GlobalErrorBoundary.tsx`: 1箇所 (layout.tsx)

### **3. エラーハンドラー**

```
src/lib/
├── error-handler.ts           # 汎用エラーハンドラー (2箇所で使用)
├── error-analysis.ts          # エラー分析 (analyzeError関数)
├── api/
│   └── error-handler.ts       # API専用エラーハンドラー
└── i18n/
    └── error-messages.ts      # i18nエラーメッセージ
```

### **4. エラーページ (UI)**

```
src/app/
├── not-found.tsx              # 404エラー（自動）
├── error.tsx                  # 500エラー（自動）
└── error/
    ├── 401/page.tsx           # 認証エラー
    ├── 403/page.tsx           # 権限エラー
    ├── 500/page.tsx           # サーバーエラー
    └── maintenance/page.tsx   # メンテナンス
```

**詳細**: [docs/systems/ERROR_PAGES.md](../systems/ERROR_PAGES.md)

### **5. その他**

```
src/
├── hooks/
│   └── use-error-handler.ts   # エラーハンドリングフック
│
├── constants/
│   └── errorCodes.ts          # エラーコード定数
│
└── app/
    └── global-error.tsx       # Next.js グローバルエラー
```

---

## 🔄 エラーハンドリングフロー

### **1. フロントエンドエラー**

```
エラー発生
  ↓
ErrorBoundary/FeatureErrorBoundary がキャッチ
  ↓
error-analysis.ts で分析
  ↓
error-patterns.ts からパターン取得
  ↓
ユーザーフレンドリーなメッセージ表示
  ↓
自動復旧可能？ → Yes: リトライ実行
                → No: フォールバック表示
```

### **2. API/サーバーエラー**

```
エラー発生
  ↓
api/error-handler.ts でキャッチ
  ↓
エラーコード判定 (errorCodes.ts)
  ↓
適切なHTTPステータスコード返却
  ↓
クライアントでエラーパターン辞書から処理
```

### **3. グローバルエラー**

```
未処理のエラー発生
  ↓
GlobalErrorBoundary がキャッチ
  ↓
Sentry統合 (sentry/integration.ts)
  ↓
自動復旧システム起動
  ↓
リトライ → 成功: アプリ続行
        → 失敗: エラー画面表示
```

---

## 📊 エラーカテゴリ

### **7つの主要カテゴリ**

| カテゴリ   | コード範囲 | 重要度   | リトライ可能 |
| ---------- | ---------- | -------- | ------------ |
| AUTH       | 1000-1999  | high     | ❌ No        |
| VALIDATION | 2000-2999  | medium   | ❌ No        |
| DB         | 3000-3999  | critical | ✅ Yes       |
| BIZ        | 4000-4999  | medium   | ❌ No        |
| EXTERNAL   | 5000-5999  | medium   | ✅ Yes       |
| SYSTEM     | 6000-6999  | critical | ✅ Yes       |
| RATE       | 7000-7999  | low      | ✅ Yes       |

---

## 💡 使用方法

### **1. エラーバウンダリーの使用**

#### 機能別エラーバウンダリー

```tsx
import { FeatureErrorBoundary } from '@/components/error-boundary'

export default function CalendarPage() {
  return (
    <FeatureErrorBoundary featureName="calendar" fallback={<ErrorFallback />}>
      <CalendarComponent />
    </FeatureErrorBoundary>
  )
}
```

#### グローバルエラーバウンダリー (layout.tsx)

```tsx
import GlobalErrorBoundary from '@/components/common/GlobalErrorBoundary'

export default function RootLayout({ children }) {
  return <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
}
```

### **2. エラーパターン辞書の使用**

```typescript
import { getUserFriendlyMessage, createErrorToast, isAutoRecoverable } from '@/config/error-patterns'

// ユーザー向けメッセージ取得
const message = getUserFriendlyMessage(errorCode)

// トースト通知作成
const toast = createErrorToast(errorCode)

// 自動復旧可能か判定
if (isAutoRecoverable(errorCode)) {
  // リトライ処理
}
```

### **3. エラー分析**

```typescript
import { analyzeError } from '@/lib/error-analysis'

try {
  await riskyOperation()
} catch (error) {
  const analysis = analyzeError(error)

  console.log(analysis.code) // エラーコード
  console.log(analysis.category) // カテゴリ
  console.log(analysis.severity) // 重要度
  console.log(analysis.autoRetryable) // リトライ可能か
  console.log(analysis.suggestedActions) // 推奨アクション
}
```

---

## 🔧 拡張方法

### **新しいエラーパターンの追加**

#### 1. `src/constants/errorCodes.ts` にコード追加

```typescript
export const ERROR_CODES = {
  // 既存のコード...
  NEW_ERROR: 4100, // 4000番台 = BIZカテゴリ
}
```

#### 2. `src/config/error-patterns.ts` にパターン追加

```typescript
export const ERROR_PATTERNS: Record<number, ErrorPattern> = {
  // 既存のパターン...
  [ERROR_CODES.NEW_ERROR]: {
    technical: '技術者向けメッセージ',
    userFriendly: 'ユーザー向けメッセージ',
    short: '短縮メッセージ',
    description: '詳細説明',
    recommendedActions: ['アクション1', 'アクション2'],
    autoRecoverable: false,
    urgency: 'medium',
    emoji: '⚠️',
  },
}
```

---

## 🚀 ベストプラクティス

### ✅ DO

- エラーは必ずエラーパターン辞書に登録する
- カテゴリに応じた適切なエラーコードを使用する
- ユーザーフレンドリーなメッセージを提供する
- 自動復旧可能なエラーは積極的にリトライする

### ❌ DON'T

- 汎用的な `try-catch` を乱用しない
- エラーメッセージに技術的な詳細を含めない
- エラーを握りつぶさない (必ずログ出力またはSentry送信)
- 同じエラーパターンを複数の場所で重複定義しない

---

## 📈 統計・モニタリング

### **Sentry統合**

- すべてのエラーは自動的にSentryに送信
- カテゴリ別タグ付けで分析が容易
- エラーパターン辞書と統合した構造化レポート

詳細: [docs/integrations/SENTRY.md](../integrations/SENTRY.md)

### **エラー統計**

```typescript
import { errorPatternDictionary } from '@/config/error-patterns'

// カテゴリ別統計
const stats = errorPatternDictionary.getCategoryStats()

// 健全性チェック
const health = errorPatternDictionary.healthCheck()
```

---

## 🗑️ 削除済みファイル (v2.0整理)

以下のファイルは未使用のため削除されました:

1. `src/components/common/ErrorBoundary.tsx` (未使用)
2. `src/lib/unified-error-handler.ts` (未使用)
3. `src/lib/errors/errorHandler.ts` (未使用)
4. `src/lib/errors/AppError.ts` (未使用)
5. `src/lib/errors.ts` (未使用)
6. `src/lib/errors/` ディレクトリ (空)

**削減:** 1,400行以上のコード削減

---

## 🔮 将来の拡張

### **高機能版への移行 (オプション)**

`src/config/error-patterns/` には以下の高機能版が用意されています:

- **ErrorPatternDictionary クラス**: より高度なエラー管理
- **CircuitBreaker パターン**: サーキットブレーカー実装
- **自動リトライ戦略**: 指数バックオフ対応
- **フォールバック機能**: 段階的なフォールバック

必要に応じて段階的に移行可能です。

---

## 📚 関連ドキュメント

- [ERROR_PAGES.md](../systems/ERROR_PAGES.md) - エラーページシステム
- [CLAUDE.md](../../CLAUDE.md) - 開発指針
- [SENTRY.md](../integrations/SENTRY.md) - Sentry統合ガイド
- [Issue #404](https://github.com/t3-nico/boxlog-app/issues/404) - エラーハンドリング整理Issue
- [Issue #543](https://github.com/t3-nico/boxlog-app/issues/543) - エラーページ実装Issue

---

## 📞 トラブルシューティング

### Q: エラーが正しくキャッチされない

A: ErrorBoundary/FeatureErrorBoundaryで囲まれているか確認してください。

### Q: ユーザーメッセージが表示されない

A: エラーコードが `error-patterns.ts` に登録されているか確認してください。

### Q: 自動復旧が動作しない

A: `isAutoRecoverable(errorCode)` が `true` を返すか確認してください。

---

**メンテナー**: BoxLog Development Team
**最終レビュー**: 2025-10-06
