/**
 * エラーパターン統合辞書
 */

import type { ErrorMessagePattern } from '../types';

import { API_ERROR_PATTERNS } from './api';
import { AUTH_ERROR_PATTERNS } from './auth';
import { BUSINESS_ERROR_PATTERNS } from './business';
import { DATA_ERROR_PATTERNS } from './data';
import { EXTERNAL_ERROR_PATTERNS } from './external';
import { SYSTEM_ERROR_PATTERNS } from './system';
import { UI_ERROR_PATTERNS } from './ui';

export const ERROR_MESSAGE_PATTERNS: Record<number, ErrorMessagePattern> = {
  ...AUTH_ERROR_PATTERNS,
  ...API_ERROR_PATTERNS,
  ...DATA_ERROR_PATTERNS,
  ...UI_ERROR_PATTERNS,
  ...SYSTEM_ERROR_PATTERNS,
  ...BUSINESS_ERROR_PATTERNS,
  ...EXTERNAL_ERROR_PATTERNS,
};

export {
  API_ERROR_PATTERNS,
  AUTH_ERROR_PATTERNS,
  BUSINESS_ERROR_PATTERNS,
  DATA_ERROR_PATTERNS,
  EXTERNAL_ERROR_PATTERNS,
  SYSTEM_ERROR_PATTERNS,
  UI_ERROR_PATTERNS,
};
