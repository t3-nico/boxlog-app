/**
 * シンプルなテーマ遵守チェック設定
 * 
 * カスタムプラグインなしで実現する簡易版テーマルール
 * 直接的なTailwindクラス使用を検出し、warning として報告
 */

module.exports = {
  rules: {
    // テーマに反するTailwindクラスの直接使用を検出（基本的なレイアウトクラスは除外）
    'no-restricted-syntax': [
      'warn',
      {
        'selector': 'Literal[value=/^(bg-(?!white|black|transparent|current|inherit)\\\\w+|text-(?!center|left|right|justify|start|end|inherit|current|transparent|black|white)\\\\w+|border-(?!0|solid|dashed|dotted|double|none|collapse|separate|inherit|current|transparent)\\\\w+)/]',
        'message': '直接的なTailwindクラスの使用は避けてください。代わりに @/config/theme からtheme値を使用してください。'
      }
    ]
  },
  
  overrides: [
    // 修正済みファイル - より厳格に
    {
      files: [
        'src/app/error/page.tsx',
        // 今後修正するファイルをここに追加
      ],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            'selector': 'Literal[value=/^(bg-(?!white|black|transparent|current|inherit)\\\\w+|text-(?!center|left|right|justify|start|end|inherit|current|transparent|black|white)\\\\w+|border-(?!0|solid|dashed|dotted|double|none|collapse|separate|inherit|current|transparent)\\\\w+)/]',
            'message': '修正済みファイルでは直接的なTailwindクラス使用は禁止です。@/config/theme を使用してください。'
          }
        ]
      }
    },
    
    // 設定ファイルとテストファイルは除外
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
        // サードパーティライブラリは除外
        'src/components/kibo-ui/**/*',
        'src/components/shadcn-ui/**/*',
        // テーマ定義ファイルは除外
        'src/config/theme/**/*',
        'src/types/**/*',
        // テーマ違反が多すぎるファイルは段階的対応（フィーチャー単位で除外）
        'src/features/aichat/**/*',
        'src/features/calendar/**/*',
        'src/features/help/**/*',
        'src/features/notifications/**/*',
        'src/features/smart-folders/**/*',
        'src/features/trash/**/*',
        'src/features/tags/**/*',
        'src/features/events/**/*',
        // 複雑なレイアウトファイルも段階的対応
        'src/components/layout/sidebar/MobileSidebar.tsx',
        'src/components/layout/inspector/MobileInspector.tsx',
        'src/components/layout/inspector/content/**/*',
        // アプリケーション設定画面
        'src/app/(app)/settings/**/*',
        // カスタムコンポーネント（複雑な実装）
        'src/components/custom/**/*',
        // 残りのレイアウトコンポーネント（段階的対応）
        'src/components/layout/**/*',
        'src/components/ui/**/*',
        'src/app/(app)/**/*'
      ],
      rules: {
        'no-restricted-syntax': 'off'
      }
    }
  ]
};