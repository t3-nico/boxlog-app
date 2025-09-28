#!/usr/bin/env node

/**
 * Sentry DSN取得ガイド - ステップバイステップ
 *
 * このスクリプトは、SentryダッシュボードでDSNを見つける手順を案内します
 */

console.log(`
🔍 Sentry DSN取得ガイド
====================================

📍 ステップ1: Sentryにログイン
   1. ブラウザで https://sentry.io にアクセス
   2. 既存のアカウントでログイン

📍 ステップ2: プロジェクトを選択/作成

   【既存プロジェクトがある場合】
   - ダッシュボード左側の「Projects」一覧から選択

   【新規プロジェクト作成の場合】
   1. 右上の「+ Create Project」ボタンをクリック
   2. Platform選択で「Next.js」を選択
   3. Project name: 「boxlog-app」など任意の名前
   4. 「Create Project」をクリック

📍 ステップ3: DSNの場所を確認

   方法A: プロジェクト作成直後の画面
   ----------------------------------------
   - 新規プロジェクト作成後、セットアップ画面が表示されます
   - 「Configure SDK」セクションに以下のようなコードが表示されます:

     Sentry.init({
       dsn: "https://xxxxxxxxx@xxxxxx.ingest.sentry.io/xxxxxxx",
     });

   👆 この dsn の値をコピーしてください

   方法B: 設定画面から取得
   ----------------------------------------
   1. プロジェクトダッシュボードで左側のメニューから
      「Settings」(⚙️ アイコン)をクリック

   2. 「Projects」をクリック

   3. 対象プロジェクト名をクリック

   4. 左側メニューから「Client Keys (DSN)」をクリック

   5. 「DSN」の欄に表示される長いURLをコピー

   方法C: 簡単なパス
   ----------------------------------------
   1. プロジェクトダッシュボードの右上
      「Settings」(⚙️)をクリック

   2. 「Client Keys」をクリック

   3. DSNをコピー

📍 DSNの形式例:
   https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/4567890

📍 追加情報（オプション）:
   - Organization slug: URLの /organizations/[ここの部分]
   - Project slug: URLの /projects/[ここの部分]

🚀 取得後の次のステップ:
   1. DSNをコピーしたら教えてください
   2. 自動的に .env.local ファイルに設定します
   3. 接続テストを実行します

💡 困った時は:
   - Sentryダッシュボードの右下にチャットサポートがあります
   - または、現在のSentryダッシュボード画面のスクリーンショットを共有ください
`)

// 実際のブラウザでSentryを開く（macOSの場合）
if (process.platform === 'darwin') {
  const { exec } = require('child_process')
  console.log('🌐 Sentry.ioを開いています...')
  exec('open https://sentry.io')
}
