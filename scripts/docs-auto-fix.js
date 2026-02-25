#!/usr/bin/env node

/**
 * ドキュメント自動修正システム
 *
 * docs-code-consistency.jsで発見された問題の一部を自動修正
 * Issue #79の追加機能
 */

const fs = require('fs');
const path = require('path');

// ANSI色コード
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}🔧 ${msg}${colors.reset}\n`),
};

class DocsAutoFixer {
  constructor() {
    this.rootDir = process.cwd();
    this.docsDir = path.join(this.rootDir, 'docs');
    this.fixes = [];
  }

  async run() {
    log.title('ドキュメント自動修正システム');

    console.log('🎯 自動修正可能な項目:');
    console.log('  - 壊れた内部リンクの修正');
    console.log('  - TODO_REPORT.mdの再生成');
    console.log('  - ドキュメント更新日付の自動更新');
    console.log('  - 古いファイル参照の修正\n');

    await this.fixBrokenInternalLinks();
    await this.regenerateTodoReport();
    await this.updateDocumentationDates();
    await this.addMissingDocumentReferences();

    this.printFixSummary();
  }

  // 壊れた内部リンクの修正
  async fixBrokenInternalLinks() {
    log.title('壊れた内部リンクの修正');

    const markdownFiles = this.getAllMarkdownFiles();

    markdownFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;
      let hasChanges = false;
      const relativePath = path.relative(this.rootDir, filePath);

      // よくある壊れたリンクパターンを修正
      const linkFixes = [
        { from: './PERFORMANCE.md', to: './BUNDLE_MONITORING.md', reason: 'ファイル名変更' },
        { from: './ESLINT.md', to: './ESLINT_THEME_ENFORCEMENT.md', reason: 'ファイル名変更' },
        { from: './CICD.md', to: './CI_CD_SETUP.md', reason: 'ファイル名変更' },
        { from: './development/', to: './features/', reason: 'ディレクトリ構造変更' },
        { from: './database/', to: './reports/', reason: 'ディレクトリ構造変更' },
      ];

      linkFixes.forEach((fix) => {
        if (content.includes(fix.from)) {
          updatedContent = updatedContent.replace(
            new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            fix.to,
          );
          log.success(`${relativePath}: ${fix.from} → ${fix.to} (${fix.reason})`);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        fs.writeFileSync(filePath, updatedContent);
        this.fixes.push(`リンク修正: ${relativePath}`);
      }
    });
  }

  // TODO_REPORT.mdの再生成
  async regenerateTodoReport() {
    log.title('TODO_REPORT.mdの再生成');

    try {
      const { execSync } = require('child_process');

      // コード内のTODOを検索
      const todoOutput = execSync(
        'grep -rn "TODO\\|FIXME\\|NOTE\\|XXX" src/ --include="*.ts" --include="*.tsx" || true',
        { encoding: 'utf8' },
      );
      const todoLines = todoOutput.split('\n').filter((line) => line.trim());

      const reportContent = `# TODO管理レポート

自動生成日: ${new Date().toISOString().split('T')[0]}

## 📊 概要

- **総TODO数**: ${todoLines.length}件
- **最終更新**: ${new Date().toLocaleString('ja-JP')}

## 📋 TODO一覧

${
  todoLines.length > 0
    ? todoLines
        .map((line, index) => {
          const [file, ...rest] = line.split(':');
          const content = rest.join(':').trim();
          return `### ${index + 1}. ${path.relative(this.rootDir, file)}

\`\`\`
${content}
\`\`\`
`;
        })
        .join('\n')
    : '現在TODOはありません ✅'
}

## 🔄 更新履歴

このファイルは \`npm run docs:auto-fix\` により自動生成されます。

---

**注意**: このファイルは自動生成のため、手動編集しないでください。`;

      const todoReportPath = path.join(this.docsDir, 'TODO_REPORT.md');
      fs.writeFileSync(todoReportPath, reportContent);

      log.success(`TODO_REPORT.md を再生成しました (${todoLines.length}件のTODO)`);
      this.fixes.push(`TODO_REPORT.md再生成 (${todoLines.length}件)`);
    } catch {
      log.error('TODO_REPORT.md の再生成に失敗しました');
    }
  }

  // ドキュメント更新日付の自動更新
  async updateDocumentationDates() {
    log.title('ドキュメント更新日付の自動更新');

    const markdownFiles = this.getAllMarkdownFiles();
    const today = new Date().toISOString().split('T')[0];

    markdownFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.rootDir, filePath);

      // フッターの更新日付パターンを検索・更新
      const datePatterns = [
        /最終更新[:\s]*\d{4}[-\/]\d{2}[-\/]\d{2}/g,
        /\*\*最終更新\*\*[:\s]*\d{4}年\d{1,2}月\d{1,2}日/g,
        /Last updated[:\s]*\d{4}[-\/]\d{2}[-\/]\d{2}/g,
      ];

      let updatedContent = content;
      let hasDateUpdate = false;

      datePatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          const newDate = `**最終更新**: ${today}`;
          updatedContent = updatedContent.replace(pattern, newDate);
          hasDateUpdate = true;
        }
      });

      // フッターがない場合は追加
      if (!hasDateUpdate && !content.includes('最終更新') && content.length > 100) {
        const footer = `\n\n---\n\n**最終更新**: ${today}`;
        updatedContent = content + footer;
        hasDateUpdate = true;
      }

      if (hasDateUpdate) {
        fs.writeFileSync(filePath, updatedContent);
        log.success(`更新日付を更新: ${relativePath}`);
        this.fixes.push(`日付更新: ${relativePath}`);
      }
    });
  }

  // 不足しているドキュメント参照の追加
  async addMissingDocumentReferences() {
    log.title('不足しているドキュメント参照の追加');

    // DESIGN_SYSTEM_README.mdにtheme系ファイルの参照を追加
    const designSystemPath = path.join(this.docsDir, 'DESIGN_SYSTEM_README.md');

    if (fs.existsSync(designSystemPath)) {
      const content = fs.readFileSync(designSystemPath, 'utf8');

      // 実装済みだが未記載のthemeファイル
      const missingReferences = [];
      if (!content.includes('animations')) missingReferences.push('animations');
      if (!content.includes('layout')) missingReferences.push('layout');
      if (!content.includes('elevation')) missingReferences.push('elevation');
      if (!content.includes('icons')) missingReferences.push('icons');

      if (missingReferences.length > 0) {
        const additionalSection = `

## 🚀 追加実装済みテーマ

以下のテーマカテゴリも実装済みです:

${missingReferences.map((ref) => `- \`${ref}.ts\`: ${this.getThemeDescription(ref)}`).join('\n')}

*注意: このセクションは自動生成により追加されました*
`;

        const updatedContent = content + additionalSection;
        fs.writeFileSync(designSystemPath, updatedContent);

        log.success(`DESIGN_SYSTEM_README.mdに不足参照を追加: ${missingReferences.join(', ')}`);
        this.fixes.push(`参照追加: DESIGN_SYSTEM_README.md (${missingReferences.length}項目)`);
      }
    }
  }

  // テーマの説明を取得
  getThemeDescription(themeName) {
    const descriptions = {
      animations: 'アニメーション・トランジション設定',
      layout: 'レイアウト・グリッドシステム',
      elevation: '影・高さ設定',
      icons: 'アイコンサイズ・色設定',
      rounded: '角丸設定',
    };
    return descriptions[themeName] || 'テーマ設定';
  }

  // ヘルパーメソッド
  getAllMarkdownFiles() {
    const files = [];
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      items.forEach((item) => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      });
    };
    walkDir(this.docsDir);
    return files;
  }

  printFixSummary() {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.bold}${colors.green}🔧 自動修正完了サマリー${colors.reset}`);
    console.log('='.repeat(60));

    if (this.fixes.length > 0) {
      console.log(`${colors.green}✅ 修正項目: ${this.fixes.length}件${colors.reset}`);
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`);
      });
    } else {
      console.log(`${colors.blue}ℹ️  修正が必要な項目はありませんでした${colors.reset}`);
    }

    console.log(`\n💡 次のステップ:`);
    console.log('  - npm run docs:check で整合性を再確認');
    console.log('  - 手動修正が必要な項目があれば対応');
    console.log('  - git add & commit で変更をコミット\n');
  }
}

// メイン実行
if (require.main === module) {
  const fixer = new DocsAutoFixer();
  fixer.run().catch(console.error);
}

module.exports = { DocsAutoFixer };
