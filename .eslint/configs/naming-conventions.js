/**
 * ESLint設定: 命名規則辞書システム
 * BoxLog App統一命名規則の自動チェック・修正
 */

module.exports = {
  // NOTE: カスタムプラグインは将来実装予定
  // plugins: ['@local/naming'],

  rules: {
    // BoxLog App カスタム命名規則（将来実装）
    // '@local/naming/enforce-naming': [
    //   'error',
    //   {
    //     checkComponents: true,    // React コンポーネント名チェック
    //     checkHooks: true,         // カスタムフック名チェック
    //     checkVariables: true,     // 変数名チェック
    //     checkFunctions: true,     // 関数名チェック
    //     checkTypes: true,         // TypeScript 型名チェック
    //     autoFix: true            // 自動修正有効
    //   }
    // ],

    // 既存のESLint命名規則を拡張
    '@typescript-eslint/naming-convention': [
      'error',
      // インターフェース
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]|Props$|Data$|Config$|API$',
          match: false
        }
      },
      // 型エイリアス
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
        suffix: ['Type', 'Data', 'Config', 'Props']
      },
      // Enum
      {
        selector: 'enum',
        format: ['PascalCase'],
        suffix: ['Enum', 'Type', 'Status']
      },
      // Enum メンバー
      {
        selector: 'enumMember',
        format: ['UPPER_CASE']
      },
      // クラス
      {
        selector: 'class',
        format: ['PascalCase']
      },
      // メソッド
      {
        selector: 'method',
        format: ['camelCase'],
        leadingUnderscore: 'allow'
      },
      // プロパティ
      {
        selector: 'property',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow'
      },
      // 変数
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow'
      },
      // 関数
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase']
      },
      // パラメータ
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow'
      },
      // 真偽値変数
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['camelCase'],
        prefix: ['is', 'has', 'can', 'should', 'will', 'does']
      },
      // 定数
      {
        selector: 'variable',
        modifiers: ['const'],
        format: ['camelCase', 'UPPER_CASE', 'PascalCase']
      }
    ],

    // React 特有の命名規則
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-pascal-case': [
      'error',
      {
        allowAllCaps: false,
        ignore: []
      }
    ],

    // ファイル名関連（将来実装）
    // 'unicorn/filename-case': [
    //   'error',
    //   {
    //     cases: {
    //       kebabCase: true,    // component ファイル
    //       camelCase: true,    // utility ファイル
    //       pascalCase: true    // type定義ファイル
    //     },
    //     ignore: [
    //       /^[A-Z]/,          // Next.js pages
    //       /\.d\.ts$/,        // 型定義ファイル
    //       /\.config\./,      // 設定ファイル
    //       /\.test\./,        // テストファイル
    //       /\.spec\./         // スペックファイル
    //     ]
    //   }
    // ],

    // 未使用変数の禁止（命名品質向上）
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }
    ],

    // 省略形の禁止（将来実装）
    // 'unicorn/prevent-abbreviations': [
    //   'error',
    //   {
    //     replacements: {
    //       // BoxLog 辞書由来の禁止用語
    //       'data': { 'information': true },
    //       'info': { 'information': true },
    //       'temp': { 'temporary': true },
    //       'config': { 'configuration': true }
    //     }
    //   }
    // ]
  },

  // プラグイン登録（カスタムルール用）
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      excludedFiles: [
        'node_modules/**',
        '.next/**',
        'dist/**',
        'build/**',
        'coverage/**'
      ]
    },
    {
      // JavaScriptファイルではTypeScript固有ルールを無効化
      files: ['**/*.{js,jsx}'],
      rules: {
        '@typescript-eslint/naming-convention': 'off'
      }
    }
  ]
}