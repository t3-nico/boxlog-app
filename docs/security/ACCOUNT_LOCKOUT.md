# アカウントロックアウト機能

## 概要

OWASP推奨のブルートフォース攻撃対策として、アカウントロックアウト機能を実装しました。

## セキュリティポリシー

- **5回失敗**: 15分間ロックアウト
- **10回以上失敗**: 1時間ロックアウト
- **ログイン成功時**: カウンターリセット

## データベースセットアップ

### 1. Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択
3. 左サイドバーから「SQL Editor」を選択

### 2. マイグレーションSQLを実行

`docs/database/migrations/login_attempts.sql` の内容をコピーして実行してください。

このSQLは以下を実行します：

1. `login_attempts` テーブル作成
2. パフォーマンス最適化のためのインデックス作成
3. Row Level Security (RLS) 有効化
4. サービスロールのみアクセス可能なポリシー設定
5. 24時間以上古いレコードの自動削除関数
6. トリガー設定（レコード挿入時に10%の確率で古いデータを削除）

### 3. 動作確認

```sql
-- テーブルが作成されたか確認
SELECT * FROM public.login_attempts LIMIT 1;

-- インデックスが作成されたか確認
SELECT indexname FROM pg_indexes WHERE tablename = 'login_attempts';

-- RLSが有効か確認
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'login_attempts';
```

## アーキテクチャ

### ファイル構成

```
src/features/auth/
├── lib/
│   └── account-lockout.ts          # ロックアウトロジック
└── components/
    └── LoginForm.tsx                # ログインフォーム（UI統合）

docs/
├── database/
│   └── migrations/
│       └── login_attempts.sql      # データベースマイグレーション
└── security/
    └── ACCOUNT_LOCKOUT.md          # このドキュメント
```

### 処理フロー

```
1. ユーザーがログインフォームにメールアドレス入力
   ↓
2. メールアドレス入力完了時、ロックアウトステータスをチェック
   - login_attempts テーブルから失敗回数を取得
   - 5回以上失敗していた場合、ロックアウト警告を表示
   ↓
3. ログインボタンクリック時
   ↓
4. 再度ロックアウトステータスをチェック
   - ロックされている場合、処理を中断
   ↓
5. Supabase認証を実行
   ↓
6a. ログイン成功の場合:
   - login_attempts に成功レコードを記録
   - 過去の失敗履歴を削除（カウンターリセット）
   - MFAチェック → リダイレクト
   ↓
6b. ログイン失敗の場合:
   - login_attempts に失敗レコードを記録
   - 新しいロックアウトステータスを取得
   - ロックアウト条件を満たす場合、エラーメッセージ表示
```

## UI/UX

### ロックアウト警告表示

ログインフォーム上部に以下の警告が表示されます：

```
🛡️ アカウントがロックされています

セキュリティのため、このアカウントは一時的にロックされています。
15分後に再試行してください。

失敗回数: 5回
```

### ボタン無効化

ロックアウト中は「ログイン」ボタンが無効化されます。

## i18n対応

### 日本語 (ja.json)

```json
{
  "auth": {
    "errors": {
      "accountLocked": "セキュリティのため、このアカウントは一時的にロックされています。{minutes}分後に再試行してください。",
      "accountLockedTitle": "アカウントがロックされています",
      "failedAttempts": "失敗回数: {count}回"
    }
  }
}
```

### 英語 (en.json)

```json
{
  "auth": {
    "errors": {
      "accountLocked": "For security reasons, this account has been temporarily locked. Please try again in {minutes} minutes.",
      "accountLockedTitle": "Account Locked",
      "failedAttempts": "Failed attempts: {count}"
    }
  }
}
```

## セキュリティ考慮事項

### ✅ 実装済み

1. **メールアドレスベースのトラッキング**: IPアドレスではなくメールアドレスでトラッキング
2. **エクスポネンシャルバックオフ**: 5回 → 15分、10回 → 60分
3. **自動リセット**: ログイン成功時にカウンターをリセット
4. **RLS保護**: 一般ユーザーは自分の失敗履歴を見ることができない
5. **自動クリーンアップ**: 24時間以上古いレコードは自動削除

### ⚠️ 今後の改善案

1. **IPアドレストラッキングの追加**: 同一IPからの複数アカウント攻撃を検出
2. **管理者通知**: 異常な失敗パターンを管理者に通知
3. **CAPTCHA統合**: ロックアウト後の認証にCAPTCHAを要求
4. **ホワイトリスト**: 信頼できるIPアドレスのホワイトリスト機能

## トラブルシューティング

### テーブルが作成されない

**原因**: サービスロールの権限不足
**解決策**: Supabase Dashboard の SQL Editor で実行（自動的にサービスロールで実行される）

### ロックアウトが解除されない

**原因**: タイムゾーンの問題
**解決策**: `attempt_time` は `TIMESTAMPTZ` 型（タイムゾーン付き）なので、自動的にUTCで保存されます

### データが削除されない

**原因**: トリガーが正しく設定されていない
**解決策**: 以下のSQLで確認

```sql
SELECT * FROM pg_trigger WHERE tgname = 'cleanup_login_attempts_trigger';
```

## パフォーマンス

### インデックス最適化

- `email` カラムにインデックス作成済み（検索高速化）
- `attempt_time` カラムに降順インデックス作成済み（最新レコード取得の高速化）

### クエリパフォーマンス

- 失敗回数カウント: `O(log n)` (インデックス使用)
- 最終失敗時刻取得: `O(log n)` (インデックス + LIMIT 1)

## 関連Issue

- [#565 - セキュリティ監査](https://github.com/t3-nico/boxlog-app/issues/565)
  - HIGH #4: アカウントロックアウトの実装 ✅ 完了

## 参考資料

- [OWASP Authentication Cheat Sheet - Account Lockout](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Rate Limits](https://supabase.com/docs/guides/platform/going-into-prod#auth-rate-limits)
