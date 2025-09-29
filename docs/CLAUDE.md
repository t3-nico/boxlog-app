# docs/ - ドキュメント作成ルール

BoxLogプロジェクトのドキュメント管理ガイドライン。

## 📚 ドキュメント作成方針

### 基本原則
1. **情報の正確性** - 実装と常に同期
2. **更新の即時性** - コード変更時に同時更新
3. **階層的構造** - 必要な情報に素早くアクセス
4. **検索可能性** - 明確な命名・タグ付け

---

## 📁 ドキュメント構造

```
docs/
├── README.md                    # プロジェクト全体概要
├── CLAUDE.md                    # このファイル
├── development/                 # 開発ガイドライン
│   ├── COMMANDS.md
│   ├── ISSUE_MANAGEMENT.md
│   └── CLAUDE_SESSION_MANAGEMENT.md
├── systems/                     # システム詳細
│   ├── ESLINT_SETUP_COMPLETE.md
│   ├── THEME_ENFORCEMENT.md
│   └── ...
└── performance/                 # パフォーマンス関連
    └── ACCESSIBILITY_TESTING_GUIDE.md
```

---

## 🎯 ドキュメント種別

### 1. ガイドドキュメント（XXX_GUIDE.md）
**目的**: 特定機能・システムの使い方を説明

**構成**:
```markdown
# タイトル - 簡潔な説明

## 🎯 概要
## 📋 前提条件
## 🚀 クイックスタート
## 📚 詳細説明
## 🔗 関連ドキュメント
```

### 2. 仕様ドキュメント（XXX_SPEC.md）
**目的**: 技術仕様・設計を記録

**構成**:
```markdown
# タイトル - 技術仕様

## 📋 要件
## 🏗️ アーキテクチャ
## 🔧 実装詳細
## 📊 データ構造
## ✅ テストケース
```

### 3. 完了レポート（XXX_COMPLETE.md）
**目的**: 実装完了した機能の記録

**構成**:
```markdown
# タイトル - 実装完了レポート

## ✅ 実装内容
## 📊 成果・統計
## 🎯 使用方法
## 🔗 関連Issue・PR
```

---

## 📝 ドキュメント作成ルール

### ファイル命名規則
```bash
# ✅ 推奨命名
FEATURE_NAME_GUIDE.md        # ガイド
SYSTEM_NAME_SETUP.md         # セットアップ
COMPONENT_NAME_SPEC.md       # 仕様
TASK_NAME_COMPLETE.md        # 完了レポート

# ❌ 避ける命名
guide.md                     # 不明確
document-v1.md               # バージョン管理はGit使用
temp_doc.md                  # 一時ファイルはコミット禁止
```

### マークダウン記法
```markdown
# 見出し1（ドキュメントタイトル）
## 見出し2（主要セクション）
### 見出し3（サブセクション）

**太字** - 重要な用語
`コード` - コマンド・変数名
[リンク](./path/to/doc.md) - 相対パス使用

\```bash
# コードブロック（言語指定必須）
npm run command
\```

- 箇条書き
  - ネスト
1. 番号付きリスト
```

### 絵文字の使用
```markdown
## 🎯 目的・概要
## 📋 リスト・手順
## 🚀 クイックスタート
## 🔧 設定・ツール
## 📊 データ・統計
## ✅ 完了・成功
## ❌ エラー・禁止事項
## 🔗 リンク・参照
```

---

## 🔄 ドキュメント更新フロー

### コード変更時
```bash
# 1. コード変更
# 2. 関連ドキュメント即座更新
# 3. ドキュメント整合性チェック
npm run docs:check

# 4. 自動修正適用
npm run docs:fix-and-check

# 5. コミット時に検証
git add . && git commit -m "feat: 機能追加とドキュメント更新"
```

### 新規ドキュメント作成時
```bash
# 1. 適切なディレクトリに配置
docs/development/NEW_FEATURE_GUIDE.md

# 2. README.md にリンク追加
# 3. 関連ドキュメントに相互リンク設定
# 4. ドキュメント検証
npm run docs:check
```

---

## 📊 品質管理

### 自動チェック項目
- リンク切れ検出
- 画像ファイル存在確認
- コードブロック言語指定
- 見出しレベル検証

### 手動レビュー項目
- [ ] 情報の正確性
- [ ] 読みやすさ
- [ ] サンプルコードの動作確認
- [ ] スクリーンショットの更新

---

## 🔗 関連コマンド

```bash
# ドキュメント整合性チェック
npm run docs:check

# 自動修正→チェック
npm run docs:fix-and-check

# ドキュメント統計
npm run docs:stats
```

---

## 🔗 関連ドキュメント

- **ドキュメント一覧**: [`README.md`](./README.md)
- **ワークフローガイド**: [`development/DOCS_WORKFLOW_GUIDE.md`](./development/DOCS_WORKFLOW_GUIDE.md)
- **コミット規約**: [`development/COMMIT_RULES.md`](./development/COMMIT_RULES.md)

---

**📖 最終更新**: 2025-09-30