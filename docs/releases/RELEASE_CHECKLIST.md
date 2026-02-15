# リリースチェックリスト

このチェックリストは、**リリース作業時に必ず確認すべき項目**をまとめたものです。
リリースの度に、このファイルを開いて、上から順に確認してください。

## 🎯 このドキュメントの使い方

1. **リリース作業開始前に、このファイルを必ず開く**
2. **上から順番に、各項目を確認する**
3. **全ての項目が✅になったら、次のステップに進む**
4. **問題があれば、必ず修正してからマージ/リリースする**

---

## 📋 Phase 0: リリース準備（PRマージ前）

### 0.1 バージョン番号の確認

- [ ] **リリースするバージョン番号を決定**
  - PATCH: バグ修正のみ（例: 0.3.0 → 0.3.1）
  - MINOR: 新機能追加（例: 0.3.0 → 0.4.0）
  - MAJOR: 破壊的変更（例: 0.3.0 → 1.0.0）

  ```bash
  # 現在のバージョンを確認
  cat package.json | grep version

  # 今回のリリースバージョン（例）
  VERSION="0.4.0"
  ```

- [ ] **既存のリリースタグと重複していないことを確認**

  ```bash
  # 既存のリリースを確認
  gh release list

  # 確認: v${VERSION} が既に存在しないこと
  gh release view v${VERSION} 2>/dev/null && echo "❌ Already exists!" || echo "✅ OK"
  ```

### 0.2 コード品質の確認

- [ ] **Lintチェック**

  ```bash
  npm run lint
  # 結果: ✅ 全てパス
  ```

- [ ] **型チェック**

  ```bash
  npm run typecheck
  # 結果: ✅ エラーなし
  ```

- [ ] **テスト**

  ```bash
  npm run test:run
  # 結果: ✅ 全テストパス
  ```

- [ ] **ビルド**
  ```bash
  npm run build
  # 結果: ✅ ビルド成功
  ```

### 0.3 package.jsonのバージョン更新（⚠️ 重要）

- [ ] **package.jsonとpackage-lock.jsonのバージョンを更新**

  ```bash
  # npmコマンドで自動更新（推奨）
  # PATCH: バグ修正のみ（例: 0.3.0 → 0.3.1）
  npm version patch --no-git-tag-version

  # MINOR: 新機能追加（例: 0.3.0 → 0.4.0）
  npm version minor --no-git-tag-version

  # MAJOR: 破壊的変更（例: 0.3.0 → 1.0.0）
  npm version major --no-git-tag-version

  # または手動で編集
  # 確認: 現在のバージョン
  cat package.json | grep version

  # 確認: 両方のファイルが更新されたこと
  git diff package.json package-lock.json
  ```

- [ ] **変更をコミット**

  ```bash
  git add package.json package-lock.json
  git commit -m "chore: bump version to v${VERSION}

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```

### 0.4 ドキュメントの準備

- [ ] **前回リリース以降の全PRを取得**

  ```bash
  # 前回リリースのタグを確認
  git tag --sort=-creatordate | head -5

  # 前回リリース以降のPR一覧を取得（例: v0.5.0以降）
  gh pr list --state merged --base main --limit 100 --json number,title,mergedAt \
    | jq -r '.[] | select(.mergedAt > "YYYY-MM-DDT00:00:00Z") | "- [#\(.number)](https://github.com/t3-nico/dayopt/pull/\(.number)) - \(.title)"'
  ```

- [ ] **リリースノートファイルの作成**

  ```bash
  # テンプレートをコピー（配置場所: docs/releases/）
  cp docs/releases/template.md docs/releases/RELEASE_NOTES_v${VERSION}.md

  # ✅ 確認: ファイルが存在すること
  ls -la docs/releases/RELEASE_NOTES_v${VERSION}.md
  ```

- [ ] **リリースノートの内容確認**
  - [ ] バージョン番号が正しい（package.jsonと一致）
  - [ ] リリース日が正しい
  - [ ] **前回リリース以降の全てのPRが含まれている**（⚠️ 最重要）
  - [ ] 各PRにリンクが付いている
  - [ ] カテゴリ別に整理されている（Added, Changed, Fixed, Removed, Performance, Security）
  - [ ] **Full Changelogリンクが含まれている**
    ```markdown
    **Full Changelog**: https://github.com/t3-nico/dayopt/compare/v{前バージョン}...v{今回バージョン}
    ```
  - [ ] Breaking Changesがあれば明記されている
  - [ ] Migration Guideが必要なら含まれている

- [ ] **変更をコミット**

  ```bash
  git add docs/releases/RELEASE_NOTES_v${VERSION}.md
  git commit -m "docs(release): add release notes for v${VERSION}

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```

---

## 📋 Phase 1: PRマージ

### 1.1 PR作成

- [ ] **PRタイトルが適切**
  - 形式: `Release v{VERSION}: {簡潔な説明}`
  - 例: `Release v0.4.0: Tags機能完全実装とGoogleドライブ風UI/UX改善`

- [ ] **PR説明が適切**
  - リリースノートへのリンク
  - 主要な変更点のサマリー
  - Breaking Changesの明記（あれば）

### 1.2 CI/CDチェック

- [ ] **全てのCI/CDチェックが通過**

  ```bash
  gh pr checks {PR番号}
  # 結果: ✅ 全て pass
  ```

  - [ ] TypeScript ✅
  - [ ] ESLint & Prettier ✅
  - [ ] Unit Tests ✅
  - [ ] E2E Tests（全ブラウザ） ✅
  - [ ] Build ✅
  - [ ] Security ✅
  - [ ] Accessibility ✅
  - [ ] Bundle Size ✅
  - [ ] Lighthouse CI ✅
  - [ ] Vercel Deployment ✅

### 1.3 PRマージ

- [ ] **PRをマージ**

  ```bash
  gh pr merge {PR番号} --squash --delete-branch
  ```

- [ ] **マージ完了確認**
  ```bash
  git checkout main
  git pull origin main
  git log -1 --oneline
  # 結果: ✅ マージコミットが表示される
  ```

---

## 📋 Phase 2: リリースタグ作成

### 2.1 mainブランチの最新を取得

- [ ] **mainブランチに切り替えて最新を取得**

  ```bash
  git checkout main
  git pull origin main
  ```

- [ ] **package.jsonのバージョンが正しいことを確認**
  ```bash
  cat package.json | grep version
  # 結果: "version": "${VERSION}"
  ```

### 2.2 Gitタグの作成とプッシュ

- [ ] **Gitタグを作成してプッシュ**

  ```bash
  # タグを作成
  git tag v${VERSION}

  # タグをプッシュ
  git push origin v${VERSION}
  ```

### 2.3 GitHub Releaseの自動作成を確認

- [ ] **GitHub Actionsワークフローが起動したことを確認**

  ```bash
  # ワークフローの実行状況を確認
  gh run list --workflow=create-release.yml --limit 1

  # 詳細を確認
  gh run watch
  ```

- [ ] **リリースが自動作成されたことを確認**

  ```bash
  # 少し待ってからリリースを確認
  gh release view v${VERSION} --web
  ```

### 2.4 リリース内容の最終確認

- [ ] **リリースページで確認**
  - [ ] バージョン番号が正しい
  - [ ] タイトルが適切
  - [ ] リリースノートが正しく表示されている
  - [ ] Full Changelogリンクが機能している
  - [ ] Assetsがある場合、正しく添付されている

**注意**: GitHub Actionsワークフローが失敗した場合は、手動で作成：

```bash
gh release create v${VERSION} \
  --title "v${VERSION}: {簡潔な説明}" \
  --notes-file docs/releases/RELEASE_NOTES_v${VERSION}.md
```

---

## 📋 Phase 3: デプロイ確認

### 3.1 Vercelデプロイの確認

- [ ] **Vercelで自動デプロイが成功**
  - Vercel Dashboard: https://vercel.com/t3-nicos-projects/dayopt

- [ ] **本番環境で動作確認**
  - [ ] サイトが正常に表示される
  - [ ] 新機能が動作する
  - [ ] 既存機能が正常に動作する
  - [ ] エラーが発生していない

### 3.2 監視・モニタリング

- [ ] **Sentryでエラー監視**
  - エラーが急増していないことを確認

---

## 📋 Phase 4: リリース後の作業

### 4.1 ドキュメント更新

- [ ] **README.mdのバージョン番号を更新（必要に応じて）**

### 4.2 通知・告知

- [ ] **チームに通知**（該当する場合）

- [ ] **関連Issueにコメント**
  ```bash
  gh issue comment {issue番号} \
    --body "Released in v${VERSION}: https://github.com/t3-nico/dayopt/releases/tag/v${VERSION}"
  ```

---

## ⚠️ よくある失敗と対策

### 失敗例1: 既存のリリースと重複するバージョンを作成

**対策**:

- ✅ Phase 0.1で既存リリースを確認
- ✅ `gh release view v${VERSION}` でチェック
- ✅ 既存バージョンが見つかった場合、必ず「v0.X.0じゃないですか？」と確認

### 失敗例2: package.jsonのバージョン更新を忘れる

**対策**:

- ✅ Phase 0.3（PRマージ前）で必ず更新
- ✅ `npm version minor/patch/major --no-git-tag-version` で自動更新
- ✅ package.json と package-lock.json 両方が更新されたことを確認

### 失敗例3: Full Changelogリンクが抜ける

**対策**:

- ✅ template.md をコピーして使用（リンクがあらかじめ含まれている）
- ✅ Phase 0.4で確認: `grep "Full Changelog" docs/releases/RELEASE_NOTES_v${VERSION}.md`

### 失敗例4: リリースノートファイル名の不整合

**対策**:

- ✅ ファイル名は必ず `docs/releases/RELEASE_NOTES_v{VERSION}.md`
- ✅ 例: `docs/releases/RELEASE_NOTES_v0.6.0.md`（`v`を含む）
- ✅ template.md をコピーする際にファイル名と配置場所を正しく指定

### 失敗例6: リリースノートに一部のPRしか含まれていない

**対策**:

- ✅ 前回リリース以降の**全てのPR**を取得してから記載
- ✅ `gh pr list --state merged` コマンドで漏れなく取得
- ✅ Phase 0.4で全PR取得を必須化
- ✅ リリースPR単体の変更だけでなく、期間中にマージされた全PRを含める

### 失敗例5: GitHub Releaseを手動作成し忘れる

**対策**:

- ✅ タグをプッシュすれば自動作成される（GitHub Actions）
- ✅ ワークフロー失敗時のみ手動作成が必要

---

## 🔗 関連ドキュメント

- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) - 詳細なリリースプロセス
- [VERSIONING.md](./VERSIONING.md) - バージョニングルール
- [template.md](./template.md) - リリースノートテンプレート

---

## 📝 チェックリスト完了

全ての項目が✅になったら、リリース完了です！

**リリース実施者**: @{username}
**リリース日時**: YYYY-MM-DD HH:MM
**バージョン**: v{VERSION}
**リリースURL**: https://github.com/t3-nico/dayopt/releases/tag/v{VERSION}

お疲れ様でした！ 🎉

---

**種類**: 📗 ハウツーガイド
**最終更新**: 2025-12-11
**所有者**: Dayopt 開発チーム
