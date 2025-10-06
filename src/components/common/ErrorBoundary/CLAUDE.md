# ErrorBoundary - AI開発ガイド

## 🎯 このコンポーネントの役割

**GlobalErrorBoundary**: Reactアプリ全体のエラーをキャッチし、自動復旧する最高レベルのエラーハンドリング

## 📋 編集時の必須チェック

### 1. エラー分析システムとの統合維持
```tsx
// ✅ 必須: error-patterns.ts と error-analysis.ts を使用
import { getUserFriendlyMessage, isAutoRecoverable } from '@/config/error-patterns'
import { analyzeError } from '@/lib/error-analysis'

// ❌ 禁止: 独自のエラー判定ロジックを追加しない
```

### 2. 自動復旧ロジック
```tsx
// ✅ 指数バックオフを維持
const delay = retryDelay * Math.pow(2, this.state.retryCount)

// ❌ 禁止: 固定遅延に変更しない
const delay = 1000 // NG
```

### 3. UIレスポンシブ対応
```tsx
// ✅ 必須: Tailwind レスポンシブクラス使用
className="text-xs sm:text-sm md:text-base"
className="flex flex-col sm:flex-row"

// ❌ 禁止: 固定サイズ指定
className="text-sm"  // モバイル対応なし
```

### 4. 型定義の場所
```tsx
// ✅ types.ts に定義
import { GlobalErrorBoundaryProps, GlobalErrorBoundaryState } from './types'

// ❌ コンポーネント内で定義しない
interface Props { ... }  // NG
```

## 🚨 絶対に変更してはいけない部分

### 1. エラーキャッチのライフサイクル
```tsx
static getDerivedStateFromError(error: Error)  // 変更禁止
componentDidCatch(error: Error, errorInfo: ErrorInfo)  // 変更禁止
```

### 2. error-patterns.ts との連携
```tsx
// 変更禁止: エラー分析ロジック
const analysis = analyzeError(error)
const autoRecoverable = isAutoRecoverable(analysis.code)
```

### 3. Sentryログ出力構造
```tsx
// 変更禁止: コンソールログのグループ化
console.group('🚨 GlobalErrorBoundary - エラー詳細')
console.error('Error Analysis:', analysis)
console.groupEnd()
```

## 🔧 よくある変更パターン

### 新しいアクションボタンを追加
```tsx
// ✅ 推奨: レスポンシブボタンを追加
<Button
  onClick={this.handleCustomAction}
  variant="outline"
  className="w-full sm:w-auto flex items-center justify-center text-sm"
>
  <Icon className="mr-2 h-4 w-4" />
  カスタムアクション
</Button>
```

### エラーログを外部サービスに送信
```tsx
// ✅ 推奨: onError propsで拡張
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // 既存のロジック...

  // カスタムハンドラー呼び出し
  onError?.(error, errorInfo, retryCount)
}
```

### リトライ戦略の変更
```tsx
// ✅ maxRetries と retryDelay は props で制御
<GlobalErrorBoundary
  maxRetries={5}     // リトライ回数
  retryDelay={2000}  // 初期遅延（指数バックオフは維持）
>
```

## 📝 テスト追加時のガイド

### 新しいテストケース追加
```tsx
// ✅ 推奨: vitest + React Testing Library
it('カスタム機能のテスト', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  render(
    <GlobalErrorBoundary>
      <ComponentThatThrows />
    </GlobalErrorBoundary>
  )

  expect(screen.getByText('期待する表示')).toBeInTheDocument()

  consoleSpy.mockRestore()
})
```

## 🔗 関連ファイル

修正時は以下も確認:
- `types.ts` - Props/State型定義
- `GlobalErrorBoundary.test.tsx` - テスト
- `@/config/error-patterns/` - エラーパターン定義
- `@/lib/error-analysis.ts` - エラー分析ロジック
- `@/docs/architecture/ERROR_HANDLING.md` - アーキテクチャドキュメント

## 📊 パフォーマンス考慮事項

### メモ化不要
- Class Component のため React.memo 不要
- State 更新は最小限

### タイマーのクリーンアップ
```tsx
// ✅ 必須: componentWillUnmount でタイマークリア
componentWillUnmount() {
  if (this.retryTimeoutId) clearTimeout(this.retryTimeoutId)
  if (this.autoRetryTimeoutId) clearTimeout(this.autoRetryTimeoutId)
}
```

## 🎨 スタイリング

### テーマシステム使用不要な理由
- Tailwind直接指定でOK（共通コンポーネントのため）
- レスポンシブ対応を優先

### カスタマイズ
```tsx
// ✅ className props で上書き可能
<GlobalErrorBoundary className="custom-class">
```
