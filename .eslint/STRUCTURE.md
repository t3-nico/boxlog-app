# .eslint/ ディレクトリ構造

## 📁 配置方針

```
プロジェクトルート/
├── eslint.config.js         # メイン設定（ESLintが自動検出）
└── .eslint/                 # ESLint関連ドキュメント・設定
    ├── README.md           # 使い方ガイド
    ├── STRUCTURE.md        # このファイル（ディレクトリ構造説明）
    └── .eslintignore       # 除外設定
```

## 💡 なぜこの構造？

### eslint.config.js をルートに配置する理由

ESLintは設定ファイルを以下の順序で自動検出します：

1. `eslint.config.js` (ルート)
2. `eslint.config.mjs`
3. `eslint.config.cjs`
4. `.eslintrc.*` (旧形式)

**ルートに配置することで、ESLintが自動的に見つけられます。**

### .eslint/ ディレクトリの役割

- **ドキュメント**: README、ガイド等
- **補助設定**: .eslintignore等
- **一元管理**: ESLint関連ファイルをまとめる

## 🔗 関連

- **メイン設定**: [`/eslint.config.js`](../eslint.config.js)
- **メイン設定**: [`/eslint.config.js`](../eslint.config.js)
