# 🎛️ ESLint設定例集 - Configuration Examples

> **様々なシーンでの設定例とベストプラクティス**

## 📚 目次

1. [基本的な設定パターン](#-基本的な設定パターン)
2. [環境別設定例](#-環境別設定例)
3. [プロジェクト別カスタマイズ](#-プロジェクト別カスタマイズ)
4. [チーム別設定例](#-チーム別設定例)
5. [パフォーマンス重視設定](#⚡-パフォーマンス重視設定)
6. [厳格なコンプライアンス設定](#-厳格なコンプライアンス設定)
7. [レガシープロジェクト移行設定](#-レガシープロジェクト移行設定)

---

## 🏗️ 基本的な設定パターン

### 🎯 最小構成（新規プロジェクト）

```javascript
// .eslint/configs/minimal.js
module.exports = {
  extends: ['next/core-web-vitals'],
  
  plugins: ['import', 'unused-imports'],
  
  rules: {
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
      'newlines-between': 'always'
    }],
    'unused-imports/no-unused-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

### 🏢 標準構成（BoxLog推奨）

```javascript
// .eslint/configs/standard.js
module.exports = {
  extends: ['next/core-web-vitals'],
  
  plugins: [
    'import',
    'unused-imports',
    'boxlog-theme',
    'boxlog-compliance'
  ],
  
  rules: {
    // Import管理
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      pathGroups: [
        { pattern: 'react', group: 'external', position: 'before' },
        { pattern: '@/**', group: 'internal', position: 'before' }
      ],
      'newlines-between': 'always-and-inside-groups',
      alphabetize: { order: 'asc', caseInsensitive: true }
    }],
    
    // 未使用コード
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'warn',
    
    // TypeScript
    'prefer-const': 'error',
    'no-var': 'error',
    
    // BoxLogカスタム
    'boxlog-theme/enforce-theme-usage': ['warn', {
      newFileErrorLevel: 'error',
      existingFileErrorLevel: 'warn'
    }],
    'boxlog-compliance/gdpr-data-collection': 'warn'
  }
};
```

### 🚀 フル機能（大規模プロジェクト）

```javascript
// .eslint/configs/enterprise.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  
  plugins: [
    '@typescript-eslint',
    'import',
    'unused-imports',
    'jsx-a11y',
    'security',
    'boxlog-theme',
    'boxlog-compliance',
    'boxlog-todo'
  ],
  
  rules: {
    // TypeScript厳格設定
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'error',
    
    // Import厳格管理
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'error',
    'import/order': ['error', { /* 詳細設定 */ }],
    
    // セキュリティ
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    
    // アクセシビリティ
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    
    // BoxLogカスタム（厳格）
    'boxlog-theme/enforce-theme-usage': 'error',
    'boxlog-compliance/gdpr-data-collection': 'error',
    'boxlog-todo/structured-todo': 'error'
  }
};
```

---

## 🌍 環境別設定例

### 🧪 開発環境（実験重視）

```javascript
// .eslint/configs/development-experimental.js
module.exports = {
  rules: {
    // デバッグ許可
    'no-console': 'off',
    'no-debugger': 'off',
    
    // 実験的コード許可
    '@typescript-eslint/no-explicit-any': 'off',
    'unused-imports/no-unused-vars': 'off',
    
    // TODO緩和
    'boxlog-todo/structured-todo': 'off',
    'boxlog-todo/todo-expiry': 'off',
    
    // テーマ緩和
    'boxlog-theme/enforce-theme-usage': 'off',
    
    // 複雑さ緩和
    complexity: 'off',
    'max-lines-per-function': 'off'
  }
};
```

### 🏭 本番環境（品質重視）

```javascript
// .eslint/configs/production-strict.js
module.exports = {
  rules: {
    // 本番禁止項目
    'no-console': 'error',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    
    // TypeScript厳格
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    
    // 未使用コード禁止
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'error',
    
    // パフォーマンス
    complexity: ['error', 8],
    'max-lines-per-function': ['error', 40],
    'max-nested-callbacks': ['error', 3],
    
    // BoxLog品質保証
    'boxlog-theme/enforce-theme-usage': 'error',
    'boxlog-compliance/gdpr-data-collection': 'error',
    'boxlog-todo/structured-todo': 'error',
    
    // セキュリティ厳格
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error'
  }
};
```

### 🧪 テスト環境

```javascript
// .eslint/configs/testing.js
module.exports = {
  env: {
    jest: true,
    'jest/globals': true
  },
  
  plugins: ['jest', 'testing-library'],
  
  rules: {
    // テスト固有ルール
    'jest/expect-expect': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/valid-expect': 'error',
    
    // Testing Library
    'testing-library/await-async-query': 'error',
    'testing-library/no-await-sync-query': 'error',
    
    // テストでの緩和
    'no-magic-numbers': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'max-lines-per-function': ['warn', 100],
    
    // テーマ・コンプライアンス緩和
    'boxlog-theme/enforce-theme-usage': 'off',
    'boxlog-compliance/gdpr-data-collection': 'off'
  }
};
```

---

## 🎨 プロジェクト別カスタマイズ

### 📱 モバイルアプリ（React Native）

```javascript
// .eslint/configs/mobile.js
module.exports = {
  extends: ['@react-native-community'],
  
  plugins: ['react-native', 'boxlog-theme'],
  
  rules: {
    // React Native固有
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    
    // パフォーマンス重視
    'boxlog-theme/no-expensive-operations-in-render': 'error',
    'boxlog-theme/require-memo-for-complex-components': 'warn',
    
    // バンドルサイズ重視
    'boxlog-theme/no-heavy-library-imports': 'error',
    'boxlog-theme/prefer-dynamic-imports': 'warn'
  }
};
```

### 🌐 WebAPI（Node.js）

```javascript
// .eslint/configs/api.js
module.exports = {
  env: {
    node: true,
    es2022: true
  },
  
  plugins: ['security', 'boxlog-compliance'],
  
  rules: {
    // Node.js固有
    'no-process-exit': 'error',
    'no-process-env': 'warn',
    
    // セキュリティ重視
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-eval-with-expression': 'error',
    
    // API固有のコンプライアンス
    'boxlog-compliance/secure-cookie-settings': 'error',
    'boxlog-compliance/data-retention': 'error',
    
    // ログ出力許可（サーバー）
    'no-console': 'warn'
  }
};
```

### 📊 ダッシュボード（データ重視）

```javascript
// .eslint/configs/dashboard.js
module.exports = {
  plugins: ['react-hooks', 'boxlog-theme'],
  
  rules: {
    // データ処理パフォーマンス
    'boxlog-theme/no-expensive-operations-in-render': 'error',
    'boxlog-theme/require-memo-for-complex-components': 'error',
    
    // React Hooks（データフェッチ重要）
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    
    // 複雑な計算許可
    complexity: ['warn', 15],
    'max-lines-per-function': ['warn', 80]
  }
};
```

---

## 👥 チーム別設定例

### 🌟 新人チーム（学習重視）

```javascript
// .eslint/configs/beginner-friendly.js
module.exports = {
  rules: {
    // 学習のため警告レベル
    '@typescript-eslint/no-explicit-any': 'warn',
    'complexity': ['warn', 12],
    'max-lines-per-function': ['warn', 60],
    
    // 良い習慣の推奨
    'prefer-const': 'error',
    'no-var': 'error',
    'import/order': 'warn',
    
    // コメント推奨
    'spaced-comment': ['warn', 'always'],
    
    // テーマは段階的導入
    'boxlog-theme/enforce-theme-usage': ['warn', {
      newFileErrorLevel: 'warn',
      existingFileErrorLevel: 'off'
    }]
  }
};
```

### 🚀 シニアチーム（効率重視）

```javascript
// .eslint/configs/senior-team.js
module.exports = {
  rules: {
    // 高い品質基準
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    
    // 厳格なコード品質
    complexity: ['error', 8],
    'max-lines-per-function': ['error', 30],
    'max-params': ['error', 3],
    
    // 完璧なテーマ使用
    'boxlog-theme/enforce-theme-usage': 'error',
    
    // 完璧なTODO管理
    'boxlog-todo/structured-todo': 'error',
    'boxlog-todo/todo-expiry': 'error',
    'boxlog-todo/todo-assignee': 'error'
  }
};
```

### 🔧 DevOpsチーム（運用重視）

```javascript
// .eslint/configs/devops.js
module.exports = {
  rules: {
    // セキュリティ最優先
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-unsafe-regex': 'error',
    
    // コンプライアンス厳格
    'boxlog-compliance/gdpr-data-collection': 'error',
    'boxlog-compliance/secure-cookie-settings': 'error',
    'boxlog-compliance/data-retention': 'error',
    
    // 運用時のデバッグ許可
    'no-console': 'warn',
    
    // 設定ファイルでの緩和
    'no-magic-numbers': 'off'
  }
};
```

---

## ⚡ パフォーマンス重視設定

### 🏃‍♂️ 高速開発設定

```javascript
// .eslint/configs/fast-development.js
module.exports = {
  // 最小限のプラグイン
  plugins: ['import', 'unused-imports'],
  
  rules: {
    // 必要最小限のルール
    'import/order': 'error',
    'unused-imports/no-unused-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // パフォーマンス重視のため無効化
    complexity: 'off',
    'max-lines-per-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  },
  
  // 多くのファイルを無視
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    'coverage/',
    '**/*.test.*',
    '**/*.spec.*',
    'src/legacy/**'
  ]
};
```

### 🎯 選択的チェック設定

```javascript
// .eslint/configs/selective.js
module.exports = {
  overrides: [
    {
      // 重要ファイルのみ厳格
      files: ['src/app/**/*.tsx', 'src/components/**/*.tsx'],
      rules: {
        'boxlog-theme/enforce-theme-usage': 'error',
        'complexity': ['error', 8]
      }
    },
    {
      // ユーティリティは緩く
      files: ['src/utils/**/*.ts', 'src/lib/**/*.ts'],
      rules: {
        'complexity': 'off',
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    },
    {
      // テストは最小限
      files: ['**/*.test.*', '**/*.spec.*'],
      rules: {
        'no-magic-numbers': 'off',
        'max-lines-per-function': 'off'
      }
    }
  ]
};
```

---

## 🔒 厳格なコンプライアンス設定

### 🛡️ GDPR完全準拠

```javascript
// .eslint/configs/gdpr-compliant.js
module.exports = {
  plugins: ['boxlog-compliance', 'security'],
  
  rules: {
    // GDPR必須項目
    'boxlog-compliance/gdpr-data-collection': 'error',
    'boxlog-compliance/explicit-consent': 'error',
    'boxlog-compliance/data-minimization': 'error',
    'boxlog-compliance/right-to-deletion': 'error',
    'boxlog-compliance/data-portability': 'error',
    
    // データ保護
    'boxlog-compliance/secure-data-storage': 'error',
    'boxlog-compliance/encryption-requirements': 'error',
    
    // セキュリティ強化
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-possible-timing-attacks': 'error',
    
    // ログ・追跡の制限
    'no-console': 'error',
    'boxlog-compliance/no-personal-data-logging': 'error'
  }
};
```

### 🏥 ヘルスケア（HIPAA準拠）

```javascript
// .eslint/configs/healthcare.js
module.exports = {
  plugins: ['boxlog-compliance', 'security'],
  
  rules: {
    // HIPAA必須項目
    'boxlog-compliance/phi-protection': 'error',
    'boxlog-compliance/access-controls': 'error',
    'boxlog-compliance/audit-logging': 'error',
    'boxlog-compliance/data-integrity': 'error',
    
    // 暗号化必須
    'boxlog-compliance/encryption-at-rest': 'error',
    'boxlog-compliance/encryption-in-transit': 'error',
    
    // セキュリティ最大レベル
    'security/detect-object-injection': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-regexp': 'error',
    
    // デバッグ情報禁止
    'no-console': 'error',
    'no-debugger': 'error'
  }
};
```

### 🏦 金融（PCI DSS準拠）

```javascript
// .eslint/configs/financial.js
module.exports = {
  plugins: ['boxlog-compliance', 'security'],
  
  rules: {
    // PCI DSS必須項目
    'boxlog-compliance/payment-data-protection': 'error',
    'boxlog-compliance/secure-transmission': 'error',
    'boxlog-compliance/access-restriction': 'error',
    
    // セキュリティ最高レベル
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    
    // コード品質最高レベル
    '@typescript-eslint/no-explicit-any': 'error',
    'complexity': ['error', 5],
    'max-lines-per-function': ['error', 25]
  }
};
```

---

## 🔄 レガシープロジェクト移行設定

### 📦 段階的移行（フェーズ1）

```javascript
// .eslint/configs/migration-phase1.js
module.exports = {
  rules: {
    // 基本的な品質向上
    'prefer-const': 'warn',
    'no-var': 'warn',
    'unused-imports/no-unused-imports': 'warn',
    
    // Import整理（警告レベル）
    'import/order': 'warn',
    
    // テーマは段階的導入
    'boxlog-theme/enforce-theme-usage': ['warn', {
      newFileErrorLevel: 'warn',
      existingFileErrorLevel: 'off'
    }],
    
    // その他は無効
    'complexity': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
```

### 🚀 段階的移行（フェーズ2）

```javascript
// .eslint/configs/migration-phase2.js
module.exports = {
  rules: {
    // 基本ルールをエラー化
    'prefer-const': 'error',
    'no-var': 'error',
    'unused-imports/no-unused-imports': 'error',
    'import/order': 'error',
    
    // テーマ使用を部分的に強制
    'boxlog-theme/enforce-theme-usage': ['warn', {
      newFileErrorLevel: 'error',
      existingFileErrorLevel: 'warn'
    }],
    
    // 複雑さに制限導入
    'complexity': ['warn', 15],
    'max-lines-per-function': ['warn', 100],
    
    // TypeScript改善開始
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
```

### 🎯 段階的移行（最終フェーズ）

```javascript
// .eslint/configs/migration-final.js
module.exports = {
  rules: {
    // 全て標準レベルに
    'prefer-const': 'error',
    'no-var': 'error',
    'unused-imports/no-unused-imports': 'error',
    'import/order': 'error',
    
    // テーマ完全準拠
    'boxlog-theme/enforce-theme-usage': 'error',
    
    // 品質基準達成
    'complexity': ['error', 10],
    'max-lines-per-function': ['error', 50],
    '@typescript-eslint/no-explicit-any': 'error',
    
    // コンプライアンス導入
    'boxlog-compliance/gdpr-data-collection': 'warn'
  }
};
```

---

## 🎛️ 設定管理のベストプラクティス

### 📋 設定継承パターン

```javascript
// .eslint/configs/inheritance-example.js
module.exports = {
  // 基本設定から継承
  extends: ['./base.js'],
  
  // 環境固有の上書き
  env: {
    jest: true
  },
  
  // プラグイン追加
  plugins: ['jest'],
  
  // ルール調整
  rules: {
    // 基本設定を上書き
    'no-console': 'off',
    
    // 新しいルール追加
    'jest/expect-expect': 'error'
  },
  
  // オーバーライド追加
  overrides: [
    {
      files: ['**/*.test.ts'],
      rules: {
        'max-lines-per-function': 'off'
      }
    }
  ]
};
```

### 🔄 動的設定生成

```javascript
// .eslint/configs/dynamic.js
const generateConfig = (options = {}) => {
  const {
    strict = false,
    theme = true,
    compliance = false
  } = options;
  
  const rules = {
    'prefer-const': 'error',
    'import/order': 'error'
  };
  
  if (strict) {
    rules['@typescript-eslint/no-explicit-any'] = 'error';
    rules['complexity'] = ['error', 8];
  }
  
  if (theme) {
    rules['boxlog-theme/enforce-theme-usage'] = strict ? 'error' : 'warn';
  }
  
  if (compliance) {
    rules['boxlog-compliance/gdpr-data-collection'] = 'error';
  }
  
  return { rules };
};

// 使用例
module.exports = generateConfig({
  strict: process.env.NODE_ENV === 'production',
  theme: true,
  compliance: process.env.COMPLIANCE_MODE === 'strict'
});
```

---

**📝 このドキュメントについて**
- **最終更新**: 2025-09-11
- **対象**: BoxLog ESLint設定 v2.0
- **用途**: 設定例・カスタマイズガイド

**💡 使い方のコツ**
1. **プロジェクトに合った例を選択**
2. **段階的に厳格さを上げる**
3. **チーム規模に応じて調整**
4. **定期的に設定を見直す**