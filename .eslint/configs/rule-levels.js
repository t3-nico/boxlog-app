/**
 * ESLintルールレベル定義
 *
 * 戦略:
 * - 新規ファイル: strictルール適用（error）
 * - 既存ファイル: progressiveルール適用（warn → error）
 * - レガシー: legacyルール適用（off/warn）
 *
 * FileStatusChecker統合による高度なファイル分類
 */

const { execSync } = require('child_process');
const path = require('path');

// FileStatusCheckerの軽量版統合
let fileStatusCache = new Map();

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

// 高度なファイル分類（FileStatusChecker統合）
const getAdvancedFileStatus = (filePath) => {
  // キャッシュ確認
  if (fileStatusCache.has(filePath)) {
    return fileStatusCache.get(filePath);
  }

  let status;
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
      status = { category: 'new', age: 0, ruleLevel: 'error' };
    } else {
      const createdAt = parseInt(result.trim());
      const now = Date.now() / 1000;
      const days = Math.floor((now - createdAt) / (24 * 60 * 60));

      if (days <= 7) {
        status = { category: 'recent', age: days, ruleLevel: 'error' };
      } else if (days <= 30) {
        status = { category: 'standard', age: days, ruleLevel: 'warn' };
      } else {
        status = { category: 'old', age: days, ruleLevel: 'warn->error' };
      }
    }
  } catch {
    // Gitで追跡されていない = 新規ファイル
    status = { category: 'new', age: 0, ruleLevel: 'error' };
  }

  // キャッシュに保存（ESLint実行中のパフォーマンス向上）
  fileStatusCache.set(filePath, status);
  return status;
};

// 統合ルールレベル決定関数（高度版）
const getIntegratedRuleLevel = (ruleName, filePath, options = {}) => {
  const fileStatus = getAdvancedFileStatus(filePath);
  const {
    strictAfterDays = 30,
    allowList = [],
    blockList = [],
    enableAdvancedClassification = true
  } = options;

  // ブロックリストのルールは常にerror
  if (blockList.includes(ruleName)) {
    return 'error';
  }

  // 許可リストのルールは常にwarn
  if (allowList.includes(ruleName)) {
    return 'warn';
  }

  // 高度分類が有効な場合
  if (enableAdvancedClassification) {
    switch (fileStatus.category) {
      case 'new':
      case 'recent':
        return 'error'; // 新規・最近のファイルは厳格
      case 'standard':
        return 'warn';  // 標準的なファイルは段階的
      case 'old':
        return process.env.NODE_ENV === 'production' ? 'error' : 'warn'; // 古いファイルは環境による
      default:
        return 'warn';
    }
  }

  // フォールバック：従来の方式
  return getRuleLevel(ruleName, filePath, options);
};

// プロジェクト全体のファイル分布レポート
const getProjectFileDistribution = () => {
  const distribution = {
    new: 0,
    recent: 0,
    standard: 0,
    old: 0,
    total: 0
  };

  try {
    const files = execSync(
      'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"',
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);

    files.forEach(file => {
      const status = getAdvancedFileStatus(file);
      distribution[status.category]++;
      distribution.total++;
    });
  } catch (error) {
    console.warn('Project file distribution analysis failed:', error.message);
  }

  return distribution;
};

module.exports = {
  isNewFile,
  getFileAge,
  getRuleLevel,
  unifiedRules,
  // 新しい統合機能
  getAdvancedFileStatus,
  getIntegratedRuleLevel,
  getProjectFileDistribution,
  // キャッシュ管理
  clearFileStatusCache: () => fileStatusCache.clear(),
};