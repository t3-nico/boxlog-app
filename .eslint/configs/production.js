/**
 * ESLint Production Configuration
 * 
 * 本番環境用の設定（厳格な設定）
 */

module.exports = {
  rules: {
    // 本番ではコンソールログ禁止
    'no-console': 'error',
    'no-debugger': 'error',
    
    // 未使用変数は厳格にエラー
    'unused-imports/no-unused-vars': 'error',
  }
};