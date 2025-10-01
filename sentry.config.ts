/**
 * Sentry統合設定 - サーバー・Edge共通
 * Next.js 14+ 対応
 */
import * as Sentry from '@sentry/nextjs'

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  })
}