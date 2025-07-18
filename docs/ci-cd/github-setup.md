# GitHub設定手順 - ステップバイステップガイド

CI/CDを完全に動作させるためのGitHub側設定手順です。

## 📋 チェックリスト

- [ ] 1. GitHub Actions有効化
- [ ] 2. Vercel Secretsの設定
- [ ] 3. Branch Protection Rules設定（推奨）

---

## 🔧 1. GitHub Actions有効化

### 手順
1. GitHubリポジトリページを開く
2. **Settings** タブをクリック
3. 左サイドバーから **Actions** → **General** を選択
4. **Actions permissions** で以下を選択：
   ```
   ✅ Allow all actions and reusable workflows
   ```
5. **Save** をクリック

### 確認方法
- リポジトリの **Actions** タブでワークフローが表示されるか確認
- プッシュ後にCI/CDが自動実行されるか確認

---

## 🔐 2. Vercel Secrets設定

### 2-1. Vercel側での準備

#### VERCEL_TOKEN取得
1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 右上のアバター → **Settings** をクリック
3. 左サイドバーから **Tokens** を選択
4. **Create Token** をクリック
5. Token名を入力（例：`github-actions-boxlog`）
6. **Create** をクリック
7. 🔥**重要**: 表示されたトークンをコピー（再表示不可）

#### ORG_ID と PROJECT_ID取得
**方法1: Vercel CLI（推奨）**
```bash
# プロジェクトルートで実行
npx vercel link

# 設定ファイル確認
cat .vercel/project.json
```

**方法2: Vercel Dashboard**
1. Vercelダッシュボードでプロジェクト選択
2. **Settings** → **General**
3. **Project ID** と **Team ID**（ORG_ID）をコピー

### 2-2. GitHub側での設定

1. GitHubリポジトリページを開く
2. **Settings** タブをクリック
3. 左サイドバーから **Secrets and variables** → **Actions** を選択
4. **New repository secret** をクリック
5. 以下の3つのSecretを追加：

#### Secret 1: VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Secret: vrl_xxxxxxxxxxxxxxxxxxxxx
```

#### Secret 2: ORG_ID
```
Name: ORG_ID
Secret: team_xxxxxxxxxxxxxxxxxxxxx
```

#### Secret 3: PROJECT_ID
```
Name: PROJECT_ID
Secret: prj_xxxxxxxxxxxxxxxxxxxxx
```

### 確認方法
- Secrets一覧で3つのSecretが表示される
- 値は `***` で隠される（正常）

---

## 🛡️ 3. Branch Protection Rules設定（推奨）

### 手順
1. GitHubリポジトリページを開く
2. **Settings** タブをクリック
3. 左サイドバーから **Branches** を選択
4. **Add branch protection rule** をクリック
5. 以下を設定：

```
Branch name pattern: main

☑ Restrict pushes that create files larger than 100 MB
☑ Require status checks to pass before merging
☑ Require branches to be up to date before merging

Status checks found in the last week for this repository:
☑ lint-and-test
```

6. **Create** をクリック

### 効果
- mainブランチへの直接プッシュを防止
- CI/CDが成功しないとマージ不可
- コード品質の担保

---

## ✅ 動作確認

### 1. CI/CD実行確認
1. 何らかの変更をプッシュ
2. **Actions** タブで以下が実行されるか確認：
   - ✅ lint-and-test job
   - ✅ Lint, TypeCheck, Test, Build

### 2. PR作成確認
1. feature ブランチからPR作成
2. PR画面で以下が表示されるか確認：
   ```
   ⚡ lint-and-test — in progress / success
   ```

### 3. デプロイ確認（mainブランチのみ）
1. mainブランチにマージ
2. **Actions** タブで `deploy` jobが実行されるか確認
3. Vercelダッシュボードで新しいデプロイが表示されるか確認

---

## 🚨 トラブルシューティング

### GitHub Actionsが実行されない
- **原因**: Actions無効化
- **解決**: Settings → Actions → General で有効化

### Vercelデプロイが失敗する
- **原因**: Secrets設定不備
- **解決**: VERCEL_TOKEN, ORG_ID, PROJECT_IDを再確認

### lint-and-testが「required」として認識されない
- **原因**: 初回実行前はStatus checksが存在しない
- **解決**: 一度CI実行後にBranch Protection Rule設定

---

## 📞 サポート

問題が発生した場合：
1. GitHub Actions ログを確認
2. Vercel Function Logsを確認  
3. `docs/troubleshooting/common-issues.md` を参照