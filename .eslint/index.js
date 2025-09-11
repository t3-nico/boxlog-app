/**
 * BoxLog ESLint Configuration - Main Entry Point
 * 
 * 環境に応じて適切な設定を選択します
 */

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  extends: [
    './configs/base.js',
    isDev ? './configs/development.js' : './configs/production.js'
  ],
  
  overrides: [
    require('./overrides/generated.js'),
    require('./overrides/legacy.js'),
  ],
};