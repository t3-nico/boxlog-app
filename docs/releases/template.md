# Release vX.Y.Z

**リリース日**: YYYY-MM-DD

## 🎯 概要

このリリースの主な変更点を簡潔に記載

---

## 📋 変更内容

### ✨ 新機能 (Added)

- 新機能1の説明
- 新機能2の説明

### 🔄 変更 (Changed)

- 変更1の説明
- 変更2の説明

### 🐛 バグ修正 (Fixed)

- 修正1の説明
- 修正2の説明

### ⚠️ 破壊的変更 (Breaking Changes)

- 破壊的変更がある場合、詳細に記載
- マイグレーション手順も記載

### 🗑️ 削除 (Removed)

- 削除された機能や非推奨になった機能

### 🔒 セキュリティ (Security)

- セキュリティ関連の修正

---

---

**Full Changelog**: https://github.com/t3-nico/boxlog-app/compare/v{前バージョン}...v{今回バージョン}

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**

---

## 📝 使い方

### リリースノート作成時（プロジェクトルート）

1. このテンプレートをコピー

   ```bash
   cp docs/releases/template.md RELEASE_NOTES_vX.Y.Z.md
   ```

2. バージョン番号を置換
   - `vX.Y.Z` → 実際のバージョン（例: `v0.4.0`）
   - `v{前バージョン}` → 前回のバージョン（例: `v0.3.0`）
   - `v{今回バージョン}` → 今回のバージョン（例: `v0.4.0`）

3. 変更内容を記載

4. **必須**: Full Changelog リンクが正しいことを確認

   ```bash
   grep "Full Changelog" RELEASE_NOTES_vX.Y.Z.md
   # 結果: ✅ リンクが含まれている
   ```

5. GitHub Release作成時にこのファイルを使用
   ```bash
   gh release create vX.Y.Z \
     --title "vX.Y.Z: {簡潔な説明}" \
     --notes-file RELEASE_NOTES_vX.Y.Z.md
   ```

### ⚠️ 注意事項

- リリースノートファイルは**プロジェクトルート**に配置（`RELEASE_NOTES_vX.Y.Z.md`）
- **Full Changelog リンクは必須**（RELEASE_CHECKLIST.md で二重チェック）
- バージョン番号は package.json と一致させること
