#!/usr/bin/env node

/**
 * Sentry 接続テストスクリプト
 * 環境変数の確認とSentryへのテスト送信
 */

const fs = require('fs')
const path = require('path')

console.log('🔗 Sentry接続テスト開始\n')

// 1. 環境変数の確認
console.log('📋 1. 環境変数の確認')
const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local ファイルが見つかりません')
  console.log('💡 .env.local を作成して必要な環境変数を設定してください')
  process.exit(1)
}

require('dotenv').config({ path: envPath })

const requiredEnvs = ['NEXT_PUBLIC_SENTRY_DSN', 'SENTRY_ORG', 'SENTRY_PROJECT']

const optionalEnvs = ['SENTRY_AUTH_TOKEN', 'NEXT_PUBLIC_APP_VERSION']

let allEnvsSet = true

console.log('\n🔍 必須環境変数:')
requiredEnvs.forEach((env) => {
  const value = process.env[env]
  if (value && value !== 'your-actual-value' && value !== '') {
    console.log(`✅ ${env}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`❌ ${env}: 未設定または無効`)
    allEnvsSet = false
  }
})

console.log('\n🔍 オプション環境変数:')
optionalEnvs.forEach((env) => {
  const value = process.env[env]
  if (value && value !== 'your-auth-token' && value !== '') {
    console.log(`✅ ${env}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`⚠️  ${env}: 未設定`)
  }
})

if (!allEnvsSet) {
  console.log('\n❌ 必須環境変数が不足しています')
  console.log('📖 詳細は SENTRY_SETUP_GUIDE.md を参照してください')
  process.exit(1)
}

// 2. DSN形式の確認
console.log('\n📋 2. DSN形式の確認')
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const dsnPattern = /^https:\/\/[a-f0-9]+@[a-z0-9.-]+\.sentry\.io\/\d+$/

if (dsnPattern.test(dsn)) {
  console.log('✅ DSN形式: 正常')
} else {
  console.log('❌ DSN形式: 無効')
  console.log('💡 正しい形式: https://abc123@sentry.io/1234567')
  process.exit(1)
}

// 3. Sentry SDKのテスト
console.log('\n📋 3. Sentry SDK接続テスト')

try {
  const Sentry = require('@sentry/node')

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: 'test',
    debug: true,
    beforeSend(event) {
      console.log('📤 テストイベントをSentryに送信中...')
      return event
    },
  })

  // テストエラーを送信
  Sentry.withScope((scope) => {
    scope.setTag('test_type', 'connection_test')
    scope.setContext('test_info', {
      script: 'sentry-connection-test.js',
      timestamp: new Date().toISOString(),
      node_version: process.version,
    })

    Sentry.captureMessage('🧪 Sentry接続テスト成功', 'info')
    console.log('✅ テストメッセージを送信しました')
  })

  // 少し待ってから完了
  setTimeout(() => {
    console.log('\n🎉 Sentry接続テスト完了！')
    console.log('📊 Sentryダッシュボードでテストメッセージを確認してください')
    console.log(
      '🔗 https://sentry.io/organizations/' +
        process.env.SENTRY_ORG +
        '/projects/' +
        process.env.SENTRY_PROJECT +
        '/issues/'
    )

    console.log('\n🚀 次のステップ:')
    console.log('1. npm run dev でアプリを起動')
    console.log('2. http://localhost:3000/test-sentry にアクセス')
    console.log('3. エラーテストボタンでテスト実行')
    console.log('4. Sentryダッシュボードでエラー確認')

    process.exit(0)
  }, 2000)
} catch (error) {
  console.log('❌ Sentry SDK エラー:', error.message)
  console.log('💡 npm install @sentry/nextjs を実行してください')
  process.exit(1)
}
