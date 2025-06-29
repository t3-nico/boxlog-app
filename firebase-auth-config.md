# Firebase Authentication 設定

## 1. Firebase プロジェクト作成
- Firebase コンソールから新しいプロジェクトを作成します。
- Web アプリを追加し、構成オブジェクトを取得します。

## 2. 環境変数設定
`.env.local` に以下を追加します。
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 3. 認証プロバイダーの有効化
- Email/Password 認証を有効にします。
- 必要に応じて Google や Apple の OAuth プロバイダーも有効にします。

## 4. セキュリティ
- ドメイン許可設定を正しく行う
- 不要なプロバイダーを無効化する
