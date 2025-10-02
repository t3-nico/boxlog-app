# リリースプロセス

BoxLogの正式なリリース作業手順を定義します。

## 📋 目次
- [前提条件](#前提条件)
- [リリース前チェックリスト](#リリース前チェックリスト)
- [リリース手順](#リリース手順)
- [リリース後の作業](#リリース後の作業)
- [ロールバック手順](#ロールバック手順)
- [トラブルシューティング](#トラブルシューティング)

## 前提条件

### 必要なツール
```bash
# Node.js & npm
node --version  # v20以上
npm --version

# GitHub CLI
gh --version

op --version

# Git
git --version
```

### 権限
- リポジトリへのWrite権限
- GitHub Releaseの作成権限
- Vercelプロジェクトへのアクセス権

## リリース前チェックリスト

### 1. コードの品質確認
```bash
# Lint チェック
npm run lint

# 型チェック
npm run typecheck

# テスト実行
npm run test:run

# ビルド確認
npm run build
```

### 2. ドキュメント確認
- [ ] CHANGELOG.md の [Unreleased] セクションに変更内容が記載されている
- [ ] 新機能のドキュメントが更新されている
- [ ] 破壊的変更がある場合、マイグレーションガイドが用意されている
- [ ] README.md が最新の状態である

### 3. Issue/PR確認
- [ ] マイルストーンに紐づく全てのIssueがクローズされている
- [ ] マイルストーンに紐づく全てのPRがマージされている
- [ ] 未解決の重大なバグがない

### 4. セキュリティ確認
```bash
# 依存関係の脆弱性チェック
npm audit

# ライセンスチェック
npm run license:check
```

## リリース手順

### Phase 1: 準備

#### 1.1 最新のコードを取得
```bash
git checkout dev
git pull origin dev
```

#### 1.2 ブランチの状態確認
```bash
# 未コミットの変更がないこと
git status

# 最新のコミット確認
git log -5 --oneline
```

### Phase 2: リリースノート作成

#### 2.1 リリースノートファイル作成
```bash
# バージョン番号を決定（例: v0.1.0）
VERSION="0.1.0"

# テンプレートをコピー
cp docs/releases/template.md docs/releases/v${VERSION}.md
```

#### 2.2 リリースノート編集
```bash
# エディタで編集
vim docs/releases/v${VERSION}.md
```

**記載内容:**
- リリース日
- 概要
- 新機能 (Added)
- 変更 (Changed)
- バグ修正 (Fixed)
- 破壊的変更 (Breaking Changes)
- 削除 (Removed)
- セキュリティ (Security)

#### 2.3 CHANGELOG.md 更新
```bash
# エディタで編集
vim CHANGELOG.md
```

**更新内容:**
1. [Unreleased] セクションの内容を新バージョンに移動
2. リリース日を追加
3. バージョンリンクを追加

**例:**
```markdown
## [0.1.0] - 2025-10-15

### Added
- 新機能の説明

[0.1.0]: https://github.com/t3-nico/boxlog-app/releases/tag/v0.1.0
```

### Phase 3: バージョンアップ

#### 3.1 バージョンの決定
```bash
# 現在のバージョン確認
npm version

# バージョンアップのタイプを選択
# PATCH: 0.0.1 → 0.0.2 (バグ修正)
# MINOR: 0.0.1 → 0.1.0 (新機能)
# MAJOR: 0.0.1 → 1.0.0 (破壊的変更)
```

#### 3.2 バージョンアップ実行
```bash
# PATCH
npm version patch -m "chore: bump version to %s"

# MINOR
npm version minor -m "feat: bump version to %s"

# MAJOR
npm version major -m "feat!: bump version to %s"
```

**このコマンドが実行すること:**
1. package.json の version を更新
2. Git commit を作成
3. Git tag を作成

#### 3.3 変更内容の確認
```bash
# 最新のコミットを確認
git log -1

# タグを確認
git tag --list | tail -5

# 変更されたファイルを確認
git show HEAD
```

### Phase 4: プッシュ

#### 4.1 コミット & タグをプッシュ
```bash
# コミットをプッシュ
git push origin dev

# タグをプッシュ
git push origin v${VERSION}
```

#### 4.2 プッシュ確認
```bash
# リモートのタグを確認
git ls-remote --tags origin

# GitHub上で確認
gh repo view --web
```

### Phase 5: GitHub Release作成

#### 5.1 GitHub Releaseテンプレート準備
```bash
# テンプレートファイルを編集
cp .github/RELEASE_TEMPLATE.md /tmp/release-v${VERSION}.md
vim /tmp/release-v${VERSION}.md
```

#### 5.2 GitHub Release作成
```bash
# GitHub CLI で作成
gh release create v${VERSION} \
  --title "Release v${VERSION}" \
  --notes-file /tmp/release-v${VERSION}.md

# または GitHub UI から作成
# https://github.com/t3-nico/boxlog-app/releases/new
```

#### 5.3 Release確認
```bash
# 作成されたReleaseを確認
gh release view v${VERSION} --web
```

### Phase 6: デプロイ確認

#### 6.1 自動デプロイの監視
```bash
# Vercelのデプロイ状況を確認
# https://vercel.com/t3-nico/boxlog-app

# デプロイログを確認
npm run deploy:stats
```

#### 6.2 本番環境の動作確認
```bash
# ヘルスチェック
npm run deploy:health

# 本番環境にアクセスして動作確認
# https://boxlog-app.vercel.app
```

**確認項目:**
- [ ] サイトが正常に表示される
- [ ] 新機能が動作する
- [ ] 既存機能が正常に動作する
- [ ] エラーが発生していない
- [ ] パフォーマンスに問題がない

## リリース後の作業

### 1. マイルストーンのクローズ
```bash
# GitHub UI でマイルストーンをクローズ
# https://github.com/t3-nico/boxlog-app/milestones
```

### 2. 関連Issueの更新
```bash
# リリースされたことをIssueにコメント
gh issue comment <issue_number> \
  --body "Released in v${VERSION}: https://github.com/t3-nico/boxlog-app/releases/tag/v${VERSION}"
```

### 3. ドキュメントの更新
- [ ] README.md のバージョン番号更新（必要に応じて）
- [ ] docs/releases/README.md にバージョンを追加

### 4. 通知
- [ ] チームへのリリース通知
- [ ] ユーザーへのアナウンス（必要に応じて）

### 5. モニタリング
```bash
# Sentryでエラー監視
# https://sentry.io/organizations/boxlog/issues/

# アナリティクス確認
npm run analytics:stats
```

## ロールバック手順

### 緊急時のロールバック

#### 1. 重大な問題の確認
- クリティカルなバグ
- セキュリティ上の問題
- データ損失の可能性

#### 2. ロールバック実行
```bash
# Vercelで前のデプロイに戻す
npm run deploy:rollback

# または Vercel UI から前のデプロイをPromote
# https://vercel.com/t3-nico/boxlog-app/deployments
```

#### 3. GitHub Releaseの対応
```bash
# Releaseをドラフトに変更（削除はしない）
gh release edit v${VERSION} --draft

# 問題を説明するIssueを作成
gh issue create \
  --title "Rollback: v${VERSION} - Critical Issue" \
  --body "Description of the issue..."
```

#### 4. 修正版のリリース
```bash
# 問題を修正
# ...

# パッチバージョンをリリース
npm version patch -m "fix: critical issue in v${VERSION}"
git push origin dev
git push origin v${VERSION_PATCH}

# 新しいReleaseを作成
gh release create v${VERSION_PATCH} \
  --title "Hotfix v${VERSION_PATCH}" \
  --notes "Fixes critical issue in v${VERSION}"
```

## トラブルシューティング

### Q: npm version でエラーが出る
```bash
# 未コミットの変更がある場合
git status
git add .
git commit -m "chore: prepare for release"

# または強制実行（非推奨）
npm version patch --force
```

### Q: タグのプッシュに失敗する
```bash
# タグの確認
git tag -l

# タグを削除して再作成
git tag -d v${VERSION}
npm version patch -m "chore: bump version to %s"
git push origin v${VERSION}
```

### Q: GitHub Releaseの作成に失敗する
```bash
# GitHub CLI の認証確認
gh auth status

# 再ログイン
gh auth login

# 手動で作成
# https://github.com/t3-nico/boxlog-app/releases/new
```

### Q: デプロイが失敗する
```bash
# Vercelのログを確認
# https://vercel.com/t3-nico/boxlog-app/deployments

# ローカルでビルド確認
npm run build

# 環境変数の確認
npm run vercel:check
```

## チェックシート

### リリース実施チェックシート

```markdown
## リリース v${VERSION} チェックシート

### リリース前
- [ ] npm run lint - 成功
- [ ] npm run typecheck - 成功
- [ ] npm run test:run - 成功
- [ ] npm run build - 成功
- [ ] CHANGELOG.md 更新済み
- [ ] リリースノート作成済み
- [ ] マイルストーンの全Issue/PRクローズ済み

### リリース実行
- [ ] バージョンアップ実行
- [ ] Git push 完了
- [ ] Tag push 完了
- [ ] GitHub Release作成完了

### リリース後
- [ ] Vercelデプロイ成功
- [ ] 本番環境動作確認OK
- [ ] Sentryエラー監視OK
- [ ] マイルストーンクローズ
- [ ] チームへ通知完了

### 日時
- 開始: YYYY-MM-DD HH:MM
- 完了: YYYY-MM-DD HH:MM
- 実施者: @username
```

## 参考リンク

- [VERSIONING.md](VERSIONING.md) - バージョニングルール
- [CHANGELOG.md](../../CHANGELOG.md) - 変更履歴
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/ja/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Vercel Deployments](https://vercel.com/docs/deployments/overview)
