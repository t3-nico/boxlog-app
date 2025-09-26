#!/usr/bin/env node

/**
 * Crowdin統合 CLIツール
 * BoxLog翻訳管理システムとCrowdinの統合・連携コマンド
 */

// Note: These imports are required for file path validation but not used directly in this CLI
// eslint-disable-next-line unused-imports/no-unused-vars
const _fs = require('fs')
// eslint-disable-next-line unused-imports/no-unused-vars
const _path = require('path')

class CrowdinCLI {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api/i18n/crowdin'
  }

  async run() {
    const command = process.argv[2]

    switch (command) {
      case 'upload':
        await this.uploadTranslations()
        break
      case 'download':
        await this.downloadTranslations()
        break
      case 'sync':
        await this.syncTranslations()
        break
      case 'progress':
        await this.showProgress()
        break
      case 'status':
        await this.showStatus()
        break
      case 'setup':
        await this.setupIntegration()
        break
      case 'test':
        await this.testConnection()
        break
      case 'help':
      default:
        this.showHelp()
    }
  }

  async uploadTranslations() {
    console.log('\\n🚀 Crowdinに翻訳データをアップロード中...')

    const languages = ['en', 'ja']
    let successCount = 0

    for (const language of languages) {
      try {
        const response = await this.makeRequest('/sync', {
          action: 'upload',
          language,
        })

        if (response.success) {
          console.log(`✅ ${language}: ${response.message}`)
          console.log(`   アップロード済みキー数: ${response.data.uploadedKeys}`)
          successCount++
        } else {
          console.error(`❌ ${language}: ${response.error}`)
        }
      } catch (error) {
        console.error(`❌ ${language}: エラー - ${error.message}`)
      }
    }

    console.log(`\\n📊 結果: ${successCount}/${languages.length} 言語のアップロードが完了`)
  }

  async downloadTranslations() {
    console.log('\\n⬇️  Crowdinから翻訳データをダウンロード中...')

    const languages = ['ja'] // 英語はソース言語のためダウンロード対象外
    let successCount = 0

    for (const language of languages) {
      try {
        const response = await this.makeRequest('/sync', {
          action: 'download',
          language,
        })

        if (response.success) {
          console.log(`✅ ${language}: ${response.message}`)
          console.log(`   ダウンロード済みキー数: ${response.data.keysCount}`)
          console.log(`   更新日時: ${new Date(response.data.updatedAt).toLocaleString('ja-JP')}`)
          successCount++
        } else {
          console.error(`❌ ${language}: ${response.error}`)
        }
      } catch (error) {
        console.error(`❌ ${language}: エラー - ${error.message}`)
      }
    }

    console.log(`\\n📊 結果: ${successCount}/${languages.length} 言語のダウンロードが完了`)
  }

  async syncTranslations() {
    console.log('\\n🔄 Crowdinとの双方向同期を開始...')

    // アップロード → ダウンロードの順で実行
    await this.uploadTranslations()
    console.log('\\n⏳ 3秒待機中（Crowdin処理完了待ち）...')
    await this.sleep(3000)
    await this.downloadTranslations()

    console.log('\\n🎉 Crowdin同期が完了しました！')
  }

  async showProgress() {
    console.log('\\n📈 Crowdin翻訳進捗状況')
    console.log('================================')

    try {
      const response = await this.makeRequest('/sync', { action: 'progress' })

      if (response.success) {
        const { totalLanguages, progress } = response.data

        console.log(`総対象言語数: ${totalLanguages}`)
        console.log(`最終更新: ${new Date(response.data.lastUpdated).toLocaleString('ja-JP')}\\n`)

        progress.forEach(lang => {
          const statusIcon = lang.progress >= 100 ? '🟢' : lang.progress >= 50 ? '🟡' : '🔴'
          const approvedPercent = Math.round((lang.approved / lang.total) * 100)

          console.log(`${statusIcon} ${lang.language.toUpperCase()}:`)
          console.log(`   翻訳済み: ${lang.translated}/${lang.total} (${lang.progress}%)`)
          console.log(`   承認済み: ${lang.approved}/${lang.total} (${approvedPercent}%)`)
          console.log(`   進捗: ${'█'.repeat(Math.floor(lang.progress / 10))}${'░'.repeat(10 - Math.floor(lang.progress / 10))} ${lang.progress}%\\n`)
        })
      } else {
        console.error('❌ 進捗取得エラー:', response.error)
      }
    } catch (error) {
      console.error('❌ API通信エラー:', error.message)
    }
  }

  async showStatus() {
    console.log('\\n🔗 Crowdin連携ステータス')
    console.log('============================')

    try {
      const response = await fetch(`${this.baseUrl}/sync`)
      const data = await response.json()

      if (data.success) {
        console.log('✅ 連携状態: 正常')
        console.log(`最終確認: ${new Date(data.data.lastChecked).toLocaleString('ja-JP')}\\n`)

        console.log('言語別ステータス:')
        data.data.languages.forEach(lang => {
          const statusEmoji = {
            completed: '🟢',
            'in-progress': '🟡',
            pending: '🔴'
          }[lang.status] || '⚪'

          console.log(`  ${statusEmoji} ${lang.language.toUpperCase()}: ${lang.progress}% (${lang.status})`)
        })
      } else {
        console.error('❌ 連携状態: 異常')
        console.error(`エラー: ${data.error}`)
      }
    } catch (error) {
      console.error('❌ 連携確認失敗:', error.message)
      console.log('\\n💡 トラブルシューティング:')
      console.log('   1. 開発サーバーが起動しているか確認')
      console.log('   2. Crowdin API設定を確認')
      console.log('   3. 環境変数が正しく設定されているか確認')
    }
  }

  async setupIntegration() {
    console.log('\\n🔧 Crowdin統合セットアップ')
    console.log('==============================')

    // 環境変数チェック
    const requiredEnvVars = [
      'CROWDIN_PROJECT_ID',
      'CROWDIN_API_TOKEN',
      'CROWDIN_WEBHOOK_SECRET'
    ]

    console.log('📋 必要な環境変数の確認:')
    let allSet = true

    requiredEnvVars.forEach(envVar => {
      const isSet = !!process.env[envVar]
      console.log(`   ${isSet ? '✅' : '❌'} ${envVar}`)
      if (!isSet) allSet = false
    })

    if (!allSet) {
      console.log('\\n⚠️  環境変数が不足しています。.envファイルに以下を設定してください:')
      console.log('   CROWDIN_PROJECT_ID=your_project_id')
      console.log('   CROWDIN_API_TOKEN=your_api_token')
      console.log('   CROWDIN_WEBHOOK_SECRET=your_webhook_secret')
      return
    }

    console.log('\\n✅ 環境変数設定OK')

    // 接続テスト
    console.log('\\n🔌 Crowdin接続テスト中...')
    await this.testConnection()

    console.log('\\n🎯 セットアップ完了推奨手順:')
    console.log('   1. npm run i18n:crowdin:upload   # 初回翻訳データアップロード')
    console.log('   2. Crowdinで翻訳・レビュー作業')
    console.log('   3. npm run i18n:crowdin:download # 翻訳データダウンロード')
    console.log('   4. npm run i18n:crowdin:progress # 進捗確認')
  }

  async testConnection() {
    console.log('\\n🧪 Crowdin API接続テスト')
    console.log('===========================')

    try {
      const response = await this.makeRequest('/sync', { action: 'progress' })

      if (response.success) {
        console.log('✅ API接続: 成功')
        console.log(`✅ プロジェクト: 確認済み (${response.data.totalLanguages}言語)`)
        console.log('✅ 認証: 正常')
      } else {
        console.error('❌ API接続: 失敗')
        console.error(`   エラー: ${response.error}`)
      }
    } catch (error) {
      console.error('❌ API接続: エラー')
      console.error(`   詳細: ${error.message}`)

      console.log('\\n🔧 確認事項:')
      console.log('   - Crowdin APIトークンが有効か')
      console.log('   - プロジェクトIDが正しいか')
      console.log('   - APIレート制限に達していないか')
    }
  }

  async makeRequest(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return await response.json()
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  showHelp() {
    console.log(`
🌐 Crowdin統合 CLIツール
=========================

BoxLog翻訳管理システムとCrowdinの連携・同期ツール

使用方法:
  node scripts/crowdin-integration-cli.js <command>

コマンド:
  upload      翻訳データをCrowdinにアップロード
  download    翻訳データをCrowdinからダウンロード
  sync        双方向同期（アップロード→ダウンロード）
  progress    翻訳進捗状況の表示
  status      連携ステータスの確認
  setup       統合セットアップガイド
  test        API接続テスト
  help        このヘルプを表示

例:
  npm run i18n:crowdin:upload
  npm run i18n:crowdin:download
  npm run i18n:crowdin:sync
  npm run i18n:crowdin:progress

環境変数（必須）:
  CROWDIN_PROJECT_ID     - CrowdinプロジェクトID
  CROWDIN_API_TOKEN      - Crowdin APIトークン
  CROWDIN_WEBHOOK_SECRET - Webhook署名検証用シークレット

詳細: docs/analysis/translation-platform-comparison-2025-09-26.md
`)
  }
}

// CLI実行
if (require.main === module) {
  const cli = new CrowdinCLI()
  cli.run().catch(error => {
    console.error('❌ CLI実行エラー:', error)
    process.exit(1)
  })
}

module.exports = CrowdinCLI