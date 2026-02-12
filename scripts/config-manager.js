#!/usr/bin/env node
/**
 * 🔧 Dayopt Configuration Manager
 *
 * 設定ファイルの管理・検証・ドキュメント生成スクリプト
 * - 設定バリデーション
 * - スキーマドキュメント生成
 * - 環境別設定比較
 * - 設定マイグレーション支援
 */

const fs = require('fs');

/**
 * 🎨 カラー出力設定
 */
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
};

/**
 * 📝 ログ出力ヘルパー
 */
const logger = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}🔧 ${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.white}   ${msg}${colors.reset}`),
};

/**
 * 📁 設定ファイルパス
 */
const CONFIG_PATHS = {
  base: './config/base.json',
  environments: {
    development: './config/development.json',
    staging: './config/staging.json',
    production: './config/production.json',
  },
  local: './config/local.json',
  schema: './src/config/schema.ts',
};

/**
 * ✅ 設定ファイルの検証
 */
async function validateConfigs() {
  logger.header('Configuration Validation Starting...');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  // ベース設定の検証
  const baseResult = await validateConfigFile('base', CONFIG_PATHS.base);
  results.details.push(baseResult);
  results.total++;

  if (baseResult.valid) {
    results.passed++;
    logger.success(`Base config: Valid`);
  } else {
    results.failed++;
    logger.error(`Base config: ${baseResult.errors.length} errors`);
  }

  // 環境別設定の検証
  for (const [env, configPath] of Object.entries(CONFIG_PATHS.environments)) {
    const envResult = await validateConfigFile(env, configPath);
    results.details.push(envResult);
    results.total++;

    if (envResult.valid) {
      results.passed++;
      logger.success(`${env} config: Valid`);
    } else {
      results.failed++;
      logger.error(`${env} config: ${envResult.errors.length} errors`);
    }

    if (envResult.warnings.length > 0) {
      results.warnings += envResult.warnings.length;
      envResult.warnings.forEach((warning) => {
        logger.warning(`${env}: ${warning}`);
      });
    }
  }

  // ローカル設定の検証（任意）
  if (fs.existsSync(CONFIG_PATHS.local)) {
    const localResult = await validateConfigFile('local', CONFIG_PATHS.local);
    results.details.push(localResult);
    results.total++;

    if (localResult.valid) {
      results.passed++;
      logger.success(`Local config: Valid`);
    } else {
      results.failed++;
      logger.error(`Local config: ${localResult.errors.length} errors`);
    }
  }

  // サマリー出力
  console.log();
  logger.header('Validation Summary');
  logger.info(`Total Configs: ${results.total}`);
  logger.success(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logger.error(`Failed: ${results.failed}`);
  }
  if (results.warnings > 0) {
    logger.warning(`Warnings: ${results.warnings}`);
  }

  // 詳細エラー出力
  const failedConfigs = results.details.filter((r) => !r.valid);
  if (failedConfigs.length > 0) {
    console.log();
    logger.header('Error Details');
    failedConfigs.forEach((config) => {
      logger.error(`${config.name}:`);
      config.errors.forEach((error) => {
        logger.data(`  ${error.path}: ${error.message}`);
      });
    });
  }

  return results;
}

/**
 * 📁 個別設定ファイルの検証
 */
async function validateConfigFile(name, filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        name,
        valid: false,
        errors: [{ path: 'file', message: 'Configuration file not found' }],
        warnings: [],
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(content);

    // 基本的な構造チェック
    const errors = [];
    const warnings = [];

    // 必須セクションチェック
    const requiredSections = ['app', 'database', 'features', 'server', 'logging'];
    requiredSections.forEach((section) => {
      if (!config[section]) {
        errors.push({ path: section, message: `Required section '${section}' is missing` });
      }
    });

    // 環境固有の検証
    if (name === 'production') {
      if (config.app?.debug === true) {
        warnings.push('Debug mode is enabled in production');
      }
      if (config.database?.ssl === false) {
        warnings.push('Database SSL is disabled in production');
      }
      if (config.server?.session?.secure === false) {
        warnings.push('Session secure flag is disabled in production');
      }
    }

    // 開発環境固有の検証
    if (name === 'development') {
      if (config.logging?.level !== 'debug') {
        warnings.push('Log level should be "debug" in development');
      }
    }

    return {
      name,
      valid: errors.length === 0,
      errors,
      warnings,
      config,
    };
  } catch (error) {
    return {
      name,
      valid: false,
      errors: [{ path: 'parse', message: `JSON parse error: ${error.message}` }],
      warnings: [],
    };
  }
}

/**
 * 📊 環境別設定の比較
 */
async function compareConfigs() {
  logger.header('Configuration Comparison');

  const configs = {};

  // 各環境の設定を読み込み
  for (const [env, configPath] of Object.entries(CONFIG_PATHS.environments)) {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        configs[env] = JSON.parse(content);
      } catch (error) {
        logger.error(`Failed to load ${env} config: ${error.message}`);
        continue;
      }
    }
  }

  const environments = Object.keys(configs);
  if (environments.length < 2) {
    logger.warning('Need at least 2 environments to compare');
    return;
  }

  logger.info(`Comparing environments: ${environments.join(', ')}`);
  console.log();

  // キーの差分を表示
  const allKeys = new Set();
  Object.values(configs).forEach((config) => {
    collectKeys(config, '', allKeys);
  });

  const sortedKeys = Array.from(allKeys).sort();

  sortedKeys.forEach((key) => {
    const values = {};
    let hasDifference = false;

    environments.forEach((env) => {
      const value = getNestedValue(configs[env], key);
      values[env] = value;

      // 差分チェック
      if (Object.keys(values).length > 1) {
        const firstValue = Object.values(values)[0];
        if (JSON.stringify(value) !== JSON.stringify(firstValue)) {
          hasDifference = true;
        }
      }
    });

    if (hasDifference) {
      logger.info(`${key}:`);
      Object.entries(values).forEach(([env, value]) => {
        logger.data(`  ${env}: ${JSON.stringify(value)}`);
      });
      console.log();
    }
  });
}

/**
 * 📚 スキーマドキュメント生成
 */
async function generateDocs() {
  logger.header('Generating Configuration Documentation');

  try {
    // スキーマファイルの読み取り（簡易パース）
    const schemaContent = fs.readFileSync(CONFIG_PATHS.schema, 'utf8');

    // TypeScript パースは複雑なので、コメントベースでドキュメント生成
    const docs = generateDocsFromSchema(schemaContent);

    const docsPath = './docs/CONFIG_SCHEMA.md';
    fs.writeFileSync(docsPath, docs);

    logger.success(`Documentation generated: ${docsPath}`);
  } catch (error) {
    logger.error(`Documentation generation failed: ${error.message}`);
  }
}

/**
 * 📝 スキーマからドキュメント生成
 */
function generateDocsFromSchema(schemaContent) {
  const timestamp = new Date().toISOString();

  let docs = `# Dayopt Configuration Schema Documentation

Generated on: ${timestamp}

## Overview

This document describes the configuration schema for the Dayopt application.
All configurations are validated using Zod schemas to ensure type safety and data integrity.

## Configuration Sections

`;

  // セクション別にドキュメント生成
  const sections = [
    { name: 'App Configuration', key: 'AppConfigSchema' },
    { name: 'Database Configuration', key: 'DatabaseConfigSchema' },
    { name: 'Authentication Configuration', key: 'AuthConfigSchema' },
    { name: 'Feature Flags', key: 'FeatureFlagsSchema' },
    { name: 'Email Configuration', key: 'EmailConfigSchema' },
    { name: 'External APIs', key: 'ExternalApisSchema' },
    { name: 'Server Configuration', key: 'ServerConfigSchema' },
    { name: 'Logging Configuration', key: 'LoggingConfigSchema' },
  ];

  sections.forEach((section) => {
    docs += `### ${section.name}\n\n`;

    // スキーマ定義からコメントを抽出
    const sectionRegex = new RegExp(`export const ${section.key}[\\s\\S]*?\\}\\)`, 'g');
    const match = schemaContent.match(sectionRegex);

    if (match) {
      const sectionCode = match[0];

      // コメントを抽出してドキュメント化
      const commentRegex = /\/\*\* (.+?) \*\//g;
      let commentMatch;

      docs += '```typescript\n';
      docs += sectionCode.substring(0, 200) + '...\n';
      docs += '```\n\n';

      while ((commentMatch = commentRegex.exec(sectionCode)) !== null) {
        docs += `- ${commentMatch[1]}\n`;
      }

      docs += '\n';
    }
  });

  docs += `
## Environment Variables

The configuration system supports environment variable mapping:

| Config Path | Environment Variable | Description |
|-------------|---------------------|-------------|
| app.name | APP_NAME | Application name |
| app.version | APP_VERSION | Application version |
| app.environment | NODE_ENV | Environment (development/staging/production) |
| database.host | DB_HOST | Database host |
| database.port | DB_PORT | Database port |
| auth.jwtSecret | JWT_SECRET | JWT secret key |

## Configuration Files

- \`config/base.json\` - Base configuration shared across all environments
- \`config/development.json\` - Development environment overrides
- \`config/staging.json\` - Staging environment overrides
- \`config/production.json\` - Production environment overrides
- \`config/local.json\` - Local development overrides (git-ignored)

## Validation

All configurations are validated using the Zod schema system:

\`\`\`typescript
import { loadConfig } from '@/config/loader'

const result = await loadConfig()
if (result.success) {
  console.log('Configuration loaded successfully')
} else {
  console.error('Configuration errors:', result.errors)
}
\`\`\`

---

*This documentation is auto-generated from the configuration schema.*
`;

  return docs;
}

/**
 * 🔑 キーの収集（再帰）
 */
function collectKeys(obj, prefix, keys, maxDepth = 5) {
  if (maxDepth <= 0 || obj === null || typeof obj !== 'object') {
    return;
  }

  Object.keys(obj).forEach((key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.add(fullKey);

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      collectKeys(obj[key], fullKey, keys, maxDepth - 1);
    }
  });
}

/**
 * 🎯 ネストされた値の取得
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * 📊 設定統計情報
 */
async function showStats() {
  logger.header('Configuration Statistics');

  const stats = {
    environments: 0,
    totalKeys: 0,
    sharedKeys: 0,
    uniqueKeys: 0,
    configSizes: {},
  };

  const configs = {};

  // 各環境の設定を読み込み
  for (const [env, configPath] of Object.entries(CONFIG_PATHS.environments)) {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(content);
        configs[env] = config;
        stats.environments++;

        const size = fs.statSync(configPath).size;
        stats.configSizes[env] = `${Math.round((size / 1024) * 100) / 100} KB`;
      } catch (error) {
        logger.error(`Failed to load ${env} config: ${error.message}`);
      }
    }
  }

  // 統計計算
  const allKeys = new Set();
  const keysByEnv = {};

  Object.entries(configs).forEach(([env, config]) => {
    const envKeys = new Set();
    collectKeys(config, '', envKeys);
    keysByEnv[env] = envKeys;
    envKeys.forEach((key) => allKeys.add(key));
  });

  stats.totalKeys = allKeys.size;

  // 共有キー計算
  let sharedKeys = 0;
  allKeys.forEach((key) => {
    const envCount = Object.values(keysByEnv).filter((keys) => keys.has(key)).length;
    if (envCount === stats.environments) {
      sharedKeys++;
    }
  });

  stats.sharedKeys = sharedKeys;
  stats.uniqueKeys = stats.totalKeys - sharedKeys;

  // 統計出力
  logger.info(`Environments: ${stats.environments}`);
  logger.info(`Total Configuration Keys: ${stats.totalKeys}`);
  logger.info(`Shared Keys: ${stats.sharedKeys}`);
  logger.info(`Environment-specific Keys: ${stats.uniqueKeys}`);

  console.log();
  logger.info('Config File Sizes:');
  Object.entries(stats.configSizes).forEach(([env, size]) => {
    logger.data(`${env}: ${size}`);
  });

  return stats;
}

/**
 * 🎯 メイン実行関数
 */
async function main() {
  const command = process.argv[2];

  logger.header('Dayopt Configuration Manager');
  logger.info(`Command: ${command || 'validate'}`);
  console.log();

  try {
    switch (command) {
      case 'validate':
        await validateConfigs();
        break;

      case 'compare':
        await compareConfigs();
        break;

      case 'docs':
        await generateDocs();
        break;

      case 'stats':
        await showStats();
        break;

      case 'full':
        // 全機能実行
        const validationResult = await validateConfigs();
        console.log();
        await compareConfigs();
        console.log();
        await showStats();
        console.log();
        await generateDocs();

        // 最終サマリー
        console.log();
        logger.header('Configuration Management Complete');
        logger.success(`Validation: ${validationResult.passed}/${validationResult.total} passed`);
        break;

      default:
        // デフォルトはvalidate
        await validateConfigs();
    }
  } catch (error) {
    logger.error(`Command execution failed: ${error.message}`);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  validateConfigs,
  compareConfigs,
  generateDocs,
  showStats,
};
