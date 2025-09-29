/**
 * ESLintルールレベル定義
 *
 * 戦略:
 * - 新規ファイル: strictルール適用（error）
 * - 既存ファイル: progressiveルール適用（warn → error）
 * - レガシー: legacyルール適用（off/warn）
 */

const { execSync } = require('child_process');
const path = require('path');

// ファイルが新規かどうか判定
const isNewFile = (filePath) => {
  try {
    // Gitで追跡されていないファイル = 新規ファイル
    const result = execSync(`git ls-files ${filePath}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return result.trim() === '';
  } catch {
    return true; // Gitエラーの場合は新規扱い
  }
};

// ファイルの作成日を取得（日数）
const getFileAge = (filePath) => {
  try {
    const result = execSync(
      `git log --format=%at --reverse ${filePath} | head -1`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    if (!result) return 0;

    const createdAt = parseInt(result.trim());
    const now = Date.now() / 1000;
    const days = (now - createdAt) / (24 * 60 * 60);
    return Math.floor(days);
  } catch {
    return 0;
  }
};

// ルールレベル決定関数
const getRuleLevel = (ruleName, filePath, options = {}) => {
  const {
    strictAfterDays = 30,  // 30日後にerrorに移行
    allowList = [],         // 常にwarnにする例外ルール
    blockList = []          // 常にerrorにするルール
  } = options;

  // ブロックリストのルールは常にerror
  if (blockList.includes(ruleName)) {
    return 'error';
  }

  // 許可リストのルールは常にwarn
  if (allowList.includes(ruleName)) {
    return 'warn';
  }

  // 新規ファイルは常にerror
  if (isNewFile(filePath)) {
    return 'error';
  }

  // 古いファイルは段階的に厳格化
  const fileAge = getFileAge(filePath);
  if (fileAge > strictAfterDays) {
    return 'error';
  }

  return 'warn';
};

// 統一ルール定義
const unifiedRules = {
  // Critical（常にerror）
  critical: {
    'no-unused-vars': 'off', // @typescript-eslint/no-unused-varsを使用
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
  },

  // Progressive（段階的にerrorへ）
  progressive: {
    'unused-imports/no-unused-imports': 'warn',
    'import/order': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
  },

  // Style（常にwarn）
  style: {
    'indent': ['warn', 2],
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'always-multiline'],
  },

  // BoxLog Custom (将来的にカスタムルールが実装される場合)
  boxlog: {
    // 'boxlog-theme/enforce-theme-usage': 'warn',
    // 'boxlog-compliance/gdpr-data-collection': 'warn',
    // 'boxlog-todo/no-expired-todos': 'error',
  }
};

module.exports = {
  isNewFile,
  getFileAge,
  getRuleLevel,
  unifiedRules,
};