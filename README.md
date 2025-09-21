# BoxLog App

Next.js 14 + TypeScript で構築されたタスク管理アプリケーション

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 1Password Developer Securityの設定
op signin

# 開発サーバー起動
npm run dev
```

開発サーバーが起動したら [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 🔐 セキュリティ

BoxLogでは機密情報管理に **1Password Developer Security** を使用しています。
セットアップ手順: [`docs/1PASSWORD_SETUP.md`](./docs/1PASSWORD_SETUP.md)

## 📚 詳細ドキュメント

技術詳細・開発ガイドラインは以下を参照してください：

- **📋 プロジェクト全体概要**: [`docs/README.md`](./docs/README.md)
- **🎨 デザインシステム**: [`docs/DESIGN_SYSTEM_README.md`](./docs/DESIGN_SYSTEM_README.md)
- **⚡ Bundle監視システム**: [`docs/BUNDLE_MONITORING.md`](./docs/BUNDLE_MONITORING.md)
- **🔧 ESLint企業級設定**: [`docs/ESLINT_SETUP_COMPLETE.md`](./docs/ESLINT_SETUP_COMPLETE.md)
- **♿ アクセシビリティ**: [`docs/ACCESSIBILITY_TESTING_GUIDE.md`](./docs/ACCESSIBILITY_TESTING_GUIDE.md)

## ⚙️ 主要技術

- **フロントエンド**: Next.js 14, React 18, TypeScript
- **UIライブラリ**: shadcn/ui, kiboUI
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS v4

## 📋 開発時の重要ルール

1. **コミット前**: `npm run lint` 必須実行
2. **コンポーネント選択**: shadcn/ui → kiboUI → カスタム実装
3. **スタイリング**: `/src/config/theme` 必須使用
4. **詳細ガイドライン**: [`CLAUDE.md`](./CLAUDE.md) を参照
