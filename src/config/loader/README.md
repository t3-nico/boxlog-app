# loader/ - 設定ローダーシステム

BoxLogアプリケーションの設定ファイルを安全に読み込み、バリデーション・環境変数適用を行うシステムです。

## 📁 ファイル構成

```
src/config/loader/
├── index.ts          # ConfigLoaderクラス（メインエントリーポイント）
├── constants.ts      # 設定ファイルパス・環境変数マッピング
├── env-parser.ts     # 環境変数パース・型変換
├── file-reader.ts    # ファイル読み込み・マージ
├── validator.ts      # Zodバリデーション・警告生成
└── README.md         # このファイル
```

## 🎯 設計方針

### 分割前の課題

- 元の `loader.ts` は **450行**（CLAUDE.md違反: 300行以下推奨）
- 設定読み込み・バリデーション・環境変数パースが1ファイルに混在
- 責務が多く、テスト・保守が困難

### 分割後の改善

- 各ファイルが **単一責任** を持つ
- テストしやすい構造
- インポートの見通しが良い

## 🚀 基本的な使い方

### 1. 設定の読み込み

```typescript
import { loadConfig } from '@/config/loader';

// デフォルト設定で読み込み
const result = await loadConfig();

if (result.success) {
  console.log('App name:', result.data.app.name);
  console.log('Database host:', result.data.database.host);
} else {
  console.error('Errors:', result.errors);
}
```

### 2. オプション指定

```typescript
import { loadConfig } from '@/config/loader';

const result = await loadConfig({
  useCache: false, // キャッシュを使わず毎回読み込み
  preferEnvVars: true, // 環境変数を優先
  strict: true, // 厳格モード（警告をエラーに昇格）
});
```

### 3. ConfigLoaderクラスの直接使用

```typescript
import { ConfigLoader } from '@/config/loader';

const loader = new ConfigLoader('production');
const result = await loader.load();

// キャッシュクリア
loader.clearCache();

// 再読み込み
const freshResult = await loader.reload();

// 現在の設定取得
const currentConfig = loader.getCurrentConfig();
```

## 📋 各モジュールの詳細

### constants.ts

設定ファイルパスと環境変数マッピングを定義

```typescript
export const CONFIG_PATHS = {
  base: './config/base.json',
  environment: {
    development: './config/development.json',
    staging: './config/staging.json',
    production: './config/production.json',
  },
  local: './config/local.json',
};

export const ENV_VAR_MAPPINGS = {
  'app.name': 'APP_NAME',
  'database.host': 'DB_HOST',
  // ...
};
```

### env-parser.ts

環境変数の適用・型変換

```typescript
import { applyEnvironmentVariables, parseEnvValue } from '@/config/loader/env-parser';

// 環境変数の型変換
parseEnvValue('true'); // boolean: true
parseEnvValue('123'); // number: 123
parseEnvValue('1.5'); // number: 1.5
parseEnvValue('{"a":1}'); // object: { a: 1 }
parseEnvValue('text'); // string: 'text'

// 設定に環境変数を適用
const config = { app: { name: 'Default' } };
const updated = applyEnvironmentVariables(config);
// APP_NAME環境変数があれば上書きされる
```

### file-reader.ts

設定ファイルの安全な読み込み・マージ

```typescript
import { loadConfigFile, deepMerge, getDefaultConfig } from '@/config/loader/file-reader';

// ファイル読み込み（セキュリティ検証付き）
const config = await loadConfigFile('./config/base.json');

// 複数設定のマージ
const merged = deepMerge({ app: { name: 'App1' } }, { app: { version: '1.0' } });
// 結果: { app: { name: 'App1', version: '1.0' } }

// 環境別デフォルト設定
const defaults = getDefaultConfig('production');
```

### validator.ts

Zodスキーマバリデーション・警告生成

```typescript
import { validateConfig, generateWarnings } from '@/config/loader/validator';

// バリデーション
const result = validateConfig(config, false, 'production');

if (!result.success) {
  result.errors.forEach((error) => {
    console.error(`[${error.path.join('.')}] ${error.message}`);
  });
}

// 警告のみ取得
const warnings = generateWarnings(config, false, 'production');
// 例: ['Debug mode is enabled in production environment']
```

## 🔒 セキュリティ機能

### パス検証

```typescript
import { isValidConfigPath } from '@/config/loader/file-reader';

// 許可されたパスのみ読み込み可能
isValidConfigPath('./config/base.json'); // true
isValidConfigPath('../../../etc/passwd'); // false
```

### ファイルシステムアクセス

- 設定ディレクトリ内のファイルのみ許可
- パストラバーサル攻撃対策
- セキュリティコメント付き

## 💡 実践例

### 環境別設定読み込み

```typescript
import { ConfigLoader } from '@/config/loader';

// 本番環境用ローダー
const prodLoader = new ConfigLoader('production');
const prodConfig = await prodLoader.load();

// 開発環境用ローダー
const devLoader = new ConfigLoader('development');
const devConfig = await devLoader.load();
```

### カスタムバリデーション

```typescript
import { loadConfig } from '@/config/loader';

const result = await loadConfig({ strict: true });

if (!result.success) {
  // エラー詳細をログ
  result.errors.forEach((error) => {
    console.error({
      path: error.path,
      message: error.message,
      code: error.code,
      input: error.input,
    });
  });
  throw new Error('Configuration validation failed');
}

// 警告がある場合は表示
if (result.warnings.length > 0) {
  console.warn('Configuration warnings:');
  result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
}
```

### キャッシュ管理

```typescript
import { globalConfigLoader, clearConfigCache } from '@/config/loader';

// 初回読み込み（キャッシュあり）
const config1 = await globalConfigLoader.load();

// 2回目は即座に返却（キャッシュから）
const config2 = await globalConfigLoader.load();

// キャッシュクリア
clearConfigCache();

// 再読み込み
const config3 = await globalConfigLoader.load();
```

## 🔗 関連ドキュメント

- [schema.ts](../schema.ts) - Zod設定スキーマ定義
- [src/config/README.md](../README.md) - config全体の使い方
- [CLAUDE.md](../../CLAUDE.md) - ファイル行数制限ルール

## ❓ よくある質問

### Q1: なぜファイルを分割したのか？

**A**: 元の `loader.ts` が450行あり、CLAUDE.mdの「300行以下」ルールに違反していたためです。責務ごとに分割することで、保守性・テスト容易性が向上しました。

### Q2: 既存のコードは影響を受けるか？

**A**: いいえ。`@/config/loader` からのインポートはそのまま動作します（`index.ts` で再エクスポート）。

```typescript
// 変更不要
import { loadConfig } from '@/config/loader';
```

### Q3: 新しい環境変数マッピングを追加するには？

**A**: `constants.ts` の `ENV_VAR_MAPPINGS` に追加します：

```typescript
export const ENV_VAR_MAPPINGS = {
  // ... 既存のマッピング
  'myFeature.apiKey': 'MY_FEATURE_API_KEY',
} as const;
```

### Q4: カスタムバリデーションルールを追加するには？

**A**: `validator.ts` の `generateWarnings` 関数に追加します：

```typescript
// 新しいセキュリティチェック
if (environment === 'production' && (config.server as any)?.https === false) {
  warnings.push('HTTPS is disabled in production');
}
```

---

**最終更新**: 2025-10-06
**関連Issue**: #424
