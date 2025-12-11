# Release vX.Y.Z

**リリース日**: YYYY-MM-DD
**バージョン**: X.Y.Z

## 🎯 概要

このリリースの主な変更点を簡潔に記載（前回リリースからの全変更を網羅）

---

## 📋 変更内容

**⚠️ 重要**: 前回リリース（v{前バージョン}）から今回リリース（v{今回バージョン}）までの**全てのPR**を網羅して記載すること。リリースPR単体の変更だけでなく、期間中にマージされた全PRの内容を反映する。

### ✨ 新機能 (Added)

- **機能名** ([#PR番号](https://github.com/t3-nico/boxlog-app/pull/{PR番号}))
  - 詳細説明

### 🔄 変更 (Changed)

- **変更内容** ([#PR番号](https://github.com/t3-nico/boxlog-app/pull/{PR番号}))
  - 詳細説明

### 🐛 バグ修正 (Fixed)

- **修正内容** ([#PR番号](https://github.com/t3-nico/boxlog-app/pull/{PR番号}))
  - 詳細説明

### ⚠️ 破壊的変更 (Breaking Changes)

- 破壊的変更がある場合、詳細に記載
- マイグレーション手順も記載

### 🗑️ 削除 (Removed)

- **削除内容** ([#PR番号](https://github.com/t3-nico/boxlog-app/pull/{PR番号}))
  - 削除された機能や非推奨になった機能

### ⚡ パフォーマンス (Performance)

- **改善内容** ([#PR番号](https://github.com/t3-nico/boxlog-app/pull/{PR番号}))
  - 詳細説明

### 🔒 セキュリティ (Security)

- **対応内容** ([#PR番号](https://github.com/t3-nico/boxlog-app/pull/{PR番号}))
  - セキュリティ関連の修正

---

## 🔗 関連リンク

### Pull Requests

**⚠️ 重要**: 前回リリースから今回リリースまでの**全てのPR**をリストアップすること。

```bash
# 前回リリース以降のPR一覧を取得
gh pr list --state merged --base main --search "merged:>=YYYY-MM-DD" --json number,title --jq '.[] | "- [#\(.number)](https://github.com/t3-nico/boxlog-app/pull/\(.number)) - \(.title)"'
```

- [#PR番号](https://github.com/t3-nico/boxlog-app/pull/{PR番号}) - {PR説明}
- [#PR番号](https://github.com/t3-nico/boxlog-app/pull/{PR番号}) - {PR説明}
- ...（前回リリース以降の全PRを記載）

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v{前バージョン}...v{今回バージョン}

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**

---

## 📝 使い方

### リリースノート作成時

1. このテンプレートを `docs/releases/` にコピー

   ```bash
   VERSION="X.Y.Z"
   cp docs/releases/template.md docs/releases/RELEASE_NOTES_v${VERSION}.md
   ```

2. 前回リリース以降の全PRを取得

   ```bash
   # 前回リリースのタグを確認
   git tag --sort=-creatordate | head -5

   # 前回リリース以降のPR一覧を取得
   gh pr list --state merged --base main --limit 100 --json number,title,mergedAt \
     | jq -r '.[] | select(.mergedAt > "YYYY-MM-DDT00:00:00Z") | "- [#\(.number)](https://github.com/t3-nico/boxlog-app/pull/\(.number)) - \(.title)"'
   ```

3. バージョン番号とPR番号を置換
   - `vX.Y.Z` → 実際のバージョン（例: `v0.6.0`）
   - `X.Y.Z` → バージョン番号（vなし、例: `0.6.0`）
   - `YYYY-MM-DD` → リリース日（例: `2025-12-01`）
   - `v{前バージョン}` → 前回のバージョン（例: `v0.5.0`）
   - `v{今回バージョン}` → 今回のバージョン（例: `v0.6.0`）

4. 変更内容を記載
   - **全てのPR**をカテゴリ別に分類（Added, Changed, Fixed, Removed, Performance, Security）
   - 各項目にPR番号のリンクを追加

5. **必須**: Full Changelog リンクが正しいことを確認

   ```bash
   grep "Full Changelog" docs/releases/RELEASE_NOTES_v${VERSION}.md
   ```

6. GitHub Release作成時にこのファイルを使用

   ```bash
   gh release create v${VERSION} \
     --title "v${VERSION}: {簡潔な説明}" \
     --notes-file docs/releases/RELEASE_NOTES_v${VERSION}.md
   ```

### ⚠️ 注意事項

- リリースノートファイルは **`docs/releases/`** に配置（`docs/releases/RELEASE_NOTES_vX.Y.Z.md`）
- **前回リリースからの全PR**を網羅すること（リリースPR単体ではない）
- **Full Changelog リンクは必須**
- バージョン番号は package.json と一致させること

### 📋 リリースノートの品質基準

- [ ] 前回リリース以降の**全てのPR**が含まれている
- [ ] 各PRにリンクが付いている
- [ ] カテゴリ別に整理されている（Added, Changed, Fixed, etc.）
- [ ] Full Changelogリンクが正しい
- [ ] バージョン番号が正しい

---

**種類**: 📙 リファレンス
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
