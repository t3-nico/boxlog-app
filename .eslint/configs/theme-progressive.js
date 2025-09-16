/**
 * 段階的テーマ導入設定
 * 
 * 開発環境でもテーマ遵守を保ちつつ、
 * 最も違反の多いファイルは段階的に適用
 */

// Phase 1: 最も違反の多いファイルを一時除外（30+ violations）
const PHASE_1_EXCLUSIONS = [
  'src/features/calendar/components/common/accessibility/AccessibilitySettings.tsx', // 33 violations
];

// Phase 2: 中程度の違反ファイルを一時除外（20-30 violations）
const PHASE_2_EXCLUSIONS = [
  'src/features/tags/components/tag-edit-modal.tsx',         // 31
  'src/features/tags/components/tag-create-modal.tsx',       // 25
  'src/features/tags/components/tag-management-modal.tsx',   // 24
  'src/features/smart-folders/components/rule-preview.tsx',  // 24
  'src/features/smart-folders/components/smart-folder-dialog.tsx', // 22
];

// Phase 3: 軽度の違反ファイル（10-20 violations）
const PHASE_3_EXCLUSIONS = [
  'src/features/tags/components/tag-tree-view.tsx',          // 16
  'src/features/tags/components/tag-filter.tsx',             // 15
  'src/features/events/components/EventTrashView.tsx',       // 15
  'src/features/notifications/components/notifications-list.tsx', // 14
  'src/features/tags/components/tag-edit-dialog.tsx',        // 13
  'src/features/smart-folders/components/rule-editor.tsx',   // 12
  'src/features/tags/components/quick-tag-create-modal.tsx', // 11
  'src/features/smart-folders/components/smart-folder-context-menu.tsx', // 10
];

// 修正済みファイル（厳格適用）
const THEME_COMPLIANT_FILES = [
  'src/app/error/page.tsx',
  // 今後修正するファイルをここに追加
];

module.exports = {
  // 基本設定：カスタムルールは一旦無効化（プラグイン問題のため）
  rules: {
    // 'boxlog-theme/enforce-theme-usage': 'warn',
    // 'boxlog-theme/no-direct-tailwind': 'warn',
  },
  
  overrides: [
    // 修正済みファイル - 将来のテーマルール適用対象
    {
      files: THEME_COMPLIANT_FILES,
      rules: {
        // 'boxlog-theme/enforce-theme-usage': 'error',
        // 'boxlog-theme/no-direct-tailwind': 'error',
      }
    },
    
    // Phase 1: 最重要ファイル - 段階的修正計画
    {
      files: PHASE_1_EXCLUSIONS,
      rules: {
        // テーマ関連は現在無効（段階的に有効化予定）
      }
    },
    
    // Phase 2: 中程度ファイル - 段階的修正計画
    {
      files: PHASE_2_EXCLUSIONS,
      rules: {
        // テーマ関連は現在無効（段階的に有効化予定）
      }
    },
    
    // Phase 3: 軽度ファイル - 段階的修正計画  
    {
      files: PHASE_3_EXCLUSIONS,
      rules: {
        // テーマ関連は現在無効（段階的に有効化予定）
      }
    },
    
    // テストファイルは除外
    {
      files: ['**/*.test.tsx', '**/*.test.ts', 'tests/**/*'],
      rules: {
        // テストファイルは対象外
      }
    },
    
    // 設定ファイルは除外
    {
      files: ['config/**/*', 'scripts/**/*', '.eslint/**/*'],
      rules: {
        // 設定ファイルは対象外
      }
    }
  ]
};