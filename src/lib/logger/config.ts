/**
 * Logger Configuration
 *
 * 環境別デフォルト設定・設定ユーティリティ
 */

import type { LoggerConfig } from './types';

/**
 * 基本設定
 */
export const DEFAULT_CONFIG: LoggerConfig = {
  level: 'info',
  console: {
    enabled: true,
    colors: true,
    format: 'pretty',
  },
  file: {
    enabled: false,
    path: './logs/app.log',
    rotation: {
      maxSize: '10MB',
      maxFiles: 5,
    },
  },
  external: {
    enabled: false,
    services: {},
  },
  metadata: {
    includeVersion: true,
    includeEnvironment: true,
    includeHostname: false,
    includeProcessId: false,
    includeMemory: false,
  },
  filtering: {
    sensitiveKeys: ['password', 'token', 'secret', 'key'],
    excludeComponents: [],
    samplingRate: 1.0,
  },
};

/**
 * 開発環境設定
 */
export const DEVELOPMENT_CONFIG: LoggerConfig = {
  ...DEFAULT_CONFIG,
  level: 'debug',
  console: {
    enabled: true,
    colors: true,
    format: 'pretty',
  },
  metadata: {
    ...DEFAULT_CONFIG.metadata,
    includeMemory: true,
  },
};

/**
 * 本番環境設定
 */
export const PRODUCTION_CONFIG: LoggerConfig = {
  ...DEFAULT_CONFIG,
  level: 'warn',
  console: {
    enabled: false,
    colors: false,
    format: 'json',
  },
  file: {
    enabled: true,
    path: './logs/production.log',
    rotation: {
      maxSize: '50MB',
      maxFiles: 10,
    },
  },
  metadata: {
    ...DEFAULT_CONFIG.metadata,
    includeHostname: true,
    includeProcessId: true,
  },
};

/**
 * ステージング環境設定
 */
export const STAGING_CONFIG: LoggerConfig = {
  ...DEFAULT_CONFIG,
  level: 'info',
  file: {
    enabled: true,
    path: './logs/staging.log',
    rotation: {
      maxSize: '20MB',
      maxFiles: 7,
    },
  },
  metadata: {
    ...DEFAULT_CONFIG.metadata,
    includeHostname: true,
  },
};

/**
 * 環境別デフォルト設定を取得
 */
export function getDefaultConfig(
  environment: string = process.env.NODE_ENV || 'development',
): LoggerConfig {
  switch (environment) {
    case 'development':
      return DEVELOPMENT_CONFIG;
    case 'production':
      return PRODUCTION_CONFIG;
    case 'staging':
      return STAGING_CONFIG;
    default:
      return DEFAULT_CONFIG;
  }
}
