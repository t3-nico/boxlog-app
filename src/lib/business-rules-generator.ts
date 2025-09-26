/**
 * ビジネスルール辞書 - 自動生成システム
 *
 * Issue #346: 自動化バリデーション・型定義生成システム
 * 関連Issue #343: ビジネスルール辞書システム実装
 * 祖先Issue #338: 技術的失敗を防ぐ開発環境構築
 *
 * 機能:
 * - ビジネスルール辞書からバリデーション関数自動生成
 * - TypeScript型定義自動生成
 * - Zodスキーマ自動生成
 * - テストケース自動生成
 */

import { BusinessRule, businessRuleRegistry } from '@/config/business-rules'

/**
 * 生成設定オプション
 */
export interface GeneratorOptions {
  /** 出力ディレクトリ */
  outputDir: string
  /** 生成対象リソース */
  resources?: string[]
  /** TypeScript厳格モード */
  strict?: boolean
  /** 日本語コメント生成 */
  generateJapaneseComments?: boolean
  /** テストケース生成 */
  generateTests?: boolean
}

/**
 * 生成結果
 */
export interface GenerationResult {
  /** 生成されたファイル数 */
  filesGenerated: number
  /** 生成されたバリデーション関数数 */
  validationFunctionsGenerated: number
  /** 生成された型定義数 */
  typeDefinitionsGenerated: number
  /** 生成されたZodスキーマ数 */
  zodSchemasGenerated: number
  /** 生成されたテストケース数 */
  testCasesGenerated: number
  /** 生成時間（ミリ秒） */
  generationTime: number
  /** エラー */
  errors: string[]
}

/**
 * バリデーションルールから関数コードを生成
 */
export class ValidationFunctionGenerator {
  /**
   * バリデーション関数のコード生成
   */
  generateValidationFunction(rule: BusinessRule): string {
    const functionName = this.generateFunctionName(rule)
    const paramType = this.inferParameterType(rule)
    const returnType = 'ValidationResult'

    return `
/**
 * ${rule.description}
 *
 * 生成元ルール: ${rule.id}
 * カテゴリ: ${rule.category}
 * 重要度: ${rule.severity}
 */
export const ${functionName} = (${paramType}): ${returnType} => {
  try {
    const context = {
      data,
      user,
      session: {
        id: crypto.randomUUID(),
        timestamp: new Date()
      }
    }

    return rule_${rule.id.replace(/[^a-zA-Z0-9]/g, '_')}(context)
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : '不明なエラー',
      code: 'VALIDATION_ERROR'
    }
  }
}
`
  }

  /**
   * 関数名生成
   */
  private generateFunctionName(rule: BusinessRule): string {
    // ルールIDから関数名を生成
    const baseName = rule.id
      .split('-')
      .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
      .join('')

    return `validate${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`
  }

  /**
   * パラメータ型推定
   */
  private inferParameterType(rule: BusinessRule): string {
    const contexts = rule.contexts

    if (contexts.includes('user')) {
      return 'data: any, user?: { id: string; role: string; permissions: string[] }'
    }

    return 'data: any, user?: { id: string; role: string; permissions: string[] }'
  }

  /**
   * 複数ルールからの一括生成
   */
  generateAllValidationFunctions(rules: BusinessRule[]): string {
    const imports = `
import { ValidationResult } from '@/config/business-rules'
import { BusinessRule, RuleContext } from '@/config/business-rules'

// 自動生成されたバリデーション関数
// 生成日時: ${new Date().toISOString()}
// 生成元ルール数: ${rules.length}
`

    const functions = rules
      .filter((rule) => rule.category === 'validation')
      .map((rule) => this.generateValidationFunction(rule))
      .join('\n')

    return imports + functions
  }
}

/**
 * TypeScript型定義生成器
 */
export class TypeDefinitionGenerator {
  /**
   * ビジネスルールから型定義を生成
   */
  generateTypeDefinition(resourceName: string, rules: BusinessRule[]): string {
    const resourceRules = rules.filter((rule) => rule.contexts.includes(resourceName))

    const interfaceName = `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Validation`

    const properties = this.extractProperties(resourceRules)
    const constraints = this.extractConstraints(resourceRules)

    return `
/**
 * ${resourceName}のバリデーション型定義
 *
 * 生成元: ビジネスルール辞書
 * ルール数: ${resourceRules.length}
 * 生成日時: ${new Date().toISOString()}
 */
export interface ${interfaceName} {
${properties.map((prop) => `  ${prop}`).join('\n')}
}

/**
 * ${resourceName}の制約情報
 */
export interface ${interfaceName}Constraints {
${constraints.map((constraint) => `  ${constraint}`).join('\n')}
}

/**
 * ${resourceName}作成時の型
 */
export type Create${interfaceName.replace('Validation', '')} = Omit<${interfaceName}, 'id' | 'createdAt' | 'updatedAt'>

/**
 * ${resourceName}更新時の型
 */
export type Update${interfaceName.replace('Validation', '')} = Partial<Create${interfaceName.replace('Validation', '')}>
`
  }

  /**
   * プロパティの抽出
   */
  private extractProperties(rules: BusinessRule[]): string[] {
    const properties = new Set<string>()

    rules.forEach((rule) => {
      // ルールの説明から推定されるプロパティを抽出
      if (rule.description.includes('タイトル') || rule.description.includes('名前')) {
        properties.add('title: string // 3-100文字制約')
      }
      if (rule.description.includes('メール') || rule.description.includes('email')) {
        properties.add('email: string // メール形式制約')
      }
      if (rule.description.includes('パスワード')) {
        properties.add('password: string // 8文字以上制約')
      }
      if (rule.description.includes('優先度') || rule.description.includes('priority')) {
        properties.add("priority: 'low' | 'medium' | 'high' // 列挙型制約")
      }
      if (rule.description.includes('状態') || rule.description.includes('status')) {
        properties.add("status: 'draft' | 'pending' | 'approved' | 'published' | 'archived' // ワークフロー制約")
      }
      if (rule.description.includes('期限') || rule.description.includes('due')) {
        properties.add('dueDate?: Date // オプショナル制約')
      }
    })

    // 基本フィールドを追加
    return [
      'id: string // 一意識別子',
      'createdAt: Date // 作成日時',
      'updatedAt: Date // 更新日時',
      ...Array.from(properties),
    ]
  }

  /**
   * 制約情報の抽出
   */
  private extractConstraints(rules: BusinessRule[]): string[] {
    const constraints: string[] = []

    rules.forEach((rule) => {
      if (rule.description.includes('必須')) {
        constraints.push(`required: string[] // 必須フィールド一覧`)
      }
      if (rule.description.includes('一意')) {
        constraints.push(`unique: string[] // 一意制約フィールド`)
      }
      if (rule.description.includes('範囲') || rule.description.includes('長さ')) {
        constraints.push(`length: Record<string, { min: number; max: number }> // 長さ制約`)
      }
      if (rule.description.includes('形式') || rule.description.includes('パターン')) {
        constraints.push(`format: Record<string, RegExp> // 形式制約`)
      }
    })

    return constraints.length > 0 ? constraints : ['// 制約情報なし']
  }

  /**
   * 全リソースの型定義生成
   */
  generateAllTypeDefinitions(resources: string[], rules: BusinessRule[]): string {
    const imports = `
// 自動生成されたTypeScript型定義
// 生成日時: ${new Date().toISOString()}
// 対象リソース: ${resources.join(', ')}

import { ValidationResult } from '@/config/business-rules'

`

    const typeDefinitions = resources.map((resource) => this.generateTypeDefinition(resource, rules)).join('\n')

    return imports + typeDefinitions
  }
}

/**
 * Zodスキーマ生成器
 */
export class ZodSchemaGenerator {
  /**
   * ビジネスルールからZodスキーマを生成
   */
  generateZodSchema(resourceName: string, rules: BusinessRule[]): string {
    const resourceRules = rules.filter((rule) => rule.contexts.includes(resourceName))

    const schemaName = `${resourceName}Schema`
    const schemaFields = this.generateSchemaFields(resourceRules)

    return `
/**
 * ${resourceName}のZodスキーマ
 *
 * 生成元: ビジネスルール辞書
 * ルール数: ${resourceRules.length}
 */
export const ${schemaName} = z.object({
${schemaFields.map((field) => `  ${field}`).join(',\n')}
})

/**
 * ${resourceName}作成用スキーマ
 */
export const create${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Schema = ${schemaName}.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

/**
 * ${resourceName}更新用スキーマ
 */
export const update${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Schema = create${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Schema.partial()

/**
 * 型推論用
 */
export type ${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Type = z.infer<typeof ${schemaName}>
export type Create${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Type = z.infer<typeof create${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Schema>
export type Update${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Type = z.infer<typeof update${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Schema>
`
  }

  /**
   * スキーマフィールドの生成
   */
  private generateSchemaFields(rules: BusinessRule[]): string[] {
    const fields = new Set<string>()

    // 基本フィールド
    fields.add('id: z.string().uuid("一意識別子はUUID形式である必要があります")')
    fields.add('createdAt: z.date()')
    fields.add('updatedAt: z.date()')

    rules.forEach((rule) => {
      if (rule.description.includes('タイトル') || rule.description.includes('名前')) {
        fields.add(
          'title: z.string().min(3, "タイトルは3文字以上必要です").max(100, "タイトルは100文字以下である必要があります")'
        )
      }
      if (rule.description.includes('メール')) {
        fields.add('email: z.string().email("有効なメールアドレスを入力してください")')
      }
      if (rule.description.includes('パスワード')) {
        fields.add('password: z.string().min(8, "パスワードは8文字以上必要です")')
      }
      if (rule.description.includes('優先度')) {
        fields.add(
          'priority: z.enum(["low", "medium", "high"], { errorMap: () => ({ message: "優先度は low, medium, high のいずれかを選択してください" }) })'
        )
      }
      if (rule.description.includes('状態')) {
        fields.add(
          'status: z.enum(["draft", "pending", "approved", "published", "archived"], { errorMap: () => ({ message: "無効な状態です" }) })'
        )
      }
      if (rule.description.includes('期限')) {
        fields.add('dueDate: z.date().optional()')
      }
    })

    return Array.from(fields)
  }

  /**
   * 全リソースのZodスキーマ生成
   */
  generateAllZodSchemas(resources: string[], rules: BusinessRule[]): string {
    const imports = `
import { z } from 'zod'

// 自動生成されたZodスキーマ
// 生成日時: ${new Date().toISOString()}
// 対象リソース: ${resources.join(', ')}

`

    const schemas = resources.map((resource) => this.generateZodSchema(resource, rules)).join('\n')

    return imports + schemas
  }
}

/**
 * テストケース生成器
 */
export class TestCaseGenerator {
  /**
   * バリデーション関数のテストケース生成
   */
  generateValidationTests(resourceName: string, rules: BusinessRule[]): string {
    const resourceRules = rules.filter((rule) => rule.contexts.includes(resourceName))

    const testSuites = resourceRules.map((rule) => this.generateRuleTest(rule)).join('\n\n')

    return `
import { describe, it, expect } from 'vitest'
import { ${resourceName}Schema } from '../generated-schemas'
import { businessRuleRegistry } from '@/config/business-rules'

describe('${resourceName} バリデーションテスト', () => {
  describe('Zodスキーマテスト', () => {
    it('正常なデータでバリデーションが通る', () => {
      const validData = {
        id: crypto.randomUUID(),
        title: '有効なタイトル',
        email: 'test@example.com',
        priority: 'medium',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(() => ${resourceName}Schema.parse(validData)).not.toThrow()
    })

    it('無効なデータでバリデーションエラーが発生', () => {
      const invalidData = {
        id: 'invalid-id',
        title: '',
        email: 'invalid-email',
        priority: 'invalid',
        status: 'invalid'
      }

      expect(() => ${resourceName}Schema.parse(invalidData)).toThrow()
    })
  })

${testSuites}
})
`
  }

  /**
   * 個別ルールのテスト生成
   */
  private generateRuleTest(rule: BusinessRule): string {
    return `
  describe('ルール: ${rule.id}', () => {
    it('${rule.description} - 正常ケース', async () => {
      const validData = {
        // 正常なテストデータ
      }

      const result = await businessRuleRegistry.validate('${rule.contexts[0]}', validData)
      expect(result.every(r => r.result.valid)).toBe(true)
    })

    it('${rule.description} - 異常ケース', async () => {
      const invalidData = {
        // 異常なテストデータ
      }

      const result = await businessRuleRegistry.validate('${rule.contexts[0]}', invalidData)
      expect(result.some(r => !r.result.valid)).toBe(true)
    })
  })`
  }
}

/**
 * 統合生成システム
 */
export class BusinessRuleCodeGenerator {
  private validationGenerator = new ValidationFunctionGenerator()
  private typeGenerator = new TypeDefinitionGenerator()
  private zodGenerator = new ZodSchemaGenerator()
  private testGenerator = new TestCaseGenerator()

  /**
   * 全自動生成実行
   */
  async generateAll(options: GeneratorOptions): Promise<GenerationResult> {
    const startTime = performance.now()
    const result: GenerationResult = {
      filesGenerated: 0,
      validationFunctionsGenerated: 0,
      typeDefinitionsGenerated: 0,
      zodSchemasGenerated: 0,
      testCasesGenerated: 0,
      generationTime: 0,
      errors: [],
    }

    try {
      const allRules = businessRuleRegistry.getAllRules()
      const resources = options.resources || ['user', 'task', 'project', 'comment']

      // 1. バリデーション関数生成
      const validationCode = this.validationGenerator.generateAllValidationFunctions(allRules)
      // await this.writeFile(`${options.outputDir}/generated-validations.ts`, validationCode)
      result.validationFunctionsGenerated = allRules.filter((r) => r.category === 'validation').length
      result.filesGenerated++

      // 2. 型定義生成
      const typeCode = this.typeGenerator.generateAllTypeDefinitions(resources, allRules)
      // await this.writeFile(`${options.outputDir}/generated-types.ts`, typeCode)
      result.typeDefinitionsGenerated = resources.length
      result.filesGenerated++

      // 3. Zodスキーマ生成
      const zodCode = this.zodGenerator.generateAllZodSchemas(resources, allRules)
      // await this.writeFile(`${options.outputDir}/generated-schemas.ts`, zodCode)
      result.zodSchemasGenerated = resources.length
      result.filesGenerated++

      // 4. テストケース生成（オプション）
      if (options.generateTests) {
        for (const resource of resources) {
          const testCode = this.testGenerator.generateValidationTests(resource, allRules)
          // await this.writeFile(`${options.outputDir}/${resource}.test.ts`, testCode)
          result.testCasesGenerated++
          result.filesGenerated++
        }
      }
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : '不明なエラー')
    }

    result.generationTime = performance.now() - startTime
    return result
  }

  /**
   * ファイル書き込み（実際の実装では有効化）
   */
  // private async writeFile(filePath: string, content: string): Promise<void> {
  //   const fs = await import('fs/promises')
  //   await fs.writeFile(filePath, content, 'utf-8')
  // }
}
