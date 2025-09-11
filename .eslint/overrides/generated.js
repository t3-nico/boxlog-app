/**
 * Generated Files Override Configuration
 * 
 * 自動生成ファイルに対する緩いルール設定
 */

module.exports = {
  files: [
    // 自動生成ファイル
    '*.generated.ts',
    '*.generated.tsx',
    '*.generated.js',
    '*.generated.jsx',
    
    // Supabase生成ファイル
    'src/types/supabase.ts',
    'src/types/database.ts',
    
    // 生成されたディレクトリ
    'src/__generated__/**',
    'src/generated/**',
    
    // ビルドアーティファクト
    '.next/**',
    'out/**',
    'dist/**',
    
    // 設定ファイル（一部）
    'next.config.js',
    'tailwind.config.js',
    'postcss.config.js'
  ],
  
  rules: {
    // Import関連の緩和
    'import/order': 'off',
    'unused-imports/no-unused-imports': 'off',
    'unused-imports/no-unused-vars': 'off',
    
    // その他の緩和
    'no-console': 'off',
    'prefer-const': 'off'
  }
};