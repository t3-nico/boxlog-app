/**
 * 命名規則パターン管理システム
 * ドメイン用語辞書と連携した統一命名規則の定義
 */

import namingDictionary from './dictionary.json';

// ==============================
// 型定義
// ==============================

export interface DomainTerm {
  english: string;
  japanese: string;
  aliases: string[];
  category: string;
  usage: {
    type: string;
    interface: string;
    component: string;
    hook: string;
    service: string;
    constant: string;
  };
  description: string;
}

export interface ForbiddenTerm {
  term: string;
  reason: string;
  alternatives: string[];
}

export interface NamingPattern {
  pattern: string;
  examples: string[];
  description: string;
}

export interface NamingRule {
  name: string;
  pattern: RegExp;
  examples: string[];
  description: string;
  autoFix?: (input: string) => string;
}

export interface ValidationResult {
  isValid: boolean;
  suggestions: string[];
  errors: string[];
  warnings: string[];
}

// ==============================
// 命名パターン定義
// ==============================

export const NAMING_PATTERNS = {
  // React コンポーネント
  COMPONENT: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    examples: ['TaskCard', 'UserProfile', 'ProjectDashboard'],
    description: 'PascalCase でコンポーネント名を定義',
    autoFix: (input: string) => toPascalCase(input),
  },

  // カスタムフック
  HOOK: {
    pattern: /^use[A-Z][a-zA-Z0-9]*$/,
    examples: ['useTask', 'useAuthentication', 'useProjectData'],
    description: 'use プレフィックス + PascalCase',
    autoFix: (input: string) => `use${toPascalCase(input.replace(/^use/, ''))}`,
  },

  // TypeScript 型・インターフェース
  TYPE: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    examples: ['TaskData', 'UserRole', 'ProjectStatus'],
    description: 'PascalCase で型名を定義',
    autoFix: (input: string) => toPascalCase(input),
  },

  // 定数
  CONSTANT: {
    pattern: /^[A-Z][A-Z0-9_]*$/,
    examples: ['TASK_STATUS', 'USER_ROLES', 'API_ENDPOINTS'],
    description: 'SCREAMING_SNAKE_CASE で定数を定義',
    autoFix: (input: string) => toScreamingSnakeCase(input),
  },

  // 変数・関数
  VARIABLE: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    examples: ['taskList', 'currentUser', 'isLoading'],
    description: 'camelCase で変数・関数名を定義',
    autoFix: (input: string) => toCamelCase(input),
  },

  // ファイル名
  FILE: {
    pattern: /^[a-z][a-z0-9-]*\.(ts|tsx|js|jsx)$/,
    examples: ['task-card.tsx', 'user-profile.ts', 'project-api.ts'],
    description: 'kebab-case でファイル名を定義',
    autoFix: (input: string) => toKebabCase(input),
  },

  // ディレクトリ名
  DIRECTORY: {
    pattern: /^[a-z][a-z0-9-]*$/,
    examples: ['task-management', 'user-auth', 'project-dashboard'],
    description: 'kebab-case でディレクトリ名を定義',
    autoFix: (input: string) => toKebabCase(input),
  },

  // CSS クラス名
  CSS_CLASS: {
    pattern: /^[a-z][a-z0-9-]*$/,
    examples: ['task-card', 'user-profile', 'loading-spinner'],
    description: 'kebab-case で CSS クラス名を定義',
    autoFix: (input: string) => toKebabCase(input),
  },

  // イベントハンドラー
  EVENT_HANDLER: {
    pattern: /^handle[A-Z][a-zA-Z0-9]*$/,
    examples: ['handleTaskCreate', 'handleUserLogin', 'handleFormSubmit'],
    description: 'handle プレフィックス + PascalCase',
    autoFix: (input: string) => `handle${toPascalCase(input.replace(/^handle/, ''))}`,
  },

  // 真偽値変数
  BOOLEAN: {
    pattern: /^(is|has|can|should|will|does)[A-Z][a-zA-Z0-9]*$/,
    examples: ['isLoading', 'hasPermission', 'canEdit', 'shouldUpdate'],
    description: 'is/has/can/should プレフィックス + PascalCase',
    autoFix: (input: string) => {
      const prefixes = ['is', 'has', 'can', 'should', 'will', 'does'];
      const hasPrefix = prefixes.some((prefix) => input.toLowerCase().startsWith(prefix));
      if (hasPrefix) {
        return toCamelCase(input);
      }
      return `is${toPascalCase(input)}`;
    },
  },

  // API エンドポイント
  API_ENDPOINT: {
    pattern: /^\/[a-z][a-z0-9-]*(\/:?[a-z][a-z0-9-]*)*$/,
    examples: ['/tasks', '/users/:id', '/projects/:projectId/tasks'],
    description: 'kebab-case で API パスを定義',
    autoFix: (input: string) => input.toLowerCase().replace(/[_\s]/g, '-'),
  },

  // 環境変数
  ENV_VAR: {
    pattern: /^[A-Z][A-Z0-9_]*$/,
    examples: ['DATABASE_URL', 'API_KEY', 'NODE_ENV'],
    description: 'SCREAMING_SNAKE_CASE で環境変数を定義',
    autoFix: (input: string) => toScreamingSnakeCase(input),
  },
} as const;

// ==============================
// ケース変換ユーティリティ
// ==============================

export function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

export function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function toScreamingSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toUpperCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// ==============================
// ドメイン用語管理
// ==============================

export class NamingConventionManager {
  private domainTerms: Map<string, DomainTerm>;
  private forbiddenTerms: Set<string>;
  private patterns: typeof NAMING_PATTERNS;

  constructor() {
    this.domainTerms = new Map();
    this.forbiddenTerms = new Set();
    this.patterns = NAMING_PATTERNS;
    this.loadDictionary();
  }

  private loadDictionary(): void {
    // ドメイン用語の読み込み
    Object.entries(namingDictionary.domainTerms).forEach(([_key, term]) => {
      this.domainTerms.set(_key, term as DomainTerm);
      // エイリアスも登録
      term.aliases.forEach((alias) => {
        this.domainTerms.set(alias, term as DomainTerm);
      });
    });

    // 禁止用語の読み込み
    namingDictionary.forbiddenTerms.forEach((item) => {
      this.forbiddenTerms.add(item.term.toLowerCase());
    });
  }

  /**
   * ドメイン用語の取得
   */
  getDomainTerm(term: string): DomainTerm | null {
    return this.domainTerms.get(term.toLowerCase()) || null;
  }

  /**
   * 推奨される命名の取得
   */
  getRecommendedNaming(term: string, type: keyof typeof NAMING_PATTERNS): string[] {
    const domainTerm = this.getDomainTerm(term);
    if (!domainTerm) {
      return [this.patterns[type].autoFix?.(term) || term];
    }

    const usage = domainTerm.usage;
    switch (type) {
      case 'COMPONENT':
        return [usage.component, toPascalCase(domainTerm.english)];
      case 'HOOK':
        return [usage.hook, `use${toPascalCase(domainTerm.english)}`];
      case 'TYPE':
        return [usage.type, toPascalCase(domainTerm.english)];
      case 'CONSTANT':
        return [usage.constant, toScreamingSnakeCase(domainTerm.english)];
      case 'VARIABLE':
        return [toCamelCase(domainTerm.english)];
      default:
        return [this.patterns[type].autoFix?.(domainTerm.english) || domainTerm.english];
    }
  }

  /**
   * 命名の検証
   */
  validateNaming(name: string, type: keyof typeof NAMING_PATTERNS): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      suggestions: [],
      errors: [],
      warnings: [],
    };

    const pattern = this.patterns[type];

    // パターンマッチング
    if (!pattern.pattern.test(name)) {
      result.isValid = false;
      result.errors.push(
        `名前 "${name}" は ${type} のパターンに適合しません: ${pattern.description}`,
      );

      if (pattern.autoFix) {
        result.suggestions.push(pattern.autoFix(name));
      }
    }

    // 禁止用語チェック
    const lowerName = name.toLowerCase();
    for (const forbiddenTerm of this.forbiddenTerms) {
      if (lowerName.includes(forbiddenTerm)) {
        result.isValid = false;
        const forbiddenData = namingDictionary.forbiddenTerms.find((f) => f.term === forbiddenTerm);
        result.errors.push(
          `禁止用語 "${forbiddenTerm}" が含まれています: ${forbiddenData?.reason}`,
        );
        if (forbiddenData?.alternatives) {
          result.suggestions.push(...forbiddenData.alternatives);
        }
      }
    }

    // ドメイン用語の推奨事項
    const words = this.extractWords(name);
    words.forEach((word) => {
      const domainTerm = this.getDomainTerm(word);
      if (domainTerm) {
        const recommended = this.getRecommendedNaming(word, type);
        if (!recommended.includes(name)) {
          result.warnings.push(`ドメイン用語 "${word}" の推奨命名: ${recommended.join(', ')}`);
          result.suggestions.push(...recommended);
        }
      }
    });

    // 重複を除去
    result.suggestions = [...new Set(result.suggestions)];

    return result;
  }

  /**
   * 名前から単語を抽出
   */
  private extractWords(name: string): string[] {
    return name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z]/g, ' ')
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word) => word.toLowerCase());
  }

  /**
   * 自動修正の提案
   */
  autoFix(name: string, type: keyof typeof NAMING_PATTERNS): string {
    const pattern = this.patterns[type];
    if (pattern.autoFix) {
      return pattern.autoFix(name);
    }
    return name;
  }

  /**
   * 日本語から英語への変換提案
   */
  translateFromJapanese(japanese: string): string[] {
    const suggestions: string[] = [];

    // 完全一致の検索
    for (const [_key, term] of this.domainTerms) {
      if (term.japanese === japanese) {
        suggestions.push(term.english);
      }
    }

    // 部分一致の検索
    if (suggestions.length === 0) {
      for (const [_key, term] of this.domainTerms) {
        if (term.japanese.includes(japanese) || japanese.includes(term.japanese)) {
          suggestions.push(term.english);
        }
      }
    }

    return [...new Set(suggestions)];
  }

  /**
   * ファイル全体の命名検証
   */
  validateFile(content: string, filePath: string): ValidationResult[] {
    const results: ValidationResult[] = [];

    // TypeScript/JavaScript のパターンマッチング
    const patterns = {
      // インターフェース定義
      interface: /interface\s+(\w+)/g,
      // 型定義
      type: /type\s+(\w+)/g,
      // クラス定義
      class: /class\s+(\w+)/g,
      // 関数定義
      function: /function\s+(\w+)/g,
      // 変数定義
      variable: /(const|let|var)\s+(\w+)/g,
      // React コンポーネント
      component: /(?:export\s+(?:default\s+)?)?(?:function|const)\s+([A-Z]\w*)/g,
      // カスタムフック
      hook: /(?:export\s+(?:default\s+)?)?(?:function|const)\s+(use[A-Z]\w*)/g,
    };

    Object.entries(patterns).forEach(([patternType, regex]) => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const name = match[1] || match[2];
        if (name) {
          let namingType: keyof typeof NAMING_PATTERNS;
          switch (patternType) {
            case 'interface':
            case 'type':
            case 'class':
              namingType = 'TYPE';
              break;
            case 'function':
              namingType = 'VARIABLE';
              break;
            case 'variable':
              namingType = 'VARIABLE';
              break;
            case 'component':
              namingType = 'COMPONENT';
              break;
            case 'hook':
              namingType = 'HOOK';
              break;
            default:
              namingType = 'VARIABLE';
          }

          const validation = this.validateNaming(name, namingType);
          if (!validation.isValid) {
            results.push({
              ...validation,
              errors: validation.errors.map((error) => `${filePath}: ${error}`),
            });
          }
        }
      }
    });

    return results;
  }

  /**
   * 統計情報の取得
   */
  getStatistics(): {
    totalDomainTerms: number;
    categoryCounts: Record<string, number>;
    forbiddenTermsCount: number;
    patternsCount: number;
  } {
    const categories: Record<string, number> = {};

    for (const term of this.domainTerms.values()) {
      categories[term.category] = (categories[term.category] || 0) + 1;
    }

    return {
      totalDomainTerms: this.domainTerms.size,
      categoryCounts: categories,
      forbiddenTermsCount: this.forbiddenTerms.size,
      patternsCount: Object.keys(this.patterns).length,
    };
  }
}

// ==============================
// グローバルインスタンス
// ==============================

export const namingManager = new NamingConventionManager();

// ==============================
// 便利な関数のエクスポート
// ==============================

export function validateNaming(name: string, type: keyof typeof NAMING_PATTERNS): ValidationResult {
  return namingManager.validateNaming(name, type);
}

export function getRecommendedNaming(term: string, type: keyof typeof NAMING_PATTERNS): string[] {
  return namingManager.getRecommendedNaming(term, type);
}

export function autoFixNaming(name: string, type: keyof typeof NAMING_PATTERNS): string {
  return namingManager.autoFix(name, type);
}

export function translateFromJapanese(japanese: string): string[] {
  return namingManager.translateFromJapanese(japanese);
}
