# CI/CD セットアップガイド

BoxLogアプリケーションのCI/CDパイプラインは、**Vitest**と**GitHub Actions**を使用して構築されています。

## 📋 概要

### テスト環境
- **Vitest**: 高速なテストフレームワーク（Viteベース）
- **Testing Library**: React コンポーネントテスト
- **JSdom**: ブラウザ環境のシミュレーション

### CI/CDパイプライン
- **GitHub Actions**: 自動化されたワークフロー
- **Vercel**: 本番環境への自動デプロイ

## 🚀 自動実行フロー

### PR作成・ブランチプッシュ時（dev/main）
1. **Lint** - コード品質チェック
2. **Type Check** - TypeScript型チェック  
3. **Test** - 単体テスト実行
4. **Build** - プロジェクトビルド

### mainブランチへのプッシュ時
上記に加えて：
5. **Deploy** - Vercelへの自動デプロイ

## 📝 利用可能なスクリプト

```bash
# 基本テスト実行
npm run test

# ウォッチモード（開発時推奨）
npm run test:watch

# UIモード（ブラウザでテスト結果確認）
npm run test:ui

# カバレッジ計測
npm run test:coverage

# 型チェック
npm run typecheck

# リント
npm run lint

# ビルド
npm run build
```

## 🔧 設定ファイル

### Vitest設定 (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### GitHub Actions設定 (`.github/workflows/ci.yml`)
- Node.js 18を使用
- 依存関係のキャッシュ有効
- 並列実行でパフォーマンス最適化

## 📊 テスト戦略

### 現在のテストカバレッジ
- ✅ UIコンポーネント（shadcn/ui Button）
- ✅ APIルート（tags.test.ts）
- ✅ ユーティリティ関数（smart-folders）

### 推奨テストパターン

#### コンポーネントテスト
```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Component } from '@/components/Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component>Test</Component>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## ⚠️ 重要な注意事項

### CI/CD実行条件
- **対象ブランチ**: `dev`, `main`のみ
- **実行タイミング**: プッシュ・PR作成時

### デプロイ設定（要設定）
Vercel自動デプロイには以下のGitHubシークレットが必要：
```
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_organization_id  
PROJECT_ID=your_project_id
```

### 型エラーについて
現在、いくつかの型エラーがありますが、CI実行は継続されます：
- Next.js自動生成ファイルの型問題
- 既存APIテストファイルの型不整合

## 🔄 今後の改善予定

### 短期的
- [ ] Vercelシークレット設定
- [ ] より包括的なテストケース追加
- [ ] カバレッジ閾値設定

### 長期的
- [ ] E2Eテスト（Playwright）
- [ ] パフォーマンステスト
- [ ] セキュリティスキャン
- [ ] 依存関係の自動更新

## 🚦 開発フロー

### 新機能開発時
1. `feature/xxx`ブランチ作成
2. 開発 + テスト作成
3. `npm run test:watch`でローカルテスト
4. PRを`dev`ブランチに作成
5. **自動CI実行** ✅
6. レビュー後マージ

### 本番リリース時
1. `dev` → `main`へのPR作成
2. **自動CI + デプロイ実行** 🚀
3. Vercelで本番確認

---

**最終更新**: 2025-01-18  
**担当**: CI/CD setup with vitest and GitHub Actions