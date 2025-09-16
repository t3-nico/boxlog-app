/**
 * 安全なテーマルール導入設定
 * 
 * 新規ファイルのみに適用し、既存ファイルは除外
 */

// 修正済みまたは新規作成されたファイルのリスト
const THEME_COMPLIANT_FILES = [
  'src/app/error/page.tsx',
  // 今後修正するファイルをここに追加
];

// 明示的に除外するファイル（大きな既存ファイル）
const LEGACY_FILES = [
  'src/features/calendar/**/*.tsx',
  'src/features/tags/**/*.tsx',
  'src/features/auth/**/*.tsx',
  'src/components/shadcn-ui/**/*.tsx',
  // 必要に応じて追加
];

module.exports = {
  overrides: [
    // 修正済みファイル - 厳格適用
    {
      files: THEME_COMPLIANT_FILES,
      rules: {
        'boxlog-theme/enforce-theme-usage': 'error',
        'boxlog-theme/no-direct-tailwind': 'error',
      }
    },
    
    // レガシーファイル - テーマルール無効（ビルドブロッカー回避）
    {
      files: LEGACY_FILES,
      rules: {
        'boxlog-theme/enforce-theme-usage': 'off',
        'boxlog-theme/no-direct-tailwind': 'off',
      }
    },
    
    // 新規ファイル検出用（30日以内作成）- 段階的に有効化予定
    // TODO: 将来的に git で新規ファイルを検出して適用
  ]
};