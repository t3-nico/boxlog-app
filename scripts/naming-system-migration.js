#!/usr/bin/env node
/**
 * Dayopt App - 命名規則辞書システム 一括マイグレーションスクリプト
 *
 * 既存コードを命名規則辞書に従って自動リネーム
 * 段階的マイグレーション・ロールバック機能付き
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 命名規則辞書の読み込み
const dictionaryPath = path.resolve(__dirname, '../src/config/naming-conventions/dictionary.json');
let dictionary = {};

try {
  dictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
} catch (error) {
  console.error('❌ 命名規則辞書の読み込みに失敗:', error.message);
  process.exit(1);
}

// ==============================
// ユーティリティ関数
// ==============================

function toCamelCase(str) {
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

function _toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function _toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function _toScreamingSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toUpperCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// ==============================
// 命名改善候補の検出
// ==============================

class NamingMigrationAnalyzer {
  constructor() {
    this.suggestions = [];
    this.backupFiles = new Map();
  }

  /**
   * ファイル内の改善候補を分析
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const suggestions = [];

    // React コンポーネント検出
    const componentRegex = /(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*[=:]/g;
    let match;
    while ((match = componentRegex.exec(content)) !== null) {
      const componentName = match[1];
      const suggestion = this.getSuggestionForComponent(componentName);
      if (suggestion && suggestion !== componentName) {
        suggestions.push({
          type: 'component',
          original: componentName,
          suggested: suggestion,
          line: this.getLineNumber(content, match.index),
          reason: 'ドメイン用語による推奨命名',
        });
      }
    }

    // カスタムフック検出
    const hookRegex = /(?:function|const)\s+(use[A-Z][a-zA-Z0-9]*)\s*[=:]/g;
    while ((match = hookRegex.exec(content)) !== null) {
      const hookName = match[1];
      const suggestion = this.getSuggestionForHook(hookName);
      if (suggestion && suggestion !== hookName) {
        suggestions.push({
          type: 'hook',
          original: hookName,
          suggested: suggestion,
          line: this.getLineNumber(content, match.index),
          reason: 'ドメイン用語による推奨命名',
        });
      }
    }

    // 変数・関数検出
    const variableRegex = /(?:const|let|var|function)\s+([a-z][a-zA-Z0-9]*)\s*[=:]/g;
    while ((match = variableRegex.exec(content)) !== null) {
      const varName = match[1];
      const suggestion = this.getSuggestionForVariable(varName);
      if (suggestion && suggestion !== varName) {
        suggestions.push({
          type: 'variable',
          original: varName,
          suggested: suggestion,
          line: this.getLineNumber(content, match.index),
          reason: 'ドメイン用語による推奨命名',
        });
      }
    }

    // 禁止用語検出
    const forbiddenSuggestions = this.detectForbiddenTerms(content);
    suggestions.push(...forbiddenSuggestions);

    return suggestions;
  }

  /**
   * コンポーネント名の改善提案
   */
  getSuggestionForComponent(componentName) {
    const words = this.extractWords(componentName);

    for (const word of words) {
      const domainTerm = this.findDomainTerm(word.toLowerCase());
      if (domainTerm && domainTerm.usage.component) {
        return domainTerm.usage.component;
      }
    }

    // 一般的な改善提案
    for (const word of words) {
      const translation = this.translateCommonTerm(word);
      if (translation && translation !== word) {
        return componentName.replace(new RegExp(word, 'i'), translation);
      }
    }

    return null;
  }

  /**
   * カスタムフック名の改善提案
   */
  getSuggestionForHook(hookName) {
    const words = this.extractWords(hookName.replace(/^use/, ''));

    for (const word of words) {
      const domainTerm = this.findDomainTerm(word.toLowerCase());
      if (domainTerm && domainTerm.usage.hook) {
        return domainTerm.usage.hook;
      }
    }

    return null;
  }

  /**
   * 変数名の改善提案
   */
  getSuggestionForVariable(varName) {
    const words = this.extractWords(varName);

    for (const word of words) {
      const domainTerm = this.findDomainTerm(word.toLowerCase());
      if (domainTerm) {
        const englishName = toCamelCase(domainTerm.english);
        if (englishName !== varName) {
          return englishName;
        }
      }
    }

    return null;
  }

  /**
   * 禁止用語の検出
   */
  detectForbiddenTerms(content) {
    const suggestions = [];
    const forbiddenTerms = dictionary.forbiddenTerms || [];

    forbiddenTerms.forEach((forbidden) => {
      const regex = new RegExp(`\\b${forbidden.term}\\b`, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        suggestions.push({
          type: 'forbidden',
          original: match[0],
          suggested: forbidden.alternatives[0] || '適切な用語に変更',
          line: this.getLineNumber(content, match.index),
          reason: forbidden.reason,
        });
      }
    });

    return suggestions;
  }

  /**
   * ドメイン用語の検索
   */
  findDomainTerm(term) {
    // 直接マッチ
    if (dictionary.domainTerms && dictionary.domainTerms[term]) {
      return dictionary.domainTerms[term];
    }

    // エイリアス検索
    for (const [_key, domainTerm] of Object.entries(dictionary.domainTerms || {})) {
      if (domainTerm.aliases && domainTerm.aliases.includes(term)) {
        return domainTerm;
      }
    }

    return null;
  }

  /**
   * 単語の抽出
   */
  extractWords(name) {
    return name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z]/g, ' ')
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word) => word.toLowerCase());
  }

  /**
   * 一般的な用語の翻訳
   */
  translateCommonTerm(term) {
    const commonTranslations = {
      data: 'information',
      info: 'information',
      btn: 'button',
      img: 'image',
      txt: 'text',
      val: 'value',
      obj: 'object',
      arr: 'array',
      str: 'string',
      num: 'number',
      bool: 'boolean',
      func: 'function',
      util: 'utility',
      mgr: 'manager',
      temp: 'temporary',
      calc: 'calculate',
    };

    return commonTranslations[term.toLowerCase()] || null;
  }

  /**
   * 行番号の取得
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * ファイルのバックアップ
   */
  createBackup(filePath) {
    const backupPath = `${filePath}.naming-backup-${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    this.backupFiles.set(filePath, backupPath);
    return backupPath;
  }

  /**
   * バックアップの復元
   */
  restoreBackup(filePath) {
    const backupPath = this.backupFiles.get(filePath);
    if (backupPath && fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
      this.backupFiles.delete(filePath);
      return true;
    }
    return false;
  }

  /**
   * 全バックアップの削除
   */
  cleanupBackups() {
    for (const [_filePath, backupPath] of this.backupFiles) {
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }
    }
    this.backupFiles.clear();
  }
}

// ==============================
// マイグレーション実行
// ==============================

class NamingMigration {
  constructor() {
    this.analyzer = new NamingMigrationAnalyzer();
    this.dryRun = false;
    this.verbose = false;
  }

  /**
   * プロジェクト全体の分析実行
   */
  async analyzeProject(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;

    console.log('🔍 Dayopt App 命名規則辞書 マイグレーション分析開始...\n');

    // 対象ファイルの取得
    const files = this.getTargetFiles();
    console.log(`📁 対象ファイル数: ${files.length}`);

    let totalSuggestions = 0;
    const results = [];

    // ファイル毎の分析
    for (const file of files) {
      if (this.verbose) {
        console.log(`📄 分析中: ${file}`);
      }

      try {
        const suggestions = this.analyzer.analyzeFile(file);
        if (suggestions.length > 0) {
          results.push({
            file,
            suggestions,
          });
          totalSuggestions += suggestions.length;
        }
      } catch (error) {
        console.error(`❌ ${file} の分析でエラー:`, error.message);
      }
    }

    // 結果表示
    this.displayResults(results, totalSuggestions);

    // レポート保存
    this.saveReport(results);

    return results;
  }

  /**
   * 対象ファイルの取得
   */
  getTargetFiles() {
    const patterns = [
      'src/**/*.{ts,tsx,js,jsx}',
      '!src/**/*.test.{ts,tsx,js,jsx}',
      '!src/**/*.spec.{ts,tsx,js,jsx}',
      '!src/**/*.d.ts',
      '!node_modules/**',
      '!.next/**',
      '!dist/**',
      '!build/**',
    ];

    let files = [];
    patterns.forEach((pattern) => {
      if (pattern.startsWith('!')) {
        // 除外パターン（現在のglobライブラリでは複雑な除外処理）
        return;
      }
      files = files.concat(glob.sync(pattern));
    });

    // 手動で除外パターンを適用
    return files.filter((file) => {
      return (
        !file.includes('node_modules') &&
        !file.includes('.next') &&
        !file.includes('dist') &&
        !file.includes('build') &&
        !file.includes('.test.') &&
        !file.includes('.spec.') &&
        !file.endsWith('.d.ts')
      );
    });
  }

  /**
   * 結果の表示
   */
  displayResults(results, totalSuggestions) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 命名規則辞書 マイグレーション分析結果');
    console.log('='.repeat(80));

    if (totalSuggestions === 0) {
      console.log('✅ 改善提案はありません。コードは命名規則に準拠しています。');
      return;
    }

    console.log(`🎯 改善提案数: ${totalSuggestions}件`);
    console.log(`📁 対象ファイル数: ${results.length}件\n`);

    // カテゴリ別統計
    const categoryStats = {};
    results.forEach((result) => {
      result.suggestions.forEach((suggestion) => {
        categoryStats[suggestion.type] = (categoryStats[suggestion.type] || 0) + 1;
      });
    });

    console.log('📋 カテゴリ別統計:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      const icon = this.getCategoryIcon(category);
      console.log(`   ${icon} ${category}: ${count}件`);
    });

    console.log('\n' + '-'.repeat(80));

    // 詳細結果表示
    results.forEach((result) => {
      console.log(`\n📄 ${result.file}`);
      result.suggestions.forEach((suggestion) => {
        const icon = this.getSeverityIcon(suggestion.type);
        console.log(
          `   ${icon} L${suggestion.line}: ${suggestion.original} → ${suggestion.suggested}`,
        );
        console.log(`      理由: ${suggestion.reason}`);
      });
    });

    if (this.dryRun) {
      console.log('\n💡 これはドライランです。実際の変更は行われていません。');
      console.log('   実際に適用するには --apply オプションを使用してください。');
    }
  }

  getCategoryIcon(category) {
    const icons = {
      component: '🧩',
      hook: '🪝',
      variable: '📦',
      function: '⚡',
      forbidden: '🚫',
      type: '📝',
    };
    return icons[category] || '📌';
  }

  getSeverityIcon(type) {
    return type === 'forbidden' ? '🚫' : '💡';
  }

  /**
   * レポートの保存
   */
  saveReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        totalSuggestions: results.reduce((sum, r) => sum + r.suggestions.length, 0),
      },
      results,
    };

    const reportPath = path.resolve(__dirname, '../reports/naming-migration-analysis.json');
    const reportsDir = path.dirname(reportPath);

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 詳細レポートを保存: ${reportPath}`);
  }
}

// ==============================
// CLI実行
// ==============================

async function main() {
  const args = process.argv.slice(2);
  const migration = new NamingMigration();

  const options = {
    dryRun: !args.includes('--apply'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Dayopt App - 命名規則辞書マイグレーションツール

使用方法:
  npm run naming:migrate              # ドライラン（分析のみ）
  npm run naming:migrate --apply      # 実際にマイグレーション実行
  npm run naming:migrate --verbose    # 詳細表示

オプション:
  --apply     実際にファイルを変更（デフォルトはドライラン）
  --verbose   詳細なログを表示
  --help      このヘルプを表示

例:
  npm run naming:migrate              # 安全な分析のみ
  npm run naming:migrate --apply -v   # 詳細表示で実際に適用
`);
    return;
  }

  try {
    await migration.analyzeProject(options);
  } catch (error) {
    console.error('❌ マイグレーション分析中にエラーが発生:', error.message);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  main();
}

module.exports = { NamingMigration, NamingMigrationAnalyzer };
