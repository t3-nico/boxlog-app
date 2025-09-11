# BoxLog ESLint Configuration

BoxLogプロジェクトのESLint設定について説明します。

## 📁 ディレクトリ構造

```
.eslint/
├── index.js               # メインエントリーポイント
├── configs/               # 設定ファイル群
│   ├── base.js           # 基本設定
│   ├── development.js    # 開発環境用設定
│   └── production.js     # 本番環境用設定
├── overrides/            # 例外処理設定
│   ├── generated.js      # 自動生成ファイル用
│   └── legacy.js         # レガシーコード用
├── rules/                # カスタムルール
│   ├── theme/           # テーマシステム関連
│   ├── todo/            # TODO管理関連
│   └── compliance/      # コンプライアンス関連
├── scripts/             # セットアップ・ユーティリティ
│   └── setup.js         # 初期設定スクリプト
├── cache/               # ESLintキャッシュ（.gitignore対象）
├── reports/             # レポート出力先
├── fixtures/            # テスト用サンプルコード
└── docs/                # ドキュメント
```

## 🚀 使い方

### 基本コマンド

```bash
# 標準リント実行
npm run lint

# 自動修正付きリント
npm run lint:fix

# キャッシュ付き高速実行
npm run lint:cache

# HTMLレポート生成
npm run lint:report
```

### 環境別実行

```bash
# 開発環境設定でリント（緩い設定）
npm run lint:dev

# 本番環境設定でリント（厳格な設定）
npm run lint:prod
```

### 特定用途のリント

```bash
# テーマシステム違反チェック
npm run lint:theme

# コンプライアンス問題チェック
npm run lint:compliance

# パフォーマンス問題チェック
npm run lint:performance

# Import順序チェック
npm run lint:imports
```

## ⚙️ 設定の詳細

### 環境による設定切り替え

- **開発環境** (`NODE_ENV=development`): 警告レベル、デバッグログ許可
- **本番環境** (`NODE_ENV=production`): エラーレベル、厳格なチェック

### オーバーライド設定

#### 自動生成ファイル (generated.js)
以下のファイルには緩いルールが適用されます：
- `*.generated.*`
- `src/types/supabase.ts`
- `src/__generated__/**`
- `.next/**`
- ビルドアーティファクト

#### レガシーコード (legacy.js)
段階的移行対象のファイルには緩いルールが適用されます：
- `src/legacy/**`
- `src/old-components/**`
- 特定の移行対象ファイル

## 🔧 セットアップ

### 初回セットアップ

```bash
npm run eslint:setup
```

このコマンドは以下を実行します：
1. カスタムプラグインをnode_modulesにコピー
2. キャッシュディレクトリの初期化
3. レポートディレクトリの初期化
4. .gitignoreの更新
5. 設定の検証

### カスタムルールの更新

カスタムルールを更新した場合：

```bash
npm run eslint:setup  # セットアップを再実行
npm run lint:cache    # キャッシュクリア付きでテスト
```

## 📊 レポート

### HTMLレポート

```bash
npm run lint:report
```

生成されたレポートは `.eslint/reports/lint-report.html` で確認できます。

### 技術的負債レポート

```bash
npm run debt:analyze
```

ESLint結果を含む包括的な技術的負債レポートが生成されます。

## 🛠️ トラブルシューティング

### カスタムルールが認識されない

```bash
# セットアップを再実行
npm run eslint:setup

# node_modulesを確認
ls node_modules/eslint-plugin-boxlog-*
```

### キャッシュをクリアしたい

```bash
# キャッシュディレクトリを削除
rm -rf .eslint/cache/*

# またはキャッシュなしで実行
npm run lint -- --no-cache
```

### 設定ファイルのエラー

```bash
# 設定の検証
node .eslint/scripts/setup.js

# 基本設定のテスト
eslint --print-config src/app/page.tsx -c .eslint/index.js
```

## 📝 設定のカスタマイズ

### 新しいルールの追加

1. `.eslint/configs/base.js` にルールを追加
2. 必要に応じて環境別設定 (development.js, production.js) を調整
3. `npm run lint:cache` でテスト

### 新しいオーバーライドの追加

1. `.eslint/overrides/` に新しい設定ファイルを作成
2. `.eslint/index.js` の `overrides` 配列に追加
3. `npm run eslint:setup` でセットアップを再実行

## 🎯 ベストプラクティス

1. **開発中は `npm run lint:dev`** を使用（緩い設定）
2. **コミット前は `npm run lint:prod`** を実行（厳格な設定）
3. **大きな変更後は `npm run lint:report`** でHTMLレポートを確認
4. **定期的に `npm run debt:analyze`** で技術的負債をチェック
5. **カスタムルール更新後は `npm run eslint:setup`** を実行

## 🔗 関連ドキュメント

### 📚 内部ドキュメント
- **[📖 詳細ガイド](../README_DETAILED.md)** - 設定の動作原理と詳細解説
- **[⚡ クイックリファレンス](../QUICK_REFERENCE.md)** - 緊急時対応・よく使うコマンド
- **[🎛️ 設定例集](../CONFIG_EXAMPLES.md)** - 様々なシーンでの設定例

### 🔧 関連システム
- [技術的負債監視システム](../../reports/tech-debt.html)
- [TODOマネージャー](../../scripts/todo-manager.js)
- [Bundle分析システム](../../scripts/bundle-check.js)

### 🌐 外部リソース
- [ESLint公式ドキュメント](https://eslint.org/docs/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Next.js ESLint設定](https://nextjs.org/docs/basic-features/eslint)

---

**📝 このドキュメントについて**
- **最終更新**: 2025-09-11
- **バージョン**: v2.0.0 - 完全統合ESLint構造
- **対象**: 基本的な使用方法・コマンド一覧

**💡 読む順序の推奨**
1. **このファイル** - 基本的な使い方
2. **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** - 困った時の緊急対応
3. **[README_DETAILED.md](../README_DETAILED.md)** - 詳細な仕組み理解
4. **[CONFIG_EXAMPLES.md](../CONFIG_EXAMPLES.md)** - カスタマイズ時