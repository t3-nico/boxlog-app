// BoxLog ESLint - ハイブリッドアプローチ設定
// 予防（80%スニペット） + 検出（15%このファイル） + レビュー（5%AI）

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/.backup/**',
      '**/coverage/**',
      '**/config/eslint/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: await import('@typescript-eslint/parser'),
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        React: 'readonly',
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        // Browser/Web API globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
      },
    },
    plugins: {
      'react-hooks': await import('eslint-plugin-react-hooks'),
    },
    rules: {
      // 🚨 致命的エラー防止（7ルール）
      // React Hooks - 実行時エラー防止
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JavaScript基本 - バグ防止（TypeScriptが型チェックするためno-undefはwarnに）
      'no-undef': 'warn', // TypeScriptプロジェクトではwarn推奨
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-constant-condition': 'warn',
      'no-empty': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];