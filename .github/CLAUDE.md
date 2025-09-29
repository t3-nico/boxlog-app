# .github/ - CI/CD・GitHub設定ルール

BoxLogプロジェクトのGitHub関連設定とCI/CDルール。

## 🎯 CI/CD基本方針

### 自動化の範囲
- **Pre-commit**: ESLint → Prettier → TypeCheck → Security Audit
- **Pre-push**: ブランチ名検証
- **Pull Request**: 全品質チェック → テスト → ビルド
- **Merge**: 自動デプロイ（本番環境）

---

## 🔧 Pre-commit Hook（Husky）

### 実行内容
```bash
# .husky/pre-commit
1. ESLint全ルール適用
2. Prettier自動整形
3. TypeScript型チェック
4. Gitleaksセキュリティ監査
```

### カスタマイズ
```bash
# Pre-commit軽量化（Issue #361で実装済み）
- ステージング済みファイルのみチェック
- ESLintキャッシュ活用
- Worker Threads並列実行
```

---

## 🚨 Conventional Commits（必須）

### コミットメッセージ型
```bash
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コード整形
refactor: リファクタリング
perf: パフォーマンス改善
test: テスト追加・修正
chore: ビルド・設定変更
```

### 自動検証
```bash
# .husky/commit-msg
1. Conventional Commits形式チェック
2. 日本語必須チェック
3. 文字数制限（subject 100文字、body 200文字）
```

### 使用例
```bash
# ✅ 正しい
git commit -m "feat: ユーザー認証機能を追加"
git commit -m "fix: ログイン時のメモリリークを修正"

# ❌ 間違い
git commit -m "update code"  # 型がない
git commit -m "feat: add authentication"  # 日本語必須
```

---

## 🌿 ブランチ戦略

### ブランチ命名規則
```bash
# Pre-pushで自動検証
feature/  # 新機能
fix/      # バグ修正
chore/    # 雑務・設定
docs/     # ドキュメント
style/    # スタイリング
refactor/ # リファクタリング
test/     # テスト
build/    # ビルド関連
```

### 使用例
```bash
# ✅ 正しい
feature/user-authentication
fix/memory-leak-on-login
docs/update-readme

# ❌ 間違い
user-authentication  # プレフィックスなし
feature-auth         # スラッシュなし
```

---

## 🔄 Pull Request ワークフロー

### PR作成時の自動処理
```yaml
# .github/workflows/pr-check.yml
1. ESLint全品質チェック
2. TypeScript型チェック
3. テスト実行（カバレッジ80%必須）
4. ビルド検証
5. セキュリティスキャン
6. Breaking Changes検知
```

### PRテンプレート
```markdown
## 概要
## 変更内容
## テスト
## Breaking Changes
## チェックリスト
- [ ] ESLint通過
- [ ] テストカバレッジ80%以上
- [ ] ドキュメント更新
```

---

## 🚀 デプロイフロー

### 本番デプロイ
```bash
# main/devブランチへのマージ時
1. npm run deploy:pre    # デプロイ前チェック
2. npm run build          # ビルド
3. npm run deploy:record  # 履歴記録
4. npm run deploy:post    # ヘルスチェック
```

### 手動デプロイ
```bash
# 完全デプロイフロー（推奨）
npm run deploy:full
```

---

## 🔐 セキュリティ

### Gitleaks（機密情報検出）
```bash
# Pre-commit時に自動実行
- APIキー検出
- 秘密鍵検出
- パスワード検出
```

### Dependabot
```yaml
# .github/dependabot.yml
自動依存関係更新:
- npm packages
- GitHub Actions
```

---

## 📊 GitHub Actions

### ワークフロー一覧
```
.github/workflows/
├── pr-check.yml        # PR時の品質チェック
├── deploy.yml          # デプロイ自動化
├── security-scan.yml   # セキュリティスキャン
└── breaking-changes.yml # 破壊的変更検知
```

---

## 🔗 関連コマンド

```bash
# Breaking Changes検知
npm run breaking:detect

# デプロイ前チェック
npm run deploy:pre

# セキュリティ監査
npm run 1password:audit
```

---

## 🔗 関連ドキュメント

- **Issue管理**: [`../docs/development/ISSUE_MANAGEMENT.md`](../docs/development/ISSUE_MANAGEMENT.md)
- **コミット規約**: [`../docs/development/COMMIT_RULES.md`](../docs/development/COMMIT_RULES.md)
- **コマンド一覧**: [`../docs/development/COMMANDS.md`](../docs/development/COMMANDS.md)

---

**📖 最終更新**: 2025-09-30