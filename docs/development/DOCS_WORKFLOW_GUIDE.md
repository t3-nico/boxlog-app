# 📚 ドキュメント管理ワークフローガイド

**BoxLogプロジェクトのドキュメント品質管理システム活用指針**

## 🎯 概要

BoxLogでは、コードとドキュメントの整合性を自動的に維持するためのツールチェーンを提供しています。
開発者が効率的にドキュメントを管理し、品質を保つための実践的なガイドです。

## 🛠️ 利用可能なコマンド

### 1. `npm run docs:check`

**ドキュメント・コード整合性チェック**

```bash
npm run docs:check
```

**実行内容:**

- ESLint設定とドキュメントの整合性
- Theme SystemとDesign Systemの同期
- package.jsonとドキュメントの依存関係
- Markdownファイル内のリンク切れ検出
- TODO/NOTEコメントとドキュメントの一致

**出力例:**

```
📊 整合性スコア: 37.5%
✅ 成功: 6/16
⚠️  警告: 4/16
❌ エラー: 6/16
```

### 2. `npm run docs:auto-fix`

**自動修正システム**

```bash
npm run docs:auto-fix
```

**修正内容:**

- 壊れた内部リンクの自動修復
- TODO_REPORT.mdの再生成
- ドキュメント更新日付の自動更新
- 古いファイル参照の修正

### 3. `npm run docs:audit`

**ドキュメント監査（check実行）**

```bash
npm run docs:audit
```

基本的に`docs:check`と同じ機能です。

### 4. `npm run docs:fix-and-check`

**修正後チェック（推奨）**

```bash
npm run docs:fix-and-check
```

自動修正→チェックを連続実行し、最終的な整合性スコアを確認できます。

## 🔄 開発ワークフローへの統合

### 🚀 推奨ワークフロー

#### 1. 日常開発時

```bash
# 機能開発開始前
npm run docs:check

# コード変更後（ドキュメント影響がある場合）
npm run docs:fix-and-check

# コミット前
npm run lint && npm run docs:check
```

#### 2. プルリクエスト作成時

```bash
# 最終チェック
npm run docs:fix-and-check
npm run typecheck
git add . && git commit -m "docs: Update documentation consistency"
```

#### 3. 定期メンテナンス（週次）

```bash
# 包括的なドキュメント監査
npm run docs:audit
npm run docs:auto-fix
git add . && git commit -m "docs: Weekly consistency maintenance"
```

### 🤖 CI/CD統合案

#### GitHub Actions統合

```yaml
# .github/workflows/docs-quality.yml
name: Documentation Quality Check

on: [push, pull_request]

jobs:
  docs-consistency:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run docs:check
      - run: |
          if npm run docs:check | grep -q "エラー"; then
            echo "❌ ドキュメント整合性エラーが検出されました"
            exit 1
          fi
```

#### Pre-commit Hook統合

```bash
# .husky/pre-commit に追加
npm run docs:check
if [ $? -ne 0 ]; then
  echo "⚠️  ドキュメント整合性に問題があります。npm run docs:fix-and-check を実行してください"
  exit 1
fi
```

## 📈 品質改善戦略

### 🎯 目標整合性スコア

| フェーズ    | 目標スコア | 期間  | 重点項目           |
| ----------- | ---------- | ----- | ------------------ |
| **Phase 1** | 50%        | 1週間 | リンク切れ修正     |
| **Phase 2** | 75%        | 2週間 | ファイル構造最適化 |
| **Phase 3** | 90%        | 1ヶ月 | 完全自動化         |

### 🔧 よくある問題と解決方法

#### 1. リンク切れが多発する

**原因**: ファイル移動時のパス更新漏れ

**解決策**:

```bash
# 移動前
npm run docs:check  # 現状把握

# ファイル移動実行
mv docs/old-path/ docs/new-path/

# 自動修正試行
npm run docs:auto-fix

# 手動修正（必要に応じて）
# - VSCode一括置換
# - grep + sed 活用

# 最終確認
npm run docs:fix-and-check
```

#### 2. 整合性スコアが改善しない

**分析手順**:

```bash
# 詳細分析
npm run docs:check | tee docs-analysis.log

# カテゴリ別エラー確認
grep "❌" docs-analysis.log | sort | uniq -c
```

**対策優先度**:

1. **リンク切れ** → 即座に修正可能
2. **ファイル不存在** → 作成 or 参照削除
3. **構造不整合** → 設計見直し

#### 3. 自動修正が誤動作する

**回避策**:

```bash
# バックアップ作成
git stash push -m "Before docs auto-fix"

# 自動修正実行
npm run docs:auto-fix

# 結果確認
git diff

# 問題があれば復元
git stash pop  # 必要に応じて
```

## 🚀 開発体験向上のための活用例

### 📝 新機能開発時

```bash
# 1. 機能設計段階
mkdir src/features/new-feature
echo "# New Feature Documentation" > src/features/new-feature/README.md

# 2. 開発進行中
npm run docs:check  # 定期的な整合性確認

# 3. 完成時
npm run docs:fix-and-check  # 最終調整
```

### 🔄 リファクタリング時

```bash
# 1. 事前状態記録
npm run docs:check > before-refactor.log

# 2. リファクタリング実行
# コード変更...

# 3. ドキュメント自動調整
npm run docs:auto-fix

# 4. 整合性確認
npm run docs:check > after-refactor.log
diff before-refactor.log after-refactor.log
```

### 📊 品質監視

```bash
# 週次品質レポート
echo "# Weekly Docs Quality Report" > weekly-docs-report.md
echo "Date: $(date)" >> weekly-docs-report.md
npm run docs:check >> weekly-docs-report.md
```

## 🎯 ベストプラクティス

### ✅ 推奨事項

1. **毎日実行**: `npm run docs:check`
2. **変更前後**: `npm run docs:fix-and-check`
3. **コミット前**: 必ず整合性確認
4. **プルリク前**: 包括的なチェック実行
5. **定期メンテ**: 週次での監査・修正

### ❌ 避けるべき事項

1. **チェック無しコミット**: 整合性悪化の原因
2. **自動修正の盲信**: 結果は必ず確認
3. **警告の無視**: 小さな問題が蓄積
4. **手動リンク修正**: 自動修正ツールを優先
5. **ドキュメント後回し**: コードと同時更新

## 🔗 関連リソース

- [package.json](../../package.json) - NPMスクリプト定義
- [docs/README.md](../README.md) - ドキュメント構造概要
- [CLAUDE.md](../../CLAUDE.md) - 基本開発指針
- [scripts/docs-code-consistency.cjs](../../scripts/docs-code-consistency.cjs) - チェックツール
- [scripts/docs-auto-fix.js](../../scripts/docs-auto-fix.js) - 自動修正ツール

---

**📊 このガイドの効果測定**

ドキュメント品質管理システムの導入により、以下の改善が期待されます：

- **開発効率**: リンク切れ検出の自動化 → 手動確認時間75%削減
- **品質向上**: 整合性スコア90%達成 → ドキュメント信頼性向上
- **保守負荷**: 自動修正機能 → メンテナンス工数50%削減
- **開発体験**: 統合ワークフロー → 開発者満足度向上

---

**最終更新**: 2025-09-22
**担当**: BoxLog 開発チーム
