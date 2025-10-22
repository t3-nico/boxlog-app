# Supabaseプロジェクト復旧ガイド

**状況**: プロジェクトが一時停止（Paused）状態
**原因**: 無料プランで一定期間使用されなかったため自動停止
**復旧期限**: 2025年11月18日まで（停止から90日以内）

---

## 🚨 現在の状況

```
⚠️ Project can be restored through the dashboard within the next 36 days

Free projects cannot be restored through the dashboard if they are paused
for more than 90 days. The latest that your project can be restored is by
18 Nov 2025. However, your database backup and Storage objects will still
be available for download thereafter.
```

**重要**:

- ✅ **データは安全**: データベースバックアップとStorageオブジェクトは保持されています
- ⏰ **復旧期限**: 36日以内にダッシュボードから復旧可能
- 🔄 **復旧時間**: 通常1-2分で完了

---

## 📋 復旧手順

### ステップ1: Supabase Dashboard にアクセス

1. https://supabase.com/dashboard にアクセス
2. 一時停止中のプロジェクトを選択

---

### ステップ2: プロジェクトを復旧（Restore）

#### 2-1. Restore/Resume ボタンをクリック

プロジェクトページに以下のようなボタンが表示されています：

```
┌─────────────────────────────────────┐
│  ⚠️ Project Paused                  │
│                                     │
│  [Restore Project]  [Download Data] │
└─────────────────────────────────────┘
```

「**Restore Project**」または「**Resume Project**」をクリック

#### 2-2. 復旧の確認

復旧には1-2分かかります。以下のステータスが表示されます：

```
Status: Restoring... → Active ✅
```

---

### ステップ3: プロジェクトの動作確認

#### 3-1. API認証情報の確認

復旧後、Settings → API に移動して以下を確認：

| 項目                 | 確認ポイント       |
| -------------------- | ------------------ |
| **Project URL**      | 変わっていないこと |
| **anon key**         | 変わっていないこと |
| **service_role key** | 変わっていないこと |

⚠️ **重要**: 通常、APIキーは変わりませんが、念のため確認してください。

#### 3-2. データベースの確認

Database → Tables で既存のテーブルが表示されるか確認：

```sql
-- SQL Editorで実行してテスト
SELECT COUNT(*) FROM auth.users;
```

---

### ステップ4: 環境変数の再確認

復旧後、プロジェクトURLとAPIキーが変更されていないことを確認：

```bash
# .env.local の内容を確認
cat .env.local | grep SUPABASE

# 以下のように表示されればOK
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

もしAPIキーが変更されていた場合は、`.env.local` を更新してください。

---

## ✅ 復旧完了の確認

### テスト1: 接続テスト

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで以下にアクセス
http://localhost:3000/ja/auth/signup
```

### テスト2: サインアップテスト

新規アカウントを作成してエラーがないか確認：

```
メール: test@example.com
パスワード: Test1234
```

**期待される動作**:

- ✅ エラーなくサインアップ完了
- ✅ `/ja/calendar` にリダイレクト
- ✅ Supabase Dashboard → Authentication → Users に表示

---

## 🔒 今後の自動停止を防ぐ方法

### 方法1: 定期的にアクセスする

無料プランでは**7日間アクティビティがない**と自動停止されます。

**推奨**: 週に1回以上、以下のいずれかを実行：

- アプリにアクセスしてサインイン/サインアウト
- Supabase Dashboard にアクセス
- API経由でデータベースクエリを実行

### 方法2: Health Check を設定（推奨）

週1回自動でAPIにアクセスするGitHub Actionsを設定：

```yaml
# .github/workflows/supabase-keepalive.yml
name: Supabase Keep Alive

on:
  schedule:
    # 毎週月曜日の午前9時（UTC）に実行
    - cron: '0 9 * * 1'
  workflow_dispatch: # 手動実行も可能

jobs:
  keepalive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase
        run: |
          curl -X GET "${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}/rest/v1/" \
            -H "apikey: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}"
```

### 方法3: Pro プランにアップグレード

月額 $25 で以下の利点：

- ✅ 自動停止なし
- ✅ より多いデータベース容量
- ✅ より多いストレージ
- ✅ カスタムドメイン

---

## 🚨 トラブルシューティング

### 問題1: Restore ボタンが見つからない

**確認ポイント**:

1. 正しいプロジェクトを選択しているか
2. プロジェクトのステータスが「Paused」になっているか
3. ブラウザをリロード

### 問題2: Restore に失敗する

**エラー例**: `Failed to restore project`

**解決策**:

1. 数分待ってから再試行
2. ブラウザのキャッシュをクリア
3. Supabase サポートに連絡（support@supabase.io）

### 問題3: APIキーが変更されている

**対処法**:

1. Settings → API で新しいキーをコピー
2. `.env.local` を更新
3. GitHub Secrets/Vercel環境変数も更新
4. 開発サーバーを再起動

---

## 📊 復旧後のチェックリスト

- [ ] プロジェクトのステータスが「Active」になっている
- [ ] API認証情報が正しい
- [ ] データベースのテーブルが表示される
- [ ] サインアップ/サインインが動作する
- [ ] 既存データが保持されている（該当する場合）
- [ ] Keep Alive の設定（推奨）

---

## 🔗 参考リンク

- [Supabase プロジェクト管理](https://supabase.com/docs/guides/platform/project-management)
- [無料プランの制限](https://supabase.com/docs/guides/platform/org-based-billing#free-plan)
- [Supabaseサポート](https://supabase.com/support)

---

## 次のステップ

復旧が完了したら、[SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md) に戻って認証設定を続けてください。
