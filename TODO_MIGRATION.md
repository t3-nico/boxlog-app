# TODO: Supabase マイグレーション適用が必要

> **このファイルはマイグレーション適用後に削除してください**

## 必要な作業

### attachmentsバケットのマイグレーション適用

Supabase UI Library参考にDropzoneコンポーネントを追加しました。
汎用ファイルアップロード用の `attachments` バケットを使用するには、マイグレーションの適用が必要です。

### コマンド

```bash
# ローカル開発環境
supabase migration up --local

# 本番環境
supabase db push
```

### マイグレーションファイル

`supabase/migrations/20251218072948_create_attachments_bucket.sql`

### 設定内容

| 項目               | 値                                               |
| ------------------ | ------------------------------------------------ |
| バケット名         | `attachments`                                    |
| ファイルサイズ制限 | 10MB                                             |
| 許可MIMEタイプ     | 画像、PDF、テキスト                              |
| RLSポリシー        | 認証ユーザーのみ自分のフォルダにアップロード可能 |

## 備考

- **AvatarDropzone（プロフィール画像）** は既存の `avatars` バケットを使用するため、**すぐに動作します**
- **汎用Dropzone** を使う場合のみ、このマイグレーション適用が必要です

## 関連コミット

- `bb374d7` feat(storage): Supabase UI Library参考にDropzoneコンポーネント追加
- `74639b1` feat(settings): AvatarDropzoneでプロフィール画像アップロード改善
- `cde90ee` feat(storage): attachmentsバケット用マイグレーション追加
