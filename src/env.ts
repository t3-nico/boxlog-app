import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  /**
   * サーバーサイド環境変数
   * クライアントからアクセス不可
   */
  server: {
    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // Sentry
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),

    // Database
    DATABASE_URL: z.string().url().optional(),
    DIRECT_URL: z.string().url().optional(),

    // Node環境
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * クライアントサイド環境変数
   * ブラウザからアクセス可能（NEXT_PUBLIC_プレフィックス必須）
   */
  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

    // App設定
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_APP_VERSION: z.string().optional(),

    // Sentry
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

    // Analytics
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  },

  /**
   * ランタイム環境変数のマッピング
   * ビルド時に検証される
   */
  runtimeEnv: {
    // Server
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
  },

  /**
   * 検証をスキップする条件
   * ビルド時のみ検証、開発環境では緩和
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
