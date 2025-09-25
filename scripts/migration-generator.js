#!/usr/bin/env node

/**
 * 🗄️ Database Migration Generator
 *
 * タイムスタンプベースのマイグレーションファイルを自動生成し、
 * チーム開発での競合を防ぎます。
 *
 * Usage:
 *   npm run migration:create "create_users_table"
 *   npm run migration:create "add_email_to_users"
 *   npm run migration:create "create_posts_table"
 */

const fs = require('fs')
const path = require('path')

// カラーコード
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
}

class MigrationGenerator {
  constructor() {
    this.migrationsDir = path.join(process.cwd(), 'src/config/database/supabase/migrations')
    this.migrationsConfig = path.join(process.cwd(), 'src/config/database/migrations.ts')
  }

  // タイムスタンプを生成（YYYYMMDD_HHMMSS形式）
  generateTimestamp() {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')

    return `${year}${month}${day}_${hour}${minute}${second}`
  }

  // 説明文をファイル名形式に変換
  sanitizeDescription(description) {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 英数字・スペース・ハイフン以外を削除
      .replace(/\s+/g, '_') // スペースをアンダースコアに
      .replace(/-+/g, '_') // ハイフンをアンダースコアに
      .replace(/_+/g, '_') // 連続するアンダースコアを一つに
      .replace(/^_|_$/g, '') // 先頭末尾のアンダースコアを削除
  }

  // マイグレーションディレクトリの作成
  ensureMigrationsDir() {
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true })
      console.log(`${colors.green}✅ マイグレーションディレクトリを作成しました: ${this.migrationsDir}${colors.reset}`)
    }
  }

  // マイグレーションファイルのテンプレートを生成
  generateTemplate(description, timestamp) {
    const dateFormatted = new Date().toISOString().split('T')[0]

    return `-- ${description}
-- ${dateFormatted}
-- Generated: ${timestamp}

-- ========================================
-- Migration: ${description}
-- ========================================

-- TODO: Add your migration SQL here

-- Example: Create table
-- CREATE TABLE IF NOT EXISTS example_table (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   name TEXT NOT NULL,
--   email TEXT UNIQUE NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT now(),
--   updated_at TIMESTAMPTZ DEFAULT now()
-- );

-- Example: Add column
-- ALTER TABLE existing_table
-- ADD COLUMN IF NOT EXISTS new_column TEXT;

-- Example: Create index
-- CREATE INDEX IF NOT EXISTS idx_example_table_email
-- ON example_table(email);

-- Example: Enable RLS
-- ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can manage their own records" ON example_table
--   FOR ALL USING (auth.uid() = user_id);

-- Example: Add trigger for updated_at
-- CREATE TRIGGER example_table_updated_at
--   BEFORE UPDATE ON example_table
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Rollback Information
-- ========================================

-- To rollback this migration:
-- TODO: Add rollback SQL here

-- Example rollback:
-- DROP TABLE IF EXISTS example_table;
-- DROP INDEX IF EXISTS idx_example_table_email;
`
  }

  // migrations.tsファイルを更新
  updateMigrationsConfig(filename) {
    if (!fs.existsSync(this.migrationsConfig)) {
      console.log(`${colors.yellow}⚠️  migrations.ts が見つかりません: ${this.migrationsConfig}${colors.reset}`)
      return
    }

    try {
      let content = fs.readFileSync(this.migrationsConfig, 'utf-8')

      // MIGRATION_HISTORYの配列に新しいマイグレーションを追加
      const migrationLine = `  '${filename}',`
      const insertPosition = content.indexOf('  // 新しいマイグレーションをここに追加')

      if (insertPosition !== -1) {
        content = content.replace(
          '  // 新しいマイグレーションをここに追加',
          `${migrationLine}\n  // 新しいマイグレーションをここに追加`
        )

        fs.writeFileSync(this.migrationsConfig, content, 'utf-8')
        console.log(`${colors.green}✅ migrations.ts を更新しました${colors.reset}`)
      } else {
        console.log(`${colors.yellow}⚠️  migrations.ts の更新位置が見つかりませんでした${colors.reset}`)
      }
    } catch (error) {
      console.log(`${colors.red}❌ migrations.ts の更新に失敗しました: ${error.message}${colors.reset}`)
    }
  }

  // 既存マイグレーションファイルの一覧を取得
  getExistingMigrations() {
    if (!fs.existsSync(this.migrationsDir)) {
      return []
    }

    return fs
      .readdirSync(this.migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort()
  }

  // マイグレーション統計を表示
  showMigrationStats() {
    const existing = this.getExistingMigrations()

    console.log(`${colors.blue}${colors.bold}📊 マイグレーション統計${colors.reset}`)
    console.log(`${colors.cyan}  📁 ディレクトリ: ${this.migrationsDir}${colors.reset}`)
    console.log(`${colors.cyan}  📝 既存ファイル数: ${existing.length}${colors.reset}`)

    if (existing.length > 0) {
      console.log(`${colors.cyan}  📅 最新: ${existing[existing.length - 1]}${colors.reset}`)
      console.log(`${colors.cyan}  📅 最古: ${existing[0]}${colors.reset}`)
    }
  }

  // マイグレーションファイルを作成
  createMigration(description) {
    if (!description || description.trim() === '') {
      console.error(`${colors.red}❌ マイグレーションの説明が必要です${colors.reset}`)
      console.log(`${colors.blue}💡 使用例: npm run migration:create "create_users_table"${colors.reset}`)
      process.exit(1)
    }

    const timestamp = this.generateTimestamp()
    const sanitizedDescription = this.sanitizeDescription(description.trim())
    const filename = `${timestamp}_${sanitizedDescription}.sql`
    const filepath = path.join(this.migrationsDir, filename)

    // ディレクトリを確実に作成
    this.ensureMigrationsDir()

    // 既存ファイルの重複チェック
    if (fs.existsSync(filepath)) {
      console.error(`${colors.red}❌ マイグレーションファイルが既に存在します: ${filename}${colors.reset}`)
      process.exit(1)
    }

    // マイグレーションファイルを作成
    const template = this.generateTemplate(description.trim(), timestamp)
    fs.writeFileSync(filepath, template, 'utf-8')

    // migrations.tsを更新
    this.updateMigrationsConfig(filename)

    console.log(`${colors.green}${colors.bold}✅ マイグレーションファイルを作成しました！${colors.reset}`)
    console.log(`${colors.cyan}📄 ファイル: ${filename}${colors.reset}`)
    console.log(`${colors.cyan}📍 パス: ${filepath}${colors.reset}`)
    console.log(`${colors.cyan}🕒 タイムスタンプ: ${timestamp}${colors.reset}`)
    console.log('')
    console.log(`${colors.blue}📝 次のステップ:${colors.reset}`)
    console.log(`1. ${colors.blue}ファイルを開いてSQL文を記述${colors.reset}`)
    console.log(`2. ${colors.blue}npm run migration:status${colors.reset} - 状況確認`)
    console.log(`3. データベースにマイグレーションを適用`)
  }

  // 既存マイグレーション一覧を表示
  listMigrations() {
    console.log(`${colors.blue}${colors.bold}📋 マイグレーション一覧${colors.reset}`)

    const migrations = this.getExistingMigrations()

    if (migrations.length === 0) {
      console.log(`${colors.dim}  (マイグレーションファイルがありません)${colors.reset}`)
      console.log(
        `${colors.blue}💡 新しいマイグレーションを作成: npm run migration:create "description"${colors.reset}`
      )
      return
    }

    migrations.forEach((filename, index) => {
      const number = String(index + 1).padStart(2, '0')
      const timestampMatch = filename.match(/^(\d{8}_\d{6})_(.+)\.sql$/)

      if (timestampMatch) {
        const [, timestamp, description] = timestampMatch
        const date = timestamp.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5:$6')
        console.log(`${colors.cyan}  ${number}. ${colors.reset}${filename}`)
        console.log(`${colors.dim}      📅 ${date} - ${description}${colors.reset}`)
      } else {
        console.log(`${colors.cyan}  ${number}. ${colors.reset}${filename}`)
      }
    })

    console.log('')
    this.showMigrationStats()
  }

  // マイグレーション状況を表示
  showStatus() {
    console.log(`${colors.blue}${colors.bold}📊 マイグレーション状況${colors.reset}`)

    this.showMigrationStats()

    console.log('')
    console.log(`${colors.blue}🔧 利用可能なコマンド:${colors.reset}`)
    console.log(`  ${colors.cyan}npm run migration:create "description"${colors.reset} - 新規作成`)
    console.log(`  ${colors.cyan}npm run migration:list${colors.reset}              - 一覧表示`)
    console.log(`  ${colors.cyan}npm run migration:status${colors.reset}            - 状況確認`)
  }

  // メイン実行
  run() {
    const args = process.argv.slice(2)
    const command = args[0]

    console.log(`${colors.bold}🗄️ BoxLog Migration Generator${colors.reset}`)
    console.log(`${colors.dim}タイムスタンプベースのマイグレーション管理${colors.reset}`)
    console.log('')

    switch (command) {
      case 'create':
        const description = args[1]
        this.createMigration(description)
        break

      case 'list':
        this.listMigrations()
        break

      case 'status':
        this.showStatus()
        break

      default:
        if (command && command !== 'help') {
          // 引数がcreate以外の場合、それを説明として扱う
          this.createMigration(command)
        } else {
          console.log(`${colors.blue}📖 使用方法:${colors.reset}`)
          console.log(`  node scripts/migration-generator.js create "description"`)
          console.log(`  node scripts/migration-generator.js list`)
          console.log(`  node scripts/migration-generator.js status`)
          console.log('')
          console.log(`${colors.blue}🚀 推奨 npm scripts:${colors.reset}`)
          console.log(`  npm run migration:create "create_users_table"`)
          console.log(`  npm run migration:list`)
          console.log(`  npm run migration:status`)
        }
        break
    }
  }
}

// メイン実行
if (require.main === module) {
  const generator = new MigrationGenerator()
  generator.run()
}

module.exports = MigrationGenerator
