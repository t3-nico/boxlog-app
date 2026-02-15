# .github/ - GitHub設定説明

DayoptプロジェクトのGitHub関連ファイル・設定。

## 📁 ディレクトリ構造

```
.github/
├── CLAUDE.md              # CI/CDルール
├── README.md              # このファイル
├── workflows/             # GitHub Actions
│   ├── pr-check.yml
│   ├── deploy.yml
│   └── ...
├── ISSUE_TEMPLATE/        # Issueテンプレート
│   ├── bug_report.md
│   ├── feature_request.md
│   └── ...
├── PULL_REQUEST_TEMPLATE.md # PRテンプレート
└── dependabot.yml         # 依存関係自動更新
```

---

## 🔧 主要ファイル説明

### workflows/ - GitHub Actions

自動化ワークフロー定義。

**主要ワークフロー**:

- `pr-check.yml` - PR時の品質チェック
- `deploy.yml` - デプロイ自動化
- `security-scan.yml` - セキュリティスキャン
- `breaking-changes.yml` - 破壊的変更検知

### ISSUE_TEMPLATE/ - Issueテンプレート

Issue作成時の定型フォーマット。

**テンプレート種類**:

- バグ報告
- 機能リクエスト
- ドキュメント改善
- パフォーマンス改善

### PULL_REQUEST_TEMPLATE.md - PRテンプレート

Pull Request作成時の定型フォーマット。

**含まれる項目**:

- 概要
- 変更内容
- テスト方法
- Breaking Changes
- チェックリスト

### dependabot.yml - 依存関係自動更新

Dependabotによる自動PR作成設定。

**更新対象**:

- npm packages
- GitHub Actions

---

## 🎯 CI/CDパイプライン

### Pull Request時

```mermaid
PR作成
  ↓
ESLint → TypeCheck → Test → Build
  ↓
セキュリティスキャン
  ↓
Breaking Changes検知
  ↓
承認待ち
```

### マージ後（本番デプロイ）

```mermaid
main/devへマージ
  ↓
デプロイ前チェック
  ↓
ビルド
  ↓
デプロイ実行
  ↓
ヘルスチェック
  ↓
完了通知
```

---

## 🔐 セキュリティ設定

### Gitleaks

機密情報の誤コミット検出。

**検出対象**:

- APIキー・トークン
- パスワード・秘密鍵
- 環境変数値

### Dependabot Security Updates

脆弱性のある依存関係を自動検出・更新。

---

## 📊 ラベル管理

### 優先度ラベル

- `priority:critical` - 緊急対応必須
- `priority:high` - 高優先度
- `priority:medium` - 中優先度
- `priority:low` - 低優先度

### 種別ラベル

- `type:feature` - 新機能
- `type:bugfix` - バグ修正
- `type:refactor` - リファクタリング
- `type:docs` - ドキュメント
- `type:chore` - 雑務・設定

### サイズラベル

- `size:xs` - 1時間未満
- `size:sm` - 1-4時間
- `size:md` - 4-8時間
- `size:lg` - 1-2日
- `size:xl` - 2日以上

---

## 🔗 関連ドキュメント

- **CI/CDルール**: [`CLAUDE.md`](./CLAUDE.md)

---

**📖 最終更新**: 2025-09-30
