#!/usr/bin/env node
/**
 * ESLint並列実行CLI
 *
 * 使用例:
 * node .eslint/utils/eslint-parallel-cli.js
 * node .eslint/utils/eslint-parallel-cli.js --fix
 * node .eslint/utils/eslint-parallel-cli.js --pattern "src/components/*.tsx"
 */

const { runParallelESLint } = require('./parallel-runner');

async function main() {
  const args = process.argv.slice(2);

  const options = {
    fix: args.includes('--fix'),
    quiet: args.includes('--quiet'),
    patterns: ['src/**/*.{ts,tsx,js,jsx}']
  };

  // パターン指定
  const patternIndex = args.indexOf('--pattern');
  if (patternIndex !== -1 && args[patternIndex + 1]) {
    options.patterns = [args[patternIndex + 1]];
  }

  try {
    const result = await runParallelESLint(options);

    // 結果に応じて終了コード設定
    if (result.summary.errors > 0) {
      process.exit(1);
    } else if (result.summary.warnings > 0) {
      process.exit(0);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ 並列実行エラー:', error.message);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };