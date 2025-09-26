#!/usr/bin/env node

/**
 * ビジネスルール辞書 - コード自動生成CLI
 *
 * Issue #346: 自動化バリデーション・型定義生成システム
 * 関連Issue #343: ビジネスルール辞書システム実装
 * 祖先Issue #338: 技術的失敗を防ぐ開発環境構築
 *
 * 使用方法:
 *   npm run generate:business-rules
 *   npm run generate:business-rules -- --resources user,task --tests
 *   npm run generate:business-rules -- --output ./src/generated --strict
 */

const fs = require('fs').promises
const path = require('path')

/**
 * コマンドライン引数の解析
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    outputDir: './src/generated/business-rules',
    resources: ['user', 'task', 'project', 'comment'],
    strict: false,
    generateJapaneseComments: true,
    generateTests: false,
    verbose: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--output':
      case '-o':
        options.outputDir = args[++i]
        break
      case '--resources':
      case '-r':
        options.resources = args[++i].split(',').map((s) => s.trim())
        break
      case '--strict':
        options.strict = true
        break
      case '--no-japanese':
        options.generateJapaneseComments = false
        break
      case '--tests':
      case '-t':
        options.generateTests = true
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--help':
      case '-h':
        showHelp()
        process.exit(0)
        break
    }
  }

  return options
}

/**
 * ヘルプ表示
 */
function showHelp() {
  console.log(`
🤖 ビジネスルール辞書 - コード自動生成CLI

使用方法:
  npm run generate:business-rules [オプション]

オプション:
  -o, --output <dir>      出力ディレクトリ (デフォルト: ./src/generated/business-rules)
  -r, --resources <list>  対象リソース (デフォルト: user,task,project,comment)
  --strict               TypeScript厳格モード
  --no-japanese          日本語コメント無効化
  -t, --tests            テストケース生成
  -v, --verbose          詳細出力
  -h, --help             このヘルプを表示

例:
  npm run generate:business-rules
  npm run generate:business-rules -- --resources user,task --tests
  npm run generate:business-rules -- --output ./custom/path --strict
`)
}

/**
 * バリデーション関数生成器（簡易版）
 */
class SimpleValidationGenerator {
  generateValidationFunctions(resources) {
    return `
import { z } from 'zod'

// 🤖 自動生成されたバリデーション関数
// 生成日時: ${new Date().toISOString()}
// 対象リソース: ${resources.join(', ')}

export interface ValidationResult {
  valid: boolean
  message?: string
  code?: string
}

${resources.map((resource) => this.generateResourceValidation(resource)).join('\n\n')}

// 統合バリデーション関数
export const validateAllResources = {
${resources.map((resource) => `  ${resource}: validate${this.capitalize(resource)}`).join(',\n')}
}
`
  }

  generateResourceValidation(resource) {
    const capitalizedResource = this.capitalize(resource)

    return `
/**
 * ${resource}のバリデーション関数
 */
export const validate${capitalizedResource} = (data: any): ValidationResult => {
  try {
    // 基本的なバリデーション
    if (!data) {
      return { valid: false, message: '${resource}データが必要です', code: 'REQUIRED' }
    }

    ${this.generateSpecificValidation(resource)}

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      message: error.message || '不明なエラー',
      code: 'VALIDATION_ERROR'
    }
  }
}`
  }

  generateSpecificValidation(resource) {
    const validations = {
      user: `
    if (!data.email || !/^[^@]+@[^@]+$/.test(data.email)) {
      return { valid: false, message: '有効なメールアドレスが必要です', code: 'INVALID_EMAIL' }
    }
    if (data.password && data.password.length < 8) {
      return { valid: false, message: 'パスワードは8文字以上必要です', code: 'WEAK_PASSWORD' }
    }`,

      task: `
    if (!data.title || data.title.trim().length < 3) {
      return { valid: false, message: 'タスクタイトルは3文字以上必要です', code: 'TITLE_TOO_SHORT' }
    }
    if (data.title && data.title.length > 100) {
      return { valid: false, message: 'タスクタイトルは100文字以下である必要があります', code: 'TITLE_TOO_LONG' }
    }
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      return { valid: false, message: '優先度は low, medium, high のいずれかである必要があります', code: 'INVALID_PRIORITY' }
    }`,

      project: `
    if (!data.name || data.name.trim().length < 2) {
      return { valid: false, message: 'プロジェクト名は2文字以上必要です', code: 'NAME_TOO_SHORT' }
    }
    if (data.status && !['active', 'archived', 'completed'].includes(data.status)) {
      return { valid: false, message: '無効なプロジェクトステータスです', code: 'INVALID_STATUS' }
    }`,

      comment: `
    if (!data.content || data.content.trim().length < 1) {
      return { valid: false, message: 'コメント内容が必要です', code: 'CONTENT_REQUIRED' }
    }
    if (data.content && data.content.length > 1000) {
      return { valid: false, message: 'コメントは1000文字以下である必要があります', code: 'CONTENT_TOO_LONG' }
    }`,
    }

    return (
      validations[resource] ||
      `
    // ${resource}用の具体的なバリデーションロジックをここに追加`
    )
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

/**
 * TypeScript型定義生成器（簡易版）
 */
class SimpleTypeGenerator {
  generateTypeDefinitions(resources) {
    return `
// 🤖 自動生成されたTypeScript型定義
// 生成日時: ${new Date().toISOString()}
// 対象リソース: ${resources.join(', ')}

${resources.map((resource) => this.generateResourceTypes(resource)).join('\n\n')}

// 統合型エクスポート
export type AllResourceTypes = ${resources.map((resource) => `${this.capitalize(resource)}Type`).join(' | ')}
`
  }

  generateResourceTypes(resource) {
    const capitalizedResource = this.capitalize(resource)
    const types = this.getResourceTypeDefinition(resource)

    return `
/**
 * ${resource}の型定義
 */
export interface ${capitalizedResource}Type {
  id: string
  createdAt: Date
  updatedAt: Date
${types}
}

/**
 * ${resource}作成時の型
 */
export type Create${capitalizedResource}Type = Omit<${capitalizedResource}Type, 'id' | 'createdAt' | 'updatedAt'>

/**
 * ${resource}更新時の型
 */
export type Update${capitalizedResource}Type = Partial<Create${capitalizedResource}Type>
`
  }

  getResourceTypeDefinition(resource) {
    const definitions = {
      user: `
  email: string
  password?: string
  name: string
  role: 'user' | 'admin' | 'moderator'`,

      task: `
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  dueDate?: Date
  assigneeId?: string`,

      project: `
  name: string
  description?: string
  status: 'active' | 'archived' | 'completed'
  ownerId: string`,

      comment: `
  content: string
  authorId: string
  targetType: 'task' | 'project' | 'user'
  targetId: string`,
    }

    return (
      definitions[resource] ||
      `
  // ${resource}の具体的な型定義をここに追加`
    )
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

/**
 * Zodスキーマ生成器（簡易版）
 */
class SimpleZodGenerator {
  generateZodSchemas(resources) {
    return `
import { z } from 'zod'

// 🤖 自動生成されたZodスキーマ
// 生成日時: ${new Date().toISOString()}
// 対象リソース: ${resources.join(', ')}

${resources.map((resource) => this.generateResourceSchema(resource)).join('\n\n')}

// 統合スキーマエクスポート
export const allSchemas = {
${resources.map((resource) => `  ${resource}: ${resource}Schema`).join(',\n')}
}
`
  }

  generateResourceSchema(resource) {
    const schema = this.getResourceSchemaDefinition(resource)
    const capitalizedResource = this.capitalize(resource)

    return `
/**
 * ${resource}のZodスキーマ
 */
export const ${resource}Schema = z.object({
  id: z.string().uuid('一意識別子はUUID形式である必要があります'),
  createdAt: z.date(),
  updatedAt: z.date(),
${schema}
})

/**
 * ${resource}作成用スキーマ
 */
export const create${capitalizedResource}Schema = ${resource}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

/**
 * ${resource}更新用スキーマ
 */
export const update${capitalizedResource}Schema = create${capitalizedResource}Schema.partial()

// 型推論
export type ${capitalizedResource}Type = z.infer<typeof ${resource}Schema>
export type Create${capitalizedResource}Type = z.infer<typeof create${capitalizedResource}Schema>
export type Update${capitalizedResource}Type = z.infer<typeof update${capitalizedResource}Schema>
`
  }

  getResourceSchemaDefinition(resource) {
    const definitions = {
      user: `
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です').optional(),
  name: z.string().min(1, '名前は必須です'),
  role: z.enum(['user', 'admin', 'moderator'], { errorMap: () => ({ message: '無効な役割です' }) })`,

      task: `
  title: z.string().min(3, 'タイトルは3文字以上必要です').max(100, 'タイトルは100文字以下である必要があります'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high'], { errorMap: () => ({ message: '優先度は low, medium, high のいずれかを選択してください' }) }),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled'], { errorMap: () => ({ message: '無効なステータスです' }) }),
  dueDate: z.date().optional(),
  assigneeId: z.string().uuid().optional()`,

      project: `
  name: z.string().min(2, 'プロジェクト名は2文字以上必要です'),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'completed'], { errorMap: () => ({ message: '無効なステータスです' }) }),
  ownerId: z.string().uuid('オーナーIDはUUID形式である必要があります')`,

      comment: `
  content: z.string().min(1, 'コメント内容は必須です').max(1000, 'コメントは1000文字以下である必要があります'),
  authorId: z.string().uuid('作成者IDはUUID形式である必要があります'),
  targetType: z.enum(['task', 'project', 'user'], { errorMap: () => ({ message: '無効な対象タイプです' }) }),
  targetId: z.string().uuid('対象IDはUUID形式である必要があります')`,
    }

    return (
      definitions[resource] ||
      `
  // ${resource}の具体的なスキーマ定義をここに追加`
    )
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

/**
 * テスト生成器（簡易版）
 */
class SimpleTestGenerator {
  generateTests(resources) {
    return resources.map((resource) => ({
      fileName: `${resource}.test.ts`,
      content: this.generateResourceTest(resource),
    }))
  }

  generateResourceTest(resource) {
    const capitalizedResource = this.capitalize(resource)

    return `
import { describe, it, expect } from 'vitest'
import { ${resource}Schema, create${capitalizedResource}Schema } from '../generated-schemas'
import { validate${capitalizedResource} } from '../generated-validations'

describe('${resource} 自動生成テスト', () => {
  describe('Zodスキーマテスト', () => {
    it('正常な${resource}データでバリデーションが通る', () => {
      const validData = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ${this.generateValidTestData(resource)}
      }

      expect(() => ${resource}Schema.parse(validData)).not.toThrow()
    })

    it('作成用スキーマで正常なデータでバリデーションが通る', () => {
      const validCreateData = {
        ${this.generateValidTestData(resource)}
      }

      expect(() => create${capitalizedResource}Schema.parse(validCreateData)).not.toThrow()
    })

    it('無効な${resource}データでバリデーションエラーが発生', () => {
      const invalidData = {
        id: 'invalid-uuid',
        ${this.generateInvalidTestData(resource)}
      }

      expect(() => ${resource}Schema.parse(invalidData)).toThrow()
    })
  })

  describe('カスタムバリデーション関数テスト', () => {
    it('validate${capitalizedResource} - 正常ケース', () => {
      const validData = {
        ${this.generateValidTestData(resource)}
      }

      const result = validate${capitalizedResource}(validData)
      expect(result.valid).toBe(true)
    })

    it('validate${capitalizedResource} - 異常ケース', () => {
      const invalidData = {
        ${this.generateInvalidTestData(resource)}
      }

      const result = validate${capitalizedResource}(invalidData)
      expect(result.valid).toBe(false)
      expect(result.message).toBeDefined()
    })
  })
})
`
  }

  generateValidTestData(resource) {
    const validData = {
      user: `
        email: 'test@example.com',
        name: 'テストユーザー',
        role: 'user'`,

      task: `
        title: '有効なタスクタイトル',
        description: 'タスクの説明',
        priority: 'medium',
        status: 'todo'`,

      project: `
        name: '有効なプロジェクト',
        description: 'プロジェクトの説明',
        status: 'active',
        ownerId: crypto.randomUUID()`,

      comment: `
        content: '有効なコメント内容',
        authorId: crypto.randomUUID(),
        targetType: 'task',
        targetId: crypto.randomUUID()`,
    }

    return validData[resource] || `// ${resource}の有効なテストデータ`
  }

  generateInvalidTestData(resource) {
    const invalidData = {
      user: `
        email: 'invalid-email',
        name: '',
        role: 'invalid'`,

      task: `
        title: 'ab',
        priority: 'invalid',
        status: 'invalid'`,

      project: `
        name: '',
        status: 'invalid',
        ownerId: 'invalid-uuid'`,

      comment: `
        content: '',
        authorId: 'invalid-uuid',
        targetType: 'invalid',
        targetId: 'invalid-uuid'`,
    }

    return invalidData[resource] || `// ${resource}の無効なテストデータ`
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

/**
 * メイン生成処理
 */
async function generateBusinessRuleCode(options) {
  const startTime = Date.now()

  console.log('🤖 ビジネスルール辞書 - コード自動生成開始')
  console.log(`📁 出力先: ${options.outputDir}`)
  console.log(`🎯 対象リソース: ${options.resources.join(', ')}`)
  console.log('')

  try {
    // 出力ディレクトリ作成
    await fs.mkdir(options.outputDir, { recursive: true })

    const generators = {
      validation: new SimpleValidationGenerator(),
      types: new SimpleTypeGenerator(),
      zod: new SimpleZodGenerator(),
      test: options.generateTests ? new SimpleTestGenerator() : null,
    }

    let filesGenerated = 0

    // 1. バリデーション関数生成
    if (options.verbose) console.log('📝 バリデーション関数を生成中...')
    const validationCode = generators.validation.generateValidationFunctions(options.resources)
    const validationPath = path.join(options.outputDir, 'generated-validations.ts')
    await fs.writeFile(validationPath, validationCode)
    filesGenerated++
    console.log('✅ バリデーション関数を生成しました')

    // 2. TypeScript型定義生成
    if (options.verbose) console.log('🔷 TypeScript型定義を生成中...')
    const typesCode = generators.types.generateTypeDefinitions(options.resources)
    const typesPath = path.join(options.outputDir, 'generated-types.ts')
    await fs.writeFile(typesPath, typesCode)
    filesGenerated++
    console.log('✅ TypeScript型定義を生成しました')

    // 3. Zodスキーマ生成
    if (options.verbose) console.log('⚡ Zodスキーマを生成中...')
    const zodCode = generators.zod.generateZodSchemas(options.resources)
    const zodPath = path.join(options.outputDir, 'generated-schemas.ts')
    await fs.writeFile(zodPath, zodCode)
    filesGenerated++
    console.log('✅ Zodスキーマを生成しました')

    // 4. テストケース生成（オプション）
    if (options.generateTests) {
      if (options.verbose) console.log('🧪 テストケースを生成中...')
      const tests = generators.test.generateTests(options.resources)

      for (const test of tests) {
        const testPath = path.join(options.outputDir, 'tests', test.fileName)
        await fs.mkdir(path.dirname(testPath), { recursive: true })
        await fs.writeFile(testPath, test.content)
        filesGenerated++
      }
      console.log(`✅ ${tests.length}個のテストケースを生成しました`)
    }

    // 5. インデックスファイル生成
    const indexCode = `
// 🤖 自動生成されたビジネスルール辞書エクスポート
// 生成日時: ${new Date().toISOString()}

export * from './generated-validations'
export * from './generated-types'
export * from './generated-schemas'
`
    const indexPath = path.join(options.outputDir, 'index.ts')
    await fs.writeFile(indexPath, indexCode)
    filesGenerated++

    // 完了レポート
    const endTime = Date.now()
    const duration = endTime - startTime

    console.log('')
    console.log('🎉 コード自動生成完了！')
    console.log(`📊 統計:`)
    console.log(`  - 生成ファイル数: ${filesGenerated}`)
    console.log(`  - 対象リソース数: ${options.resources.length}`)
    console.log(`  - 生成時間: ${duration}ms`)
    console.log(`  - 出力先: ${options.outputDir}`)

    if (options.generateTests) {
      console.log('  - テストケース: 生成済み')
    }

    console.log('')
    console.log('📝 次のステップ:')
    console.log('  1. 生成されたコードを確認')
    console.log('  2. 必要に応じてカスタマイズ')
    console.log('  3. テストを実行してバリデーション')
    console.log('')
  } catch (error) {
    console.error('❌ エラー:', error.message)
    if (options.verbose) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// CLI実行
if (require.main === module) {
  const options = parseArgs()
  generateBusinessRuleCode(options)
}

module.exports = {
  generateBusinessRuleCode,
  parseArgs,
}
