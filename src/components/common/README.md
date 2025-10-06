# Common Components

BoxLogアプリケーション全体で使用される共通コンポーネント群です。

## 📁 ディレクトリ構造

```
src/components/common/
  ├── ErrorBoundary/    # エラーハンドリング
  ├── Loading/          # ローディング表示
  ├── Preload/          # リソースプリロード
  ├── Providers/        # Context Providers
  └── index.ts          # 全体のre-export
```

## 🧩 コンポーネント一覧

### ErrorBoundary
グローバルエラーバウンダリーと自動復旧システム

- `GlobalErrorBoundary` - アプリ全体のエラーキャッチ・復旧
- エラー分析・ユーザーフレンドリーなメッセージ表示
- 自動リトライ機能

### Loading
統一されたローディング状態コンポーネント

- `LoadingSpinner` - 基本的なスピナー
- `LoadingOverlay` - オーバーレイ付きローディング
- `LoadingCard` - カード型ローディング
- `LoadingButton` - ボタン付きローディング
- `Skeleton` - スケルトンUI

### Preload
重要なリソースをプリロードしてナビゲーションを高速化

- `PreloadResources` - ルート・フォントのプリフェッチ
- `initializeCacheStrategy` - Service Worker初期化

### Providers
アプリケーション全体のContext Providers

- `Providers` - QueryClient, Auth, Chat, CommandPalette等を統合
- すべてのProviderを一元管理

## 📖 使用例

### エラーバウンダリー
```tsx
import { GlobalErrorBoundary } from '@/components/common'

<GlobalErrorBoundary maxRetries={3}>
  <YourApp />
</GlobalErrorBoundary>
```

### ローディング
```tsx
import { LoadingSpinner, LoadingOverlay } from '@/components/common'

<LoadingSpinner size="lg" />

<LoadingOverlay isLoading={true} message="データ取得中...">
  <Content />
</LoadingOverlay>
```

### Providers
```tsx
import { Providers } from '@/components/common'

<Providers>
  <App />
</Providers>
```

## 🔧 開発ガイドライン

### コロケーション原則（CLAUDE.md準拠）
各コンポーネントディレクトリには以下を配置：

- `*.tsx` - コンポーネント本体
- `*.test.tsx` - テストファイル
- `types.ts` - 型定義
- `index.ts` - re-export
- `README.md` - 使用例・API仕様
- `CLAUDE.md` - AI向け開発指針（必要に応じて）

### テスト
```bash
npm run test:run    # テスト実行
npm run test:coverage  # カバレッジ確認
```

### 型チェック
```bash
npm run typecheck   # TypeScript型チェック
```

## 📚 関連ドキュメント

- [CLAUDE.md](../../CLAUDE.md) - プロジェクト全体の開発指針
- [src/CLAUDE.md](../../src/CLAUDE.md) - コーディング規約
- [ERROR_HANDLING.md](../../docs/architecture/ERROR_HANDLING.md) - エラーハンドリングアーキテクチャ

## 🚨 重要な注意事項

1. **スタイリング**: `@/config/ui/theme.ts` のみ使用（直接指定禁止）
2. **TypeScript厳格**: `any` 型禁止
3. **テスト必須**: 新規コンポーネントには必ずテストを追加
4. **コロケーション**: 関連ファイルは必ず近接配置

## 🔄 最終更新

- **日付**: 2025-10-06
- **バージョン**: v1.0
- **Issue**: #409 - CLAUDE.mdコロケーション原則準拠
