/**
 * 設定ローダー - 定数定義
 */

/**
 * 📁 設定ファイルパス定義
 */
export const CONFIG_PATHS = {
  /** ベース設定 */
  base: './config/base.json',
  /** 環境別設定 */
  environment: {
    development: './config/development.json',
    staging: './config/staging.json',
    production: './config/production.json',
  },
  /** ローカル設定（Git除外対象） */
  local: './config/local.json',
  /** 環境変数マッピング */
  envMapping: './config/env-mapping.json',
} as const;

/**
 * 🌍 環境変数から設定マッピング
 */
export const ENV_VAR_MAPPINGS = {
  // アプリケーション
  'app.name': 'APP_NAME',
  'app.version': 'APP_VERSION',
  'app.environment': 'NODE_ENV',
  'app.baseUrl': 'NEXT_PUBLIC_APP_URL',
  'app.debug': 'DEBUG',

  // データベース
  'database.host': 'DB_HOST',
  'database.port': 'DB_PORT',
  'database.name': 'DB_NAME',
  'database.username': 'DB_USER',
  'database.password': 'DB_PASSWORD',
  'database.ssl': 'DB_SSL',

  // 認証
  'auth.jwtSecret': 'JWT_SECRET',
  'auth.jwtExpiresIn': 'JWT_EXPIRES_IN',

  // メール
  'email.host': 'SMTP_HOST',
  'email.port': 'SMTP_PORT',
  'email.username': 'SMTP_USER',
  'email.password': 'SMTP_PASSWORD',
  'email.from': 'SMTP_FROM',

  // 外部API
  'apis.openai.apiKey': 'OPENAI_API_KEY',
  'apis.vercel.token': 'VERCEL_TOKEN',

  // サーバー
  'server.port': 'PORT',
  'server.host': 'HOST',
  'server.session.secret': 'SESSION_SECRET',
} as const;
