# BoxLog App

Next.js 14 + TypeScript で構築されたタスク管理アプリケーション

## 🚀 クイックスタート

```bash
npm install
npm run dev
```

開発サーバーが起動したら [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 🏗️ プロジェクト構造

BoxLogは機能別モジュール設計（Feature-Based Architecture）を採用しています：

```
src/
├── app/                    # Next.js App Router
├── components/            # 共通UIコンポーネント
├── features/              # 機能別モジュール
│   ├── calendar/          # カレンダー機能
│   ├── board/             # ボード・カンバン機能
│   ├── tags/              # タグ管理機能
│   ├── smart-folders/     # スマートフォルダ機能
│   └── table/             # テーブル機能
├── lib/                   # 共通ユーティリティ
├── config/                # 設定ファイル集約
├── docs/                  # ドキュメント
├── scripts/               # ビルド・ユーティリティスクリプト
└── tests/                 # テスト関連
```

## 📚 ドキュメント

### メインドキュメント
詳細な技術情報は **Compass サブモジュール** で一元管理されています：
- **開発者向け詳細指示**: [`compass/ai-context/app/CLAUDE.md`](./compass/ai-context/app/CLAUDE.md)
- **技術ドキュメント**: [`compass/knowledge/app-docs/`](./compass/knowledge/app-docs/)
- **アーキテクチャ設計**: [`compass/architecture/`](./compass/architecture/)

### プロジェクト固有ドキュメント
- [プロジェクト概要](./docs/README.md)
- [開発ガイド](./docs/development/)
- [データベース設計](./docs/database/)

## ⚙️ 技術スタック

- **フロントエンド**: Next.js 14, React 18, TypeScript
- **UIライブラリ**: shadcn/ui, kiboUI
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS v4 + 8pxグリッドシステム
- **状態管理**: Zustand
- **開発ツール**: ESLint, Prettier, Vitest

## 🔄 開発ワークフロー

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# リンティング
npm run lint

# テスト実行
npm test

# 型チェック
npm run typecheck
```

## 📋 開発時の重要な指針

1. **機能追加時**: `src/features/` に新しいモジュールを作成
2. **コンポーネント選択優先度**: shadcn/ui → kiboUI → カスタム実装
3. **コミット前**: 必ず `npm run lint` を実行
4. **詳細な開発指示**: [`compass/ai-context/app/CLAUDE.md`](./compass/ai-context/app/CLAUDE.md) を参照
