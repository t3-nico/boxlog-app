/**
 * ESLint Production Configuration
 *
 * 本番環境用の設定（厳格な設定）
 */

module.exports = {
  extends: ['./bundle-optimization.js'],

  rules: {
    // 本番ではコンソールログ禁止
    'no-console': 'error',
    'no-debugger': 'error',

    // 未使用変数は本番環境ではエラーレベル（コードクリーンアップ強制）
    'unused-imports/no-unused-vars': 'error',

    // TypeScript any型チェック（本番環境：エラーレベル）
    '@typescript-eslint/no-explicit-any': 'error',

    // 複雑度チェック（本番環境：エラーレベル - リーダブルコード必須）
    complexity: ['error', 10],

    // テーマルールは本番環境では厳格に適用
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'Literal[value=/bg-(red|green|blue|yellow|purple|pink|indigo|gray|slate|zinc|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(\\d00|50)/]',
        message:
          '🎨 本番環境では直接的なTailwindカラークラス (bg-*-*) の使用は禁止です。@/config/theme の colors を使用してください。',
      },
      {
        selector:
          'Literal[value=/text-(red|green|blue|yellow|purple|pink|indigo|gray|slate|zinc|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(\\d00|50)/]',
        message:
          '🎨 本番環境では直接的なTailwindテキストカラークラス (text-*-*) の使用は禁止です。@/config/theme の colors を使用してください。',
      },
      {
        selector:
          'Literal[value=/border-(red|green|blue|yellow|purple|pink|indigo|gray|slate|zinc|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(\\d00|50)/]',
        message:
          '🎨 本番環境では直接的なTailwindボーダーカラークラス (border-*-*) の使用は禁止です。@/config/theme の colors を使用してください。',
      },
    ],
  },
}
