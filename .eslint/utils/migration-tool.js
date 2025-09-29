#!/usr/bin/env node
/**
 * ESLint環境別エラーレベル統一 - マイグレーションツール
 *
 * 段階的移行戦略:
 * 1. 現在のエラーレベル分析
 * 2. 新規ファイル検出・error適用
 * 3. 既存ファイル段階的移行
 * 4. 移行進捗レポート
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { isNewFile, getFileAge, getRuleLevel } = require('../configs/rule-levels');

class ESLintMigrationTool {
  constructor() {
    this.configPath = '.eslint/configs/base.js';
    this.reportPath = '.eslint/reports/migration-report.json';
    this.migrationRules = [
      'unused-imports/no-unused-imports',
      'import/order',
      '@typescript-eslint/no-explicit-any',
      'prefer-const',
      'no-var'
    ];
  }

  // 1. 現在のエラーレベル分析
  async analyzeCurrentState() {
    console.log('🔍 現在のESLint設定を分析中...');

    const files = this.getAllTSXFiles();
    const analysis = {
      totalFiles: files.length,
      newFiles: 0,
      oldFiles: 0,
      recentFiles: 0,
      ruleAnalysis: {},
      timestamp: new Date().toISOString()
    };

    for (const file of files) {
      const isNew = isNewFile(file);
      const age = getFileAge(file);

      if (isNew) {
        analysis.newFiles++;
      } else if (age > 30) {
        analysis.oldFiles++;
      } else {
        analysis.recentFiles++;
      }

      // ルール別分析
      for (const rule of this.migrationRules) {
        if (!analysis.ruleAnalysis[rule]) {
          analysis.ruleAnalysis[rule] = {
            newFileLevel: 'error',
            oldFileLevel: 'error',
            recentFileLevel: 'warn',
            affectedFiles: 0
          };
        }

        const level = getRuleLevel(rule, file);
        if (level === 'warn') {
          analysis.ruleAnalysis[rule].affectedFiles++;
        }
      }
    }

    return analysis;
  }

  // 2. 実際のESLint実行・エラー検出
  async runESLintAnalysis() {
    console.log('⚡ ESLint実行・エラー検出中...');

    try {
      // 開発環境でのESLint実行
      const devResult = this.runESLintCommand('development');
      // 本番環境でのESLint実行
      const prodResult = this.runESLintCommand('production');

      return {
        development: devResult,
        production: prodResult,
        consistency: this.compareResults(devResult, prodResult)
      };
    } catch (error) {
      console.warn('⚠️ ESLint実行中にエラーが発生:', error.message);
      return null;
    }
  }

  // ESLint実行コマンド
  runESLintCommand(env) {
    try {
      const result = execSync(
        `NODE_ENV=${env} npx eslint . -c .eslint/index.js --format json`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
      return JSON.parse(result);
    } catch (error) {
      // ESLintエラーがある場合もstderrからJSONを取得
      if (error.stdout) {
        try {
          return JSON.parse(error.stdout);
        } catch {
          return { error: error.message, files: [] };
        }
      }
      return { error: error.message, files: [] };
    }
  }

  // 結果比較
  compareResults(devResult, prodResult) {
    const devErrors = this.countErrors(devResult);
    const prodErrors = this.countErrors(prodResult);

    return {
      devErrors,
      prodErrors,
      difference: prodErrors - devErrors,
      isConsistent: devErrors === prodErrors,
      problematicRules: this.findProblematicRules(devResult, prodResult)
    };
  }

  // エラー数カウント
  countErrors(result) {
    if (!result || !result.length) return 0;
    return result.reduce((sum, file) => sum + file.errorCount, 0);
  }

  // 問題のあるルール特定
  findProblematicRules(devResult, prodResult) {
    const devRules = this.extractRules(devResult);
    const prodRules = this.extractRules(prodResult);
    const problematic = [];

    for (const rule of this.migrationRules) {
      const devCount = devRules[rule] || 0;
      const prodCount = prodRules[rule] || 0;

      if (devCount !== prodCount) {
        problematic.push({
          rule,
          devCount,
          prodCount,
          difference: prodCount - devCount
        });
      }
    }

    return problematic;
  }

  // ルール別エラー抽出
  extractRules(result) {
    if (!result || !result.length) return {};

    const rules = {};
    result.forEach(file => {
      file.messages?.forEach(message => {
        if (message.ruleId && message.severity === 2) {
          rules[message.ruleId] = (rules[message.ruleId] || 0) + 1;
        }
      });
    });

    return rules;
  }

  // 3. 移行戦略実行
  async executeMigration(options = {}) {
    const {
      dryRun = true,
      phase = 'analysis', // analysis | progressive | strict
      target = 'all' // all | new | old
    } = options;

    console.log(`🚀 移行戦略実行中 (phase: ${phase}, target: ${target}, dryRun: ${dryRun})`);

    const analysis = await this.analyzeCurrentState();
    const eslintAnalysis = await this.runESLintAnalysis();

    const migrationPlan = {
      phase,
      target,
      analysis,
      eslintAnalysis,
      recommendations: this.generateRecommendations(analysis, eslintAnalysis),
      actions: []
    };

    if (phase === 'progressive') {
      migrationPlan.actions = this.generateProgressiveActions(analysis);
    } else if (phase === 'strict') {
      migrationPlan.actions = this.generateStrictActions(analysis);
    }

    if (!dryRun && migrationPlan.actions.length > 0) {
      await this.executeActions(migrationPlan.actions);
    }

    return migrationPlan;
  }

  // 推奨事項生成
  generateRecommendations(analysis, eslintAnalysis) {
    const recommendations = [];

    // 一貫性チェック
    if (eslintAnalysis?.consistency && !eslintAnalysis.consistency.isConsistent) {
      recommendations.push({
        type: 'critical',
        message: `環境間でエラー数が${eslintAnalysis.consistency.difference}個異なります`,
        action: '環境別エラーレベル統一を実行してください'
      });
    }

    // 新規ファイル対応
    if (analysis.newFiles > 0) {
      recommendations.push({
        type: 'info',
        message: `${analysis.newFiles}個の新規ファイルが検出されました`,
        action: '新規ファイルにはstrictルールを適用します'
      });
    }

    // 段階的移行対象
    if (analysis.recentFiles > 0) {
      recommendations.push({
        type: 'info',
        message: `${analysis.recentFiles}個のファイルが段階的移行対象です`,
        action: 'warnレベルから徐々にerrorレベルに移行します'
      });
    }

    return recommendations;
  }

  // 段階的移行アクション生成
  generateProgressiveActions(analysis) {
    const actions = [];

    // 新規ファイル用のstrictルール適用
    if (analysis.newFiles > 0) {
      actions.push({
        type: 'config_update',
        description: '新規ファイル用strictルール設定追加',
        target: 'new_files',
        changes: {
          rules: this.migrationRules.reduce((acc, rule) => {
            acc[rule] = 'error';
            return acc;
          }, {})
        }
      });
    }

    return actions;
  }

  // 厳格移行アクション生成
  generateStrictActions(analysis) {
    const actions = [];

    // 全ファイルにstrictルール適用
    actions.push({
      type: 'config_update',
      description: '全ファイルにstrictルール適用',
      target: 'all_files',
      changes: {
        rules: this.migrationRules.reduce((acc, rule) => {
          acc[rule] = 'error';
          return acc;
        }, {})
      }
    });

    return actions;
  }

  // アクション実行
  async executeActions(actions) {
    for (const action of actions) {
      console.log(`⚙️ 実行中: ${action.description}`);
      // 実際の設定変更はdryRunでない場合のみ
      if (action.type === 'config_update') {
        await this.updateESLintConfig(action.changes);
      }
    }
  }

  // ESLint設定更新
  async updateESLintConfig(changes) {
    // 設定ファイル更新の実装
    console.log('🔧 ESLint設定を更新中...');
    // 実際の実装は必要に応じて
  }

  // ユーティリティ: 全TSXファイル取得
  getAllTSXFiles() {
    try {
      const result = execSync('find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      return result.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  // 4. レポート生成
  async generateReport(migrationPlan) {
    console.log('📊 移行レポートを生成中...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: migrationPlan.analysis.totalFiles,
        newFiles: migrationPlan.analysis.newFiles,
        recentFiles: migrationPlan.analysis.recentFiles,
        oldFiles: migrationPlan.analysis.oldFiles,
        isConsistent: migrationPlan.eslintAnalysis?.consistency?.isConsistent || false
      },
      details: migrationPlan,
      nextSteps: this.generateNextSteps(migrationPlan)
    };

    // レポート保存
    const reportDir = path.dirname(this.reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));

    // レポート表示
    this.displayReport(report);

    return report;
  }

  // 次のステップ生成
  generateNextSteps(migrationPlan) {
    const steps = [];

    if (migrationPlan.analysis.newFiles > 0) {
      steps.push('新規ファイルのstrictルール適用確認');
    }

    if (migrationPlan.analysis.recentFiles > 0) {
      steps.push('段階的移行ファイルの定期チェック');
    }

    if (!migrationPlan.eslintAnalysis?.consistency?.isConsistent) {
      steps.push('環境間一貫性の問題解決');
    }

    steps.push('並列実行によるパフォーマンス改善測定');

    return steps;
  }

  // レポート表示
  displayReport(report) {
    console.log('\n📈 ESLint環境別エラーレベル統一 - 移行レポート');
    console.log('=' .repeat(60));
    console.log(`📅 実行日時: ${report.timestamp}`);
    console.log(`📁 総ファイル数: ${report.summary.totalFiles}`);
    console.log(`🆕 新規ファイル: ${report.summary.newFiles}`);
    console.log(`📊 段階的移行対象: ${report.summary.recentFiles}`);
    console.log(`📚 古いファイル: ${report.summary.oldFiles}`);
    console.log(`✅ 環境間一貫性: ${report.summary.isConsistent ? 'OK' : 'NG'}`);

    if (report.details.recommendations) {
      console.log('\n💡 推奨事項:');
      report.details.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. [${rec.type.toUpperCase()}] ${rec.message}`);
        console.log(`      → ${rec.action}`);
      });
    }

    if (report.nextSteps) {
      console.log('\n🎯 次のステップ:');
      report.nextSteps.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });
    }

    console.log(`\n📄 詳細レポート: ${this.reportPath}`);
    console.log('=' .repeat(60));
  }
}

// CLI実行
async function main() {
  const args = process.argv.slice(2);
  const tool = new ESLintMigrationTool();

  const command = args[0] || 'analyze';
  const options = {
    dryRun: !args.includes('--apply'),
    phase: args.includes('--strict') ? 'strict' : args.includes('--progressive') ? 'progressive' : 'analysis',
    target: args.includes('--new') ? 'new' : args.includes('--old') ? 'old' : 'all'
  };

  try {
    switch (command) {
      case 'analyze':
        console.log('🎯 分析モード: 現在の状態を分析します');
        const analysis = await tool.analyzeCurrentState();
        const eslintAnalysis = await tool.runESLintAnalysis();
        const migrationPlan = { analysis, eslintAnalysis, recommendations: tool.generateRecommendations(analysis, eslintAnalysis) };
        await tool.generateReport(migrationPlan);
        break;

      case 'migrate':
        console.log('🚀 移行モード: 段階的移行を実行します');
        const migrationResult = await tool.executeMigration(options);
        await tool.generateReport(migrationResult);
        break;

      case 'report':
        console.log('📊 レポートモード: 最新レポートを表示します');
        if (fs.existsSync(tool.reportPath)) {
          const report = JSON.parse(fs.readFileSync(tool.reportPath, 'utf8'));
          tool.displayReport(report);
        } else {
          console.log('レポートファイルが見つかりません。まず analyze を実行してください。');
        }
        break;

      default:
        console.log('使用方法:');
        console.log('  node .eslint/utils/migration-tool.js analyze              # 現在の状態分析');
        console.log('  node .eslint/utils/migration-tool.js migrate              # 段階的移行（dryRun）');
        console.log('  node .eslint/utils/migration-tool.js migrate --apply      # 実際の移行実行');
        console.log('  node .eslint/utils/migration-tool.js migrate --strict     # 厳格移行');
        console.log('  node .eslint/utils/migration-tool.js report               # レポート表示');
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ESLintMigrationTool };