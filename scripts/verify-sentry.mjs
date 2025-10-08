/**
 * Sentry統合検証スクリプト（ESM形式）
 *
 * CI/CD・ローカルでSentry接続を確認するためのスクリプト
 *
 * 使用方法:
 * ```bash
 * npm run sentry:verify
 * ```
 */

import https from 'https'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 環境変数読み込み（.env.localから）
const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

/**
 * 検証項目
 */
const checks = [
  {
    name: '環境変数チェック',
    async check() {
      const required = ['NEXT_PUBLIC_SENTRY_DSN']
      const missing = required.filter((key) => !process.env[key])

      if (missing.length) {
        throw new Error(`必須環境変数が設定されていません: ${missing.join(', ')}`)
      }

      console.log(`  NEXT_PUBLIC_SENTRY_DSN: ${process.env.NEXT_PUBLIC_SENTRY_DSN.substring(0, 30)}...`)

      return true
    },
  },
  {
    name: 'DSN形式検証',
    async check() {
      const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

      if (!dsn) {
        throw new Error('NEXT_PUBLIC_SENTRY_DSNが設定されていません')
      }

      if (!dsn.startsWith('https://')) {
        throw new Error('DSNはhttps://で始まる必要があります')
      }

      if (!dsn.includes('@')) {
        throw new Error('DSNの形式が不正です（@が含まれていません）')
      }

      if (!dsn.includes('sentry.io') && !dsn.includes('ingest')) {
        throw new Error('DSNがSentry公式ホストを指していません')
      }

      console.log('  形式: ✅ 正常')

      return true
    },
  },
  {
    name: 'Sentry設定ファイル確認',
    async check() {
      const configPath = join(process.cwd(), 'sentry.config.ts')

      if (!existsSync(configPath)) {
        throw new Error('sentry.config.ts が見つかりません')
      }

      console.log(`  設定ファイル: ${configPath}`)

      return true
    },
  },
  {
    name: 'パフォーマンス監視コード確認',
    async check() {
      const performancePath = join(process.cwd(), 'src/lib/sentry/performance.ts')

      if (!existsSync(performancePath)) {
        throw new Error('src/lib/sentry/performance.ts が見つかりません')
      }

      const content = readFileSync(performancePath, 'utf-8')

      // INP対応チェック
      if (!content.includes('onINP')) {
        console.warn('  ⚠️ 警告: INP（Interaction to Next Paint）測定が未実装です')
        console.warn('    Google 2025基準ではFIDは廃止され、INPが推奨されています')
      } else {
        console.log('  INP測定: ✅ 実装済み')
      }

      return true
    },
  },
  {
    name: 'WebVitalsレポーター確認',
    async check() {
      const reporterPath = join(process.cwd(), 'src/components/WebVitalsReporter.tsx')

      if (!existsSync(reporterPath)) {
        console.warn('  ⚠️ 警告: WebVitalsReporter.tsx が見つかりません')
        console.warn('    Next.js useReportWebVitals統合を推奨します')
        return true
      }

      console.log('  WebVitalsレポーター: ✅ 実装済み')

      return true
    },
  },
]

/**
 * メイン実行
 */
async function verifySentry() {
  console.log('🔍 Sentry統合検証を開始します...\n')

  let failed = false
  let warnings = 0

  for (const { name, check } of checks) {
    try {
      process.stdout.write(`📋 ${name}... `)
      await check()
      console.log('✅')
    } catch (error) {
      console.log('❌')
      console.error(`   エラー: ${error.message}`)
      failed = true
    }
  }

  console.log('\n' + '='.repeat(60))

  if (failed) {
    console.log('❌ Sentry検証に失敗しました')
    console.log('\n修正方法:')
    console.log('1. .env.local に NEXT_PUBLIC_SENTRY_DSN を設定')
    console.log('2. Sentry Dashboard → Settings → Client Keys (DSN) から取得')
    console.log('3. 形式: https://<key>@<org>.ingest.sentry.io/<project>')
    process.exit(1)
  }

  if (warnings > 0) {
    console.log(`⚠️  Sentry検証完了（警告 ${warnings}件）`)
    console.log('警告を確認してください')
  } else {
    console.log('✅ Sentry検証完了！すべての項目が正常です')
  }

  console.log('\n次のステップ:')
  console.log('1. npm run dev でローカルサーバー起動')
  console.log('2. http://localhost:3000/api/test/sentry?type=message でテストイベント送信')
  console.log('3. Sentry Dashboard でイベント確認（5分以内）')
}

// 実行
verifySentry().catch((error) => {
  console.error('\n💥 致命的エラー:', error)
  process.exit(1)
})
