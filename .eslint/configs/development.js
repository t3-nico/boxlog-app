/**
 * ESLint Development Configuration
 * 
 * 開発環境用の設定（より緩い設定）
 */

module.exports = {
  rules: {
    // コンソールログは開発中は許可
    'no-console': 'off',
    
    // デバッガーは警告レベル
    'no-debugger': 'warn',
    
    // 未使用変数は警告レベル
    'unused-imports/no-unused-vars': 'warn',
  }
};