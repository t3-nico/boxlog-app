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

## 🛡️ コード品質管理

BoxLogでは企業レベルの品質管理システムを採用：

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

# コミット時（自動実行）
# 1. ESLint全ルール適用
# 2. Prettier自動フォーマット
# 3. TypeScript型チェック
# 4. セキュリティ監査

# プッシュ時（自動実行）
# ブランチ名検証
```
