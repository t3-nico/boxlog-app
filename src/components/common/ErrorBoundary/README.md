# ErrorBoundary

グローバルエラーバウンダリーと自動復旧システム

## 概要

Reactアプリケーション全体のエラーをキャッチし、ユーザーフレンドリーなエラー画面を表示します。自動リトライ機能により、一時的なエラーから自動復旧します。

## コンポーネント

### GlobalErrorBoundary

アプリケーション全体をラップするエラーバウンダリー

## Props

```typescript
interface GlobalErrorBoundaryProps {
  children: ReactNode
  maxRetries?: number           // 最大リトライ回数（デフォルト: 3）
  retryDelay?: number           // リトライ遅延（ms）（デフォルト: 1000）
  onError?: (error: Error, errorInfo: ErrorInfo, retryCount: number) => void
  className?: string
}
```

## 使用例

### 基本的な使い方

```tsx
import { GlobalErrorBoundary } from '@/components/common'

function App() {
  return (
    <GlobalErrorBoundary maxRetries={3} retryDelay={1000}>
      <YourApp />
    </GlobalErrorBoundary>
  )
}
```

### カスタムエラーハンドラー

```tsx
<GlobalErrorBoundary
  maxRetries={5}
  onError={(error, errorInfo, retryCount) => {
    console.error('エラー発生:', error)
    console.log('リトライ回数:', retryCount)
    // Sentryなど外部サービスにログ送信
  }}
>
  <App />
</GlobalErrorBoundary>
```

## 機能

### 1. エラー分析
- error-patterns.tsと統合し、エラーを7カテゴリに自動分類
- ユーザーフレンドリーなメッセージを自動生成
- 推奨アクションを表示

### 2. 自動復旧
- 復旧可能なエラーは自動でリトライ
- 指数バックオフ（1秒 → 2秒 → 4秒）
- リトライ回数の上限設定可能

### 3. 手動操作
- 手動再試行ボタン
- ページ再読み込みボタン
- ホームに戻るボタン

### 4. 開発者向け情報
- 開発環境では技術詳細を表示
- スタックトレース表示
- エラーID・分析コード表示

## エラー画面の構成

1. **エラーヘッダー**
   - アイコン + タイトル
   - エラーID + 重要度

2. **自動復旧状況**
   - リトライ中の表示
   - 試行回数の表示

3. **エラー分析**
   - ユーザーフレンドリーなメッセージ
   - 推奨アクション

4. **操作ボタン**
   - 手動再試行
   - ページ再読み込み
   - ホームに戻る

5. **技術詳細**（開発環境のみ）
   - エラーメッセージ
   - スタックトレース

## 統合されているシステム

### error-patterns.ts
- エラーコード定義
- カテゴリ分類（AUTH, VALIDATION, DB, BIZ, EXTERNAL, SYSTEM, RATE）
- ユーザーフレンドリーメッセージ
- 推奨アクション

### error-analysis.ts
- エラー分析ロジック
- 重要度判定
- 復旧可能性判定

## テスト

```bash
npm run test:run -- ErrorBoundary
```

テストケース:
- 正常なコンポーネントのレンダリング
- エラー発生時のフォールバックUI表示
- エラーIDの表示確認

## 関連ドキュメント

- [ERROR_HANDLING.md](../../../docs/architecture/ERROR_HANDLING.md)
- [error-patterns.ts](../../../config/error-patterns/)
- [error-analysis.ts](../../../lib/error-analysis.ts)
