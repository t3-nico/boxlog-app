/**
 * ESLint Development Configuration
 *
 * 開発環境用の設定（より緩い設定）
 */

const themeSimple = require('./theme-simple.js')

module.exports = {
  ...themeSimple,

  rules: {
    ...themeSimple.rules,

    // 開発環境固有のルール
    'no-console': 'off',
    'no-debugger': 'warn',
    'unused-imports/no-unused-vars': 'warn',

    // TypeScript any型チェック（開発環境：警告レベル）
    '@typescript-eslint/no-explicit-any': 'warn',

    // 複雑度チェック（開発環境：警告レベル - リーダブルコード促進）
    complexity: ['warn', 15],

    // 人間中心設計ルールは本番error必須（アクセシビリティ強化）
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-autofocus': 'warn',  // autofocusは状況により必要な場合があるためwarn維持
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',  // インタラクティブ要素はフォーカス可能必須
    'jsx-a11y/label-has-associated-control': 'error',  // フォーム要素のラベル必須
    // 外部リンクセキュリティ（Google基準 - 開発環境でも警告）
    'react/jsx-no-target-blank': [
      'warn',
      {
        allowReferrer: false,
        enforceDynamicLinks: 'always',
        warnOnSpreadAttributes: true,
      },
    ],
    'react/button-has-type': 'warn',

    // テーマルールは開発環境では警告レベル（段階的導入）
    'no-restricted-syntax': [
      'warn',
      {
        selector:
          'Literal[value=/bg-(red|green|blue|yellow|purple|pink|indigo|gray|slate|zinc|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(\\d00|50)/]',
        message:
          '🎨 直接的なTailwindカラークラス (bg-*-*) の使用は禁止です。代わりに @/config/theme の colors を使用してください。',
      },
      {
        selector:
          'Literal[value=/text-(red|green|blue|yellow|purple|pink|indigo|gray|slate|zinc|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(\\d00|50)/]',
        message:
          '🎨 直接的なTailwindテキストカラークラス (text-*-*) の使用は禁止です。代わりに @/config/theme の colors を使用してください。',
      },
      {
        selector:
          'Literal[value=/border-(red|green|blue|yellow|purple|pink|indigo|gray|slate|zinc|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(\\d00|50)/]',
        message:
          '🎨 直接的なTailwindボーダーカラークラス (border-*-*) の使用は禁止です。代わりに @/config/theme の colors を使用してください。',
      },
    ],
  },

  overrides: [
    ...(themeSimple.overrides || []),
    // 型定義ファイルはテーマルール除外
    {
      files: ['src/types/**/*'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
}
