# CLAUDE.md - BoxLog App メインリポジトリ

このファイルは、BoxLog App メインリポジトリでの Claude Code (claude.ai/code) の動作指針を定義します。

## 🗣️ コミュニケーション言語

**重要: 基本的に日本語で応答してください。** ただし、技術的に一般的な英語（feature、bug、commit、etc.）は適宜使用可能です。

## 📚 ドキュメント配置

**重要: 主要なドキュメントはCompassサブモジュールで一元管理されています。**

詳細なドキュメントは以下の場所を参照してください：
- **App専用AI指示書**: `compass/ai-context/app/CLAUDE.md` ← **開発時はこちらを主に参照**
- **技術ドキュメント**: `compass/knowledge/app-docs/`
- **アーキテクチャ**: `compass/architecture/`
- **デザインシステム**: `compass/design-system/`

## 🔄 Compass サブモジュール連携

このリポジトリには Compass サブモジュールが統合されており、以下のように連携しています：

### サブモジュール操作
```bash
# Compassの最新情報を取得
git submodule update --remote

# Compass内で作業（ドキュメント更新など）
cd compass
git checkout -b feature/update-docs
# 編集作業
git add . && git commit -m "docs: ドキュメント更新"
git push origin feature/update-docs
# PR作成・マージ

# メインリポジトリに戻ってサブモジュール更新を反映
cd ..
git add compass
git commit -m "chore: compassサブモジュール更新"
```

### 自動同期システム
Compass の `dev`/`main` ブランチへの push により、このリポジトリへの自動同期が実行されます：
```
Compass更新 → GitHub Actions → 自動でこのリポジトリのサブモジュール更新
```

## 🚀 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# リンティング実行
npm run lint

# テスト実行
npm test
```

## 🏗️ プロジェクト概要

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。Compass ナレッジマネジメントシステムと統合し、ドキュメントとリソースを一元管理しています。

### 主要技術スタック

- **フロントエンド**: Next.js 14（App Router）, React 18, TypeScript
- **UIコンポーネント**: shadcn/ui（基本）, kiboUI（高度な機能）
- **ドキュメント**: Compass サブモジュールによる一元管理
- **データベース**: Supabase（PostgreSQL）
- **スタイリング**: Tailwind CSS v4 + 8pxグリッドシステム

### コンポーネント選択優先度

1. **🥇 shadcn/ui（第一選択）** - 基本UIコンポーネント
2. **🥈 kiboUI（高度な機能）** - AI コンポーネント、Kanban など
3. **🥉 カスタム実装（最後の手段）** - ライブラリオプションが存在しない場合のみ

## 🎯 開発ワークフロー

### ブランチ戦略
- **dev**: 開発・統合ブランチ（メイン作業）
- **main**: 本番環境ブランチ
- **feature/***: 機能開発ブランチ
- **fix/***: バグ修正ブランチ

### 重要なルール
1. **コミット前に `npm run lint` を必ず実行**
2. **新しいコンポーネントはライト・ダークモード両方をテスト**
3. **8pxグリッドシステムに準拠**
4. **TypeScript を厳密に使用（`any` 型を避ける）**

## 📋 開発時の指針

### Claude Code 使用時
- **詳細な技術指示**: `compass/ai-context/app/CLAUDE.md` を参照
- **コンポーネント実装**: shadcn/ui → kiboUI → カスタム の順で検討
- **デザインシステム**: Compass の統一トークンを使用

### ドキュメント更新
1. **App関連**: `compass/knowledge/app-docs/` で管理
2. **サブモジュール更新**: 上記のサブモジュール操作手順に従う
3. **変更追跡**: コミットメッセージで修正元を明記

## 🔗 重要なリンク

- **詳細技術ドキュメント**: `compass/ai-context/app/CLAUDE.md`
- **コンポーネントガイド**: `compass/knowledge/app-docs/components/`
- **デザインシステム**: `compass/design-system/`
- **Git ワークフロー**: `compass/knowledge/app-docs/development/git-workflow.md`

---

**📖 このドキュメントについて**: BoxLog App メインリポジトリ概要  
**詳細指示書**: `compass/ai-context/app/CLAUDE.md` ← **開発時はこちらを主に参照**  
**最終更新**: 2025-07-29  
**バージョン**: v2.0 - Compass統合・日本語ベース版