# Compass自動同期セットアップガイド

## 🎯 概要
CompassリポジトリとAppリポジトリ間のサブモジュール自動同期システムの設定方法

## ⚙️ 必要な設定

### 1. Personal Access Token (PAT) 作成

1. GitHub Settings: https://github.com/settings/tokens
2. "Generate new token (classic)" を選択
3. 権限設定:
   - ✅ `repo` - リポジトリへのフルアクセス
   - ✅ `workflow` - GitHub Actionsワークフローの更新
4. トークンを安全に保存

### 2. Compass側シークレット設定

- リポジトリ: `t3-nico/boxlog-compass`
- Settings → Secrets and variables → Actions
- シークレット名: `APP_REPO_TOKEN`
- 値: 作成したPAT

### 3. App側権限設定

- リポジトリ: `t3-nico/boxlog-app`  
- Settings → Actions → General
- 必要な権限:
  - ✅ Allow all actions and reusable workflows
  - ✅ Read and write permissions
  - ✅ Allow GitHub Actions to create and approve pull requests

## 🔄 動作フロー

1. **Compass更新**: dev/main ブランチにpush
2. **Trigger**: `trigger-app-sync.yml` 実行
3. **Webhook**: App側に `repository_dispatch` 送信
4. **同期**: `compass-sync.yml` 実行、PR自動作成

## 🧪 テスト方法

### 手動テスト
```bash
# App側でワークフローを手動実行
gh workflow run compass-sync.yml
```

### Compass更新テスト
```bash
# Compass側で小さな変更をコミット
cd compass
echo "Test update $(date)" >> test-file.txt
git add test-file.txt
git commit -m "test: 自動同期テスト"
git push origin dev
```

## ⚠️ トラブルシューティング

### よくある問題

1. **権限エラー**: PATの権限不足
   - 解決: repo, workflow権限を確認

2. **Webhook失敗**: APP_REPO_TOKEN未設定
   - 解決: Compass側シークレット確認

3. **PR作成失敗**: App側権限不足  
   - 解決: Actions権限設定確認

### ログ確認場所

- Compass: https://github.com/t3-nico/boxlog-compass/actions
- App: https://github.com/t3-nico/boxlog-app/actions

## 📝 注意事項

- PATは定期的に更新が必要
- 自動PRは手動でレビュー・マージ推奨
- 大きな変更は手動確認を推奨

---

*最終更新: 2025-01-28*