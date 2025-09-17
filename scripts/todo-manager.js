#!/usr/bin/env node

/**
 * BoxLog TODO/FIXME Management System
 * 
 * TODO/FIXMEコメントの一元管理、レポート生成、統計情報の提供
 */

const fs = require('fs');
const path = require('path');

// 🎨 カラー出力
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

// 📅 日付関連ユーティリティ
function getDaysFromNow(dateStr) {
  const targetDate = new Date(dateStr);
  const now = new Date();
  const diffTime = targetDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getTimeAgo(dateStr) {
  const days = -getDaysFromNow(dateStr);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// 🔍 TODO/FIXME パーサー
class TodoParser {
  constructor() {
    this.structuredRegex = /^\s*(TODO|FIXME|HACK|NOTE|BUG)\s*(?:\[([^\]]+)\])?\s*(?:\((\d{4}-\d{2}-\d{2})\))?\s*(?:@([^\s:]+))?\s*:?\s*(.*)$/i;
    this.legacyRegex = /^\s*(TODO|FIXME|HACK|NOTE|BUG)\s*:?\s*(.*)$/i;
    this.priorities = ['P0', 'P1', 'P2', 'P3', 'LOW', 'HIGH', 'CRITICAL'];
  }

  parseComment(comment, filePath, lineNumber) {
    const text = comment.trim();
    const structuredMatch = this.structuredRegex.exec(text);
    
    if (structuredMatch) {
      const [, type, issueId, date, assignee, description] = structuredMatch;
      return {
        type: type.toUpperCase(),
        issueId: issueId || null,
        date: date || null,
        assignee: assignee || null,
        description: description.trim(),
        filePath,
        lineNumber,
        isStructured: true,
        priority: this.extractPriority(description),
        daysUntilDeadline: date ? getDaysFromNow(date) : null,
        timeAgo: date ? getTimeAgo(date) : null
      };
    }

    const legacyMatch = this.legacyRegex.exec(text);
    if (legacyMatch) {
      const [, type, description] = legacyMatch;
      return {
        type: type.toUpperCase(),
        issueId: null,
        date: null,
        assignee: null,
        description: description.trim(),
        filePath,
        lineNumber,
        isStructured: false,
        priority: this.extractPriority(description),
        daysUntilDeadline: null,
        timeAgo: null
      };
    }

    return null;
  }

  extractPriority(text) {
    for (const priority of this.priorities) {
      if (new RegExp(`\\b${priority}\\b`, 'i').test(text)) {
        return priority;
      }
    }
    return null;
  }
}

// 📁 ファイル検索
function findSourceFiles(directory, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // 除外ディレクトリ
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
          walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walkDir(directory);
  return files;
}

// 📄 ファイル解析
function analyzeTodosInFile(filePath, parser) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const todos = [];
    
    lines.forEach((line, index) => {
      // 行コメント
      const lineCommentMatch = line.match(/\/\/\s*(.+)$/);
      if (lineCommentMatch) {
        const todo = parser.parseComment(lineCommentMatch[1], filePath, index + 1);
        if (todo) todos.push(todo);
      }
      
      // ブロックコメント（単行）
      const blockCommentMatch = line.match(/\/\*\s*(.+?)\s*\*\//);
      if (blockCommentMatch) {
        const todo = parser.parseComment(blockCommentMatch[1], filePath, index + 1);
        if (todo) todos.push(todo);
      }
    });
    
    // 複数行ブロックコメント
    const blockComments = content.match(/\/\*[\s\S]*?\*\//g);
    if (blockComments) {
      blockComments.forEach(comment => {
        const cleanComment = comment.replace(/\/\*|\*\//g, '').trim();
        const lineNumber = content.substring(0, content.indexOf(comment)).split('\n').length;
        const todo = parser.parseComment(cleanComment, filePath, lineNumber);
        if (todo) todos.push(todo);
      });
    }
    
    return todos;
  } catch (error) {
    console.warn(`${colors.yellow}⚠️ ファイル読み込みエラー: ${filePath}${colors.reset}`);
    return [];
  }
}

// 📊 統計情報生成
function generateStatistics(todos) {
  const stats = {
    total: todos.length,
    byType: {},
    byPriority: {},
    structured: 0,
    legacy: 0,
    withIssueId: 0,
    withDeadline: 0,
    withAssignee: 0,
    overdue: 0,
    expiringSoon: 0,
    byFile: {}
  };

  todos.forEach(todo => {
    // タイプ別
    stats.byType[todo.type] = (stats.byType[todo.type] || 0) + 1;
    
    // 優先度別
    if (todo.priority) {
      stats.byPriority[todo.priority] = (stats.byPriority[todo.priority] || 0) + 1;
    }
    
    // 構造化状況
    if (todo.isStructured) stats.structured++;
    else stats.legacy++;
    
    // 各種フィールド
    if (todo.issueId) stats.withIssueId++;
    if (todo.date) stats.withDeadline++;
    if (todo.assignee) stats.withAssignee++;
    
    // 期限関連
    if (todo.daysUntilDeadline !== null) {
      if (todo.daysUntilDeadline < 0) stats.overdue++;
      else if (todo.daysUntilDeadline <= 7) stats.expiringSoon++;
    }
    
    // ファイル別
    const fileName = path.basename(todo.filePath);
    stats.byFile[fileName] = (stats.byFile[fileName] || 0) + 1;
  });

  return stats;
}

// 📈 レポート生成
function generateReport(todos, options = {}) {
  const { format = 'console', includeStats = true, sortBy = 'file' } = options;
  
  if (format === 'console') {
    return generateConsoleReport(todos, { includeStats, sortBy });
  } else if (format === 'markdown') {
    return generateMarkdownReport(todos, { includeStats, sortBy });
  } else if (format === 'json') {
    return JSON.stringify({ todos, stats: generateStatistics(todos) }, null, 2);
  }
  
  throw new Error(`Unknown format: ${format}`);
}

function generateConsoleReport(todos, { includeStats, sortBy }) {
  let report = `${colors.bold}${colors.blue}📋 BoxLog TODO/FIXME Report${colors.reset}\n\n`;
  
  if (includeStats) {
    const stats = generateStatistics(todos);
    
    report += `${colors.bold}📊 統計情報${colors.reset}\n`;
    report += `${colors.cyan}総数:${colors.reset} ${stats.total}\n`;
    report += `${colors.cyan}構造化:${colors.reset} ${stats.structured} / 非構造化: ${stats.legacy}\n`;
    
    if (stats.overdue > 0) {
      report += `${colors.red}期限切れ:${colors.reset} ${stats.overdue}\n`;
    }
    if (stats.expiringSoon > 0) {
      report += `${colors.yellow}期限間近:${colors.reset} ${stats.expiringSoon}\n`;
    }
    
    // タイプ別統計
    report += `\n${colors.bold}タイプ別:${colors.reset}\n`;
    Object.entries(stats.byType).forEach(([type, count]) => {
      const color = type === 'TODO' ? colors.blue : 
                   type === 'FIXME' ? colors.red : 
                   type === 'BUG' ? colors.red : colors.gray;
      report += `  ${color}${type}:${colors.reset} ${count}\n`;
    });
    
    // 優先度別統計
    if (Object.keys(stats.byPriority).length > 0) {
      report += `\n${colors.bold}優先度別:${colors.reset}\n`;
      Object.entries(stats.byPriority).forEach(([priority, count]) => {
        const color = ['P0', 'CRITICAL'].includes(priority) ? colors.red :
                     ['P1', 'HIGH'].includes(priority) ? colors.yellow : colors.green;
        report += `  ${color}${priority}:${colors.reset} ${count}\n`;
      });
    }
    
    report += `\n${  '─'.repeat(60)  }\n\n`;
  }
  
  // TODO項目一覧
  const sortedTodos = sortTodos(todos, sortBy);
  let currentFile = '';
  
  sortedTodos.forEach(todo => {
    const fileName = path.relative(process.cwd(), todo.filePath);
    
    if (sortBy === 'file' && fileName !== currentFile) {
      currentFile = fileName;
      report += `${colors.bold}${colors.magenta}📄 ${fileName}${colors.reset}\n`;
    }
    
    const typeColor = todo.type === 'TODO' ? colors.blue :
                     todo.type === 'FIXME' ? colors.red :
                     todo.type === 'BUG' ? colors.red : colors.gray;
    
    const priorityStr = todo.priority ? ` [${todo.priority}]` : '';
    const issueStr = todo.issueId ? ` [${todo.issueId}]` : '';
    const assigneeStr = todo.assignee ? ` @${todo.assignee}` : '';
    const deadlineStr = todo.date ? ` (${todo.date})` : '';
    
    let statusIndicator = '';
    if (todo.daysUntilDeadline !== null) {
      if (todo.daysUntilDeadline < 0) {
        statusIndicator = ` ${colors.red}⚠️ 期限切れ${colors.reset}`;
      } else if (todo.daysUntilDeadline <= 7) {
        statusIndicator = ` ${colors.yellow}🕐 期限間近${colors.reset}`;
      }
    }
    
    report += `  ${colors.gray}L${todo.lineNumber}:${colors.reset} `;
    report += `${typeColor}${todo.type}${colors.reset}`;
    report += `${priorityStr}${issueStr}${deadlineStr}${assigneeStr}`;
    report += `${statusIndicator}\n`;
    report += `    ${todo.description}\n`;
    
    if (sortBy !== 'file') {
      report += `    ${colors.gray}📄 ${fileName}${colors.reset}\n`;
    }
    
    report += '\n';
  });
  
  return report;
}

function generateMarkdownReport(todos, { includeStats, sortBy }) {
  let report = '# 📋 BoxLog TODO/FIXME Report\n\n';
  
  if (includeStats) {
    const stats = generateStatistics(todos);
    
    report += '## 📊 統計情報\n\n';
    report += `- **総数:** ${stats.total}\n`;
    report += `- **構造化:** ${stats.structured} / **非構造化:** ${stats.legacy}\n`;
    
    if (stats.overdue > 0) {
      report += `- **期限切れ:** ${stats.overdue} ⚠️\n`;
    }
    if (stats.expiringSoon > 0) {
      report += `- **期限間近:** ${stats.expiringSoon} 🕐\n`;
    }
    
    report += '\n### タイプ別\n\n';
    Object.entries(stats.byType).forEach(([type, count]) => {
      report += `- **${type}:** ${count}\n`;
    });
    
    if (Object.keys(stats.byPriority).length > 0) {
      report += '\n### 優先度別\n\n';
      Object.entries(stats.byPriority).forEach(([priority, count]) => {
        report += `- **${priority}:** ${count}\n`;
      });
    }
    
    report += '\n---\n\n';
  }
  
  report += '## 📝 TODO/FIXME一覧\n\n';
  
  const sortedTodos = sortTodos(todos, sortBy);
  let currentFile = '';
  
  sortedTodos.forEach(todo => {
    const fileName = path.relative(process.cwd(), todo.filePath);
    
    if (sortBy === 'file' && fileName !== currentFile) {
      currentFile = fileName;
      report += `### 📄 ${fileName}\n\n`;
    }
    
    const priorityBadge = todo.priority ? ` ![${todo.priority}](https://img.shields.io/badge/${todo.priority}-red)` : '';
    const issueBadge = todo.issueId ? ` [${todo.issueId}]` : '';
    const assigneeBadge = todo.assignee ? ` @${todo.assignee}` : '';
    const deadlineBadge = todo.date ? ` 📅 ${todo.date}` : '';
    
    let statusBadge = '';
    if (todo.daysUntilDeadline !== null) {
      if (todo.daysUntilDeadline < 0) {
        statusBadge = ' ⚠️ **期限切れ**';
      } else if (todo.daysUntilDeadline <= 7) {
        statusBadge = ' 🕐 **期限間近**';
      }
    }
    
    report += `#### ${todo.type}${priorityBadge}${issueBadge}${deadlineBadge}${assigneeBadge}${statusBadge}\n\n`;
    report += `**Line ${todo.lineNumber}:** ${todo.description}\n\n`;
    
    if (sortBy !== 'file') {
      report += `📄 \`${fileName}\`\n\n`;
    }
  });
  
  return report;
}

function sortTodos(todos, sortBy) {
  switch (sortBy) {
    case 'priority':
      const priorityOrder = { 'P0': 0, 'CRITICAL': 0, 'P1': 1, 'HIGH': 1, 'P2': 2, 'P3': 3, 'LOW': 3 };
      return todos.sort((a, b) => {
        const aOrder = priorityOrder[a.priority] ?? 99;
        const bOrder = priorityOrder[b.priority] ?? 99;
        return aOrder - bOrder;
      });
    case 'deadline':
      return todos.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      });
    case 'type':
      return todos.sort((a, b) => a.type.localeCompare(b.type));
    case 'file':
    default:
      return todos.sort((a, b) => {
        const fileCompare = a.filePath.localeCompare(b.filePath);
        if (fileCompare !== 0) return fileCompare;
        return a.lineNumber - b.lineNumber;
      });
  }
}

// 📝 ヘルプ表示
function showHelp() {
  console.log(`
${colors.bold}BoxLog TODO/FIXME Manager${colors.reset}

使用方法:
  node scripts/todo-manager.js [オプション]

オプション:
  --format, -f     出力形式 (console, markdown, json)
  --sort, -s       ソート順 (file, priority, deadline, type)
  --output, -o     出力ファイル
  --type, -t       特定のタイプのみ表示 (TODO, FIXME, etc.)
  --priority, -p   特定の優先度のみ表示
  --legacy         非構造化TODOのみ表示
  --overdue        期限切れTODOのみ表示
  --no-stats       統計情報を非表示
  --help, -h       このヘルプを表示

例:
  npm run todo:check
  npm run todo:check -- --format markdown --output todos.md
  npm run todo:check -- --sort priority --type FIXME
  npm run todo:check -- --overdue
        `);
  process.exit(0);
}

// ⚙️ コマンドライン引数解析
function parseCommandLineArgs(args) {
  const options = {
    directory: process.cwd(),
    format: 'console',
    sortBy: 'file',
    includeStats: true,
    outputFile: null,
    filterType: null,
    filterPriority: null,
    showLegacyOnly: false,
    showOverdueOnly: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        break;

      case '--format':
      case '-f':
        options.format = args[++i];
        break;

      case '--sort':
      case '-s':
        options.sortBy = args[++i];
        break;

      case '--output':
      case '-o':
        options.outputFile = args[++i];
        break;

      case '--type':
      case '-t':
        options.filterType = args[++i];
        break;

      case '--priority':
      case '-p':
        options.filterPriority = args[++i];
        break;

      case '--legacy':
        options.showLegacyOnly = true;
        break;

      case '--overdue':
        options.showOverdueOnly = true;
        break;

      case '--no-stats':
        options.includeStats = false;
        break;
    }
  }

  return options;
}

// 🔍 TODOフィルタリング
function filterTodos(todos, options) {
  let filteredTodos = todos;

  if (options.filterType) {
    filteredTodos = filteredTodos.filter(todo => todo.type === options.filterType.toUpperCase());
  }

  if (options.filterPriority) {
    filteredTodos = filteredTodos.filter(todo => todo.priority === options.filterPriority.toUpperCase());
  }

  if (options.showLegacyOnly) {
    filteredTodos = filteredTodos.filter(todo => !todo.isStructured);
  }

  if (options.showOverdueOnly) {
    filteredTodos = filteredTodos.filter(todo => todo.daysUntilDeadline !== null && todo.daysUntilDeadline < 0);
  }

  return filteredTodos;
}

// 📊 結果出力とサマリー
function outputResults(allTodos, options, report) {
  if (options.outputFile) {
    fs.writeFileSync(options.outputFile, report);
    console.log(`${colors.green}✅ レポートを保存しました: ${options.outputFile}${colors.reset}`);
  } else {
    console.log(report);
  }

  const stats = generateStatistics(allTodos);
  if (options.format !== 'json') {
    if (stats.total === 0) {
      console.log(`${colors.green}🎉 TODO/FIXMEは見つかりませんでした！${colors.reset}`);
    } else {
      console.log(`${colors.blue}📋 ${stats.total}個のTODO/FIXMEを発見${colors.reset}`);

      if (stats.overdue > 0) {
        console.log(`${colors.red}⚠️ ${stats.overdue}個の期限切れTODOがあります${colors.reset}`);
        process.exit(1);
      }

      if (stats.expiringSoon > 0) {
        console.log(`${colors.yellow}🕐 ${stats.expiringSoon}個のTODOが期限間近です${colors.reset}`);
      }
    }
  }
}

// 🚀 メイン実行関数
async function main() {
  const args = process.argv.slice(2);
  const options = parseCommandLineArgs(args);

  if (options.format !== 'json') {
    console.log(`${colors.cyan}🔍 TODO/FIXMEを検索中...${colors.reset}`);
  }

  // ファイル検索と解析
  const parser = new TodoParser();
  const files = findSourceFiles(options.directory);
  let allTodos = [];

  files.forEach(file => {
    const todos = analyzeTodosInFile(file, parser);
    allTodos = allTodos.concat(todos);
  });

  // フィルタリング
  allTodos = filterTodos(allTodos, options);

  // レポート生成
  const report = generateReport(allTodos, options);

  // 出力
  outputResults(allTodos, options, report);
}

// CLI実行
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}❌ エラーが発生しました:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = {
  TodoParser,
  analyzeTodosInFile,
  generateStatistics,
  generateReport
};