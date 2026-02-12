#!/usr/bin/env node

/**
 * 📊 Dayopt Analytics Event Validator
 *
 * アナリティクスイベント名の検証・管理ツール
 * - イベント名の重複チェック
 * - 命名規則の検証
 * - 使用されていないイベントの検出
 * - イベント統計の生成
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 設定
const CONFIG = {
  eventsFile: path.join(process.cwd(), 'src/lib/analytics/events.ts'),
  srcDir: path.join(process.cwd(), 'src'),
  outputFile: path.join(process.cwd(), 'analytics-report.json'),
  excludedDirs: ['node_modules', '.git', '.next', 'dist', 'build'],
  sourceExtensions: ['.ts', '.tsx', '.js', '.jsx'],
};

/**
 * 🎨 カラー出力ヘルパー
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * 📋 イベント定義の解析
 */
function parseEventsFile() {
  try {
    const content = fs.readFileSync(CONFIG.eventsFile, 'utf8');

    // ANALYTICS_EVENTSオブジェクトを抽出
    const eventsRegex = /export const ANALYTICS_EVENTS = ({[\s\S]*?}) as const/;
    const match = content.match(eventsRegex);

    if (!match) {
      throw new Error('ANALYTICS_EVENTS object not found');
    }

    // 各カテゴリとイベントを解析
    const categories = {};

    // カテゴリ毎に分割処理
    const eventSections = match[1].split(/\/\/ ={20,}/);

    eventSections.forEach((section) => {
      // カテゴリ名を抽出
      const categoryNameMatch = section.match(/(\w+): \{/);
      if (!categoryNameMatch) return;

      const categoryName = categoryNameMatch[1];
      categories[categoryName] = {};

      // イベント定義を抽出
      const eventMatches = section.match(/(\w+): '([^']+)'/g);
      if (eventMatches) {
        eventMatches.forEach((eventMatch) => {
          const parts = eventMatch.match(/(\w+): '([^']+)'/);
          if (parts) {
            const eventKey = parts[1];
            const eventValue = parts[2];
            categories[categoryName][eventKey] = eventValue;
          }
        });
      }
    });

    return categories;
  } catch (error) {
    console.error(colorize(`❌ イベントファイル解析エラー: ${error.message}`, 'red'));
    return null;
  }
}

/**
 * 🔍 ソースコード内のイベント使用を検索
 */
function findEventUsage(events) {
  const usage = {};
  const allEvents = [];

  // すべてのイベント名を収集
  Object.values(events).forEach((category) => {
    Object.values(category).forEach((eventName) => {
      allEvents.push(eventName);
      usage[eventName] = {
        count: 0,
        files: [],
        contexts: [],
      };
    });
  });

  console.log(colorize('🔍 ソースコード検索中...', 'blue'));

  try {
    // ripgrepまたはgrepでイベント名を検索
    const searchCommand = `rg -r --type ts --type tsx --type js --type jsx -n -o "${allEvents.join('|')}" ${CONFIG.srcDir} || grep -r -n --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -E "${allEvents.join('|')}" ${CONFIG.srcDir}`;

    const output = execSync(searchCommand, { encoding: 'utf8', stdio: 'pipe' }).split('\n');

    output.forEach((line) => {
      if (!line.trim()) return;

      const match = line.match(/^([^:]+):(\d+):(.*)$/);
      if (!match) return;

      const [, filePath, lineNumber, content] = match;
      const relativePath = path.relative(CONFIG.srcDir, filePath);

      // 使用されたイベント名を検出
      allEvents.forEach((eventName) => {
        if (content.includes(eventName)) {
          usage[eventName].count++;
          if (!usage[eventName].files.includes(relativePath)) {
            usage[eventName].files.push(relativePath);
          }
          usage[eventName].contexts.push({
            file: relativePath,
            line: parseInt(lineNumber),
            context: content.trim(),
          });
        }
      });
    });
  } catch (error) {
    console.warn(colorize('⚠️ 検索コマンドが失敗しました（検索結果なしの可能性）', 'yellow'));
  }

  return usage;
}

/**
 * 📊 命名規則の検証
 */
function validateNamingConventions(events) {
  const issues = [];

  Object.entries(events).forEach(([category, categoryEvents]) => {
    const categoryLower = category.toLowerCase();

    Object.entries(categoryEvents).forEach(([eventKey, eventValue]) => {
      // イベント名はcategory_で始まる必要がある
      if (!eventValue.startsWith(`${categoryLower}_`)) {
        issues.push({
          type: 'naming_convention',
          severity: 'error',
          message: `イベント名 "${eventValue}" はカテゴリプレフィックス "${categoryLower}_" で始まる必要があります`,
          category,
          eventKey,
          eventValue,
        });
      }

      // イベント名は小文字とアンダースコアのみ
      if (!/^[a-z0-9_]+$/.test(eventValue)) {
        issues.push({
          type: 'naming_format',
          severity: 'error',
          message: `イベント名 "${eventValue}" は小文字とアンダースコアのみ使用できます`,
          category,
          eventKey,
          eventValue,
        });
      }

      // イベント名の長さチェック（推奨50文字以下）
      if (eventValue.length > 50) {
        issues.push({
          type: 'naming_length',
          severity: 'warning',
          message: `イベント名 "${eventValue}" が長すぎます（${eventValue.length}文字、推奨50文字以下）`,
          category,
          eventKey,
          eventValue,
        });
      }

      // イベントキーとバリューの一貫性チェック
      const expectedKey = eventValue
        .replace(`${categoryLower}_`, '')
        .toUpperCase()
        .replace(/_/g, '_');

      if (eventKey !== expectedKey) {
        issues.push({
          type: 'key_consistency',
          severity: 'warning',
          message: `イベントキー "${eventKey}" とイベント名 "${eventValue}" の命名が一貫していません`,
          category,
          eventKey,
          eventValue,
          suggestion: expectedKey,
        });
      }
    });
  });

  return issues;
}

/**
 * 🔄 重複チェック
 */
function checkDuplicates(events) {
  const eventNames = [];
  const duplicates = [];

  Object.values(events).forEach((category) => {
    Object.values(category).forEach((eventName) => {
      if (eventNames.includes(eventName)) {
        duplicates.push(eventName);
      } else {
        eventNames.push(eventName);
      }
    });
  });

  return duplicates;
}

/**
 * 📊 統計生成
 */
function generateStatistics(events, usage) {
  const stats = {
    totalEvents: 0,
    usedEvents: 0,
    unusedEvents: 0,
    categories: {},
    mostUsed: [],
    leastUsed: [],
    unused: [],
  };

  // カテゴリ別統計
  Object.entries(events).forEach(([category, categoryEvents]) => {
    const categoryStats = {
      total: Object.keys(categoryEvents).length,
      used: 0,
      unused: 0,
      events: Object.values(categoryEvents),
    };

    Object.values(categoryEvents).forEach((eventName) => {
      stats.totalEvents++;
      if (usage[eventName].count > 0) {
        stats.usedEvents++;
        categoryStats.used++;
      } else {
        stats.unusedEvents++;
        categoryStats.unused++;
        stats.unused.push(eventName);
      }
    });

    stats.categories[category] = categoryStats;
  });

  // 使用頻度でソート
  const eventsByUsage = Object.entries(usage)
    .map(([eventName, data]) => ({ eventName, count: data.count, files: data.files.length }))
    .sort((a, b) => b.count - a.count);

  stats.mostUsed = eventsByUsage.slice(0, 10);
  stats.leastUsed = eventsByUsage.filter((e) => e.count > 0).slice(-10);

  return stats;
}

/**
 * 📊 レポート生成
 */
function generateReport(events, usage, validationIssues, duplicates, stats) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalEvents: stats.totalEvents,
      usedEvents: stats.usedEvents,
      unusedEvents: stats.unusedEvents,
      usageRate: ((stats.usedEvents / stats.totalEvents) * 100).toFixed(1),
      validationIssues: validationIssues.length,
      duplicates: duplicates.length,
    },
    categories: stats.categories,
    usage: {
      mostUsed: stats.mostUsed,
      leastUsed: stats.leastUsed,
      unused: stats.unused,
    },
    validation: {
      issues: validationIssues,
      duplicates,
    },
    details: {
      events,
      usage,
    },
  };

  return report;
}

/**
 * 📊 コンソール出力
 */
function printReport(report) {
  console.log(colorize('📊 Dayopt Analytics Event Report', 'bright'));
  console.log(colorize(`生成日時: ${new Date(report.timestamp).toLocaleString('ja-JP')}`, 'dim'));
  console.log('');

  // サマリー
  console.log(colorize('📈 サマリー', 'blue'));
  console.log(colorize(`  📊 総イベント数: ${report.summary.totalEvents}`, 'cyan'));
  console.log(
    colorize(`  ✅ 使用中: ${report.summary.usedEvents} (${report.summary.usageRate}%)`, 'green'),
  );
  console.log(colorize(`  ❌ 未使用: ${report.summary.unusedEvents}`, 'yellow'));
  console.log(colorize(`  🚨 検証問題: ${report.summary.validationIssues}`, 'red'));
  console.log(colorize(`  🔄 重複: ${report.summary.duplicates}`, 'magenta'));
  console.log('');

  // カテゴリ別統計
  console.log(colorize('📋 カテゴリ別統計', 'blue'));
  Object.entries(report.categories).forEach(([category, stats]) => {
    const usageRate = stats.total > 0 ? ((stats.used / stats.total) * 100).toFixed(1) : 0;
    console.log(colorize(`  ${category.toUpperCase()}`, 'magenta'));
    console.log(
      colorize(
        `    📊 総数: ${stats.total}, 使用中: ${stats.used}, 未使用: ${stats.unused} (${usageRate}%)`,
        'white',
      ),
    );
  });
  console.log('');

  // 使用頻度上位
  if (report.usage.mostUsed.length > 0) {
    console.log(colorize('🏆 使用頻度上位 (上位10件)', 'blue'));
    report.usage.mostUsed.forEach((item, index) => {
      console.log(
        `  ${index + 1}. ${colorize(item.eventName, 'cyan')} - ${colorize(item.count + '回', 'green')} (${item.files}ファイル)`,
      );
    });
    console.log('');
  }

  // 未使用イベント
  if (report.usage.unused.length > 0) {
    console.log(colorize('🚨 未使用イベント', 'yellow'));
    report.usage.unused.slice(0, 20).forEach((eventName) => {
      console.log(colorize(`  - ${eventName}`, 'yellow'));
    });
    if (report.usage.unused.length > 20) {
      console.log(colorize(`  ... 他 ${report.usage.unused.length - 20} 件`, 'dim'));
    }
    console.log('');
  }

  // 検証問題
  if (report.validation.issues.length > 0) {
    console.log(colorize('🚨 検証問題', 'red'));
    report.validation.issues.forEach((issue) => {
      const severity =
        issue.severity === 'error' ? colorize('ERROR', 'red') : colorize('WARNING', 'yellow');
      console.log(`  ${severity} [${issue.type}] ${issue.message}`);
      if (issue.suggestion) {
        console.log(colorize(`    💡 推奨: ${issue.suggestion}`, 'dim'));
      }
    });
    console.log('');
  }

  // 重複
  if (report.validation.duplicates.length > 0) {
    console.log(colorize('🔄 重複イベント', 'magenta'));
    report.validation.duplicates.forEach((eventName) => {
      console.log(colorize(`  - ${eventName}`, 'magenta'));
    });
    console.log('');
  }
}

/**
 * 🚀 メイン処理
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'validate';

  console.log(colorize('📊 Dayopt Analytics Validator', 'bright'));
  console.log('');

  switch (command) {
    case 'validate':
    case 'report': {
      console.log(colorize('🔍 イベント定義を解析中...', 'blue'));
      const events = parseEventsFile();
      if (!events) return;

      console.log(colorize('📊 使用状況を分析中...', 'blue'));
      const usage = findEventUsage(events);

      console.log(colorize('🔧 命名規則を検証中...', 'blue'));
      const validationIssues = validateNamingConventions(events);

      console.log(colorize('🔄 重複をチェック中...', 'blue'));
      const duplicates = checkDuplicates(events);

      console.log(colorize('📊 統計を生成中...', 'blue'));
      const stats = generateStatistics(events, usage);

      const report = generateReport(events, usage, validationIssues, duplicates, stats);

      // コンソール出力
      printReport(report);

      // JSONファイル出力
      if (args.includes('--json') || command === 'report') {
        fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
        console.log(colorize(`📄 詳細レポートを出力しました: ${CONFIG.outputFile}`, 'green'));
      }

      // 問題がある場合のエラーコード
      if (validationIssues.some((i) => i.severity === 'error') || duplicates.length > 0) {
        process.exit(1);
      }
      break;
    }

    case 'unused': {
      const events = parseEventsFile();
      if (!events) return;

      const usage = findEventUsage(events);
      const unused = Object.entries(usage)
        .filter(([, data]) => data.count === 0)
        .map(([eventName]) => eventName);

      console.log(colorize('🚨 未使用イベント一覧', 'yellow'));
      unused.forEach((eventName) => {
        console.log(colorize(`  ${eventName}`, 'yellow'));
      });
      console.log('');
      console.log(colorize(`合計: ${unused.length} 件の未使用イベント`, 'dim'));
      break;
    }

    case 'stats': {
      const events = parseEventsFile();
      if (!events) return;

      const usage = findEventUsage(events);
      const stats = generateStatistics(events, usage);

      console.log(colorize('📊 イベント統計', 'blue'));
      console.log(colorize(`  総イベント数: ${stats.totalEvents}`, 'cyan'));
      console.log(colorize(`  使用中: ${stats.usedEvents}`, 'green'));
      console.log(colorize(`  未使用: ${stats.unusedEvents}`, 'yellow'));
      console.log(
        colorize(`  使用率: ${((stats.usedEvents / stats.totalEvents) * 100).toFixed(1)}%`, 'cyan'),
      );
      break;
    }

    default:
      console.log('使用方法:');
      console.log(colorize('  validate', 'cyan') + '  - 完全な検証とレポート生成');
      console.log(colorize('  report', 'cyan') + '    - JSONレポート出力');
      console.log(colorize('  unused', 'cyan') + '   - 未使用イベント一覧');
      console.log(colorize('  stats', 'cyan') + '    - 基本統計情報');
      console.log('');
      console.log('オプション:');
      console.log(colorize('  --json', 'cyan') + '    - JSON形式でレポート出力');
  }
}

// 実行
if (require.main === module) {
  main();
}

module.exports = {
  parseEventsFile,
  findEventUsage,
  validateNamingConventions,
  checkDuplicates,
  generateStatistics,
  generateReport,
};
