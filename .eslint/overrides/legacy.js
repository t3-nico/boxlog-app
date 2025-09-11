/**
 * Legacy Code Override Configuration
 * 
 * 既存コードの段階的な移行用設定
 */

module.exports = {
  files: [
    // レガシーディレクトリ
    'src/legacy/**',
    'src/old-components/**',
    'src/deprecated/**',
    
    // 段階的移行対象のファイル
    'src/hooks/useAddPopup.ts',        // TODO: 段階的に削除予定
    'src/lib/data/index.ts',           // TODO: Replace with proper implementation
    
    // 大規模なリファクタリング対象
    'src/features/smart-folders/stores/smart-folder-store.ts',
    'src/features/trash/stores/useTrashStore.ts',
    
    // theme移行が複雑なファイル
    'src/app/(app)/board/page.tsx',
    'src/app/(app)/stats/page.tsx',
    
    // 一時的な例外ファイル（PRごとに見直し）
    'src/app/(app)/ai-chat/page.tsx',
    'src/components/ui/rich-text-editor/**'
  ],
  
  rules: {
    // 未使用変数は警告レベル
    'unused-imports/no-unused-vars': 'warn',
    
    // Import orderは警告レベル
    'import/order': 'warn',
  }
};