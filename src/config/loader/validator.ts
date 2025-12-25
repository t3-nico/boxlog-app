/**
 * 設定ローダー - バリデーター
 */

import { ZodError } from 'zod';

import { ConfigSchema, ConfigValidationError, ConfigValidationResult } from '../schema';

/**
 * ✅ 設定の検証
 */
export function validateConfig(
  config: Record<string, unknown>,
  strict: boolean,
  environment: string,
): ConfigValidationResult {
  try {
    const validatedConfig = ConfigSchema.parse(config);

    return {
      success: true,
      data: validatedConfig,
      errors: [],
      warnings: generateWarnings(config, strict, environment),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ConfigValidationError[] = error.issues.map((err) => ({
        path: err.path.map(String),
        message: err.message,
        code: err.code,
        input: 'input' in err ? err.input : undefined,
      }));

      return {
        success: false,
        errors,
        warnings: [],
      };
    }

    return {
      success: false,
      errors: [
        {
          path: ['validation'],
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATION_ERROR',
        },
      ],
      warnings: [],
    };
  }
}

/**
 * ⚠️ 警告の生成
 */
// 型安全なプロパティアクセスヘルパー
function getNestedProperty(obj: unknown, ...keys: string[]): unknown {
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

export function generateWarnings(
  config: Record<string, unknown>,
  _strict: boolean,
  environment: string,
): string[] {
  const warnings: string[] = [];

  // 本番環境でのデバッグモード警告
  if (environment === 'production' && getNestedProperty(config, 'app', 'debug') === true) {
    warnings.push('Debug mode is enabled in production environment');
  }

  // SSL無効化警告
  if (environment !== 'development' && getNestedProperty(config, 'database', 'ssl') === false) {
    warnings.push('Database SSL is disabled in non-development environment');
  }

  // 機能フラグ警告
  if (getNestedProperty(config, 'features', 'debugMode') === true && environment === 'production') {
    warnings.push('Debug mode feature flag is enabled in production');
  }

  // セッションセキュリティ警告
  if (
    getNestedProperty(config, 'server', 'session', 'secure') === false &&
    environment === 'production'
  ) {
    warnings.push('Session secure flag is disabled in production');
  }

  return warnings;
}
