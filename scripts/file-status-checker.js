#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * ファイルステータスチェッカー
 * 新規/既存ファイルの判定とルールレベル提案
 */

class FileStatusChecker {
  check(pattern = 'src/**/*.{ts,tsx}') {
    const files = this.getFiles(pattern);
    const report = {
      new: [],
      recent: [],    // 7日以内
      standard: [],  // 8-30日
      old: [],       // 30日以上
      total: files.length
    };

    files.forEach(file => {
      const status = this.getFileStatus(file);
      report[status.category].push({
        path: file,
        age: status.age,
        ruleLevel: status.ruleLevel
      });
    });

    this.printReport(report);
    return report;
  }

  getFiles(pattern) {
    const result = execSync(
      `find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`,
      { encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(Boolean);
  }

  getFileStatus(filePath) {
    try {
      // Gitで追跡されているか確認
      execSync(`git ls-files --error-unmatch ${filePath}`, {
        stdio: ['ignore', 'ignore', 'ignore']
      });

      // ファイルの作成日を取得
      const result = execSync(
        `git log --format=%at --reverse ${filePath} | head -1`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      );

      if (!result) {
        return { category: 'new', age: 0, ruleLevel: 'error' };
      }

      const createdAt = parseInt(result.trim());
      const now = Date.now() / 1000;
      const days = Math.floor((now - createdAt) / (24 * 60 * 60));

      if (days <= 7) {
        return { category: 'recent', age: days, ruleLevel: 'error' };
      } else if (days <= 30) {
        return { category: 'standard', age: days, ruleLevel: 'warn' };
      } else {
        return { category: 'old', age: days, ruleLevel: 'warn->error' };
      }
    } catch {
      // Gitで追跡されていない = 新規ファイル
      return { category: 'new', age: 0, ruleLevel: 'error' };
    }
  }

  printReport(report) {
    console.log(`
📊 File Status Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Total Files: ${report.total}

🆕 New Files (error level): ${report.new.length}
   ${report.new.slice(0, 3).map(f => `   - ${f.path}`).join('\n')}
   ${report.new.length > 3 ? `   ... and ${report.new.length - 3} more` : ''}

📅 Recent Files (<7 days, error level): ${report.recent.length}
   ${report.recent.slice(0, 3).map(f => `   - ${f.path} (${f.age} days)`).join('\n')}

📝 Standard Files (8-30 days, warn level): ${report.standard.length}
   ${report.standard.slice(0, 3).map(f => `   - ${f.path} (${f.age} days)`).join('\n')}

🏛️ Old Files (>30 days, migrating to error): ${report.old.length}
   ${report.old.slice(0, 3).map(f => `   - ${f.path} (${f.age} days)`).join('\n')}

💡 Recommendation:
   - New/Recent files: Strict rules (error)
   - Standard files: Progressive rules (warn)
   - Old files: Consider refactoring to meet strict rules
    `);
  }
}

// CLIとして実行
if (require.main === module) {
  const checker = new FileStatusChecker();
  const pattern = process.argv[2];
  checker.check(pattern);
}

module.exports = FileStatusChecker;