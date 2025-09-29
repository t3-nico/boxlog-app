#!/usr/bin/env node

/**
 * Vercel環境変数チェックスクリプト
 * 本番環境での設定確認とSentry連携テスト
 */

console.log('🚀 Vercel環境変数チェック開始\n')

// 環境の判定
const isVercel = process.env.VERCEL === '1'
const _isProduction = process.env.NODE_ENV === 'production'
const vercelUrl = process.env.VERCEL_URL
const vercelEnv = process.env.VERCEL_ENV // production, preview, development

console.log('🌍 環境情報:')
console.log(`- Vercel環境: ${isVercel ? '✅ Yes' : '❌ No'}`)
console.log(`- NODE_ENV: ${process.env.NODE_ENV || '未設定'}`)
console.log(`- VERCEL_ENV: ${vercelEnv || '未設定'}`)
console.log(`- VERCEL_URL: ${vercelUrl || '未設定'}`)
console.log()

// Sentry環境変数の確認
const sentryEnvs = {
  required: {
    'NEXT_PUBLIC_SENTRY_DSN': process.env.NEXT_PUBLIC_SENTRY_DSN,
    'SENTRY_ORG': process.env.SENTRY_ORG,
    'SENTRY_PROJECT': process.env.SENTRY_PROJECT
  },
  optional: {
    'SENTRY_AUTH_TOKEN': process.env.SENTRY_AUTH_TOKEN,
    'NEXT_PUBLIC_APP_VERSION': process.env.NEXT_PUBLIC_APP_VERSION,
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL
  }
}

console.log('📋 Sentry必須環境変数:')
let allRequiredSet = true

Object.entries(sentryEnvs.required).forEach(([key, value]) => {
  if (value && value !== 'your-actual-value' && value !== '') {
    const masked = value.length > 20 ?
      value.substring(0, 20) + '...' :
      value.substring(0, 10) + '...'
    console.log(`✅ ${key}: ${masked}`)
  } else {
    console.log(`❌ ${key}: 未設定`)
    allRequiredSet = false
  }
})

console.log('\n📋 Sentryオプション環境変数:')
Object.entries(sentryEnvs.optional).forEach(([key, value]) => {
  if (value && value !== 'your-auth-token' && value !== '') {
    const masked = value.length > 20 ?
      value.substring(0, 20) + '...' :
      value
    console.log(`✅ ${key}: ${masked}`)
  } else {
    console.log(`⚠️  ${key}: 未設定`)
  }
})

// Vercel特有の確認
if (isVercel) {
  console.log('\n🔧 Vercel固有の確認:')

  // Vercel URL の確認
  if (vercelUrl) {
    console.log(`✅ VERCEL_URL: https://${vercelUrl}`)

    // 本番URLの推測
    if (vercelEnv === 'production') {
      console.log(`🌐 本番URL推測: https://${vercelUrl}`)
      console.log(`🧪 テストURL: https://${vercelUrl}/test-sentry`)
    }
  } else {
    console.log('❌ VERCEL_URL: 未設定')
  }

  // Git情報
  console.log(`📝 Git Commit: ${process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || '未設定'}`)
  console.log(`🌿 Git Branch: ${process.env.VERCEL_GIT_COMMIT_REF || '未設定'}`)
}

// 推奨アクション
console.log('\n🎯 推奨アクション:')

if (!allRequiredSet) {
  console.log('❌ 必須環境変数が不足しています')
  console.log('📖 設定方法: VERCEL_SENTRY_SETUP.md を参照')
} else {
  console.log('✅ 必須環境変数は設定済みです')
}

if (isVercel) {
  if (vercelUrl) {
    console.log(`🧪 テスト実行: https://${vercelUrl}/test-sentry にアクセス`)
    console.log('📊 Sentryダッシュボードでエラー確認')
  }
} else {
  console.log('💻 ローカル環境: npm run dev でテスト可能')
}

// 環境固有の設定チェック
if (vercelEnv === 'production') {
  console.log('\n🚨 本番環境での注意点:')
  console.log('- Sentryのサンプルレートを調整してください')
  console.log('- デバッグモードが無効になっているか確認')
  console.log('- パフォーマンス監視が有効か確認')
}

console.log('\n🎉 チェック完了!')

if (isVercel && allRequiredSet) {
  console.log('🎊 Vercel + Sentry 設定成功!')
  console.log('「技術的失敗をしない開発環境」稼働中 🚀')
}