# reCAPTCHA セットアップガイド

## 概要

BoxLogアプリでは、段階的なreCAPTCHA保護を実装しています：

```
通常時: CAPTCHAなし
  ↓
3回失敗: reCAPTCHA v3（バックグラウンド、スコア確認）
  ↓
5回失敗: アカウントロックアウト（15分間）
  ↓
ロックアウト解除後: reCAPTCHA v2 Invisible（必要時のみチャレンジ表示）
```

## 🚀 クイックスタート（開発環境）

### 1. テストキーを使用（推奨）

開発・テスト用に以下のテストキーを`.env.local`に追加してください：

```bash
# reCAPTCHA v3 テストキー（Google公式）
NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY_V3=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# reCAPTCHA v2 Invisible テストキー（Google公式）
NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V2=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY_V2=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**⚠️ 注意**: これらのテストキーは常に成功を返します。本番環境では必ず本番キーを使用してください。

### 2. 開発サーバーを再起動

```bash
npm run dev
```

### 3. 動作確認

1. ログインページにアクセス
2. 故意に3回ログイン失敗
3. reCAPTCHA v3がバックグラウンドで動作（見えない）
4. さらに失敗してロックアウト
5. 15分後（またはデータベースの`login_attempts`を削除）
6. ログインを試行 → reCAPTCHA v2チャレンジが表示される可能性

## 🔑 本番環境セットアップ

### ステップ1: Google reCAPTCHAアカウント作成

1. [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create) にアクセス
2. Googleアカウントでログイン

### ステップ2: reCAPTCHA v3サイトを登録

1. 「ラベル」: `BoxLog Production v3` などわかりやすい名前
2. 「reCAPTCHAタイプ」: **reCAPTCHA v3** を選択
3. 「ドメイン」:
   ```
   localhost          # ローカル開発用
   your-domain.com    # 本番環境
   *.vercel.app       # Vercel環境（オプション）
   ```
4. 「オーナー」: あなたのGmailアドレス
5. 「送信」をクリック

### ステップ3: reCAPTCHA v2サイトを登録

同様の手順で **reCAPTCHA v2 > Invisible reCAPTCHA badge** を選択して登録

### ステップ4: キーをコピー

登録後、以下の4つのキーが表示されます：

- **v3 サイトキー** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3`
- **v3 シークレットキー** → `RECAPTCHA_SECRET_KEY_V3`
- **v2 サイトキー** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V2`
- **v2 シークレットキー** → `RECAPTCHA_SECRET_KEY_V2`

### ステップ5: 環境変数を設定

#### ローカル開発（`.env.local`）

```bash
# reCAPTCHA v3 本番キー
NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3=6Lc...your-v3-site-key
RECAPTCHA_SECRET_KEY_V3=6Lc...your-v3-secret-key

# reCAPTCHA v2 Invisible 本番キー
NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V2=6Lc...your-v2-site-key
RECAPTCHA_SECRET_KEY_V2=6Lc...your-v2-secret-key
```

#### Vercel本番環境

1. Vercelダッシュボードにアクセス
2. プロジェクト選択 → Settings → Environment Variables
3. 上記4つの環境変数を追加
4. 環境: `Production`, `Preview`, `Development` すべて選択
5. 保存後、再デプロイ

## 🎯 実装状況

### 現在実装済み

- ✅ LoginForm: 段階的CAPTCHA保護（3回失敗 → v3、ロックアウト後 → v2）

### 今後の実装予定

- ⏳ PasswordResetForm: reCAPTCHA v3（全リクエスト）
- ⏳ SignupForm: reCAPTCHA v3（全リクエスト）

## 🔧 トラブルシューティング

### CAPTCHAが表示されない

**原因**: 環境変数が正しく設定されていない

**解決策**:

```bash
# 環境変数を確認
echo $NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3

# サーバーを再起動
npm run dev
```

### スコアが低すぎてブロックされる

**原因**: reCAPTCHA v3スコアが閾値（0.5）を下回っている

**解決策**:

- `src/lib/recaptcha/config.ts` の `SCORE_THRESHOLD.MODERATE` を調整
- 開発環境では `LENIENT: 0.3` を使用

### テストキーで本番環境にデプロイしてしまった

**危険**: テストキーは常に成功を返すため、セキュリティリスクがあります

**解決策**:

1. すぐにVercel環境変数を本番キーに変更
2. 再デプロイ
3. 動作確認

## 📚 関連ドキュメント

- [アカウントロックアウト](./ACCOUNT_LOCKOUT.md)
- [OWASP CAPTCHA Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)

## 🔗 関連Issue

- [#565 - セキュリティ監査](https://github.com/t3-nico/boxlog-app/issues/565)
  - HIGH #5: CAPTCHA導入 🚧 実装中
