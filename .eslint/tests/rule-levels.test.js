/**
 * ESLintルールレベル統一システムのテスト
 */

const {
  isNewFile,
  getFileAge,
  getRuleLevel,
  unifiedRules
} = require('../configs/rule-levels');

// モックファイル作成用関数
const mockGitCommand = (command, output) => {
  const originalExecSync = require('child_process').execSync;
  require('child_process').execSync = jest.fn().mockImplementation((cmd) => {
    if (cmd.includes(command)) {
      if (output === 'ERROR') {
        throw new Error('Command failed');
      }
      return output;
    }
    return originalExecSync(cmd);
  });
};

describe('ESLintルールレベル統一システム', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isNewFile関数', () => {
    test('Gitで追跡されていないファイルは新規ファイルとして判定', () => {
      mockGitCommand('git ls-files', '');
      expect(isNewFile('src/components/NewComponent.tsx')).toBe(true);
    });

    test('Gitで追跡されているファイルは既存ファイルとして判定', () => {
      mockGitCommand('git ls-files', 'src/components/ExistingComponent.tsx');
      expect(isNewFile('src/components/ExistingComponent.tsx')).toBe(false);
    });

    test('Gitコマンドエラー時は新規ファイルとして扱う', () => {
      mockGitCommand('git ls-files', 'ERROR');
      expect(isNewFile('any-file.tsx')).toBe(true);
    });
  });

  describe('getFileAge関数', () => {
    test('ファイル作成から30日以上経過の場合', () => {
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
      mockGitCommand('git log --format=%at --reverse', thirtyDaysAgo.toString());

      const age = getFileAge('src/old-file.tsx');
      expect(age).toBeGreaterThanOrEqual(30);
    });

    test('新しいファイルの場合（7日以内）', () => {
      const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
      mockGitCommand('git log --format=%at --reverse', sevenDaysAgo.toString());

      const age = getFileAge('src/new-file.tsx');
      expect(age).toBeLessThan(30);
    });

    test('Gitログが空の場合は0を返す', () => {
      mockGitCommand('git log --format=%at --reverse', '');
      expect(getFileAge('any-file.tsx')).toBe(0);
    });
  });

  describe('getRuleLevel関数', () => {
    test('新規ファイルは常にerrorレベル', () => {
      mockGitCommand('git ls-files', '');
      const level = getRuleLevel('unused-imports/no-unused-imports', 'src/new-file.tsx');
      expect(level).toBe('error');
    });

    test('30日以上経過したファイルはerrorレベル', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - (35 * 24 * 60 * 60);
      mockGitCommand('git ls-files', 'src/old-file.tsx');
      mockGitCommand('git log --format=%at --reverse', oldTimestamp.toString());

      const level = getRuleLevel('unused-imports/no-unused-imports', 'src/old-file.tsx');
      expect(level).toBe('error');
    });

    test('30日以内のファイルはwarnレベル', () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - (20 * 24 * 60 * 60);
      mockGitCommand('git ls-files', 'src/recent-file.tsx');
      mockGitCommand('git log --format=%at --reverse', recentTimestamp.toString());

      const level = getRuleLevel('unused-imports/no-unused-imports', 'src/recent-file.tsx');
      expect(level).toBe('warn');
    });

    test('ブロックリストのルールは常にerror', () => {
      const options = { blockList: ['unused-imports/no-unused-imports'] };
      mockGitCommand('git ls-files', 'src/any-file.tsx');

      const level = getRuleLevel('unused-imports/no-unused-imports', 'src/any-file.tsx', options);
      expect(level).toBe('error');
    });

    test('許可リストのルールは常にwarn', () => {
      const options = { allowList: ['unused-imports/no-unused-imports'] };
      mockGitCommand('git ls-files', '');

      const level = getRuleLevel('unused-imports/no-unused-imports', 'src/new-file.tsx', options);
      expect(level).toBe('warn');
    });
  });

  describe('unifiedRules定義', () => {
    test('Critical rulesには重要なルールが含まれている', () => {
      expect(unifiedRules.critical).toHaveProperty('@typescript-eslint/no-unused-vars');
      expect(unifiedRules.critical).toHaveProperty('no-debugger');
      expect(unifiedRules.critical).toHaveProperty('no-console');
    });

    test('Progressive rulesには段階的適用ルールが含まれている', () => {
      expect(unifiedRules.progressive).toHaveProperty('unused-imports/no-unused-imports');
      expect(unifiedRules.progressive).toHaveProperty('import/order');
      expect(unifiedRules.progressive).toHaveProperty('@typescript-eslint/no-explicit-any');
    });

    test('Style rulesにはフォーマット関連ルールが含まれている', () => {
      expect(unifiedRules.style).toHaveProperty('indent');
      expect(unifiedRules.style).toHaveProperty('quotes');
      expect(unifiedRules.style).toHaveProperty('semi');
    });

    test('BoxLog custom rulesには専用ルールが含まれている', () => {
      expect(unifiedRules.boxlog).toHaveProperty('boxlog-theme/enforce-theme-usage');
      expect(unifiedRules.boxlog).toHaveProperty('boxlog-compliance/gdpr-data-collection');
    });
  });

  describe('統合テスト', () => {
    test('環境変数に応じたルールレベル適用', () => {
      // NODE_ENV=productionの場合
      process.env.NODE_ENV = 'production';

      // 新規ファイルの場合
      mockGitCommand('git ls-files', '');
      const newFileLevel = getRuleLevel('unused-imports/no-unused-imports', 'src/new.tsx');
      expect(newFileLevel).toBe('error');

      // 既存ファイル（古い）の場合
      const oldTimestamp = Math.floor(Date.now() / 1000) - (40 * 24 * 60 * 60);
      mockGitCommand('git ls-files', 'src/old.tsx');
      mockGitCommand('git log --format=%at --reverse', oldTimestamp.toString());
      const oldFileLevel = getRuleLevel('unused-imports/no-unused-imports', 'src/old.tsx');
      expect(oldFileLevel).toBe('error');

      delete process.env.NODE_ENV;
    });

    test('開発環境での段階的適用', () => {
      process.env.NODE_ENV = 'development';

      // 新しいファイル（20日以内）の場合
      const recentTimestamp = Math.floor(Date.now() / 1000) - (15 * 24 * 60 * 60);
      mockGitCommand('git ls-files', 'src/recent.tsx');
      mockGitCommand('git log --format=%at --reverse', recentTimestamp.toString());

      const level = getRuleLevel('unused-imports/no-unused-imports', 'src/recent.tsx');
      expect(level).toBe('warn');

      delete process.env.NODE_ENV;
    });
  });
});

// パフォーマンステスト
describe('パフォーマンステスト', () => {
  test('大量ファイル処理のパフォーマンス', () => {
    const startTime = Date.now();

    // 100ファイルの処理をシミュレート
    for (let i = 0; i < 100; i++) {
      mockGitCommand('git ls-files', `src/file-${i}.tsx`);
      getRuleLevel('unused-imports/no-unused-imports', `src/file-${i}.tsx`);
    }

    const duration = Date.now() - startTime;

    // 100ファイル処理が1秒以内に完了することを確認
    expect(duration).toBeLessThan(1000);
  });
});

module.exports = {
  mockGitCommand,
};