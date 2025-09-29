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
          // BoxLog 辞書由来の禁止用語
          'data': {
            'information': true,
            'details': true,
            'content': true
          },
          'info': {
            'information': true,
            'details': true,
            'metadata': true
          },
          'temp': {
            'temporary': true,
            'cache': true,
            'buffer': true,
            'draft': true
          },
          'util': {
            'utility': true,
            'helper': true,
            'tool': true
          },
          'mgr': {
            'manager': true,
            'service': true,
            'handler': true
          },
          'btn': {
            'button': true,
            'control': true,
            'action': true
          },
          'img': {
            'image': true,
            'picture': true,
            'photo': true
          },
          'txt': {
            'text': true,
            'content': true,
            'message': true
          },
          'val': {
            'value': true,
            'amount': true,
            'data': true
          },
          'var': {
            'variable': true,
            'property': true,
            'field': true
          },
          'obj': {
            'object': true,
            'item': true,
            'entity': true
          },
          'arr': {
            'array': true,
            'list': true,
            'collection': true
          },
          'str': {
            'string': true,
            'text': true,
            'message': true
          },
          'num': {
            'number': true,
            'count': true,
            'amount': true
          },
          'bool': {
            'boolean': true,
            'flag': true,
            'isActive': true
          },
          'func': {
            'function': true,
            'method': true,
            'handler': true
          },
          'param': {
            'parameter': true,
            'argument': true,
            'option': true
          },
          'config': {
            'configuration': true,
            'settings': true,
            'options': true
          },
          'admin': {
            'administrator': true,
            'adminRole': true,
            'adminUser': true
          },
          'calc': {
            'calculate': true,
            'computation': true,
            'formula': true
          }
        //   },
        //   allowList: {
        //     // 例外的に許可する省略形
        //     'props': true,       // React props
        //     'ref': true,         // React ref
        //     'env': true,         // 環境変数
        //     'api': true,         // API関連
        //     'url': true,         // URL
        //     'id': true,          // ID
        //     'db': true,          // データベース
        //     'ui': true,          // UI関連
        //     'css': true,         // CSS関連
        //     'html': true,        // HTML関連
        //     'js': true,          // JavaScript
        //     'ts': true,          // TypeScript
        //     'jsx': true,         // JSX
        //     'tsx': true,         // TSX
        //     'svg': true,         // SVG
        //     'png': true,         // PNG
        //     'jpg': true,         // JPG
        //     'gif': true,         // GIF
        //     'pdf': true,         // PDF
        //     'json': true,        // JSON
        //     'xml': true,         // XML
        //     'csv': true,         // CSV
        //     'md': true,          // Markdown
        //     'uuid': true,        // UUID
        //     'npm': true,         // NPM
        //     'src': true,         // ソースディレクトリ
        //     'dist': true,        // ビルドディレクトリ
        //     'dev': true,         // 開発環境
        //     'prod': true,        // 本番環境
        //     'auth': true,        // 認証（短縮が一般的）
        //     'oauth': true,       // OAuth
        //     'jwt': true,         // JWT
        //     'seo': true,         // SEO
        //     'cdn': true,         // CDN
        //     'ssl': true,         // SSL
        //     'cors': true,        // CORS
        //     'csrf': true,        // CSRF
        //     'xss': true,         // XSS
        //     'http': true,        // HTTP
        //     'https': true,       // HTTPS
        //     'tcp': true,         // TCP
        //     'udp': true,         // UDP
        //     'ws': true,          // WebSocket
        //     'rpc': true,         // RPC
        //     'rest': true,        // REST
        //     'crud': true,        // CRUD
        //     'sql': true,         // SQL
        //     'nosql': true,       // NoSQL
        //     'ssh': true,         // SSH
        //     'ftp': true,         // FTP
        //     'dns': true,         // DNS
        //     'vim': true,         // Vim
        //     'cli': true,         // CLI
        //     'gui': true,         // GUI
        //     'cpu': true,         // CPU
        //     'gpu': true,         // GPU
        //     'ram': true,         // RAM
        //     'ssd': true,         // SSD
        //     'hdd': true,         // HDD
        //     'os': true,          // OS
        //     'ios': true,         // iOS
        //     'mac': true,         // Mac
        //     'pc': true,          // PC
        //     'tv': true,          // TV
        //     'pwa': true,         // PWA
        //     'spa': true,         // SPA
        //     'ssr': true,         // SSR
        //     'ssg': true,         // SSG
        //     'aws': true,         // AWS
        //     'gcp': true,         // GCP
        //     's3': true,          // S3
        //     'ec2': true,         // EC2
        //     'rds': true,         // RDS
        //     'cdn': true,         // CDN
        //     'ci': true,          // CI
        //     'cd': true,          // CD
        //     'qa': true,          // QA
        //     'uat': true,         // UAT
        //   }
        // }
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