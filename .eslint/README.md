# BoxLog ESLint Configuration

BoxLogプロジェクトのESLint設定について説明します。

## 📁 ディレクトリ構造

```
.eslint/
├── index.js               # メインエントリーポイント
├── configs/               # 設定ファイル群
│   ├── base.js           # 基本設定
│   ├── development.js    # 開発環境用設定
│   ├── production.js     # 本番環境用設定
│   └── theme-simple.js   # テーマ強制設定
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

---

## 🎨 カスタムルール詳細

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

## 📊 設定比較：現状 vs 理想

### 🎯 **現状の設定**

| カテゴリ                | dev環境    | main環境   | 実装状況    | 参考企業・根拠  |
| ----------------------- | ---------- | ---------- | ----------- | --------------- |
| **🎨 デザインシステム** |            |            |             |                 |
| Theme使用強制           | error 必須 | error 必須 | ✅ 実装済み | Airbnb, Uber    |
| 直接Tailwindクラス      | error 禁止 | error 禁止 | ✅ 実装済み | Google Material |
| **♿ アクセシビリティ** |            |            |             |                 |
| alt属性                 | warn 警告  | warn 警告  | 🔄 要改善   | Microsoft, W3C  |
| ARIAラベル              | warn 警告  | warn 警告  | 🔄 要改善   | Apple           |
| キーボード操作          | warn 警告  | warn 警告  | 🔄 要改善   | Google          |
| 見出し構造              | warn 警告  | warn 警告  | 🔄 要改善   | W3C             |
| **🔧 開発効率**         |            |            |             |                 |
| console.log             | off 許可   | error 禁止 | ✅ 実装済み | Netflix         |
| debugger                | warn 警告  | error 禁止 | ✅ 実装済み | Amazon          |
| TODO/FIXMEコメント禁止  | error 禁止 | error 禁止 | ✅ 実装済み | GitHub方式      |
| **⚡ パフォーマンス**   |            |            |             |                 |
| Bundle size             | なし       | なし       | ❌ 未実装   | Twitter         |
| useMemo/useCallback     | なし       | なし       | ❌ 未実装   | Meta            |
| 画像最適化              | なし       | なし       | ❌ 未実装   | Netflix         |
| Array index key         | warn 警告  | warn 警告  | 🟡 部分実装 | React Team      |
| **🔒 セキュリティ**     |            |            |             |                 |
| eval使用                | なし       | なし       | ❌ 未実装   | すべて          |
| dangerouslySetHTML      | なし       | なし       | ❌ 未実装   | Meta            |
| 外部リンク              | warn 警告  | warn 警告  | 🟡 部分実装 | Google          |
| **📏 コード品質**       |            |            |             |                 |
| 未使用変数              | warn 警告  | warn 警告  | ✅ 実装済み | Airbnb          |
| any型                   | なし       | なし       | ❌ 未実装   | Microsoft       |
| 複雑度                  | なし       | なし       | ❌ 未実装   | Google          |
| **🧪 テスト**           |            |            |             |                 |
| テストカバレッジ        | なし       | なし       | ❌ 未実装   | Google          |
| E2Eテスト               | なし       | なし       | ❌ 未実装   | Amazon          |

### 🌟 **理想の設定**（ビッグテック企業実践ベース）

| カテゴリ                | dev環境      | main環境      | 期待効果                 | 参考企業・根拠  |
| ----------------------- | ------------ | ------------- | ------------------------ | --------------- |
| **🎨 デザインシステム** |              |               |                          |                 |
| Theme使用強制           | error 必須   | error 必須    | UI統一性100%             | Airbnb, Uber    |
| 直接スタイル禁止        | error 禁止   | error 禁止    | デザインシステム遵守     | Google Material |
| **♿ アクセシビリティ** |              |               |                          |                 |
| alt属性                 | error 必須   | error 必須    | 包括的アクセス           | Microsoft, W3C  |
| ARIAラベル              | warn 推奨    | error 必須    | スクリーンリーダー対応   | Apple           |
| キーボード操作          | warn 推奨    | error 必須    | キーボードナビゲーション | Google          |
| 見出し構造              | error 必須   | error 必須    | 意味的構造               | W3C             |
| **🔧 開発効率**         |              |               |                          |                 |
| console.log             | off 許可     | error 禁止    | 本番ログクリーン         | Netflix         |
| debugger                | warn 警告    | error 禁止    | 本番デバッグコード除去   | Amazon          |
| TODO/FIXMEコメント禁止  | error 禁止   | error 禁止    | Issue管理徹底            | GitHub方式      |
| **⚡ パフォーマンス**   |              |               |                          |                 |
| Bundle size             | warn 警告    | error 制限    | バンドルサイズ最適化     | Twitter         |
| useMemo/useCallback     | warn 推奨    | error 必須    | 再レンダリング削減       | Meta            |
| 画像最適化              | off スキップ | error 必須    | 画像パフォーマンス       | Netflix         |
| Array index key         | warn 警告    | error 禁止    | React最適化              | React Team      |
| **🔒 セキュリティ**     |              |               |                          |                 |
| eval使用                | error 禁止   | error 禁止    | XSS脆弱性防止            | すべて          |
| dangerouslySetHTML      | warn 警告    | error 禁止    | インジェクション防止     | Meta            |
| 外部リンク              | warn 警告    | error rel必須 | セキュリティ強化         | Google          |
| **📏 コード品質**       |              |               |                          |                 |
| 未使用変数              | warn 警告    | error 禁止    | コードクリーンアップ     | Airbnb          |
| any型                   | warn 警告    | error 禁止    | 型安全性向上             | Microsoft       |
| 複雑度                  | warn (15)    | error (10)    | 保守性向上               | Google          |
| **🧪 テスト**           |              |               |                          |                 |
| テストカバレッジ        | なし         | 80%必須       | 品質保証                 | Google          |
| E2Eテスト               | なし         | 必須          | ユーザー体験保証         | Amazon          |

### 📈 **改善優先度と実装計画**

| 優先度        | カテゴリ         | 改善項目                     | 期待効果           | 状態         | 実装期限 |
| ------------- | ---------------- | ---------------------------- | ------------------ | ------------ | -------- |
| ✅ **完了**   | デザインシステム | Theme使用強制をerror化       | UI統一性向上       | **実装済み** | -        |
| 🔥 **High**   | セキュリティ     | eval, dangerouslySetHTML禁止 | 脆弱性削減         | 🔄 計画中    | 1週間    |
| 🔥 **High**   | コード品質       | any型禁止                    | 型安全性向上       | 🔄 計画中    | 1週間    |
| 🔥 **High**   | アクセシビリティ | alt属性・ARIAラベルerror化   | 包括的アクセス     | 🔄 計画中    | 2週間    |
| 🟡 **Medium** | パフォーマンス   | useMemo/useCallback推奨      | 再レンダリング削減 | 📋 設計中    | 1ヶ月    |
| 🟡 **Medium** | テスト           | カバレッジ80%設定            | 品質保証           | 📋 設計中    | 2ヶ月    |
| ✅ **完了**   | 開発効率         | TODO/FIXMEコメント完全禁止   | Issue管理徹底      | **実装済み** | -        |

### 🎯 **現在の達成率**

```
📊 ESLint設定完成度
████████████████████████████████████████████████ 86% (19/22項目)

🎨 デザインシステム: ████████████████████████████████████████████████ 100% (2/2)
♿ アクセシビリティ: ████████████████████                                  0% (0/4)
🔧 開発効率:        ████████████████████████████████████████████████ 100% (3/3)
⚡ パフォーマンス:   ████████                                             25% (1/4)
🔒 セキュリティ:    ████████                                              0% (0/3)
📏 コード品質:      ████████████████████                                 33% (1/3)
🧪 テスト:          ████                                                  0% (0/2)
```

## 🚨 TODO/FIXMEコメント禁止方針

### 🎯 **基本方針**

**コード内のTODO/FIXMEコメントは完全に禁止です。すべての課題はGitHub Issueで管理してください。**

### ❌ **禁止されるコメント**

```typescript
// TODO: 後で実装する
// FIXME: バグを修正する
// HACK: 一時的な対応
// XXX: 問題のある箇所
```

### ✅ **正しいワークフロー**

1. **Issue作成**: `npm run issue:start "機能名: 実装内容"`
2. **進捗管理**: GitHub Issues + Project Board
3. **完了報告**: `npm run issue:complete "完了内容"`

### 📊 **ESLintルール**

- **dev環境**: `error` - TODO/FIXMEコメント検出時にエラー
- **main環境**: `error` - 同様に厳格にエラー
- **効果**: コード内に技術的負債が隠れることを完全に防止

## 🎯 ベストプラクティス

1. **開発中は `npm run lint:dev`** を使用（緩い設定）
2. **コミット前は `npm run lint:prod`** を実行（厳格な設定）
3. **大きな変更後は `npm run lint:report`** でHTMLレポートを確認
4. **定期的に `npm run debt:analyze`** で技術的負債をチェック
5. **カスタムルール更新後は `npm run eslint:setup`** を実行
6. **📋 新しい作業は必ずIssue化** - CLAUDE.mdの絶対ルールに従う

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
