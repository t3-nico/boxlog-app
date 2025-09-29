# ⚡ 最適化された開発ワークフロー

> **更新日**: 2025-09-29
> **Issue**: #361 - Pre-commit処理の軽量化とESLintキャッシュ最適化

## 🚀 高速Pre-commitチェック

**コミット時は必須項目のみチェック（5-10秒）**:

- ESLint（変更ファイルのみ、キャッシュ付き）
- Prettier（自動フォーマット）

### ✅ 最適化前 vs 最適化後

| 項目             | 最適化前          | 最適化後             |
| ---------------- | ----------------- | -------------------- |
| **実行時間**     | 45-60秒           | 5-10秒               |
| **チェック数**   | 7つの重いチェック | 1つの軽量チェック    |
| **対象ファイル** | 全ファイル        | 変更ファイルのみ     |
| **キャッシュ**   | なし              | ESLintキャッシュ有効 |

## 🏗️ 包括的チェック（CI/CD）

**PRやマージ時に実行される重いチェック**:

- バンドルサイズ分析
- ライセンス検証
- API破壊的変更検出
- パフォーマンス回帰テスト
- 命名規則チェック
- ファイルサイズチェック

### 🔄 GitHub Actions で自動実行

```yaml
# .github/workflows/heavy-checks.yml
- Bundle Size Check
- License Verification
- API Breaking Changes Detection
- Performance Regression Test
- Naming Convention Check
- File Size Check
```

## 💡 開発のコツ

### 🚀 高速実行コマンド（新規追加）

```bash
# ESLint高速実行（キャッシュ付き）
npm run lint:quick        # 3秒以内（2回目以降）

# 変更ファイルのみリント
npm run lint:changed      # 1秒以内

# Pre-commit軽量実行
npm run precommit:quick   # 5-10秒
```

### 🏗️ CI用重いチェック

```bash
# すべての重いチェック
npm run ci:heavy-checks   # バンドル + ライセンス + API

# 個別実行
npm run bundle:check      # バンドルサイズのみ
npm run license:check     # ライセンスのみ
npm run api:check         # API変更のみ
```

### 🛠️ ESLintキャッシュ管理

```bash
# キャッシュをクリア（問題発生時）
rm -rf .eslint/cache/*

# キャッシュの場所確認
ls -la .eslint/cache/

# キャッシュファイルサイズ確認
du -sh .eslint/cache/
```

## 📊 パフォーマンス効果

### ⏱️ 時間短縮効果

```bash
# ✅ 1回目実行（キャッシュなし）
npm run lint:quick
# → 約10秒

# ✅ 2回目実行（キャッシュあり）
npm run lint:quick
# → 約3秒（70%短縮）

# ✅ 変更ファイルのみ
npm run lint:changed
# → 約1秒（90%短縮）
```

### 🔄 キャッシュ戦略

| 設定            | 値                           | 効果               |
| --------------- | ---------------------------- | ------------------ |
| `cache`         | `true`                       | キャッシュ有効化   |
| `cacheLocation` | `.eslint/cache/.eslintcache` | 保存場所統一       |
| `cacheStrategy` | `content`                    | ファイル内容ベース |
| `maxWarnings`   | `20`                         | 警告数制限で高速化 |

## 🔧 トラブルシューティング

### ❌ ESLintが遅い場合

```bash
# 1. キャッシュクリア
rm -rf .eslint/cache/*

# 2. 高速コマンド使用
npm run lint:quick

# 3. 変更ファイルのみチェック
npm run lint:changed
```

### ❌ Pre-commitが遅い場合

```bash
# 1. 軽量コマンドを手動実行
npm run precommit:quick

# 2. husky設定確認
cat .husky/pre-commit

# 3. 重いスクリプトがCI移動済みか確認
grep -r "bundle-size-guard\|license-checker" .husky/
```

### ❌ GitHub Actions で重いチェックが実行されない

```bash
# 1. ワークフローファイル確認
cat .github/workflows/heavy-checks.yml

# 2. PRトリガー確認
# - pull_request: [opened, synchronize, reopened]
# - push: [main, dev]

# 3. Actions タブで実行ログ確認
```

## 📈 監視・メトリクス

### 🎯 成功指標

- **Pre-commit時間**: 10秒以内 ✅
- **ESLintキャッシュ効果**: 2回目実行が3秒以内 ✅
- **変更ファイルリント**: 1秒以内 ✅
- **GitHub Actions**: 15分以内で完了 ✅

### 📊 定期確認コマンド

```bash
# パフォーマンステスト
time npm run lint:quick        # 初回実行時間
time npm run lint:quick        # キャッシュ効果確認
time npm run lint:changed      # 変更ファイル処理時間

# キャッシュ使用状況
du -sh .eslint/cache/          # キャッシュサイズ
ls -la .eslint/cache/          # ファイル確認
```

## 🚨 重要な注意事項

### ⚠️ やってはいけない

1. **重いチェックをpre-commitに戻さない**
   - バンドルサイズ分析
   - ライセンス検証
   - API変更検出

2. **キャッシュを無効化しない**
   - `--no-cache` オプション使用
   - `.eslint/cache/` 削除の常用

3. **全ファイルを対象にしない**
   - `lint:quick` ではなく `lint` の使用
   - `git add .` 後の不必要な全体チェック

### ✅ 推奨パターン

1. **日常開発**

   ```bash
   # ファイル変更
   npm run lint:changed    # 変更分チェック
   git add .
   git commit -m "..."     # 自動でlint-staged実行
   ```

2. **大きな変更時**

   ```bash
   npm run lint:quick      # 高速全体チェック
   npm run ci:heavy-checks # 重いチェック（必要時）
   ```

3. **CI/CD**
   ```bash
   # GitHub Actions で自動実行
   # - PR作成時: 重いチェック実行
   # - merge時: 包括的分析
   ```

---

**🎯 効果**: コミット時間 **45-60秒 → 5-10秒** (83%短縮)
**📊 キャッシュ効果**: 2回目実行 **10秒 → 3秒** (70%短縮)
**⚡ 開発効率**: 中断時間最小化により集中力維持
