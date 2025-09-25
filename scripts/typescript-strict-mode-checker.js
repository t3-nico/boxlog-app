#!/usr/bin/env node

/**
 * ===================================================================
 * TypeScript超厳密モード監視システム - Phase 3b
 * ===================================================================
 *
 * TypeScript型安全性の極限追求システム
 * BigTech標準の最高レベル型安全性を実現
 *
 * 企業レベルの型安全管理:
 * - TypeScriptエラー分析・分類・優先度付け
 * - 段階的型安全性向上アプローチ
 * - エラー数追跡・回帰検出システム
 * - 自動型修正提案・コード品質向上
 *
 * @version 1.0.0
 * @since Phase 3b: TypeScript超厳密モード実装
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ===========================================
// 設定: TypeScript品質管理システム
// ===========================================

const CONFIG = {
  // TypeScript設定強化レベル
  strictnessLevels: {
    current: 'intermediate', // 現在レベル
    target: 'enterprise',    // 目標レベル

    levels: {
      basic: {
        description: '基本的な型チェック',
        compilerOptions: {
          strict: true,
          noImplicitAny: true,
        },
        maxErrors: 500
      },
      intermediate: {
        description: '中間レベルの型安全性',
        compilerOptions: {
          strict: true,
          noImplicitAny: true,
          noImplicitReturns: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
        },
        maxErrors: 200
      },
      advanced: {
        description: '高度な型安全性',
        compilerOptions: {
          strict: true,
          noImplicitAny: true,
          noImplicitReturns: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          exactOptionalPropertyTypes: true,
          noImplicitOverride: true,
          noPropertyAccessFromIndexSignature: true,
        },
        maxErrors: 50
      },
      enterprise: {
        description: '企業レベル最高型安全性',
        compilerOptions: {
          strict: true,
          noImplicitAny: true,
          noImplicitReturns: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          exactOptionalPropertyTypes: true,
          noImplicitOverride: true,
          noPropertyAccessFromIndexSignature: true,
          noUncheckedIndexedAccess: true,
          allowUnusedLabels: false,
          allowUnreachableCode: false,
          noFallthroughCasesInSwitch: true,
          noImplicitThis: true,
        },
        maxErrors: 0
      }
    }
  },

  // エラー分類システム
  errorCategories: {
    critical: {
      patterns: [
        'Cannot find name',
        'Cannot find module',
        'is not assignable to type',
        'Property .* does not exist',
        'Type .* has no properties in common',
        'Object is possibly',
        'implicitly has an \'any\' type'
      ],
      priority: 1,
      description: '即座に修正が必要',
      icon: '🔴'
    },
    high: {
      patterns: [
        'Type .* is not assignable',
        'Argument of type .* is not assignable',
        'No overload matches this call',
        'used before being assigned',
        'Block-scoped variable .* used before',
        'Variable .* is used before being assigned'
      ],
      priority: 2,
      description: '高優先度で修正',
      icon: '🟡'
    },
    medium: {
      patterns: [
        'is declared but its value is never read',
        'Parameter .* implicitly has an \'any\' type',
        'Return type of .* function is inferred',
        'Function implementation is missing'
      ],
      priority: 3,
      description: '計画的に修正',
      icon: '🟠'
    },
    low: {
      patterns: [
        'Expected .* arguments, but got',
        'This condition will always return',
        'Unreachable code detected'
      ],
      priority: 4,
      description: 'レビュー・検討',
      icon: '🟢'
    }
  },

  // 分析対象ファイル
  includePatterns: [
    'src/**/*.ts',
    'src/**/*.tsx'
  ],

  // 除外パターン
  excludePatterns: [
    'src/test/**',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.d.ts',
    'node_modules/**'
  ],

  // ベースライン管理
  baselineFile: '.typescript-baseline.json',

  // 閾値設定
  thresholds: {
    maxTotalErrors: 100,           // 全エラー数制限
    maxCriticalErrors: 10,         // Critical エラー制限
    maxErrorsPerFile: 5,           // ファイルごとエラー制限
    regressionThreshold: 10        // 回帰検出閾値（エラー増加）
  }
};

// ===========================================
// ユーティリティ関数
// ===========================================

/**
 * TypeScriptコンパイル実行
 */
function runTypeScriptCheck() {
  try {
    console.log('🔍 TypeScript厳密チェック実行中...');

    const output = execSync('npx tsc --noEmit --pretty false', {
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    return { success: true, output: output || '', errors: [] };

  } catch (error) {
    // TypeScriptエラーがある場合はexitCode 1で例外が投げられる
    const errorOutput = error.stdout || error.message || '';
    const errors = parseTypeScriptErrors(errorOutput);

    return {
      success: false,
      output: errorOutput,
      errors: errors,
      exitCode: error.status
    };
  }
}

/**
 * TypeScriptエラー解析
 */
function parseTypeScriptErrors(output) {
  if (!output || typeof output !== 'string') return [];

  const errors = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // TypeScriptエラー形式: src/file.ts(10,5): error TS2322: Type 'string' is not assignable...
    const errorMatch = trimmedLine.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/);

    if (errorMatch) {
      const [, filePath, line, column, errorCode, message] = errorMatch;

      const error = {
        file: filePath,
        line: parseInt(line),
        column: parseInt(column),
        errorCode,
        message: message.trim(),
        severity: categorizeError(message),
        category: getErrorCategory(message),
        rawLine: trimmedLine
      };

      errors.push(error);
    }
  }

  return errors;
}

/**
 * エラー分類
 */
function categorizeError(message) {
  for (const [severity, config] of Object.entries(CONFIG.errorCategories)) {
    for (const pattern of config.patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(message)) {
        return severity;
      }
    }
  }
  return 'medium'; // デフォルト分類
}

/**
 * エラーカテゴリー取得
 */
function getErrorCategory(message) {
  if (/cannot find|module/i.test(message)) return 'import';
  if (/not assignable|type/i.test(message)) return 'type-mismatch';
  if (/property.*does not exist/i.test(message)) return 'property-access';
  if (/implicitly.*any/i.test(message)) return 'implicit-any';
  if (/used before|assigned/i.test(message)) return 'usage-order';
  if (/overload/i.test(message)) return 'function-overload';
  if (/possibly null|undefined/i.test(message)) return 'null-undefined';

  return 'other';
}

/**
 * エラー統計生成
 */
function generateErrorStats(errors) {
  const stats = {
    total: errors.length,
    bySeverity: {},
    byCategory: {},
    byFile: {},
    topErrors: {}
  };

  // 重要度別統計
  Object.keys(CONFIG.errorCategories).forEach(severity => {
    stats.bySeverity[severity] = errors.filter(e => e.severity === severity).length;
  });

  // カテゴリ別統計
  errors.forEach(error => {
    const category = error.category || 'other';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
  });

  // ファイル別統計
  errors.forEach(error => {
    const file = error.file;
    if (!stats.byFile[file]) {
      stats.byFile[file] = { count: 0, errors: [] };
    }
    stats.byFile[file].count++;
    stats.byFile[file].errors.push(error);
  });

  // 頻出エラータイプ
  const errorCounts = {};
  errors.forEach(error => {
    const key = error.errorCode || 'Unknown';
    errorCounts[key] = (errorCounts[key] || 0) + 1;
  });

  stats.topErrors = Object.entries(errorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  return stats;
}

/**
 * ベースライン管理
 */
function loadBaseline() {
  try {
    if (fs.existsSync(CONFIG.baselineFile)) {
      const content = fs.readFileSync(CONFIG.baselineFile, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.log('⚠️  ベースライン読み込みエラー:', error.message);
  }
  return null;
}

function saveBaseline(stats) {
  try {
    const baseline = {
      timestamp: new Date().toISOString(),
      stats: stats,
      version: '1.0.0'
    };

    fs.writeFileSync(CONFIG.baselineFile, JSON.stringify(baseline, null, 2));
    console.log(`💾 ベースライン保存: ${CONFIG.baselineFile}`);
  } catch (error) {
    console.error('❌ ベースライン保存エラー:', error.message);
  }
}

/**
 * 回帰検出
 */
function detectRegression(currentStats, baseline) {
  if (!baseline) {
    return { hasRegression: false, message: 'ベースラインなし' };
  }

  const previousTotal = baseline.stats.total;
  const currentTotal = currentStats.total;
  const increase = currentTotal - previousTotal;

  if (increase > CONFIG.thresholds.regressionThreshold) {
    return {
      hasRegression: true,
      message: `エラー数が ${increase}件 増加 (${previousTotal} → ${currentTotal})`,
      details: {
        previous: previousTotal,
        current: currentTotal,
        increase: increase
      }
    };
  }

  if (increase > 0) {
    return {
      hasRegression: false,
      message: `軽微な増加: ${increase}件 (許容範囲内)`,
      details: {
        previous: previousTotal,
        current: currentTotal,
        increase: increase
      }
    };
  }

  return {
    hasRegression: false,
    message: increase < 0 ?
      `改善: ${Math.abs(increase)}件のエラー削減` :
      '変化なし',
    details: {
      previous: previousTotal,
      current: currentTotal,
      decrease: Math.abs(increase)
    }
  };
}

/**
 * 修正提案生成
 */
function generateFixSuggestions(errors) {
  const suggestions = [];
  const topFilesByErrors = Object.entries(
    errors.reduce((acc, error) => {
      acc[error.file] = (acc[error.file] || 0) + 1;
      return acc;
    }, {})
  )
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5);

  suggestions.push({
    type: 'priority-files',
    title: '🎯 優先対応ファイル',
    description: 'エラー数が多いファイルから順に修正',
    files: topFilesByErrors.map(([file, count]) => `${file} (${count}件)`)
  });

  // Critical エラー対応
  const criticalErrors = errors.filter(e => e.severity === 'critical');
  if (criticalErrors.length > 0) {
    suggestions.push({
      type: 'critical-fixes',
      title: '🔴 緊急修正項目',
      description: 'アプリケーション動作に影響する重要なエラー',
      count: criticalErrors.length,
      examples: criticalErrors.slice(0, 3).map(e => ({
        file: e.file,
        line: e.line,
        message: e.message.substring(0, 80) + '...'
      }))
    });
  }

  // 型安全性向上提案
  const implicitAnyErrors = errors.filter(e => e.category === 'implicit-any');
  if (implicitAnyErrors.length > 0) {
    suggestions.push({
      type: 'type-safety',
      title: '🛡️ 型安全性向上',
      description: '明示的な型定義でコード品質を向上',
      count: implicitAnyErrors.length,
      action: '型アノテーションの追加を推奨'
    });
  }

  return suggestions;
}

// ===========================================
// メイン処理
// ===========================================

async function runTypeScriptStrictCheck() {
  const startTime = Date.now();
  console.log('🔥 TypeScript超厳密モードチェック開始...');

  // TypeScript実行
  const result = runTypeScriptCheck();
  const duration = Date.now() - startTime;

  // 統計生成
  const stats = generateErrorStats(result.errors);
  stats.duration = `${duration}ms`;

  console.log('\n📊 TypeScript品質分析結果:');
  console.log(`   ⏱️  実行時間: ${stats.duration}`);
  console.log(`   📂 分析ファイル数: ${Object.keys(stats.byFile).length}件`);
  console.log(`   🚨 総エラー数: ${stats.total}件`);

  // 重要度別表示
  console.log('\n🔍 重要度別エラー分布:');
  Object.entries(CONFIG.errorCategories).forEach(([severity, config]) => {
    const count = stats.bySeverity[severity] || 0;
    if (count > 0) {
      console.log(`   ${config.icon} ${severity.toUpperCase()}: ${count}件 - ${config.description}`);
    }
  });

  // カテゴリ別表示
  if (Object.keys(stats.byCategory).length > 0) {
    console.log('\n📋 エラーカテゴリ別:');
    Object.entries(stats.byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([category, count]) => {
        console.log(`   📌 ${category}: ${count}件`);
      });
  }

  // 頻出エラータイプ
  if (Object.keys(stats.topErrors).length > 0) {
    console.log('\n🔢 頻出エラータイプ:');
    Object.entries(stats.topErrors)
      .slice(0, 5)
      .forEach(([errorCode, count]) => {
        console.log(`   🔸 ${errorCode}: ${count}件`);
      });
  }

  // エラーが多いファイル
  const topFiles = Object.entries(stats.byFile)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 5);

  if (topFiles.length > 0) {
    console.log('\n📁 エラーが多いファイル:');
    topFiles.forEach(([file, data]) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`   📄 ${relativePath}: ${data.count}件`);
    });
  }

  // ベースライン比較・回帰検出
  const baseline = loadBaseline();
  const regression = detectRegression(stats, baseline);

  console.log('\n📈 品質トレンド:');
  console.log(`   📊 ${regression.message}`);

  if (regression.hasRegression) {
    console.log('\n🚨 回帰検出:');
    console.log(`   ⚠️  エラー数が大幅に増加しています`);
    console.log(`   📊 ${regression.details.previous} → ${regression.details.current} (+${regression.details.increase})`);
  }

  // 修正提案
  const suggestions = generateFixSuggestions(result.errors);
  if (suggestions.length > 0) {
    console.log('\n💡 修正提案:');
    suggestions.forEach((suggestion, index) => {
      console.log(`\n   ${index + 1}. ${suggestion.title}`);
      console.log(`      ${suggestion.description}`);

      if (suggestion.files) {
        suggestion.files.slice(0, 3).forEach(file => {
          console.log(`      📄 ${file}`);
        });
      }

      if (suggestion.examples) {
        suggestion.examples.forEach(example => {
          console.log(`      🔸 ${path.relative(process.cwd(), example.file)}:${example.line}`);
          console.log(`         ${example.message}`);
        });
      }
    });
  }

  // 品質ゲート判定
  const qualityGate = evaluateQualityGate(stats);
  console.log('\n🏁 品質ゲート結果:');
  console.log(`   ${qualityGate.passed ? '✅' : '❌'} ${qualityGate.message}`);

  if (!qualityGate.passed) {
    console.log('\n🚫 品質ゲート失敗理由:');
    qualityGate.violations.forEach(violation => {
      console.log(`   ❌ ${violation}`);
    });
  }

  // 次のステップ提案
  console.log('\n🎯 次のアクション:');
  if (stats.total === 0) {
    console.log('   🎉 完璧！全てのTypeScriptエラーが解決されました');
    console.log('   📈 次のレベル（enterprise）への設定強化を検討');
  } else if (stats.total < 20) {
    console.log('   🎯 残り少数のエラー修正で型安全性完全達成');
    console.log('   🔍 Critical・Highエラーを優先的に修正');
  } else if (stats.total < 100) {
    console.log('   📋 段階的なエラー修正計画を立て、継続的に改善');
    console.log('   🎯 週次での定期チェック・進捗管理を推奨');
  } else {
    console.log('   🚧 大規模な型安全化が必要');
    console.log('   📊 ファイル別・優先度別の修正計画を推奨');
  }

  // ベースライン更新（--update-baseline フラグ）
  if (process.argv.includes('--update-baseline')) {
    saveBaseline(stats);
    console.log('✅ ベースラインを更新しました');
  } else if (!baseline) {
    console.log('\n💡 ヒント: --update-baseline でベースラインを作成できます');
  }

  return {
    success: qualityGate.passed,
    stats,
    errors: result.errors,
    regression,
    suggestions
  };
}

/**
 * 品質ゲート評価
 */
function evaluateQualityGate(stats) {
  const violations = [];

  // 全体エラー数チェック
  if (stats.total > CONFIG.thresholds.maxTotalErrors) {
    violations.push(`総エラー数上限超過: ${stats.total} > ${CONFIG.thresholds.maxTotalErrors}`);
  }

  // Critical エラー数チェック
  const criticalCount = stats.bySeverity.critical || 0;
  if (criticalCount > CONFIG.thresholds.maxCriticalErrors) {
    violations.push(`Criticalエラー上限超過: ${criticalCount} > ${CONFIG.thresholds.maxCriticalErrors}`);
  }

  // ファイル別エラー数チェック
  const fileViolations = Object.entries(stats.byFile)
    .filter(([, data]) => data.count > CONFIG.thresholds.maxErrorsPerFile)
    .length;

  if (fileViolations > 0) {
    violations.push(`${fileViolations}ファイルでエラー数上限超過 (${CONFIG.thresholds.maxErrorsPerFile}件/ファイル)`);
  }

  return {
    passed: violations.length === 0,
    message: violations.length === 0 ?
      'すべての品質基準をクリア' :
      `${violations.length}件の品質違反`,
    violations
  };
}

// ===========================================
// 実行部分
// ===========================================

if (require.main === module) {
  const forceRun = process.argv.includes('--force');
  const verboseMode = process.argv.includes('--verbose');
  const updateBaseline = process.argv.includes('--update-baseline');

  runTypeScriptStrictCheck()
    .then(result => {
      if (verboseMode) {
        console.log('\n📊 詳細統計:');
        console.log(JSON.stringify(result.stats, null, 2));
      }

      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ TypeScript Strict Mode Check failed:', error);
      process.exit(1);
    });
}

module.exports = { runTypeScriptStrictCheck, CONFIG };