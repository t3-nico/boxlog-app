/**
 * 🔧 Dayopt Configuration Loader
 *
 * 設定ファイルの安全な読み込み・バリデーション・管理システム
 * - 環境別設定読み込み
 * - バリデーション付き安全読み込み
 * - デフォルト値マージ
 * - 型安全性保証
 */

import { Config, ConfigValidationResult } from '../schema';
import { CONFIG_PATHS } from './constants';
import { applyEnvironmentVariables } from './env-parser';
import { deepMerge, getDefaultConfig, loadConfigFile } from './file-reader';
import { validateConfig } from './validator';

/**
 * 🎯 設定ローダークラス
 */
export class ConfigLoader {
  private cachedConfig: Config | null = null;
  private environment: string;

  constructor(environment?: string) {
    this.environment = environment || process.env.NODE_ENV || 'development';
  }

  /**
   * 📊 設定の読み込み
   */
  async load(
    options: {
      /** キャッシュを使用 */
      useCache?: boolean;
      /** 環境変数を優先 */
      preferEnvVars?: boolean;
      /** 厳密モード */
      strict?: boolean;
    } = {},
  ): Promise<ConfigValidationResult> {
    const { useCache = true, preferEnvVars = true, strict = false } = options;

    try {
      // キャッシュチェック
      if (useCache && this.cachedConfig) {
        return {
          success: true,
          data: this.cachedConfig,
          errors: [],
          warnings: [],
        };
      }

      // 1. ベース設定の読み込み
      const baseConfig = await loadConfigFile(CONFIG_PATHS.base);

      // 2. 環境別設定の読み込み
      const envConfigPath =
        CONFIG_PATHS.environment[this.environment as keyof typeof CONFIG_PATHS.environment];
      const envConfig = await loadConfigFile(envConfigPath);

      // 3. ローカル設定の読み込み
      const localConfig = await loadConfigFile(CONFIG_PATHS.local);

      // 4. デフォルト設定の取得
      const defaultConfig = getDefaultConfig(this.environment);

      // 5. 設定のマージ
      let mergedConfig = deepMerge(
        defaultConfig,
        baseConfig || {},
        envConfig || {},
        localConfig || {},
      );

      // 6. 環境変数の適用
      if (preferEnvVars) {
        mergedConfig = applyEnvironmentVariables(mergedConfig);
      }

      // 7. バリデーション
      const validationResult = validateConfig(mergedConfig, strict, this.environment);

      // 8. キャッシュ更新
      if (validationResult.success && validationResult.data) {
        this.cachedConfig = validationResult.data;
      }

      return validationResult;
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            path: ['loader'],
            message: `Configuration loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'LOADING_ERROR',
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * 🧹 キャッシュのクリア
   */
  clearCache(): void {
    this.cachedConfig = null;
  }

  /**
   * 📊 現在の設定取得
   */
  getCurrentConfig(): Config | null {
    return this.cachedConfig;
  }

  /**
   * 🔄 設定の再読み込み
   */
  async reload(options?: Parameters<ConfigLoader['load']>[0]): Promise<ConfigValidationResult> {
    this.clearCache();
    return await this.load(options);
  }
}

/**
 * 🌍 グローバルローダーインスタンス
 */
export const globalConfigLoader = new ConfigLoader();

/**
 * 🔧 便利な関数エクスポート
 */
export const loadConfig = globalConfigLoader.load.bind(globalConfigLoader);
export const reloadConfig = globalConfigLoader.reload.bind(globalConfigLoader);
export const getCurrentConfig = globalConfigLoader.getCurrentConfig.bind(globalConfigLoader);
export const clearConfigCache = globalConfigLoader.clearCache.bind(globalConfigLoader);

export default globalConfigLoader;
