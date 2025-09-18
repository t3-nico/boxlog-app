/**
 * 厳格なテーマ遵守チェック設定
 *
 * 新規作成コンポーネント向けの厳格なtheme enforcement
 * 直接的なTailwindクラス使用を完全に禁止
 */

module.exports = {
  rules: {
    // 色関連クラスの完全禁止
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'Literal[value=/\\b(bg|text|border|hover:bg|hover:text|hover:border|dark:bg|dark:text|dark:border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d+\\b/]',
        message:
          '❌ 直接的な色指定は禁止です。@/config/theme/colors を使用してください。例: colors.primary.DEFAULT, colors.semantic.error.DEFAULT',
      },
      {
        selector: 'Literal[value=/\\b(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-\\d+\\b/]',
        message:
          '❌ 直接的な余白指定は禁止です。@/config/theme/spacing を使用してください。例: spacing.component.DEFAULT',
      },
      {
        selector: 'Literal[value=/\\b(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl))\\b/]',
        message:
          '❌ 直接的なフォントサイズ指定は禁止です。@/config/theme/typography を使用してください。例: typography.heading.h1',
      },
      {
        selector: 'Literal[value=/\\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\\b/]',
        message:
          '❌ 直接的な角丸指定は禁止です。@/config/theme/rounded を使用してください。例: rounded.component.button.md',
      },
    ],

    // import文でのtheme使用チェック
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/config/theme/**'],
            importNames: ['*'],
            message:
              'デフォルト import の代わりに named import を使用してください。例: import { colors, typography } from "@/config/theme"',
          },
        ],
      },
    ],
  },

  overrides: [
    // 新規作成ファイル用の厳格ルール（過去3日以内に作成されたファイル）
    {
      files: [
        // 新規コンポーネント作成時は明示的にここに追加
        'src/components/new/**/*',
        'src/features/new/**/*',
        // テスト用のサンプルファイル
        'src/components/theme-test/**/*',
      ],
      rules: {
        // theme importが必須
        'import/no-restricted-paths': [
          'error',
          {
            zones: [
              {
                target: 'src/components/**/*.{ts,tsx}',
                from: 'src/**',
                except: ['**/config/theme/**'],
                message: 'コンポーネントではtheme以外の直接インポートを避けてください',
              },
            ],
          },
        ],
      },
    },

    // 設定ファイルとライブラリは除外
    {
      files: [
        '**/*.test.tsx',
        '**/*.test.ts',
        'tests/**/*',
        'config/**/*',
        'scripts/**/*',
        '.eslint/**/*',
        'tailwind.config.*',
        'next.config.*',
        'src/config/theme/**/*',
        'src/components/kibo-ui/**/*',
        'src/components/shadcn-ui/**/*',
      ],
      rules: {
        'no-restricted-syntax': 'off',
        'no-restricted-imports': 'off',
      },
    },
  ],
}
