#!/usr/bin/env node

/**
 * BoxLog Technical Debt Visualization System
 * 
 * 技術的負債を包括的に分析し、視覚的なレポートを生成
 */

const { execSync } = require('child_process');
const fs = require('fs');

const path = require('path');

const { ESLint } = require('eslint');

// レポート設定
const REPORT_CONFIG = {
  outputDir: 'reports',
  htmlFile: 'tech-debt.html',
  jsonFile: 'tech-debt.json',
  trendsFile: 'tech-debt-trends.json',
  maxHistoryEntries: 30
};

// カラー出力
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * ESLint結果の分析
 */
async function analyzeESLintResults() {
  console.log(`${colors.cyan}🔍 ESLintで技術的負債を分析中...${colors.reset}`);
  
  const eslint = new ESLint({
    useEslintrc: true,
    baseConfig: {
      extends: ['./config/eslint/.eslintrc.json']
    }
  });
  
  try {
    const results = await eslint.lintFiles(['src/**/*.{ts,tsx}']);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        totalErrors: 0,
        totalWarnings: 0,
        themeViolations: 0,
        complianceIssues: 0,
        performanceIssues: 0,
        todoIssues: 0,
        complexityIssues: 0
      },
      byCategory: {
        theme: [],
        compliance: [],
        performance: [],
        todo: [],
        complexity: [],
        imports: [],
        react: [],
        typescript: []
      },
      byFile: {},
      hotspots: []
    };
    
    // 結果を分析
    results.forEach(result => {
      const relativePath = path.relative(process.cwd(), result.filePath);
      
      if (result.messages.length > 0) {
        report.byFile[relativePath] = {
          path: relativePath,
          errorCount: result.errorCount,
          warningCount: result.warningCount,
          messages: result.messages,
          debtScore: calculateFileDebtScore(result.messages)
        };
      }
      
      result.messages.forEach(msg => {
        report.summary.totalErrors += msg.severity === 2 ? 1 : 0;
        report.summary.totalWarnings += msg.severity === 1 ? 1 : 0;
        
        // カテゴリ分類
        const category = categorizeRule(msg.ruleId);
        if (category && report.byCategory[category]) {
          report.byCategory[category].push({
            file: relativePath,
            line: msg.line,
            column: msg.column,
            message: msg.message,
            ruleId: msg.ruleId,
            severity: msg.severity
          });
          
          // サマリー更新
          updateSummaryCount(report.summary, category);
        }
      });
    });
    
    // ホットスポット（問題の多いファイル）を特定
    report.hotspots = Object.values(report.byFile)
      .sort((a, b) => b.debtScore - a.debtScore)
      .slice(0, 10);
    
    return report;
    
  } catch (error) {
    console.error(`${colors.red}❌ ESLint分析でエラーが発生しました:${colors.reset}`, error.message);
    return null;
  }
}

/**
 * ルールのカテゴリ分類
 */
function categorizeRule(ruleId) {
  if (!ruleId) return 'other';
  
  if (ruleId.includes('boxlog-theme') || ruleId.includes('theme')) return 'theme';
  if (ruleId.includes('boxlog-compliance') || ruleId.includes('jsx-a11y') || ruleId.includes('security')) return 'compliance';
  if (ruleId.includes('performance') || ruleId.includes('memo') || ruleId.includes('callback')) return 'performance';
  if (ruleId.includes('boxlog-todo') || ruleId.includes('todo')) return 'todo';
  if (ruleId.includes('complexity') || ruleId.includes('max-') || ruleId.includes('cyclomatic')) return 'complexity';
  if (ruleId.includes('import') || ruleId.includes('unused-imports')) return 'imports';
  if (ruleId.includes('react') || ruleId.includes('jsx')) return 'react';
  if (ruleId.includes('@typescript-eslint')) return 'typescript';
  
  return 'other';
}

/**
 * サマリーカウント更新
 */
function updateSummaryCount(summary, category) {
  switch (category) {
    case 'theme':
      summary.themeViolations++;
      break;
    case 'compliance':
      summary.complianceIssues++;
      break;
    case 'performance':
      summary.performanceIssues++;
      break;
    case 'todo':
      summary.todoIssues++;
      break;
    case 'complexity':
      summary.complexityIssues++;
      break;
  }
}

/**
 * ファイルの技術的負債スコア計算
 */
function calculateFileDebtScore(messages) {
  let score = 0;
  
  messages.forEach(msg => {
    const weight = msg.severity === 2 ? 3 : 1; // エラーは警告の3倍重み
    const categoryWeight = getCategoryWeight(categorizeRule(msg.ruleId));
    score += weight * categoryWeight;
  });
  
  return score;
}

/**
 * カテゴリ重み取得
 */
function getCategoryWeight(category) {
  const weights = {
    compliance: 3,   // コンプライアンス違反は最重要
    performance: 2,  // パフォーマンス問題は重要
    complexity: 2,   // 複雑性問題は重要
    theme: 1.5,      // テーマ違反は中程度
    react: 1.5,      // React問題は中程度
    typescript: 1,   // TypeScript問題は軽度
    imports: 1,      // インポート問題は軽度
    todo: 0.5,       // TODO問題は軽微
    other: 1
  };
  
  return weights[category] || 1;
}

/**
 * TODO/FIXME分析の統合
 */
async function analyzeTodos() {
  console.log(`${colors.cyan}📋 TODO/FIXME分析を統合中...${colors.reset}`);
  
  try {
    const output = execSync('node scripts/todo-manager.js --format json 2>/dev/null', { encoding: 'utf8' });
    const todoData = JSON.parse(output);
    
    return {
      stats: todoData.stats,
      todos: todoData.todos
    };
  } catch (error) {
    console.warn(`${colors.yellow}⚠️ TODO分析の統合に失敗しました${colors.reset}`);
    return { stats: {}, todos: [] };
  }
}

/**
 * バンドルサイズ分析の統合
 */
async function analyzeBundleSize() {
  console.log(`${colors.cyan}📦 バンドルサイズ分析を統合中...${colors.reset}`);
  
  try {
    // 簡易バンドルサイズ分析
    const buildDir = '.next';
    if (!fs.existsSync(buildDir)) {
      return { available: false, message: 'ビルドファイルが見つかりません' };
    }
    
    const staticDir = path.join(buildDir, 'static');
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    
    if (fs.existsSync(staticDir)) {
      const calculateDirSize = (dir, extension = null) => {
        let size = 0;
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            size += calculateDirSize(fullPath, extension);
          } else if (!extension || file.name.endsWith(extension)) {
            size += fs.statSync(fullPath).size;
          }
        });
        
        return size;
      };
      
      totalSize = calculateDirSize(staticDir);
      jsSize = calculateDirSize(staticDir, '.js');
      cssSize = calculateDirSize(staticDir, '.css');
    }
    
    return {
      available: true,
      totalSize,
      jsSize,
      cssSize,
      analysis: {
        isOversize: totalSize > 1024 * 1024, // 1MB threshold
        jsSizeRatio: totalSize > 0 ? (jsSize / totalSize) : 0,
        cssSizeRatio: totalSize > 0 ? (cssSize / totalSize) : 0
      }
    };
  } catch (error) {
    return { available: false, message: error.message };
  }
}

/**
 * 統合レポート生成
 */
async function generateIntegratedReport() {
  console.log(`${colors.bold}${colors.blue}📊 BoxLog Technical Debt Report Generator${colors.reset}\n`);
  
  // レポートディレクトリ作成
  if (!fs.existsSync(REPORT_CONFIG.outputDir)) {
    fs.mkdirSync(REPORT_CONFIG.outputDir, { recursive: true });
  }
  
  // 各種分析実行
  const eslintReport = await analyzeESLintResults();
  const todoAnalysis = await analyzeTodos();
  const bundleAnalysis = await analyzeBundleSize();
  
  if (!eslintReport) {
    console.error(`${colors.red}❌ ESLint分析に失敗しました${colors.reset}`);
    process.exit(1);
  }
  
  // 統合レポート作成
  const integratedReport = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      generator: 'BoxLog Technical Debt Analyzer'
    },
    summary: {
      ...eslintReport.summary,
      todoCount: todoAnalysis.stats.total || 0,
      todoHealthScore: calculateTodoHealthScore(todoAnalysis.stats),
      bundleSize: bundleAnalysis.totalSize || 0,
      overallScore: calculateOverallDebtScore(eslintReport, todoAnalysis, bundleAnalysis)
    },
    details: {
      eslint: eslintReport,
      todos: todoAnalysis,
      bundle: bundleAnalysis
    },
    recommendations: generateRecommendations(eslintReport, todoAnalysis, bundleAnalysis)
  };
  
  // トレンド分析
  const trendsData = updateTrendsData(integratedReport.summary);
  
  // レポート出力
  const jsonPath = path.join(REPORT_CONFIG.outputDir, REPORT_CONFIG.jsonFile);
  fs.writeFileSync(jsonPath, JSON.stringify(integratedReport, null, 2));
  
  const htmlPath = path.join(REPORT_CONFIG.outputDir, REPORT_CONFIG.htmlFile);
  const htmlReport = generateHTMLReport(integratedReport, trendsData);
  fs.writeFileSync(htmlPath, htmlReport);
  
  // コンソール出力
  displaySummary(integratedReport.summary);
  
  console.log(`\n${colors.green}✅ 技術的負債レポートを生成しました:${colors.reset}`);
  console.log(`   📄 JSON: ${jsonPath}`);
  console.log(`   🌐 HTML: ${htmlPath}`);
  
  return integratedReport;
}

/**
 * TODO健康スコア計算
 */
function calculateTodoHealthScore(todoStats) {
  if (!todoStats.total) return 100;
  
  let score = 100;
  const structuredRate = todoStats.structured / todoStats.total;
  score = structuredRate * 80 + (todoStats.overdue ? 0 : 20);
  
  return Math.max(Math.round(score), 0);
}

/**
 * 総合技術的負債スコア計算
 */
function calculateOverallDebtScore(eslintReport, todoAnalysis, bundleAnalysis) {
  let score = 100;
  
  // ESLintスコア（50点満点）
  const eslintPenalty = (eslintReport.summary.totalErrors * 2 + eslintReport.summary.totalWarnings) / 2;
  score -= Math.min(eslintPenalty, 50);
  
  // TODOスコア（25点満点）
  const todoHealthScore = calculateTodoHealthScore(todoAnalysis.stats);
  score -= (100 - todoHealthScore) * 0.25;
  
  // バンドルサイズスコア（25点満点）
  if (bundleAnalysis.available && bundleAnalysis.analysis.isOversize) {
    score -= 25;
  }
  
  return Math.max(Math.round(score), 0);
}

/**
 * 改善提案生成
 */
function generateRecommendations(eslintReport, todoAnalysis, bundleAnalysis) {
  const recommendations = [];
  
  // ESLint関連
  if (eslintReport.summary.totalErrors > 0) {
    recommendations.push({
      category: 'critical',
      title: 'ESLintエラーの修正',
      description: `${eslintReport.summary.totalErrors}個のESLintエラーがあります。`,
      actions: ['エラーレベルの問題を優先的に修正', 'CI/CDでエラー時のビルド停止を検討']
    });
  }
  
  if (eslintReport.summary.themeViolations > 10) {
    recommendations.push({
      category: 'high',
      title: 'テーマシステム違反の修正',
      description: `${eslintReport.summary.themeViolations}個のテーマ違反があります。`,
      actions: ['直接的なTailwindクラス使用をtheme経由に変更', 'チーム向けテーマガイドラインの共有']
    });
  }
  
  if (eslintReport.summary.complianceIssues > 0) {
    recommendations.push({
      category: 'critical',
      title: 'コンプライアンス問題の対応',
      description: `${eslintReport.summary.complianceIssues}個のコンプライアンス問題があります。`,
      actions: ['アクセシビリティ違反の修正', 'セキュリティ問題の即座な対応', 'GDPR遵守の確認']
    });
  }
  
  // TODO関連
  if (todoAnalysis.stats.overdue > 0) {
    recommendations.push({
      category: 'high',
      title: '期限切れTODOの対応',
      description: `${todoAnalysis.stats.overdue}個の期限切れTODOがあります。`,
      actions: ['期限切れTODOの優先度再評価', '実現可能な新期限の設定']
    });
  }
  
  // バンドルサイズ関連
  if (bundleAnalysis.available && bundleAnalysis.analysis.isOversize) {
    recommendations.push({
      category: 'medium',
      title: 'バンドルサイズの最適化',
      description: 'バンドルサイズが推奨サイズを超過しています。',
      actions: ['動的インポートの導入', '未使用コードの削除', 'Tree-shakingの最適化']
    });
  }
  
  return recommendations;
}

/**
 * トレンドデータ更新
 */
function updateTrendsData(currentSummary) {
  const trendsPath = path.join(REPORT_CONFIG.outputDir, REPORT_CONFIG.trendsFile);
  
  let trendsData = { entries: [] };
  if (fs.existsSync(trendsPath)) {
    try {
      trendsData = JSON.parse(fs.readFileSync(trendsPath, 'utf8'));
    } catch (error) {
      console.warn(`${colors.yellow}⚠️ トレンドデータの読み込みに失敗しました${colors.reset}`);
    }
  }
  
  // 新しいエントリを追加
  trendsData.entries.push({
    timestamp: new Date().toISOString(),
    ...currentSummary
  });
  
  // 古いエントリを削除（最大30件保持）
  if (trendsData.entries.length > REPORT_CONFIG.maxHistoryEntries) {
    trendsData.entries = trendsData.entries.slice(-REPORT_CONFIG.maxHistoryEntries);
  }
  
  fs.writeFileSync(trendsPath, JSON.stringify(trendsData, null, 2));
  
  return trendsData;
}

/**
 * サマリー表示
 */
function displaySummary(summary) {
  console.log(`\n${colors.bold}📊 技術的負債レポート${colors.reset}`);
  console.log('━'.repeat(40));
  console.log(`${colors.red}🔴 エラー: ${summary.totalErrors}${colors.reset}`);
  console.log(`${colors.yellow}🟡 警告: ${summary.totalWarnings}${colors.reset}`);
  console.log(`${colors.blue}🎨 Theme違反: ${summary.themeViolations}${colors.reset}`);
  console.log(`${colors.magenta}🔒 コンプライアンス: ${summary.complianceIssues}${colors.reset}`);
  console.log(`${colors.cyan}⚡ パフォーマンス: ${summary.performanceIssues}${colors.reset}`);
  console.log(`${colors.gray}📋 TODO問題: ${summary.todoIssues}${colors.reset}`);
  console.log(`${colors.green}🏥 総合スコア: ${summary.overallScore}/100${colors.reset}`);
}

/**
 * HTMLレポート生成
 */
function generateHTMLReport(report, trendsData) {
  const { summary, details } = report;
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BoxLog 技術的負債レポート</title>
    <style>
        :root {
            --primary-color: #3b82f6;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-color: #1f2937;
            --border-color: #e5e7eb;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, var(--primary-color), #6366f1);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header .subtitle {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .metric-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-left: 4px solid var(--primary-color);
        }
        
        .metric-card.error { border-left-color: var(--error-color); }
        .metric-card.warning { border-left-color: var(--warning-color); }
        .metric-card.success { border-left-color: var(--success-color); }
        
        .metric-card h3 {
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin-bottom: 0.5rem;
        }
        
        .metric-card .value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .metric-card .description {
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .section {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
        
        .section h2 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: var(--primary-color);
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 0.5rem;
        }
        
        .hotspots-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .hotspots-table th,
        .hotspots-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        .hotspots-table th {
            background: var(--bg-color);
            font-weight: 600;
            color: var(--text-color);
        }
        
        .hotspots-table tr:hover {
            background: var(--bg-color);
        }
        
        .debt-score {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.8rem;
        }
        
        .debt-score.high { background: #fee2e2; color: var(--error-color); }
        .debt-score.medium { background: #fef3c7; color: var(--warning-color); }
        .debt-score.low { background: #d1fae5; color: var(--success-color); }
        
        .recommendations {
            display: grid;
            gap: 1rem;
        }
        
        .recommendation {
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid;
        }
        
        .recommendation.critical {
            background: #fef2f2;
            border-left-color: var(--error-color);
        }
        
        .recommendation.high {
            background: #fffbeb;
            border-left-color: var(--warning-color);
        }
        
        .recommendation.medium {
            background: #f0f9ff;
            border-left-color: var(--primary-color);
        }
        
        .recommendation h4 {
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .recommendation ul {
            margin: 0.5rem 0 0 1.5rem;
        }
        
        .chart-container {
            height: 300px;
            margin: 1rem 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-color);
            border-radius: 8px;
            color: #6b7280;
        }
        
        .footer {
            text-align: center;
            padding: 2rem;
            color: #6b7280;
            border-top: 1px solid var(--border-color);
            margin-top: 3rem;
        }
        
        @media (max-width: 768px) {
            .container { padding: 1rem; }
            .header { padding: 1rem; }
            .header h1 { font-size: 2rem; }
            .summary-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 BoxLog 技術的負債レポート</h1>
        <div class="subtitle">生成日時: ${new Date(report.metadata.generatedAt).toLocaleString('ja-JP')}</div>
    </div>

    <div class="container">
        <div class="summary-grid">
            <div class="metric-card ${summary.totalErrors > 0 ? 'error' : 'success'}">
                <h3>ESLintエラー</h3>
                <div class="value">${summary.totalErrors}</div>
                <div class="description">修正が必要な重大な問題</div>
            </div>
            
            <div class="metric-card warning">
                <h3>ESLint警告</h3>
                <div class="value">${summary.totalWarnings}</div>
                <div class="description">改善推奨の問題</div>
            </div>
            
            <div class="metric-card">
                <h3>テーマ違反</h3>
                <div class="value">${summary.themeViolations}</div>
                <div class="description">デザインシステム違反</div>
            </div>
            
            <div class="metric-card ${summary.complianceIssues > 0 ? 'error' : 'success'}">
                <h3>コンプライアンス</h3>
                <div class="value">${summary.complianceIssues}</div>
                <div class="description">アクセシビリティ・セキュリティ</div>
            </div>
            
            <div class="metric-card">
                <h3>パフォーマンス</h3>
                <div class="value">${summary.performanceIssues}</div>
                <div class="description">最適化が必要な箇所</div>
            </div>
            
            <div class="metric-card ${summary.overallScore >= 80 ? 'success' : summary.overallScore >= 60 ? 'warning' : 'error'}">
                <h3>総合健康スコア</h3>
                <div class="value">${summary.overallScore}/100</div>
                <div class="description">技術的負債の総合評価</div>
            </div>
        </div>

        <div class="section">
            <h2>🔥 問題の多いファイル (技術的負債ホットスポット)</h2>
            <table class="hotspots-table">
                <thead>
                    <tr>
                        <th>ファイル</th>
                        <th>エラー</th>
                        <th>警告</th>
                        <th>負債スコア</th>
                    </tr>
                </thead>
                <tbody>
                    ${details.eslint.hotspots.map(file => `
                        <tr>
                            <td><code>${file.path}</code></td>
                            <td>${file.errorCount}</td>
                            <td>${file.warningCount}</td>
                            <td><span class="debt-score ${file.debtScore > 20 ? 'high' : file.debtScore > 10 ? 'medium' : 'low'}">${file.debtScore}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>💡 改善提案</h2>
            <div class="recommendations">
                ${report.recommendations.map(rec => `
                    <div class="recommendation ${rec.category}">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                        <ul>
                            ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2>📈 トレンド分析</h2>
            <div class="chart-container">
                <p>📊 過去${trendsData.entries.length}回の分析データを保持<br>
                チャート表示機能は今後実装予定</p>
            </div>
        </div>

        <div class="section">
            <h2>📋 TODO/FIXME 分析</h2>
            <p><strong>総TODO数:</strong> ${details.todos.stats.total || 0}</p>
            <p><strong>構造化率:</strong> ${details.todos.stats.total ? Math.round((details.todos.stats.structured / details.todos.stats.total) * 100) : 0}%</p>
            <p><strong>期限切れ:</strong> ${details.todos.stats.overdue || 0}個</p>
            <p><strong>健康スコア:</strong> ${summary.todoHealthScore}/100</p>
        </div>

        <div class="section">
            <h2>📦 バンドルサイズ分析</h2>
            ${details.bundle.available ? `
                <p><strong>総サイズ:</strong> ${(details.bundle.totalSize / 1024).toFixed(1)} KB</p>
                <p><strong>JavaScript:</strong> ${(details.bundle.jsSize / 1024).toFixed(1)} KB</p>
                <p><strong>CSS:</strong> ${(details.bundle.cssSize / 1024).toFixed(1)} KB</p>
                <p><strong>サイズ評価:</strong> ${details.bundle.analysis.isOversize ? '🔴 改善推奨' : '🟢 適正範囲'}</p>
            ` : `
                <p>バンドルサイズ分析は利用できません: ${details.bundle.message}</p>
            `}
        </div>
    </div>

    <div class="footer">
        <p>📊 BoxLog Technical Debt Visualization System v${report.metadata.version}</p>
        <p>継続的な品質改善のためのレポートです</p>
    </div>
</body>
</html>`;
}

/**
 * メイン実行関数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}BoxLog Technical Debt Analyzer${colors.reset}

使用方法:
  node scripts/tech-debt-report.js [オプション]

オプション:
  --help, -h     このヘルプを表示
  --json-only    JSONレポートのみ生成
  --no-trends    トレンドデータを更新しない

例:
  npm run debt:report
  npm run debt:report -- --json-only
    `);
    process.exit(0);
  }
  
  try {
    await generateIntegratedReport();
  } catch (error) {
    console.error(`${colors.red}❌ 技術的負債レポート生成でエラーが発生しました:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// CLI実行
if (require.main === module) {
  main();
}

module.exports = {
  analyzeESLintResults,
  generateIntegratedReport,
  calculateOverallDebtScore
};