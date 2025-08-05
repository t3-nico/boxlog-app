# BoxLog App - メインドキュメント

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。

## 📚 ドキュメント構成

### 開発関連
- [開発ガイド](./development/) - 開発環境セットアップ・ワークフロー
- [アーキテクチャ](./ARCHITECTURE.md) - システム設計・技術構成
- [コントリビューションガイド](./CONTRIBUTING.md) - 開発への参加方法

### データベース・API
- [データベース設計](./database/) - スキーマ・マイグレーション
- [検証レポート](./database-verification-report.md) - DB整合性確認結果

### プロジェクト管理
- [PR テンプレート](./PR_TEMPLATE.md) - プルリクエスト作成指針
- [ライセンス](./LICENSE.md) - 利用許諾・法的事項

## 🚀 クイックスタート

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

開発サーバーが起動したら [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 🏗️ 技術スタック

- **フロントエンド**: Next.js 14, React 18, TypeScript
- **データベース**: Supabase (PostgreSQL)
- **UIライブラリ**: shadcn/ui, kiboUI
- **スタイリング**: Tailwind CSS v4

詳細は[アーキテクチャドキュメント](./ARCHITECTURE.md)を参照してください。