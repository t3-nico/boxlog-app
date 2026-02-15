# Dayopt App

Next.js 14 + TypeScript で構築されたタスク管理アプリケーション

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localに必要な値を設定

# 開発サーバー起動
npm run dev
```

開発サーバーが起動したら [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## ⚙️ 主要技術

| カテゴリ           | 技術                                                  |
| ------------------ | ----------------------------------------------------- |
| **フレームワーク** | Next.js 14 (App Router), React 18, TypeScript 5       |
| **UIライブラリ**   | shadcn/ui (Radix UI), HeadlessUI, kiboUI              |
| **スタイリング**   | Tailwind CSS v4, セマンティックトークン (globals.css) |
| **状態管理**       | Zustand (グローバル), TanStack Query (サーバー状態)   |
| **API**            | tRPC 11 (型安全なAPI)                                 |
| **データベース**   | Supabase (PostgreSQL + Auth + Realtime)               |
| **バリデーション** | Zod                                                   |
| **テスト**         | Vitest, Playwright                                    |

## 📋 開発時の重要ルール

### 必須コマンド

```bash
npm run typecheck   # 型チェック（コード変更後）
npm run lint        # コード品質チェック（コミット前）
npm run dev         # 開発サーバー起動
```

### コーディング規約

1. **コンポーネント**: 関数宣言 + 名前付きエクスポート（`React.FC`禁止）
2. **スタイリング**: `globals.css`のセマンティックトークン使用（`bg-card`, `text-foreground`等）
3. **型定義**: `any`型禁止、厳密な型定義必須
4. **UIコンポーネント選択**: shadcn/ui → HeadlessUI → kiboUI → カスタム実装

```tsx
// ✅ 推奨
export function MyComponent({ title }: Props) {
  return <div className="bg-card text-card-foreground p-4">{title}</div>
}

// ❌ 禁止
export const MyComponent: FC<Props> = ...  // React.FC非推奨
<div className="bg-white p-[13px]">        // ハードコード値禁止
```

**詳細ガイドライン**: [`CLAUDE.md`](./CLAUDE.md)

## 📚 ドキュメント

### 開発者向け

| ドキュメント                     | 内容                                   |
| -------------------------------- | -------------------------------------- |
| [`CLAUDE.md`](./CLAUDE.md)       | AI意思決定プロトコル・コーディング規約 |
| Storybook → Docs/Guides/Commands | 全コマンド一覧                         |

### 設計・アーキテクチャ

| ドキュメント                                   | 内容                                 |
| ---------------------------------------------- | ------------------------------------ |
| Storybook（`npm run storybook`）               | デザインシステム（Tokens/_, Docs/_） |
| Storybook → Docs/Architecture/State Management | 状態管理の判断基準                   |
| Storybook → Docs/Architecture/Error Patterns   | エラーハンドリング                   |

### 品質・テスト

| ドキュメント                              | 内容                   |
| ----------------------------------------- | ---------------------- |
| Storybook → Docs/Test Strategy            | テスト戦略             |
| Storybook → Docs/Guides/Bundle Monitoring | Bundle監視システム     |
| Storybook → Docs/Accessibility            | アクセシビリティテスト |

## 🛡️ コード品質管理

Dayoptでは企業レベルの品質管理システムを採用：

### ESLint 8分野強化

- **セキュリティ**: XSS防止、秘密情報ハードコーディング検出
- **アクセシビリティ**: WCAG AA準拠の自動チェック
- **パフォーマンス**: Bundle最適化、メモリリーク防止
- **Import管理**: 重複防止、順序統一、未使用削除
- **TypeScript厳格化**: 型安全性強化、非null制御
- **コミットフック**: ESLint→prettier→tsc→セキュリティ監査
- **コミットメッセージ**: Conventional Commits自動検証
- **ブランチ名**: feature/fix/chore等プレフィックス強制

### 自動品質ゲート

```bash
# 開発時
npm run lint        # 全品質チェック
npm run lint:fix    # 自動修正可能な問題を修正
npm run typecheck   # TypeScript型チェック

# テスト
npm run test:run    # ユニットテスト
npm run test:e2e    # E2Eテスト

# コミット時（自動実行）
# 1. ESLint全ルール適用
# 2. Prettier自動フォーマット
# 3. TypeScript型チェック
# 4. セキュリティ監査
```

## 🙏 Acknowledgments

Dayoptは以下のオープンソースプロジェクトを利用しています：

### UI Components & Design

- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components built with Radix UI and Tailwind CSS (MIT License)
- **[shadcn-dashboard-landing-template](https://github.com/silicondeck/shadcn-dashboard-landing-template)** - Error page designs
  - Copyright (c) 2025 ShadcnStore
  - Licensed under MIT License
  - Used in: Error pages (404, 401, 403, 500, maintenance)

### Core Technologies

- **[Next.js](https://nextjs.org/)** - The React Framework (MIT License)
- **[React](https://react.dev/)** - A JavaScript library for building user interfaces (MIT License)
- **[TypeScript](https://www.typescriptlang.org/)** - Typed JavaScript (Apache-2.0 License)
- **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework (MIT License)
- **[Supabase](https://supabase.com/)** - Open source Firebase alternative (Apache-2.0 License)

詳細なライセンス情報は [`docs/CREDITS.md`](./docs/CREDITS.md) をご覧ください。

---

**バージョン**: 0.4.0 | **最終更新**: 2025-11-24
